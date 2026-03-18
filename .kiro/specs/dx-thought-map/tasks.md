# Implementation Plan

## Task Format Legend
- `(P)` — 前タスクと並行実行可能
- `- [ ]*` — MVP後に延期可能なオプションテスト

---

- [ ] 1. プロジェクトセットアップ
- [ ] 1.1 Vite + React + TypeScript プロジェクトの初期化と依存関係インストール
  - Vite 5でReact + TypeScript テンプレートを初期化する
  - `@xyflow/react`、`zustand`、`react-router-dom` をインストールする
  - TypeScript を strict モードに設定する（`tsconfig.json` の `strict: true`）
  - `@/` パスエイリアスを `vite.config.ts` で `src/` にマップする
  - _Requirements: 2.1_

- [ ] 1.2 Vercel Functions と環境変数の設定
  - プロジェクトルートに `api/anthropic/v1/messages.ts` を追加し、Anthropic API へのプロキシ関数を実装する
  - `.env` ファイルを作成し `ANTHROPIC_API_KEY` を定義する
  - `.env` を `.gitignore` に追加する
  - `src/` 配下にディレクトリ構造（`components/`、`hooks/`、`types/`、`lib/`、`config/`）を作成する
  - _Requirements: 4.5_

- [ ] 2. データ型定義と永続化基盤
- [ ] 2.1 アプリ全体の型定義
  - `Theme`、`DecisionNode`、`DecisionNodeData`、`FlowEdge` の型を定義する
  - `NodeStatus`（`'selected' | 'considering' | 'rejected'`）を定義する
  - `NodeSuggestion`（AI提案候補）と `Position` の型を定義する
  - `ThemeRepository` インターフェース（`loadThemes`、`saveThemes`、`getStorageUsage`）を定義する
  - _Requirements: 2.1, 3.2, 4.1, 5.3_

- [ ] 2.2 (P) StorageAdapter の実装
  - `ThemeRepository` インターフェースを実装した `LocalStorageAdapter` クラスを作成する
  - `loadThemes` — localStorage から JSON をパースして返す。未初期化時は空配列を返す
  - `saveThemes` — themes を JSON.stringify して localStorage に保存する
  - `getStorageUsage` — 使用バイト数・上限・使用率（ratio）を返す
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 3. Zustand 状態管理ストア
- [ ] 3.1 useThemeStore の全アクション実装
  - `themes`（テーマ一覧）と `currentThemeId` をストアステートとして定義する
  - `createTheme`、`deleteTheme`、`selectTheme` アクションを実装する
  - `addNode`（親IDと初期ラベルを受け取り子ノードを生成）を実装する
  - `updateNode`（部分更新）、`deleteNode`（子孫・エッジも一括削除）、`updateNodePosition` を実装する
  - `addNodes`（AI提案候補の一括追加）を実装する
  - _Requirements: 1.1, 1.4, 2.2, 2.3, 2.5, 3.3_

- [ ] 3.2 StorageAdapter との同期とストレージ監視
  - ストア初期化時に `StorageAdapter.loadThemes` でデータを復元する
  - 全ミューテーション後に `StorageAdapter.saveThemes` を呼び出す
  - `getStorageUsage().ratio >= 0.9` の場合にストアに警告フラグを立てる
  - _Requirements: 1.5, 5.1, 5.2, 5.4_

- [ ] 4. テーマ一覧画面とルーティング
- [ ] 4.1 アプリルーティングの設定
  - `react-router-dom` で `/`（ThemeListPage）と `/canvas/:themeId`（MindMapCanvas）のルートを設定する
  - テーマ選択時に `/canvas/:themeId` へ遷移し `selectTheme` を呼ぶ処理を実装する
  - _Requirements: 1.3_

- [ ] 4.2 ThemeListPage の実装
  - テーマカード一覧をグリッドで表示する（タイトル・最終更新日時を含む）
  - 「新規テーマ作成」ボタンとタイトル入力ダイアログを実装する
  - テーマ削除の確認ダイアログを実装する
  - ストレージ警告フラグが立っている場合に警告バナーを表示する
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 5.4_

- [ ] 5. マインドマップキャンバス
- [ ] 5.1 MindMapCanvas 基盤の実装
  - `currentThemeId` のノード/エッジを React Flow の `useNodesState`/`useEdgesState` に初期ロードする
  - `onNodesChange`/`onEdgesChange` で useThemeStore に変更を伝播する
  - パン・ズームコントロールを有効化する（`<Controls />`、`<MiniMap />`）
  - `nodeTypes` に `DecisionNode` カスタムコンポーネントを登録する
  - _Requirements: 2.1, 2.4_

