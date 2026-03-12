import { useState } from 'react'
import { callAnthropicStructurize } from '@/lib/anthropic'
import { buildStructurizePrompt, buildJudgmentAxisPrompt } from '@/config/prompts'
import type { NodeSuggestion } from '@/types'

interface UseAIReturn {
  isLoading: boolean
  error: string | null
  structurize: (text: string) => Promise<NodeSuggestion[]>
  suggestJudgmentAxes: (nodeLabel: string) => Promise<NodeSuggestion[]>
}

export function useAI(): UseAIReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function structurize(text: string): Promise<NodeSuggestion[]> {
    setIsLoading(true)
    setError(null)
    const prompt = buildStructurizePrompt(text)
    const result = await callAnthropicStructurize(prompt)
    setIsLoading(false)
    if (!result.ok) {
      setError(result.error.message)
      return []
    }
    return result.data
  }

  async function suggestJudgmentAxes(nodeLabel: string): Promise<NodeSuggestion[]> {
    setIsLoading(true)
    setError(null)
    const prompt = buildJudgmentAxisPrompt(nodeLabel)
    const result = await callAnthropicStructurize(prompt)
    setIsLoading(false)
    if (!result.ok) {
      setError(result.error.message)
      return []
    }
    return result.data
  }

  return { isLoading, error, structurize, suggestJudgmentAxes }
}
