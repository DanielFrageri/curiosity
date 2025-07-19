<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useMessages } from '../composables/useMessages'
import type { Message } from '../types/api'

defineProps<{ msg: string }>()

const messagesContainer = ref<HTMLElement | null>(null)

// Usando o composable para gerenciar mensagens
const { 
  messages, 
  isLoading, 
  error, 
  initializeMessages, 
  retryLoad 
} = useMessages()

onMounted(async () => {
  // Aguarda o próximo tick para garantir que o DOM está montado
  await nextTick()
  
  // Inicializa mensagens com função que retorna o container para scroll automático
  await initializeMessages(() => messagesContainer.value)
})

const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleString('pt-BR')
}
</script>

<template>
  <div class="chat-history-container">
    <!-- Estado de carregamento -->
    <div v-if="isLoading && messages.length === 0" class="loading-state">
      <p>Carregando mensagens...</p>
    </div>
    
    <!-- Estado de erro -->
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="retryLoad" class="retry-button">
        Tentar Novamente
      </button>
    </div>
    
    <!-- Mensagens -->
    <div v-else-if="messages.length > 0" class="messages-container">
      <div class="messages-list" ref="messagesContainer">
        <div 
          v-for="(message, index) in messages" 
          :key="`${message.author}-${index}-${message.timestamp}`"
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
    
    <!-- Estado vazio -->
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
  height: 60vh;
  min-height: 400px;
  max-height: 600px;
}

.loading-state,
.error-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  text-align: center;
  border: 1px solid #555;
  border-radius: 8px;
  background-color: #7a7a7a;
}

.loading-state p {
  color: #ccc;
  font-style: italic;
  margin: 0;
}

.error-state p {
  color: #ff6b6b;
  margin-bottom: 16px;
}

.retry-button {
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.retry-button:hover {
  background-color: #0056b3;
}

.retry-button:focus {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}

.messages-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

.messages-list {
  flex: 1;
  overflow-y: auto;
  border: 1px solid #555;
  border-radius: 8px;
  padding: 10px;
  background-color: #7a7a7a;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message-item {
  padding: 12px;
  border-radius: 8px;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
  max-width: 80%;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.message-user {
  background-color: #1a1d1a;
  color: white;
  margin-left: auto;
  border-radius: 18px 18px 4px 18px;
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

.message-item:not(.message-user) {
  margin-right: auto;
  border-radius: 18px 18px 18px 4px;
  background-color: #9a9a9a;
  border: 1px solid #666;
  color: #fff;
}

.message-curiosity {
  background: linear-gradient(135deg, #4a148c, #6a1b9a) !important;
  border: 1px solid #3a0b6b !important;
  color: #fff !important;
  margin-right: auto !important;
  box-shadow: 0 2px 8px rgba(74, 20, 140, 0.3) !important;
}

.message-curiosity .message-author {
  color: #e1bee7 !important;
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
  white-space: pre-wrap;
  max-height: 150px;
  overflow-y: auto;
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
  background-color: #7a7a7a;
}

.no-messages p {
  margin: 0;
}

/* Media queries para responsividade */
@media (max-width: 768px) {
  .chat-history-container {
    height: 60vh;
    min-height: 300px;
    max-height: 500px;
  }
  
  .message-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .message-item {
    padding: 10px;
    max-width: 85%;
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
    max-width: 90%;
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
