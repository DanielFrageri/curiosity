import { SaveMessageRequest } from './types';

/**
 * Valida os dados para salvar uma mensagem
 */
function validateSaveMessage(data: any): { isValid: boolean; error?: string } {
    if (!data.author || !data.content) {
        return {
            isValid: false,
            error: 'Campos "author" e "content" são obrigatórios'
        };
    }

    if (typeof data.author !== 'string' || typeof data.content !== 'string') {
        return {
            isValid: false,
            error: 'Campos "author" e "content" devem ser strings'
        };
    }

    if (data.content.trim().length === 0) {
        return {
            isValid: false,
            error: 'O conteúdo da mensagem não pode estar vazio'
        };
    }

    if (data.author.trim().length === 0) {
        return {
            isValid: false,
            error: 'O autor da mensagem não pode estar vazio'
        };
    }

    return { isValid: true };
}

/**
 * Sanitiza os dados de entrada
 */
function sanitizeSaveMessage(data: SaveMessageRequest): SaveMessageRequest {
    return {
        author: data.author.trim(),
        content: data.content.trim()
    };
}

/**
 * Valida se uma string não está vazia após trim
 */
function validateNonEmptyString(value: string, fieldName: string): { isValid: boolean; error?: string } {
    if (typeof value !== 'string') {
        return {
            isValid: false,
            error: `Campo "${fieldName}" deve ser uma string`
        };
    }

    if (value.trim().length === 0) {
        return {
            isValid: false,
            error: `Campo "${fieldName}" não pode estar vazio`
        };
    }

    return { isValid: true };
}

// Client que agrupa as funções
export const conversationValidator = {
    validateSaveMessage,
    sanitizeSaveMessage,
    validateNonEmptyString
};

// Manter classe para compatibilidade com código existente
export class ConversationValidator {
    static validateSaveMessage(data: any): { isValid: boolean; error?: string } {
        return conversationValidator.validateSaveMessage(data);
    }

    static sanitizeSaveMessage(data: SaveMessageRequest): SaveMessageRequest {
        return conversationValidator.sanitizeSaveMessage(data);
    }

    static validateNonEmptyString(value: string, fieldName: string): { isValid: boolean; error?: string } {
        return conversationValidator.validateNonEmptyString(value, fieldName);
    }
} 