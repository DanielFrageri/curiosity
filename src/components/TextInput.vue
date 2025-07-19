<script setup lang="ts">
import { ref } from 'vue'
import { MessageManager } from '../utils/messageManager'
import type { Message } from '../types/api'

const inputText = ref('')
const isLoading = ref(false)

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  inputText.value = target.value
}

const sendMessage = async () => {
  if (!inputText.value.trim() || isLoading.value) return

  const message: Message = {
    author: 'user',
    content: inputText.value.trim(),
    timestamp: new Date().toISOString()
  }

  try {
    isLoading.value = true
    await MessageManager.saveMessage(message)
    inputText.value = '' // Limpa o input após enviar
    
  } catch (error) {
    console.error('Erro ao salvar mensagem:', error)
    alert('Erro ao salvar mensagem. Tente novamente.')
  } finally {
    isLoading.value = false
  }
}

const handleKeyPress = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}
</script>

<template>
  <div class="text-input-container">
    <label for="textInput" class="input-label">Digite seu texto:</label>
    <div class="input-group">
      <input
        id="textInput"
        type="text"
        v-model="inputText"
        @input="handleInput"
        @keypress="handleKeyPress"
        placeholder="Escreva aqui..."
        class="text-input"
      />
      <button 
        @click="sendMessage"
        :disabled="!inputText.trim() || isLoading"
        class="send-button"
      >
        {{ isLoading ? 'Enviando...' : 'Enviar' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.text-input-container {
  margin: 20px 0;
  padding: 20px;
  border: 1px solid #555;
  border-radius: 8px;
  background-color: #7a7a7a; /* Cinza escuro */
}

.input-label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #fff;
}

.input-group {
  display: flex;
  gap: 10px;
  align-items: stretch;
}

.text-input {
  flex: 1;
  padding: 10px;
  border: 1px solid #555;
  border-radius: 4px;
  font-size: 16px;
  box-sizing: border-box;
  background-color: #5a5a5a;
  color: #fff;
}

.text-input:focus {
  outline: none;
  border-color: #1a1d1a;
  box-shadow: 0 0 0 2px rgba(26, 29, 26, 0.25);
}

.text-input::placeholder {
  color: #bbb;
}

.send-button {
  padding: 10px 20px;
  background-color: #1a1d1a; /* Mesma cor das mensagens */
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.send-button:hover:not(:disabled) {
  background-color: #2a2d2a; /* Versão ligeiramente mais clara para hover */
}

.send-button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}
</style> 