import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

// Configuração da API OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// System prompt para o Curiosity
const SYSTEM_PROMPT = "Você é uma pessoa curiosa que se chama Curiosity";

/**
 * Carrega o histórico da conversa do arquivo conversation.json
 */
function loadConversationHistory(): OpenAI.Chat.Completions.ChatCompletionMessageParam[] {
    try {
        // Caminho relativo ao arquivo atual - mais robusto
        const conversationPath = path.join(__dirname, '..', '..', '..', '..', 'database', 'conversation.json');
        const conversationData = fs.readFileSync(conversationPath, 'utf8');
        const conversation = JSON.parse(conversationData);

        // Converte mensagens para o formato da OpenAI API
        return conversation.messages.map((message: any): OpenAI.Chat.Completions.ChatCompletionMessageParam => ({
            role: message.author === 'user' ? 'user' : 'assistant',
            content: message.content
        }));
    } catch (error) {
        console.warn('Erro ao carregar histórico da conversa:', error);
        return [];
    }
}

/**
 * Gera uma resposta usando a OpenAI API
 */
export async function generateResponse(userMessage: string): Promise<string> {
    try {
        // Carrega o histórico da conversa
        const conversationHistory = loadConversationHistory();

        // Monta as mensagens para a API
        const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
            {
                role: "system",
                content: SYSTEM_PROMPT
            },
            ...conversationHistory,
            {
                role: "user",
                content: userMessage
            }
        ];

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: messages,
            max_tokens: 1000,
            temperature: 0.7,
        });

        const response = completion.choices[0]?.message?.content;

        if (!response) {
            throw new Error('Nenhuma resposta foi gerada pela IA');
        }

        return response;
    } catch (error) {
        console.error('Erro ao gerar resposta da IA:', error);

        // Se for erro de API key ou outro erro da OpenAI, lance um erro específico
        if (error instanceof OpenAI.APIError) {
            throw new Error(`Erro da OpenAI API: ${error.message}`);
        }

        throw new Error('Erro interno ao processar mensagem com IA');
    }
}

/**
 * Verifica se a configuração da OpenAI está correta
 */
export function validateOpenAIConfig(): boolean {
    return !!process.env.OPENAI_API_KEY;
}

export const aiService = {
    generateResponse,
    validateOpenAIConfig
}; 