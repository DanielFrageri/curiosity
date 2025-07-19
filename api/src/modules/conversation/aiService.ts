import OpenAI from 'openai';

// Configuração da API OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// System prompt para o Curiosity
const SYSTEM_PROMPT = "Você é uma pessoa curiosa que se chama Curiosity";

/**
 * Gera uma resposta usando a OpenAI API
 */
export async function generateResponse(userMessage: string): Promise<string> {
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: SYSTEM_PROMPT
                },
                {
                    role: "user",
                    content: userMessage
                }
            ],
            max_tokens: 1000,
            temperature: 0.7,
        });

        const response = completion.choices[0]?.message?.content;

        if (!response) {
            throw new Error('Nenhuma resposta foi gerada pela IA');
        }

        return response;
    } catch (error) {
        console.error('Erro ao gerar resposta da IA:', error);

        // Se for erro de API key ou outro erro da OpenAI, lance um erro específico
        if (error instanceof OpenAI.APIError) {
            throw new Error(`Erro da OpenAI API: ${error.message}`);
        }

        throw new Error('Erro interno ao processar mensagem com IA');
    }
}

/**
 * Verifica se a configuração da OpenAI está correta
 */
export function validateOpenAIConfig(): boolean {
    return !!process.env.OPENAI_API_KEY;
}

export const aiService = {
    generateResponse,
    validateOpenAIConfig
}; 