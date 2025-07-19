import { ref, onUnmounted, nextTick } from 'vue'
import { MessageManager } from '../utils/messageManager'
import type { Message } from '../types/api'

export function useMessages() {
    const messages = ref<Message[]>([])
    const isLoading = ref(false)
    const error = ref<string | null>(null)

    // Refs para cleanup
    let unsubscribeFromMessages: (() => void) | null = null
    let isDestroyed = false

    // Otimização de scroll - debounce
    let scrollTimeout: number | null = null

    const scrollToBottom = async (container: HTMLElement | null, immediate = false) => {
        if (!container || isDestroyed) return

        // Clear previous timeout
        if (scrollTimeout) {
            clearTimeout(scrollTimeout)
            scrollTimeout = null
        }

        const doScroll = () => {
            if (container && !isDestroyed) {
                // Força o scroll para o final
                container.scrollTop = container.scrollHeight

                // Também usa a API scrollTo como backup
                container.scrollTo({
                    top: container.scrollHeight,
                    behavior: immediate ? 'auto' : 'smooth'
                })
            }
        }

        if (immediate) {
            // Para scroll imediato, aguarda o DOM e faz múltiplas tentativas
            await nextTick()
            doScroll()

            // Segunda tentativa após um pequeno delay para garantir que o conteúdo foi renderizado
            setTimeout(() => {
                if (container && !isDestroyed) {
                    doScroll()
                }
            }, 10)
        } else {
            // Debounce para evitar scrolls excessivos
            scrollTimeout = setTimeout(async () => {
                await nextTick()
                doScroll()
            }, 100)
        }
    }

    // Melhor detecção de duplicatas usando ID único ou hash
    const generateMessageHash = (message: Message): string => {
        return `${message.author}-${message.content}-${new Date(message.timestamp).getTime()}`
    }

    const messageHashes = new Set<string>()

    const isDuplicate = (message: Message): boolean => {
        const hash = generateMessageHash(message)
        return messageHashes.has(hash)
    }

    const addMessageHash = (message: Message): void => {
        const hash = generateMessageHash(message)
        messageHashes.add(hash)
    }

    const loadMessages = async (): Promise<void> => {
        if (isDestroyed) return

        try {
            isLoading.value = true
            error.value = null

            const loadedMessages = await MessageManager.getAllMessages()

            if (isDestroyed) return // Check again after async operation

            messages.value = loadedMessages

            // Rebuild hash set para consistência
            messageHashes.clear()
            loadedMessages.forEach(addMessageHash)

        } catch (err) {
            if (!isDestroyed) {
                error.value = err instanceof Error ? err.message : 'Erro ao carregar mensagens'
                console.error('Erro ao carregar mensagens:', err)
            }
        } finally {
            if (!isDestroyed) {
                isLoading.value = false
            }
        }
    }

    const addMessage = async (message: Message, container?: HTMLElement | null): Promise<void> => {
        if (isDestroyed || isDuplicate(message)) return

        try {
            messages.value.push(message)
            addMessageHash(message)

            // Aguarda o próximo tick para garantir que a mensagem foi renderizada
            await nextTick()

            // Scroll to bottom com debounce
            if (container) {
                await scrollToBottom(container)
            }

        } catch (err) {
            if (!isDestroyed) {
                error.value = err instanceof Error ? err.message : 'Erro ao adicionar mensagem'
                console.error('Erro ao adicionar mensagem:', err)
            }
        }
    }

    const initializeMessages = async (getContainer: () => HTMLElement | null): Promise<void> => {
        if (isDestroyed) return

        // Carrega mensagens iniciais
        await loadMessages()

        if (isDestroyed) return

        // Scroll inicial (imediato) - aguarda o container estar disponível
        const container = getContainer()
        if (container) {
            await scrollToBottom(container, true)
        }

        // Configura listener para novas mensagens (SEM polling)
        unsubscribeFromMessages = MessageManager.onMessageSaved((message: Message) => {
            const currentContainer = getContainer()
            addMessage(message, currentContainer)
        })
    }

    const retryLoad = async (): Promise<void> => {
        await loadMessages()
    }

    // Cleanup robusto
    const cleanup = (): void => {
        isDestroyed = true

        // Clear scroll timeout
        if (scrollTimeout) {
            clearTimeout(scrollTimeout)
            scrollTimeout = null
        }

        // Unsubscribe from messages
        if (unsubscribeFromMessages) {
            unsubscribeFromMessages()
            unsubscribeFromMessages = null
        }

        // Clear refs
        messages.value = []
        messageHashes.clear()
        error.value = null
        isLoading.value = false
    }

    // Auto cleanup quando componente é destruído
    onUnmounted(cleanup)

    return {
        // State
        messages,
        isLoading,
        error,

        // Methods
        initializeMessages,
        addMessage,
        scrollToBottom,
        retryLoad,
        cleanup
    }
} 