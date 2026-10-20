/**
 * Enterprise AI Gateway Service
 * Manages resilient communication with NVIDIA NIM models:
 * - Nemotron 3.5 Lightning (30B) for reasoning, structural analysis & CAD calculations
 * - DeepSeek V4.1 Flash for vision inspection and blueprint digitization
 */

const IS_BROWSER = typeof window !== 'undefined';
// When in browser, route through Vite proxy (/api/nvidia) to prevent CORS blocking.
const PRIMARY_ENDPOINT = IS_BROWSER ? '/api/nvidia/chat/completions' : 'https://integrate.api.nvidia.com/v1/chat/completions';
const FALLBACK_ENDPOINT = 'https://integrate.api.nvidia.com/v1/chat/completions';

const NEMOTRON_KEY = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_NVIDIA_NEMOTRON_KEY) || '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';
const DEEPSEEK_KEY = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_NVIDIA_DEEPSEEK_KEY) || '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';

export interface AiGatewayResponse {
  content: string;
  reasoning?: string;
  model: string;
  usage?: { promptTokens: number; completionTokens: number };
}

export const aiGateway = {
  /**
   * Calls Nemotron 3.5 Lightning for complex architectural reasoning and CAD JSON synthesis
   */
  async callNemotron(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    options: {
      enableThinking?: boolean;
      reasoningBudget?: number;
      maxTokens?: number;
      temperature?: number;
    } = {}
  ): Promise<AiGatewayResponse> {
    const {
      enableThinking = false, // Set false for fast deterministic CAD JSON output
      reasoningBudget = 2048,
      maxTokens = 8192,
      temperature = 0.2
    } = options;

    const requestBody: any = {
      model: 'nvidia/nemotron-3.5-lightning-30b-a3b',
      messages,
      max_tokens: maxTokens,
      temperature
    };

    if (enableThinking) {
      requestBody.chat_template_kwargs = { enable_thinking: true };
      requestBody.reasoning_budget = reasoningBudget;
    } else {
      requestBody.chat_template_kwargs = { enable_thinking: false };
    }

    const endpoints = [PRIMARY_ENDPOINT, FALLBACK_ENDPOINT];
    let lastError: any = null;

    for (const url of endpoints) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${NEMOTRON_KEY}`
          },
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`NVIDIA NIM returned HTTP ${response.status}: ${errText.substring(0, 200)}`);
        }

        const data = await response.json();
        const choice = data?.choices?.[0];
        const content = choice?.message?.content || '';
        const reasoning = choice?.message?.reasoning_content || '';

        // If content is empty but reasoning is present, use reasoning as source
        const outputText = content.trim() ? content : (reasoning || '');

        return {
          content: outputText,
          reasoning: reasoning || undefined,
          model: data?.model || 'nvidia/nemotron-3.5-lightning-30b-a3b',
          usage: {
            promptTokens: data?.usage?.prompt_tokens || 0,
            completionTokens: data?.usage?.completion_tokens || 0
          }
        };
      } catch (err) {
        lastError = err;
        console.warn(`Nemotron request via ${url} failed, attempting next endpoint:`, err);
      }
    }

    throw lastError || new Error('All AI Gateway endpoints failed');
  },

  /**
   * Calls DeepSeek V4.1 Flash for vision inspection and blueprint digitization
   */
  async callDeepSeekVision(
    textPrompt: string,
    imageBase64: string
  ): Promise<AiGatewayResponse> {
    const formattedUrl = imageBase64.startsWith('data:') 
      ? imageBase64 
      : `data:image/jpeg;base64,${imageBase64}`;

    const requestBody = {
      model: 'deepseek-ai/deepseek-v4.1-flash',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: textPrompt },
            { type: 'image_url', image_url: { url: formattedUrl } }
          ]
        }
      ],
      max_tokens: 4096
    };

    const endpoints = [PRIMARY_ENDPOINT, FALLBACK_ENDPOINT];
    let lastError: any = null;

    for (const url of endpoints) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${DEEPSEEK_KEY}`
          },
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`DeepSeek returned HTTP ${response.status}: ${errText.substring(0, 200)}`);
        }

        const data = await response.json();
        const content = data?.choices?.[0]?.message?.content || '';

        return {
          content,
          model: data?.model || 'deepseek-ai/deepseek-v4.1-flash'
        };
      } catch (err) {
        lastError = err;
        console.warn(`DeepSeek vision via ${url} failed:`, err);
      }
    }

    throw lastError || new Error('DeepSeek Vision Gateway failed');
  }
};
