import Groq from 'groq-sdk';
import pRetry, { RetryContext } from 'p-retry';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

// 2026 High-Precision Model Tiering
const MODEL_TIERS: Record<string, string[]> = {
    CONTENT: [
        'llama-3.3-70b-versatile',   // Tier 1: Primary (SEO Quality)
        'llama-3.1-70b-versatile',   // Tier 2: Secondary
        'mixtral-8x7b-32768'        // Tier 3: Urgent Fallback
    ],
    METADATA: [
        'llama-3.1-8b-instant',      // Tier 1: Primary (Speed/SEO)
        'gemma2-9b-it'              // Tier 2: Fallback
    ],
    IMAGE_PROMPT: [
        'llama-3.1-8b-instant',      // Tier 1: Primary
        'mixtral-8x7b-32768'        // Tier 2: Fallback
    ],
};

interface CompletionOptions {
    prompt: string;
    type: keyof typeof MODEL_TIERS;
    temperature?: number;
    jsonMode?: boolean;
}

interface GroqResponse {
    content: string;
    model_used: string;
}

/**
 * Generates content using Groq with a multi-tier fallback strategy.
 * Monitors for Rate Limits (429) and Empty results.
 */
export async function generateWithGroq({
    prompt,
    type,
    temperature = 0.7,
    jsonMode = false
}: CompletionOptions): Promise<GroqResponse> {
    const candidateModels = MODEL_TIERS[type];

    // Attempt with candidate models in order
    for (const model of candidateModels) {
        const run = async () => {
            try {
                const chatCompletion = await groq.chat.completions.create({
                    messages: [{ role: 'user', content: prompt }],
                    model: model,
                    temperature: temperature,
                    response_format: jsonMode ? { type: 'json_object' } : undefined,
                });

                const content = chatCompletion.choices[0]?.message?.content || '';

                // Critical Check: If content is empty, trigger retry/fallback
                if (!content || content.length < 5) {
                    throw new Error('Empty or too short response from model');
                }

                return {
                    content,
                    model_used: model
                };
            } catch (error: unknown) {
                const errorInfo = (typeof error === 'object' && error !== null)
                    ? error as { status?: number; headers?: Record<string, string>; message?: string }
                    : {};
                const status = errorInfo.status;
                const headers = errorInfo.headers;
                const message = errorInfo.message || String(error);

                if (status === 429) {
                    const resetTime = headers?.['x-ratelimit-reset-requests'] || 'unknown';
                    console.warn(`[Groq 429] Model ${model} rate limited. Resets in: ${resetTime}`);
                    throw new Error(`Rate limit exceeded for ${model}`);
                }

                if (status === 400 || status === 404) {
                    // Deprecated or invalid model - immediate fallback, no retry
                    console.error(`[Groq Critical] Model ${model} failed with status ${status}`);
                    return null; // Signals immediate move to next model
                }

                console.error(`[Groq Error] ${model}:`, message);
                throw error;
            }
        };

        try {
            const result = await pRetry(run, {
                retries: 2, // 2 retries per model before moving to fallback
                minTimeout: 3000,
                factor: 2,
                onFailedAttempt: (context: RetryContext) => {
                    console.warn(`[Retry] ${model} attempt ${context.attemptNumber} failed. ${context.retriesLeft} left.`);
                },
            });

            if (result) return result;
        } catch {
            console.error(`[Fallback] Exhausted retries for ${model}. Moving to next tier.`);
            continue; // Move to next model in the tier list
        }
    }

    throw new Error(`All Groq model tiers for ${type} failed to generate content.`);
}
