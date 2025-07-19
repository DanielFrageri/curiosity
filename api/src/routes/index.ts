import { Router, Request, Response } from 'express';
import { ApiResponse } from '../types';
import conversationRoutes from '../modules/conversation/routes';
import { conversationService } from '../modules/conversation/service';
import { conversationValidator } from '../modules/conversation/validator';
import { SaveMessageRequest } from '../modules/conversation/types';

const router = Router();

// Health check endpoint
router.get('/health', (req: Request, res: Response) => {
    const healthData = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    };

    const response: ApiResponse = {
        success: true,
        data: healthData
    };
    res.json(response);
});

// Rotas do módulo conversation
router.use('/conversation', conversationRoutes);

// Rota para compatibilidade com endpoints antigos
// GET /api/messages -> redireciona para /api/conversation/messages
router.get('/messages', (req: Request, res: Response) => {
    res.redirect(301, '/api/conversation/messages');
});

// POST /api/messages -> implementa a mesma lógica que /api/conversation/messages
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

        // Cria resposta automática do Curiosity (eco da mensagem do usuário)
        const curiosityResponse = await conversationService.addMessage(
            'Curiosity',
            sanitizedData.content
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
        console.error('Erro ao salvar mensagem (compatibilidade):', error);
        const response: ApiResponse = {
            success: false,
            error: 'Erro interno do servidor ao salvar mensagem'
        };
        res.status(500).json(response);
    }
});

// GET /api/stats -> redireciona para /api/conversation/stats
router.get('/stats', (req: Request, res: Response) => {
    res.redirect(301, '/api/conversation/stats');
});

export default router; 