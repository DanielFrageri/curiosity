<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { MessageManager, type Message } from '../utils/messageManager'

defineProps<{ msg: string }>()

const messages = ref<Message[]>([])

const loadMessages = async () => {
  try {
    messages.value = await MessageManager.getAllMessages()
  } catch (error) {
    console.error('Erro ao carregar mensagens:', error)
  }
}

onMounted(() => {
  loadMessages()
  // Atualiza a lista a cada 3 segundos para mostrar novas mensagens
  setInterval(loadMessages, 3000)
})

const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleString('pt-BR')
}
</script>

<template>
  <div class="chat-history-container">
    <h1>{{ msg }}</h1>
    
    <div v-if="messages.length > 0" class="messages-container">
      <h2>Mensagens salvas:</h2>
      <div class="messages-list">
        <div 
          v-for="(message, index) in messages" 
          :key="index"
          class="message-item"
          :class="`message-${message.author}`"
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
}

.messages-container {
  margin-top: 20px;
}

.messages-container h2 {
  color: #333;
  margin-bottom: 15px;
  font-size: 1.2em;
}

.messages-list {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 10px;
  background-color: #fafafa;
}

.message-item {
  margin-bottom: 15px;
  padding: 12px;
  border-radius: 8px;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.message-item:last-child {
  margin-bottom: 0;
}

.message-user {
  border-left: 4px solid #007bff;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 0.9em;
}

.message-author {
  font-weight: bold;
  color: #007bff;
  text-transform: capitalize;
}

.message-time {
  color: #666;
  font-size: 0.85em;
}

.message-content {
  color: #333;
  line-height: 1.4;
}

.no-messages {
  padding: 20px;
  text-align: center;
  color: #666;
  font-style: italic;
}

.no-messages p {
  margin: 0;
}
</style>
