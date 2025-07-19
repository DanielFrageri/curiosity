// Exports dos clients (recomendado para uso)
export { conversationService } from './service';
export { conversationValidator } from './validator';

// Exports das classes (compatibilidade com código existente)
export { ConversationService } from './service';
export { ConversationValidator } from './validator';

// Exports dos tipos
export * from './types';

// Export das rotas
export { default as conversationRoutes } from './routes'; 