- [ ] 5.2 (P) DecisionNode カスタムコンポーネントの実装
  - ノードのステータス（選定済み・検討中・却下）を色で視覚的に区別する
  - ルートノード以外に「子ノード追加」ボタン（`+`アイコン）を表示する
  - ノードラベルをクリックで NodeDetailPanel が開くようにする
  - ルートノードには削除ボタンを表示しない
  - _Requirements: 2.2, 2.6, 3.1_

- [ ] 5.3 ノード操作の実装（追加・削除・ドラッグ）
  - 「子追加」ボタン押下で `useThemeStore.addNode` を呼び、新ノードをキャンバスに反映する
  - ノード削除時に `useThemeStore.deleteNode` を呼び、子孫・エッジも一括削除する
  - ノードドラッグ完了時（`onNodeDragStop`）に `updateNodePosition` を呼ぶ
  - _Requirements: 2.2, 2.3, 2.5_

- [ ] 6. ノードメタデータ編集パネル
- [ ] 6.1 NodeDetailPanel の実装
  - ノード選択時にサイドパネルとして表示する（MindMapCanvas 内に配置）
  - ラベル（必須）・判断理由・却下理由・関連情報・ステータスのフォームを実装する
  - ラベルが空の場合は保存ボタンを disabled にしてエラーメッセージを表示する
  - 保存時に `useThemeStore.updateNode` を呼び、キャンバスのノード表示を即時更新する
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 7. AI 思考整理機能
- [ ] 7.1 (P) AnthropicClient の実装
  - クライアントからは `/api/anthropic/v1/messages` に対して JSON ボディのみを送信し、APIキーを扱わない
  - サーバーサイド（Vercel Functions）で `process.env.ANTHROPIC_API_KEY` を用いて Anthropic API にリクエストを送る
  - レスポンスの content テキストから `NodeSuggestion[]` を JSON パースして返す
  - パース失敗時はエラーオブジェクトを返す（例外をスローしない）
  - _Requirements: 4.1, 4.4, 4.5_

- [ ] 7.2 (P) useAI フックの実装
  - `structurize(text: string): Promise<NodeSuggestion[]>` を提供するフックを実装する
  - `config/prompts.ts` のプロンプトテンプレートにユーザーテキストを注入して AnthropicClient に渡す
  - `isLoading`・`error` 状態を管理し、呼び出し元コンポーネントに公開する
  - `config/prompts.ts` に「自由記述→構造化ノード変換」と「判断軸問いかけ」の2種のプロンプトを定義する
  - _Requirements: 4.1, 4.2, 4.3_

- [ ] 7.3 AIAssistPanel の実装
  - テキストエリアと「AI整理」ボタンを持つパネルを実装する（MindMapCanvas に組み込む）
  - `useAI.structurize` を呼び出し、`isLoading` 中はスピナーを表示して入力を無効化する
  - 返却された `NodeSuggestion[]` をチェックボックスリストで表示し、全選択/全解除トグルを提供する
  - 選択された候補を「追加」ボタンで `useThemeStore.addNodes` に渡す
  - AI呼び出し失敗時はエラーメッセージをパネル内に表示する（パネルは閉じない）
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 8. エラーハンドリングと統合検証
- [ ] 8.1 グローバルエラー通知 UI の実装
  - トースト通知コンポーネントを実装し、AI APIエラー（401/429/500）を表示する
  - ストレージ容量警告バナーをアプリ全体のレイアウトに組み込む
  - _Requirements: 4.4, 5.4_

- [ ] 8.2 コア機能の統合検証
  - テーマ作成 → ノード追加 → メタデータ編集 → ページリロード後にデータが復元されることを確認する
  - ルートノードの削除が拒否されることを確認する
  - AI補助でノード候補が生成・追加されることを確認する
  - _Requirements: 1.1, 1.5, 2.5, 4.1, 5.1, 5.2_

- [ ]* 8.3 ユニットテスト
  - `StorageAdapter` — `loadThemes`（未初期化→空配列）・`saveThemes` → `loadThemes` で同値復元
  - `useThemeStore.deleteNode` — ルートノードが削除されないこと
  - `AnthropicClient` — パース失敗時にエラーオブジェクトを返すこと
  - _Requirements: 2.5, 5.1, 5.2, 4.4_
