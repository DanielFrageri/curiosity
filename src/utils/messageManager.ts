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

// Event system for real-time updates
type MessageEventHandler = (message: Message) => void;

export class MessageManager {
    private static readonly API_BASE_URL = 'http://localhost:3001/api';
    private static readonly STORAGE_KEY = 'conversation_data_backup';
    private static eventHandlers: MessageEventHandler[] = [];

    // Event system methods
    static onMessageSaved(handler: MessageEventHandler): () => void {
        this.eventHandlers.push(handler);
        // Return unsubscribe function
        return () => {
            const index = this.eventHandlers.indexOf(handler);
            if (index > -1) {
                this.eventHandlers.splice(index, 1);
            }
        };
    }

    private static emitMessageSaved(message: Message): void {
        this.eventHandlers.forEach(handler => {
            try {
                handler(message);
            } catch (error) {
                console.error('Error in message event handler:', error);
            }
        });
    }

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

            // A API agora retorna { userMessage, curiosityResponse } ou apenas uma mensagem para compatibilidade
            const responseData = apiResponse.data;

            if (responseData && responseData.userMessage && responseData.curiosityResponse) {
                // Nova estrutura com resposta do Curiosity
                // Backup no localStorage
                this.saveToLocalStorage(responseData.userMessage);
                this.saveToLocalStorage(responseData.curiosityResponse);

                // Emit events for both messages
                this.emitMessageSaved(responseData.userMessage);
                this.emitMessageSaved(responseData.curiosityResponse);
            } else {
                // Estrutura antiga (compatibilidade)
                this.saveToLocalStorage(responseData || message);
                this.emitMessageSaved(responseData || message);
            }

        } catch (error) {
            console.error('Erro ao salvar mensagem via API:', error);

            // Fallback: salva no localStorage se a API falhar
            try {
                await this.saveToLocalStorageFallback(message);

                // Emit event even for fallback
                this.emitMessageSaved(message);

                // Se o fallback funcionou, consideramos como sucesso - não lançamos erro
            } catch (fallbackError) {
                console.error('Erro no fallback para localStorage:', fallbackError);
                throw new Error('Falha ao salvar mensagem. Tente novamente.');
            }
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