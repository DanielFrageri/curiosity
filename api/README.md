# API Curiosity Backend

API backend simples para o sistema de conversação do Curiosity, desenvolvida com Express.js e TypeScript.

## 🚀 Como executar

### Pré-requisitos
- Node.js >= 18.0.0
- npm ou yarn

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

Salva uma nova mensagem no arquivo conversation.json.

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
    "author": "user",
    "content": "Olá, mundo!",
    "timestamp": "2024-01-15T10:30:00.000Z"
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
│   ├── server.ts              # Servidor Express principal
│   ├── conversationService.ts # Serviço de gerenciamento de mensagens
│   └── types.ts               # Interfaces TypeScript
├── dist/                      # Código compilado
├── package.json
├── tsconfig.json
└── README.md
``` 