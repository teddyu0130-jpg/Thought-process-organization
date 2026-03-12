# Requirements Document

## Introduction

DX思考マップは、DX施策の検討過程・意思決定の経緯を可視化・構造化するWebアプリである。
DX推進チーム（生産技術部門、数名）が、テーマ単位でマインドマップ的に思考を記録・共有できるプロトタイプを1週間以内に完成させる。
スタック：Vite + React + TypeScript + @xyflow/react + Anthropic API（Claude）

---

## Requirements

### Requirement 1: テーマ管理

**Objective:** As a DX推進チームメンバー, I want DX施策テーマを作成・一覧表示・削除できる, so that 検討中の施策を整理し素早く目的のテーマへアクセスできる

#### Acceptance Criteria

1. When ユーザーが新規テーマ作成を実行した場合, the DX思考マップ shall タイトル入力UIを表示し、確定後にテーマ一覧へ追加する
2. The DX思考マップ shall 保存済みテーマをカード形式で一覧表示し、タイトル・最終更新日時を含める
3. When ユーザーがテーマカードを選択した場合, the DX思考マップ shall そのテーマのマインドマップキャンバス画面へ遷移する
4. When ユーザーがテーマを削除した場合, the DX思考マップ shall 確認ダイアログを表示し、承認後にテーマとその全ノードを削除する
5. The DX思考マップ shall テーマデータをlocalStorageに永続化し、ページリロード後も保持する

---

### Requirement 2: マインドマップキャンバス

**Objective:** As a DX推進チームメンバー, I want テーマを起点にノードとエッジでツリー構造を視覚的に構築できる, so that 施策の検討過程を構造化して把握できる

#### Acceptance Criteria

1. The DX思考マップ shall テーマをルートノードとするマインドマップをReact Flowキャンバス上に表示する
2. When ユーザーがノード追加を実行した場合, the DX思考マップ shall 指定した親ノードの子として新しいノードを追加しエッジで接続する
3. When ユーザーがノードをドラッグした場合, the DX思考マップ shall ノードの位置をリアルタイムで更新する
4. The DX思考マップ shall キャンバスのパン（移動）とズームをサポートする
5. When ユーザーがノードを削除した場合, the DX思考マップ shall そのノードと子孫ノード・接続エッジを全て削除する
6. The DX思考マップ shall ノードの状態（選定済み・検討中・却下）を色またはアイコンで視覚的に区別する

---

### Requirement 3: ノードメタデータ管理

**Objective:** As a DX推進チームメンバー, I want 各ノードに意思決定の根拠を記録できる, so that 「なぜこの施策を選んだか・捨てたか」を後から追跡できる

#### Acceptance Criteria

1. When ユーザーがノードを選択した場合, the DX思考マップ shall サイドパネルまたはモーダルでそのノードの詳細編集UIを表示する
2. The DX思考マップ shall 各ノードに以下のフィールドを持たせる：ラベル（必須）、判断理由、却下理由、関連情報、ステータス（選定済み／検討中／却下）
3. When ユーザーがメタデータを保存した場合, the DX思考マップ shall 変更をlocalStorageに即時反映する
4. The DX思考マップ shall ノードのステータスに応じてキャンバス上のノード表示を更新する
5. If 必須フィールド（ラベル）が空の状態で保存しようとした場合, the DX思考マップ shall エラーメッセージを表示し保存をブロックする

---

### Requirement 4: AI思考整理補助

**Objective:** As a DX推進チームメンバー, I want 散文的なメモをAIが構造化ノードに変換・提案してくれる, so that 思考の整理が加速しノード入力の手間が減る

#### Acceptance Criteria

1. When ユーザーが自由記述テキストを入力してAI整理を実行した場合, the DX思考マップ shall Anthropic API（Claude）にテキストを送信し、構造化されたノード候補リストを返す
2. The DX思考マップ shall AIが返したノード候補を「提案パネル」として表示し、ユーザーが取捨選択してキャンバスに追加できるようにする
3. Where AI補助機能が有効な場合, the DX思考マップ shall 既存ノード選択時に「このノードの判断軸は何ですか？」等のプロンプトを提示できる
4. When Anthropic APIの呼び出しが失敗した場合, the DX思考マップ shall エラーメッセージを表示しローカル操作は継続できる状態を保つ
5. The DX思考マップ shall APIキーを環境変数（VITE_ANTHROPIC_API_KEY）から読み込み、ソースコードにハードコードしない

---

### Requirement 5: データ永続化

**Objective:** As a DX推進チームメンバー, I want データがローカルに保存され、再起動後も失われない, so that プロト段階でもデータが安全に保持される

#### Acceptance Criteria

1. The DX思考マップ shall 全テーマ・ノード・エッジ・メタデータをlocalStorageに保存する
2. When アプリが起動した場合, the DX思考マップ shall localStorageから既存データを読み込み復元する
3. The DX思考マップ shall データ構造をJSON形式で保持し、将来のSupabase移管時にスキーマ変換が容易な設計にする
4. If localStorageの容量上限に近づいた場合, the DX思考マップ shall 警告を表示する

