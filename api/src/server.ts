import express from 'express';
import cors from 'cors';
import { ApiResponse } from './types';
import apiRoutes from './routes';

const app = express();
const PORT = process.env.PORT || 3001;

// Configuração do CORS
app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true
}));

app.use(express.json());

// Rotas
app.use('/api', apiRoutes);

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
});

export default app; 