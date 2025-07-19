<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { MessageManager, type Message } from '../utils/messageManager'

defineProps<{ msg: string }>()

const messages = ref<Message[]>([])
const messagesContainer = ref<HTMLElement | null>(null)
let unsubscribeFromMessages: (() => void) | null = null

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTo({
      top: messagesContainer.value.scrollHeight,
      behavior: 'smooth'
    })
  }
}

const loadMessages = async () => {
  try {
    messages.value = await MessageManager.getAllMessages()
    // Scroll to bottom after loading messages
    scrollToBottom()
  } catch (error) {
    console.error('Erro ao carregar mensagens:', error)
  }
}

const addMessageToList = async (message: Message) => {
  // Check if message already exists to avoid duplicates
  const exists = messages.value.some(m => 
    m.content === message.content && 
    m.author === message.author && 
    Math.abs(new Date(m.timestamp).getTime() - new Date(message.timestamp).getTime()) < 1000
  )
  
  if (!exists) {
    messages.value.push(message)
    // Scroll to bottom after adding new message
    scrollToBottom()
  }
}

onMounted(() => {
  // Load initial messages
  loadMessages()
  
  // Subscribe to real-time updates
  unsubscribeFromMessages = MessageManager.onMessageSaved(addMessageToList)
  
  // Periodically sync with server (less frequently now - every 30 seconds)
  // This serves as a backup to ensure we don't miss any messages
  const syncInterval = setInterval(loadMessages, 30000)
  
  // Store cleanup function
  onUnmounted(() => {
    clearInterval(syncInterval)
  })
})

onUnmounted(() => {
  // Cleanup event subscription
  if (unsubscribeFromMessages) {
    unsubscribeFromMessages()
  }
})

const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleString('pt-BR')
}
</script>

<template>
  <div class="chat-history-container">
    
    <div v-if="messages.length > 0" class="messages-container">
      <div class="messages-list" ref="messagesContainer">
        <div 
          v-for="(message, index) in messages" 
          :key="index"
          class="message-item"
          :class="[`message-${message.author}`, message.author === 'Curiosity' ? 'message-curiosity' : '']"
        >
          <div class="message-header">
            <span class="message-author">{{ message.author }}</span>
            <span class="message-time">{{ formatTime(message.timestamp) }}</span>
          </div>
          <div class="message-content">{{ message.content }}</div>
        </div>
      </div>
    </div>
    
    <div v-else class="no-messages">
      <p>Nenhuma mensagem salva ainda. Use o campo abaixo para enviar sua primeira mensagem!</p>
    </div>
  </div>
</template>

<style scoped>
.chat-history-container {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  height: 60vh; /* Altura responsiva baseada na viewport */
  min-height: 400px; /* Altura mínima para telas pequenas */
  max-height: 600px; /* Altura máxima para telas grandes */
}

.messages-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

.messages-container h2 {
  color: #333;
  margin-bottom: 15px;
  font-size: 1.2em;
  flex-shrink: 0; /* Não encolhe */
}

.messages-list {
  flex: 1; /* Ocupa todo o espaço disponível */
  overflow-y: auto;
  border: 1px solid #555;
  border-radius: 8px;
  padding: 10px;
  background-color: #7a7a7a; /* Cinza escuro */
  display: flex;
  flex-direction: column;
  gap: 12px; /* Espaçamento consistente entre mensagens */
}

.message-item {
  padding: 12px;
  border-radius: 8px;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  flex-shrink: 0; /* Não encolhe as mensagens */
  max-width: 80%; /* Largura máxima para criar bolhas de chat */
  word-wrap: break-word; /* Quebra palavras longas */
  overflow-wrap: break-word;
}

.message-user {
  background-color: #1a1d1a; /* Preto com leve tom esverdeado */
  color: white;
  margin-left: auto; /* Alinha à direita */
  border-radius: 18px 18px 4px 18px; /* Formato de bolha de chat */
}

.message-user .message-author {
  color: rgba(255, 255, 255, 0.9);
}

.message-user .message-time {
  color: rgba(255, 255, 255, 0.7);
}

.message-user .message-content {
  color: white;
}

/* Estilos para mensagens de outros autores */
.message-item:not(.message-user) {
  margin-right: auto; /* Alinha à esquerda */
  border-radius: 18px 18px 18px 4px; /* Formato de bolha de chat */
  background-color: #9a9a9a;
  border: 1px solid #666;
  color: #fff;
}

/* Estilos específicos para mensagens do Curiosity */
.message-curiosity {
  background: linear-gradient(135deg, #4a148c, #6a1b9a) !important; /* Roxo escuro com gradiente */
  border: 1px solid #3a0b6b !important;
  color: #fff !important;
  margin-right: auto !important; /* Alinha à esquerda */
  box-shadow: 0 2px 8px rgba(74, 20, 140, 0.3) !important; /* Sombra roxa sutil */
}

.message-curiosity .message-author {
  color: #e1bee7 !important; /* Roxo claro para o nome do autor */
  font-weight: bold !important;
}

.message-curiosity .message-time {
  color: rgba(255, 255, 255, 0.8) !important;
}

.message-curiosity .message-content {
  color: #fff !important;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 0.9em;
  flex-wrap: wrap;
  gap: 8px;
}

.message-author {
  font-weight: bold;
  color: #007bff;
  text-transform: capitalize;
  flex-shrink: 0;
}

.message-time {
  color: #666;
  font-size: 0.85em;
  flex-shrink: 0;
}

.message-content {
  color: #333;
  line-height: 1.4;
  word-break: break-word;
  white-space: pre-wrap; /* Preserva quebras de linha */
  max-height: 150px; /* Altura máxima para mensagens muito longas */
  overflow-y: auto; /* Scroll se necessário */
}

.no-messages {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  text-align: center;
  color: #ccc;
  font-style: italic;
  border: 1px solid #555;
  border-radius: 8px;
  background-color: #7a7a7a; /* Cinza escuro */
}

.no-messages p {
  margin: 0;
}

/* Media queries para responsividade */
@media (max-width: 768px) {
  .chat-history-container {
    height: 50vh;
    min-height: 300px;
    max-height: 400px;
  }
  
  .message-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .message-item {
    padding: 10px;
    max-width: 85%; /* Aumenta um pouco a largura em tablets */
  }
  
  .message-content {
    max-height: 120px;
  }
}

@media (max-width: 480px) {
  .chat-history-container {
    height: 45vh;
    min-height: 250px;
    max-height: 350px;
  }
  
  .message-item {
    max-width: 90%; /* Largura maior em mobile */
    padding: 8px;
  }
  
  .message-content {
    max-height: 100px;
  }
  
  .messages-list {
    padding: 8px;
    gap: 8px;
  }
}

@media (min-width: 1200px) {
  .chat-history-container {
    height: 65vh;
    max-height: 700px;
  }
  
  .message-content {
    max-height: 200px;
  }
}
</style>
