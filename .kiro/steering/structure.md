# Project Structure

## Organization Philosophy

機能（Feature）単位で関連ファイルをまとめるfeature-firstアプローチ。
ただしプロト規模のため、`components/`・`hooks/`・`types/` の浅いレイヤー構成から始め、複雑化したらfeature分割する。

## Directory Patterns

### エントリーポイント
**Location**: `/src/`
**Purpose**: アプリのルートファイル群
**Example**: `main.tsx`, `App.tsx`

### コンポーネント
**Location**: `/src/components/`
**Purpose**: UIコンポーネント。複数箇所で使う共通UIと、機能固有UIを分ける
**Example**:
```
components/
  canvas/        # マインドマップキャンバス（ノード・エッジ描画）
  theme/         # テーマ一覧・作成UI
  node/          # ノード詳細パネル（メタデータ編集）
  common/        # Button, Modal 等の汎用UI
```

### カスタムフック
**Location**: `/src/hooks/`
**Purpose**: ビジネスロジック・状態管理・副作用の分離
**Example**: `useThemeStore.ts`, `useAI.ts`, `useLocalStorage.ts`

### 型定義
**Location**: `/src/types/`
**Purpose**: データモデルの型定義を一元管理。コンポーネントに型を埋め込まない
**Example**:
```typescript
// types/index.ts
export interface Theme { id: string; title: string; nodes: Node[] }
export interface Node { id: string; label: string; reason?: string; status: NodeStatus }
```

### データ永続化
**Location**: `/src/lib/`
**Purpose**: localStorage操作・データ変換・AIクライアントなどのインフラ層
**Example**: `storage.ts`, `anthropic.ts`

### 定数・設定
**Location**: `/src/config/`
**Purpose**: AIプロンプトテンプレート、アプリ設定定数
**Example**: `prompts.ts`, `constants.ts`

## Naming Conventions

- **ファイル名**: PascalCase（コンポーネント）/ camelCase（hooks, lib, types）
- **Components**: PascalCase（`ThemeCard.tsx`, `NodePanel.tsx`）
- **Hooks**: `use` prefix + camelCase（`useAI.ts`, `useThemeStore.ts`）
- **Types/Interfaces**: PascalCase（`Theme`, `DecisionNode`）

## Import Organization

```typescript
// 1. 外部ライブラリ
import React from 'react'
import { ReactFlow } from 'reactflow'

// 2. 内部 — 絶対パス（@/）
import { useThemeStore } from '@/hooks/useThemeStore'
import type { Theme } from '@/types'

// 3. 内部 — 相対パス（同階層）
import { NodePanel } from './NodePanel'
```

**Path Aliases**:
- `@/`: `src/` にマップ（`vite.config.ts` で設定）

## Code Organization Principles

- **型先行**: 新機能はまず `types/` にデータモデルを定義してからコンポーネントを作る
- **ロジック分離**: コンポーネントにビジネスロジックを書かない。カスタムフックへ移す
- **データ層の抽象化**: `lib/storage.ts` を経由することで、Phase 3のDB移管時に変更箇所を局所化できる
- **AIプロンプトは設定として管理**: `config/prompts.ts` に集約し、コンポーネントに散在させない

---
_Document patterns, not file trees. New files following patterns shouldn't require updates_
