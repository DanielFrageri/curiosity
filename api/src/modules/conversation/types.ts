export interface Message {
    author: string;
    content: string;
    timestamp: string;
}

export interface ConversationData {
    messages: Message[];
}

export interface SaveMessageRequest {
    author: string;
    content: string;
}

export interface ConversationStats {
    totalMessages: number;
    lastMessageTime?: string;
} 