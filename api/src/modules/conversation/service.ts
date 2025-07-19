import * as fs from 'fs';
import * as path from 'path';
import { ConversationData, Message, ConversationStats } from './types';

// Configuração padrão
const getDefaultFilePath = (): string => {
    return path.join(process.cwd(), '..', 'database', 'conversation.json');
};

/**
 * Salva os dados da conversação no arquivo
 */
async function saveConversation(data: ConversationData, filePath: string): Promise<void> {
    try {
        // Garante que o diretório existe
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            await fs.promises.mkdir(dir, { recursive: true });
        }

        const jsonContent = JSON.stringify(data, null, 2);
        await fs.promises.writeFile(filePath, jsonContent, 'utf-8');
    } catch (error) {
        console.error('Erro ao salvar arquivo de conversação:', error);
        throw new Error('Falha ao salvar no arquivo');
    }
}

/**
 * Lê as mensagens do arquivo conversation.json
 */
async function getMessages(filePath: string): Promise<ConversationData> {
    try {
        // Verifica se o arquivo existe
        if (!fs.existsSync(filePath)) {
            // Se não existe, cria com estrutura inicial
            const initialData: ConversationData = { messages: [] };
            await saveConversation(initialData, filePath);
            return initialData;
        }

        const fileContent = await fs.promises.readFile(filePath, 'utf-8');
        const data: ConversationData = JSON.parse(fileContent);

        // Valida a estrutura do arquivo
        if (!data.messages || !Array.isArray(data.messages)) {
            console.warn('Arquivo conversation.json com estrutura inválida. Resetando...');
            const resetData: ConversationData = { messages: [] };
            await saveConversation(resetData, filePath);
            return resetData;
        }

        return data;
    } catch (error) {
        console.error('Erro ao ler arquivo de conversação:', error);
        // Em caso de erro, retorna estrutura vazia
        return { messages: [] };
    }
}

/**
 * Adiciona uma nova mensagem ao arquivo
 */
async function addMessage(author: string, content: string, filePath: string): Promise<Message> {
    try {
        const conversationData = await getMessages(filePath);

        const newMessage: Message = {
            author,
            content,
            timestamp: new Date().toISOString()
        };

        conversationData.messages.push(newMessage);
        await saveConversation(conversationData, filePath);

        return newMessage;
    } catch (error) {
        console.error('Erro ao adicionar mensagem:', error);
        throw new Error('Falha ao salvar mensagem');
    }
}

/**
 * Obtém estatísticas das mensagens
 */
async function getStats(filePath: string): Promise<ConversationStats> {
    try {
        const data = await getMessages(filePath);
        const totalMessages = data.messages.length;
        const lastMessageTime = data.messages.length > 0
            ? data.messages[data.messages.length - 1].timestamp
            : undefined;

        return { totalMessages, lastMessageTime };
    } catch (error) {
        console.error('Erro ao obter estatísticas:', error);
        return { totalMessages: 0 };
    }
}

// Client que agrupa as funções
export const conversationService = {
    getMessages: (filePath: string = getDefaultFilePath()) => getMessages(filePath),
    addMessage: (author: string, content: string, filePath: string = getDefaultFilePath()) => addMessage(author, content, filePath),
    getStats: (filePath: string = getDefaultFilePath()) => getStats(filePath),
    saveConversation: (data: ConversationData, filePath: string = getDefaultFilePath()) => saveConversation(data, filePath)
};

// Manter classe para compatibilidade com código existente
export class ConversationService {
    private readonly filePath: string;

    constructor(filePath?: string) {
        this.filePath = filePath || getDefaultFilePath();
    }

    async getMessages(): Promise<ConversationData> {
        return conversationService.getMessages(this.filePath);
    }

    async addMessage(author: string, content: string): Promise<Message> {
        return conversationService.addMessage(author, content, this.filePath);
    }

    async getStats(): Promise<ConversationStats> {
        return conversationService.getStats(this.filePath);
    }

    private async saveConversation(data: ConversationData): Promise<void> {
        return conversationService.saveConversation(data, this.filePath);
    }
} 