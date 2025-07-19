import { Router, Request, Response } from 'express';
import { conversationService } from './service';
import { conversationValidator } from './validator';
import { aiService } from './aiService';
import { ApiResponse } from '../../types';
import { SaveMessageRequest } from './types';

const router = Router();

/**
 * GET /api/conversation/messages
 * Busca todas as mensagens da conversação
 */
router.get('/messages', async (req: Request, res: Response) => {
    try {
        const data = await conversationService.getMessages();
        const response: ApiResponse = {
            success: true,
            data: data.messages
        };
        res.json(response);
    } catch (error) {
        console.error('Erro ao buscar mensagens:', error);
        const response: ApiResponse = {
            success: false,
            error: 'Erro interno do servidor ao buscar mensagens'
        };
        res.status(500).json(response);
    }
});

/**
 * POST /api/conversation/messages
 * Adiciona uma nova mensagem à conversação
 */
router.post('/messages', async (req: Request, res: Response): Promise<void> => {
    try {
        // Validação dos dados
        const validation = conversationValidator.validateSaveMessage(req.body);
        if (!validation.isValid) {
            const response: ApiResponse = {
                success: false,
                error: validation.error
            };
            res.status(400).json(response);
            return;
        }

        // Sanitiza os dados
        const sanitizedData = conversationValidator.sanitizeSaveMessage(req.body as SaveMessageRequest);

        // Salva a mensagem do usuário
        const newMessage = await conversationService.addMessage(
            sanitizedData.author,
            sanitizedData.content
        );

        // Gera resposta do Curiosity usando OpenAI
        const aiResponse = await aiService.generateResponse(sanitizedData.content);

        console.log('aiResponse', aiResponse);
        const curiosityResponse = await conversationService.addMessage(
            'Curiosity',
            aiResponse
        );

        const response: ApiResponse = {
            success: true,
            data: {
                userMessage: newMessage,
                curiosityResponse: curiosityResponse
            }
        };
        res.status(201).json(response);
    } catch (error) {
        console.error('Erro ao salvar mensagem:', error);
        const response: ApiResponse = {
            success: false,
            error: 'Erro interno do servidor ao salvar mensagem'
        };
        res.status(500).json(response);
    }
});

/**
 * GET /api/conversation/stats
 * Obtém estatísticas da conversação
 */
router.get('/stats', async (req: Request, res: Response) => {
    try {
        const stats = await conversationService.getStats();
        const response: ApiResponse = {
            success: true,
            data: stats
        };
        res.json(response);
    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        const response: ApiResponse = {
            success: false,
            error: 'Erro interno do servidor ao buscar estatísticas'
        };
        res.status(500).json(response);
    }
});

export default router; 