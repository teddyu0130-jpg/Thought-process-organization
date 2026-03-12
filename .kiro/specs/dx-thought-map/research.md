# Research & Design Decisions

---
**Purpose**: ディスカバリーフェーズの調査結果・アーキテクチャ検討・設計判断の根拠を記録する。

---

## Summary

- **Feature**: `dx-thought-map`
- **Discovery Scope**: New Feature（グリーンフィールドSPA）
- **Key Findings**:
  - React Flow v12（@xyflow/react）はノードのカスタムコンポーネント・ドラッグ・型安全を標準提供。プロト向き最適解。
  - Anthropic APIのクライアント直呼び出しはCORSが発生するため、Vite devProxyまたはSDK設定が必要。
  - localStorageの容量上限は約5MBで、ノード数が数百件以内なら十分。将来のSupabase移管に備えてデータ層は`lib/storage.ts`に集約する。

---

## Research Log

### React Flow v12（@xyflow/react）の利用方針

- **Context**: マインドマップキャンバスの描画ライブラリとして選定済み
- **Findings**:
  - `Node<T>` の `data` フィールドに任意のメタデータ（label, reason, status等）を型安全に持たせられる
  - カスタムノードコンポーネントは `nodeTypes` に登録するだけで差し替え可能
  - エッジも `EdgeTypes` でカスタマイズ可能
  - `useNodesState` / `useEdgesState` フックが状態管理の起点になる
  - ルートノード固定（削除不可）はノードIDによる条件分岐で実現
- **Implications**: DecisionNodeのメタデータをReact Flowの`node.data`に乗せる設計が最もシンプル

### Anthropic API クライアントサイド呼び出し

- **Context**: プロト段階でサーバーを持たずフロントエンドから直接呼び出す方針
- **Findings**:
  - ブラウザから`api.anthropic.com`への直接リクエストはCORSポリシーでブロックされる
  - Viteの`server.proxy`設定でローカル開発時に`/api/anthropic`→`https://api.anthropic.com`にプロキシ可能
  - `VITE_ANTHROPIC_API_KEY`は`import.meta.env`経由で読み込む。`.env`は`.gitignore`必須
  - 本番デプロイはPhase 3でサーバーサイドへ移行するため、今はdevProxyのみ対応で十分
- **Implications**: `lib/anthropic.ts`でVite proxy経由のリクエストを抽象化する

### localStorageの設計

- **Context**: DBなしでデータ永続化する方針
- **Findings**:
  - localStorageの上限は5MB（ブラウザ依存）
  - JSON.stringify/parseで十分。ノード数が数百件ならサイズ問題なし
  - キー設計：`dx-thought-map:themes`に全テーマ配列を格納するシンプルな設計
  - Supabase移管時は`lib/storage.ts`のみ差し替えれば他は変更不要な設計にする
- **Implications**: `ThemeRepository`インターフェースを定義し、localStorage実装とSupabase実装を差し替え可能にする

---

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| Context + useReducer | React標準の状態管理 | 依存ゼロ、学習コスト低 | ネスト深いと再レンダリング多い | プロト規模なら十分 |
| Zustand | 軽量グローバルストア | シンプルAPI、React外から操作可 | 依存追加 | 複雑化したら移行 |
| Jotai / Recoil | アトミック状態管理 | 細粒度更新 | 学習コスト、オーバーエンジニアリング | 不要 |

**選定**: **Zustand** — テーマ一覧ページとキャンバスページをまたぐグローバル状態（現在テーマ、ノード/エッジ）が必要なため。APIが最小限でContextより見通しが良い。

---

## Design Decisions

### Decision: 状態管理にZustandを採用

- **Context**: テーマ一覧→キャンバスの画面遷移をまたいで状態共有が必要
- **Alternatives Considered**:
  1. React Context + useReducer — 依存なし、ただし複数コンテキストのネストが発生
  2. Zustand — 単一ストアでシンプル管理
- **Selected Approach**: Zustand。`useThemeStore`に全データ（テーマ一覧・現在テーマ・ノード・エッジ）を集約
- **Rationale**: 画面間の状態共有がシンプル。localStorage同期もstoreのsubscribeで一元化できる
- **Trade-offs**: 依存ライブラリが1つ増えるが、バンドルサイズは約1KB（gzip）で影響なし
- **Follow-up**: 将来的にundoスタックが必要になったらzustand-middlewareのimmerと組み合わせる

### Decision: AIプロンプトをconfig/prompts.tsに集約

- **Context**: AIへの入力プロンプトがコンポーネントに散在するとメンテナンスが困難
- **Alternatives Considered**:
  1. コンポーネント内にハードコード — 素早いが管理できない
  2. `config/prompts.ts`に定数として集約 — 一元管理、テストしやすい
- **Selected Approach**: `config/prompts.ts`。関数形式にして動的パラメータを注入できるようにする
- **Rationale**: プロンプトチューニングを実装変更なしで行える
- **Trade-offs**: 間接参照が増えるがメリット大

### Decision: React FlowのノードデータとアプリのDecisionNodeを分離しない

- **Context**: React Flowの`Node<T>`のdataとアプリのデータモデルをどう対応させるか
- **Selected Approach**: `Node<DecisionNodeData>`として`node.data`にメタデータを直接持たせる。`DecisionNodeData`型をtypes/index.tsで定義
- **Rationale**: 変換レイヤーを増やすと複雑さが増すだけ。プロト規模では直接対応が最善
- **Trade-offs**: React Flowへの依存が型に現れる。Phase 3移管時に型の見直しが必要な可能性あり

---

## Risks & Mitigations

- **Anthropic API CORS問題** — Vite devProxy設定で回避。`vite.config.ts`に`server.proxy`を必ず設定する
- **localStorageのデータ肥大化** — テーマ数・ノード数が増えると5MB上限に近づく。プロト段階では警告表示のみ対応
- **React Flowのルートノード削除** — ユーザーがルートノードを削除するとマップが壊れる。`node.id === theme.id`の場合は削除ボタンを非表示にする
- **AI応答のパース失敗** — Claudeが期待外のフォーマットで返答した場合のフォールバック処理を`lib/anthropic.ts`に実装する

---

## References

- React Flow公式ドキュメント: https://reactflow.dev/learn
- React Flow カスタムノード: https://reactflow.dev/learn/customization/custom-nodes
- Zustand公式: https://zustand.docs.pmnd.rs/
- Vite環境変数: https://vitejs.dev/guide/env-and-mode
- Anthropic API Reference: https://docs.anthropic.com/en/api/
