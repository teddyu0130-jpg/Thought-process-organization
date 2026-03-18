# Technology Stack

## Architecture

SPAアーキテクチャ。フロントエンドのみで完結するプロト構成。
データ層はPhase 1ではローカル（localStorage/JSON）、Phase 3でSupabase/PostgreSQLへ差し替える移管戦略を前提とした設計。

## Core Technologies

- **Language**: TypeScript
- **Framework**: React
- **Build Tool**: Vite
- **Runtime**: Node.js（開発環境）

## Key Libraries

- **マインドマップ描画**: @xyflow/react（React Flow） — React統合・TypeScript・インタラクティブ編集が標準装備のため選定
- **AI**: Anthropic API（Claude） — 思考整理補助・構造化提案・要約生成
- **状態管理**: React標準（useState / useReducer / Context）または Zustand（規模次第）

## Development Standards

### Type Safety
- TypeScript strict mode
- ノードデータモデルは型定義を先に設計する（`types/` に集約）

### Code Quality
- ESLint + Prettier
- コンポーネントはReact Function Component統一

### Testing
- プロト段階では最小限。コア機能（データモデル変換、AI応答パース）のみユニットテスト検討

## Development Environment

### Required Tools
- Node.js 20+
- Anthropic API Key（`.env` で管理、`.gitignore` 必須）

### Common Commands
```bash
# Dev: npm run dev
# Build: npm run build
# Test: npm test
```

### Environment Variables
```
ANTHROPIC_API_KEY=sk-ant-...
```

## Key Technical Decisions

1. **ローカルJSON優先** — プロト段階はDB不要。`localStorage` or JSONファイルで即始める。移管時にデータ層のみ差し替え可能な設計にする。
2. **描画ライブラリ = React Flow** — D3.jsはDOM競合・学習コストが高く1週間プロトに不向き。React FlowはReactネイティブ・TypeScript完全対応・ドラッグ編集標準装備で即戦力。
3. **AIはサーバーレス関数経由** — 本番デプロイ時はVercel Functions経由でAnthropic APIを呼び出し、APIキーはサーバーサイドのみで保持する。ローカル開発では必要に応じてVite devProxyを利用してもよい。
4. **API Keyはサーバー側** — APIキーは`ANTHROPIC_API_KEY`として環境変数に設定し、クライアントバンドルには含めない。

---
_Document standards and patterns, not every dependency_
