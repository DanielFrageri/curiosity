import { Router, Request, Response } from 'express';
import { ApiResponse } from '../types';
import conversationRoutes from '../modules/conversation/routes';

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

// POST /api/messages -> redireciona para /api/conversation/messages
router.post('/messages', (req: Request, res: Response) => {
    // Redireciona para a rota oficial
    res.redirect(307, '/api/conversation/messages');
});

// GET /api/stats -> redireciona para /api/conversation/stats
router.get('/stats', (req: Request, res: Response) => {
    res.redirect(301, '/api/conversation/stats');
});

export default router; 