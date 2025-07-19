export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}

export interface SaveMessageRequest {
    author: string;
    content: string;
}

export interface Message {
    author: string;
    content: string;
    timestamp: string;
} 