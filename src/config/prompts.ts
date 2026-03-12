export function buildStructurizePrompt(text: string): string {
  return `あなたはDX施策の思考整理を支援するAIアシスタントです。
以下の自由記述テキストを分析し、マインドマップのノード候補を生成してください。

【入力テキスト】
${text}

【出力形式】
以下のJSON配列のみを返してください（説明文不要）:
[
  {
    "label": "ノード名（簡潔に）",
    "reason": "このノードの説明や判断理由",
    "status": "considering"
  }
]

【ルール】
- ノードは3〜7個程度
- labelは15文字以内
- statusは "selected" | "considering" | "rejected" のいずれか
- JSON以外は絶対に出力しない`
}

export function buildJudgmentAxisPrompt(nodeLabel: string): string {
  return `DX施策「${nodeLabel}」の判断軸を検討しています。
このノードを評価する際の主要な判断基準を3〜5個、JSON配列で返してください。

[
  {
    "label": "判断軸名",
    "reason": "なぜこの軸が重要か",
    "status": "considering"
  }
]

JSON以外は出力しないでください。`
}
