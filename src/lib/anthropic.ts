import type { NodeSuggestion } from '@/types'

const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined

interface AnthropicError {
  type: 'api_error' | 'parse_error' | 'auth_error' | 'rate_limit'
  message: string
}

type Result<T> = { ok: true; data: T } | { ok: false; error: AnthropicError }

export async function callAnthropicStructurize(
  prompt: string
): Promise<Result<NodeSuggestion[]>> {
  if (!API_KEY) {
    return { ok: false, error: { type: 'auth_error', message: 'APIキーが設定されていません。.envファイルを確認してください。' } }
  }

  let response: Response
  try {
    response = await fetch('/api/anthropic/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      }),
    })
  } catch {
    return { ok: false, error: { type: 'api_error', message: 'ネットワークエラーが発生しました。' } }
  }

  if (response.status === 401) {
    return { ok: false, error: { type: 'auth_error', message: 'APIキーが無効です。確認してください。' } }
  }
  if (response.status === 429) {
    return { ok: false, error: { type: 'rate_limit', message: 'レート制限に達しました。しばらく待ってから再試行してください。' } }
  }
  if (!response.ok) {
    return { ok: false, error: { type: 'api_error', message: `AI補助が一時的に利用できません（${response.status}）。` } }
  }

  let json: { content: Array<{ type: string; text: string }> }
  try {
    json = await response.json()
  } catch {
    return { ok: false, error: { type: 'parse_error', message: 'AIの応答を解析できませんでした。' } }
  }

  const text = json.content.find((c) => c.type === 'text')?.text ?? ''

  try {
    // Extract JSON array from text (handle markdown code fences)
    const match = text.match(/\[[\s\S]*\]/)
    if (!match) throw new Error('no array found')
    const raw = JSON.parse(match[0]) as NodeSuggestion[]
    return { ok: true, data: raw }
  } catch {
    return { ok: false, error: { type: 'parse_error', message: 'AIの応答を解析できませんでした。' } }
  }
}
