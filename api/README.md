# API Curiosity Backend

API backend para o sistema de conversação do Curiosity, desenvolvida com Express.js e TypeScript.
Integrada com a OpenAI API para gerar respostas inteligentes do assistente "Curiosity".

## 🚀 Como executar

### Pré-requisitos
- Node.js >= 18.0.0
- npm ou yarn
- API Key da OpenAI

### Configuração da OpenAI

1. Crie um arquivo `.env` na raiz do diretório `api/`:
```bash
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Server Configuration (opcional)
PORT=3001
```

2. **Para obter sua API key da OpenAI:**
   - Acesse https://platform.openai.com/api-keys
   - Faça login em sua conta OpenAI
   - Crie uma nova API key
   - Copie a key e cole no arquivo `.env`

### Instalação
```bash
cd api
npm install
```

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm run build
npm start
```

## 📝 Endpoints da API

### Base URL
```
http://localhost:3001/api
```

### 1. Salvar Mensagem
**POST** `/messages`

Salva uma nova mensagem do usuário e gera automaticamente uma resposta do Curiosity usando IA.

**Body:**
```json
{
  "author": "user",
  "content": "Olá, mundo!"
}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "userMessage": {
      "author": "user",
      "content": "Olá, mundo!",
      "timestamp": "2024-01-15T10:30:00.000Z"
    },
    "curiosityResponse": {
      "author": "Curiosity",
      "content": "Olá! É um prazer te conhecer! Como você está se sentindo hoje? Eu sou o Curiosity e estou sempre curioso para saber mais sobre as pessoas.",
      "timestamp": "2024-01-15T10:30:01.000Z"
    }
  }
}
```

### 2. Buscar Mensagens
**GET** `/messages`

Retorna todas as mensagens salvas.

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "author": "user",
      "content": "Primeira mensagem",
      "timestamp": "2024-01-15T10:30:00.000Z"
    },
    {
      "author": "user", 
      "content": "Segunda mensagem",
      "timestamp": "2024-01-15T10:31:00.000Z"
    }
  ]
}
```

### 3. Estatísticas
**GET** `/stats`

Retorna estatísticas sobre as mensagens.

**Resposta:**
```json
{
  "success": true,
  "data": {
    "totalMessages": 5,
    "lastMessageTime": "2024-01-15T10:31:00.000Z"
  }
}
```

### 4. Health Check
**GET** `/health`

Verifica se a API está funcionando.

**Resposta:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-15T10:32:00.000Z",
    "uptime": 3600
  }
}
```

## 💾 Banco de Dados

As mensagens são salvas no arquivo `database/conversation.json` com a seguinte estrutura:

```json
{
  "messages": [
    {
      "author": "user",
      "content": "Conteúdo da mensagem",
      "timestamp": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

## 🔧 Configuração

### Variáveis de Ambiente
- `OPENAI_API_KEY`: Chave da API da OpenAI (obrigatório)
- `PORT`: Porta do servidor (padrão: 3001)

### CORS
A API está configurada para aceitar requisições de:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000` (desenvolvimento)

## 🛡️ Tratamento de Erros

Todos os endpoints retornam respostas no formato:

**Sucesso:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Erro:**
```json
{
  "success": false,
  "error": "Descrição do erro"
}
```

## 📁 Estrutura do Projeto

```
api/
├── src/
│   ├── modules/
│   │   └── conversation/
│   │       ├── aiService.ts       # Integração com OpenAI API
│   │       ├── service.ts         # Gerenciamento de mensagens
│   │       ├── routes.ts          # Endpoints da API
│   │       ├── validator.ts       # Validação de dados
│   │       └── types.ts           # Tipos TypeScript do módulo
│   ├── routes/
│   │   └── index.ts               # Configuração de rotas
│   ├── types/
│   │   └── index.ts               # Tipos TypeScript globais
│   └── server.ts                  # Servidor Express principal
├── dist/                          # Código compilado
├── .env                           # Variáveis de ambiente (criar)
├── package.json
├── tsconfig.json
└── README.md
``` 