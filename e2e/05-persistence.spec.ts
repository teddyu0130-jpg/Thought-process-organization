// E2E section 5: データ永続化・容量警告（5-1, 5-2, 5-3, 5-4）
import { test, expect } from '@playwright/test'

const STORAGE_KEY = 'dx-thought-map:themes'
const STORAGE_LIMIT = 5 * 1024 * 1024

test.describe('5-1. テーマ・ノード・メタデータがリロード後も復元される', () => {
  test('作成→ノード追加→メタデータ編集→リロードで復元される', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /新規テーマ/ }).first().click()
    await page.getByPlaceholder(/例）/).fill('永続化テスト')
    await page.getByRole('button', { name: '作成', exact: true }).click()
    await page.getByText('永続化テスト').first().click()
    await expect(page).toHaveURL(/\/canvas\//)
    const themeUrl = page.url()
    await page.getByTitle('子ノードを追加').first().click()
    await page.getByTitle('子ノードを追加').first().click()
    await page.getByTitle('子ノードを追加').first().click()
    const childNodes = page.locator('.react-flow__node').filter({ hasText: '新しいノード' })
    await childNodes.first().getByTestId('node-click-area').dispatchEvent('click')
    await page.getByPlaceholder(/例.*ライン/).fill('編集したラベル')
    await page.getByPlaceholder(/なぜこの選択に至ったか/).fill('判断理由メモ')
    await page.getByText('選定済み', { exact: true }).click()
    await page.getByRole('button', { name: '保存' }).click()
    await page.reload()
    await page.goto(themeUrl)
    await expect(page.getByText('永続化テスト').first()).toBeVisible()
    await expect(page.getByText('編集したラベル').first()).toBeVisible()
    await expect(page.getByText('選定済み').first()).toBeVisible()
    await page.locator('.react-flow__node').filter({ hasText: '編集したラベル' }).getByTestId('node-click-area').dispatchEvent('click')
    await expect(page.getByPlaceholder(/例.*ライン/)).toHaveValue('編集したラベル')
  })
})

test.describe('5-2. 異なるテーマ間でデータが分離されている', () => {
  test('テーマAの変更がテーマBに反映されない', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /新規テーマ/ }).first().click()
    await page.getByPlaceholder(/例）/).fill('テーマA')
    await page.getByRole('button', { name: '作成', exact: true }).click()
    await page.getByRole('button', { name: /新規テーマ/ }).first().click()
    await page.getByPlaceholder(/例）/).fill('テーマB')
    await page.getByRole('button', { name: '作成', exact: true }).click()
    await page.getByText('テーマA').first().click()
    await expect(page).toHaveURL(/\/canvas\//)
    await page.getByTitle('子ノードを追加').first().click()
    const childA = page.locator('.react-flow__node').filter({ hasText: '新しいノード' }).first()
    await childA.getByTestId('node-click-area').dispatchEvent('click')
    await page.getByPlaceholder(/例.*ライン/).fill('テーマA専用ノード')
    await page.getByRole('button', { name: '保存' }).click()
    await page.getByRole('button', { name: /テーマ一覧に戻る/ }).click()
    await page.getByText('テーマB').first().click()
    await expect(page).toHaveURL(/\/canvas\//)
    await expect(page.getByText('テーマA専用ノード')).not.toBeVisible()
    await expect(page.getByText('テーマB').first()).toBeVisible()
  })
})

test.describe('5-3. localStorage 容量逼迫で警告バナー表示', () => {
  test('使用率90%以上でテーマ一覧・キャンバスに警告バナーが表示される', async ({ page }) => {
    await page.goto('/')
    const payload = JSON.stringify([
      {
        id: 'seed-theme',
        title: '容量テスト',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        nodes: [
          {
            id: 'seed-theme',
            type: 'decisionNode',
            position: { x: 0, y: 0 },
            data: {
              label: 'ルート',
              status: 'considering',
              isRoot: true,
              reason: 'x'.repeat(Math.floor(STORAGE_LIMIT * 0.92)),
            },
          },
        ],
        edges: [],
      },
    ])
    await page.evaluate(
      ({ key, value }) => localStorage.setItem(key, value),
      { key: STORAGE_KEY, value: payload }
    )
    await page.reload()
    await expect(page.getByText(/ストレージ容量が不足しています/)).toBeVisible()
    await page.getByText('容量テスト').first().click()
    await expect(page.getByText(/ストレージ容量が不足しています/)).toBeVisible()
  })
})

test.describe('5-4. テーマ削除で容量が減ると警告バナーが消える', () => {
  test('容量逼迫状態からテーマ削除でバナーが消える', async ({ page }) => {
    await page.goto('/')
    const payload = JSON.stringify([
      {
        id: 'big-theme',
        title: '削除用テーマ',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        nodes: [
          {
            id: 'big-theme',
            type: 'decisionNode',
            position: { x: 0, y: 0 },
            data: {
              label: 'ルート',
              status: 'considering',
              isRoot: true,
              reason: 'x'.repeat(Math.floor(STORAGE_LIMIT * 0.92)),
            },
          },
        ],
        edges: [],
      },
    ])
    await page.evaluate(
      ({ key, value }) => localStorage.setItem(key, value),
      { key: STORAGE_KEY, value: payload }
    )
    await page.reload()
    await expect(page.getByText(/ストレージ容量が不足しています/)).toBeVisible()
    await page.getByText('削除用テーマ').first().click()
    await page.getByRole('button', { name: /テーマ一覧に戻る/ }).click()
    await page.locator('div').filter({ hasText: '削除用テーマ' }).getByRole('button', { name: 'テーマを削除' }).click()
    await page.getByRole('button', { name: '削除', exact: true }).click()
    await expect(page.getByText(/ストレージ容量が不足しています/)).not.toBeVisible()
  })
})
