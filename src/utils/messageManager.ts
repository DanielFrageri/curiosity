export interface Message {
    author: string;
    content: string;
    timestamp: string;
}

export interface ConversationData {
    messages: Message[];
}

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}

export interface SaveMessageRequest {
    author: string;
    content: string;
}

export class MessageManager {
    private static readonly API_BASE_URL = 'http://localhost:3001/api';
    private static readonly STORAGE_KEY = 'conversation_data_backup';

    // Salva mensagem via API
    static async saveMessage(message: Message): Promise<void> {
        try {
            const requestData: SaveMessageRequest = {
                author: message.author,
                content: message.content
            };

            const response = await fetch(`${this.API_BASE_URL}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            const apiResponse: ApiResponse = await response.json();

            if (!apiResponse.success) {
                throw new Error(apiResponse.error || 'Erro desconhecido na API');
            }

            console.log('Mensagem salva com sucesso via API:', apiResponse.data);

            // Backup no localStorage em caso de falha da API
            this.saveToLocalStorage(apiResponse.data);

        } catch (error) {
            console.error('Erro ao salvar mensagem via API:', error);

            // Fallback: salva no localStorage se a API falhar
            console.log('Tentando salvar no localStorage como fallback...');
            await this.saveToLocalStorageFallback(message);

            throw new Error('Falha ao conectar com o servidor. Mensagem salva localmente.');
        }
    }

    // Carrega mensagens via API
    static async getAllMessages(): Promise<Message[]> {
        try {
            const response = await fetch(`${this.API_BASE_URL}/messages`);

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            const apiResponse: ApiResponse<Message[]> = await response.json();

            if (!apiResponse.success) {
                throw new Error(apiResponse.error || 'Erro desconhecido na API');
            }

            return apiResponse.data || [];

        } catch (error) {
            console.error('Erro ao carregar mensagens via API:', error);

            // Fallback: carrega do localStorage se a API falhar
            console.log('Carregando mensagens do localStorage como fallback...');
            return this.loadFromLocalStorage();
        }
    }

    // Obtém estatísticas via API
    static async getStats(): Promise<{ totalMessages: number; lastMessageTime?: string }> {
        try {
            const response = await fetch(`${this.API_BASE_URL}/stats`);

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            const apiResponse: ApiResponse = await response.json();

            if (!apiResponse.success) {
                throw new Error(apiResponse.error || 'Erro desconhecido na API');
            }

            return apiResponse.data;

        } catch (error) {
            console.error('Erro ao carregar estatísticas via API:', error);
            return { totalMessages: 0 };
        }
    }

    // Verifica se a API está funcionando
    static async checkApiHealth(): Promise<boolean> {
        try {
            const response = await fetch(`${this.API_BASE_URL}/health`);
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    // Métodos de fallback para localStorage
    private static saveToLocalStorage(message: Message): void {
        try {
            const existingData = this.loadFromLocalStorageRaw();
            existingData.messages.push(message);
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingData));
        } catch (error) {
            console.error('Erro ao salvar backup no localStorage:', error);
        }
    }

    private static async saveToLocalStorageFallback(message: Message): Promise<void> {
        try {
            const existingData = this.loadFromLocalStorageRaw();
            existingData.messages.push(message);
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingData));
            console.log('Mensagem salva no localStorage como fallback');
        } catch (error) {
            console.error('Erro ao salvar no localStorage:', error);
            throw error;
        }
    }

    private static loadFromLocalStorage(): Message[] {
        return this.loadFromLocalStorageRaw().messages;
    }

    private static loadFromLocalStorageRaw(): ConversationData {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            if (data) {
                return JSON.parse(data);
            }
            return { messages: [] };
        } catch (error) {
            console.error('Erro ao carregar do localStorage:', error);
            return { messages: [] };
        }
    }
} 