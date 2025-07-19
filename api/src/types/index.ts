export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}

export interface HealthStatus {
    status: string;
    timestamp: string;
    uptime: number;
} 