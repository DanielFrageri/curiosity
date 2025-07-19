import express from 'express';
import cors from 'cors';
import { ApiResponse } from './types';
import apiRoutes from './routes';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'], // URLs do frontend Vite
    credentials: true
}));
app.use(express.json());

// Rotas da API
app.use('/api', apiRoutes);

// Middleware de tratamento de rotas não encontradas
app.use('*', (req, res) => {
    const response: ApiResponse = {
        success: false,
        error: `Rota ${req.originalUrl} não encontrada`
    };
    res.status(404).json(response);
});

// Middleware de tratamento de erros
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Erro não tratado:', error);
    const response: ApiResponse = {
        success: false,
        error: 'Erro interno do servidor'
    };
    res.status(500).json(response);
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📝 API disponível em http://localhost:${PORT}/api`);
    console.log(`💾 Banco de dados: database/conversation.json`);
    console.log(`🔄 Rotas organizadas por módulos:`);
    console.log(`   - Health: /api/health`);
    console.log(`   - Conversation: /api/conversation/*`);
    console.log(`   - Compatibilidade: /api/messages, /api/stats`);
});

export default app; 