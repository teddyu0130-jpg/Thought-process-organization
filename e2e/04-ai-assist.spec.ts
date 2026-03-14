// E2E section 4: AI思考整理補助フロー（4-1, 4-2 mock, 4-3, 4-4, 4-5 mock, 4-6 mock）
import { test, expect } from '@playwright/test'

const MOCK_SUGGESTIONS = [
  { label: 'トレーサビリティ強化', reason: '品質追跡のため', status: 'considering' as const },
  { label: '源流工程の見える化', reason: '対策の早期反映', status: 'considering' as const },
  { label: '拡大防止プロセス', reason: '市場流出防止', status: 'considering' as const },
]

function mockAnthropicSuccess(page: import('@playwright/test').Page) {
  return page.route('**/api/anthropic/v1/messages', async (route) => {
    const body = JSON.stringify({
      content: [{ type: 'text', text: JSON.stringify(MOCK_SUGGESTIONS) }],
    })
    await route.fulfill({ status: 200, body, contentType: 'application/json' })
  })
}

function mockAnthropicError(page: import('@playwright/test').Page, status: number) {
  return page.route('**/api/anthropic/v1/messages', (route) =>
    route.fulfill({ status, body: '{}', contentType: 'application/json' })
  )
}

function mockAnthropicInvalidBody(page: import('@playwright/test').Page) {
  return page.route('**/api/anthropic/v1/messages', async (route) => {
    const body = JSON.stringify({
      content: [{ type: 'text', text: 'This is not valid JSON array.' }],
    })
    await route.fulfill({ status: 200, body, contentType: 'application/json' })
  })
}

test.describe('4-1. AIパネルを開閉できる', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /新規テーマ/ }).first().click()
    await page.getByPlaceholder(/例）/).fill('AIテスト')
    await page.getByRole('button', { name: '作成' }).click()
    await page.getByText('AIテスト').first().click()
    await expect(page).toHaveURL(/\/canvas\//)
  })

  test('AI思考整理ボタンでパネルが開き、×で閉じる', async ({ page }) => {
    await page.getByRole('button', { name: 'AI思考整理' }).click()
    await expect(page.getByText('AI提案')).toBeVisible()
    await expect(page.getByText('散文メモからノード候補を生成します')).toBeVisible()
    await expect(page.getByRole('button', { name: 'AI整理を実行' })).toBeVisible()
    await page.locator('div').filter({ hasText: 'AI提案' }).getByRole('button').click()
    await expect(page.getByText('AI提案')).not.toBeVisible()
  })
})

test.describe('4-2, 4-3, 4-4. AI候補表示・選択・キャンバス追加', () => {
  test.beforeEach(async ({ page }) => {
    await mockAnthropicSuccess(page)
    await page.goto('/')
    await page.getByRole('button', { name: /新規テーマ/ }).first().click()
    await page.getByPlaceholder(/例）/).fill('AI候補テスト')
    await page.getByRole('button', { name: '作成' }).click()
    await page.getByText('AI候補テスト').first().click()
    await expect(page).toHaveURL(/\/canvas\//)
    await page.getByRole('button', { name: 'AI思考整理' }).click()
  })

  test('自由記述からAI整理実行で候補が表示され、選択してキャンバスに追加できる', async ({ page }) => {
    await page.getByPlaceholder(/自由記述/).fill('市場で品質不具合が発生したときにすぐに対象を特定し、拡大を防止する。')
    await page.getByRole('button', { name: 'AI整理を実行' }).click()
    await expect(page.getByText('整理中...')).toBeVisible({ timeout: 2000 }).catch(() => {})
    await expect(page.getByText('トレーサビリティ強化')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('提案 (3件)')).toBeVisible()
    await expect(page.getByText('全選択').or(page.getByText('全解除'))).toBeVisible()
    const addButton = page.getByRole('button', { name: /選択した \d+ 件をキャンバスに追加/ })
    await expect(addButton).toBeVisible()
    await addButton.click()
    await expect(page.getByText('トレーサビリティ強化').first()).toBeVisible()
    await expect(page.getByText('源流工程の見える化').first()).toBeVisible()
    await expect(page.getByText('拡大防止プロセス').first()).toBeVisible()
  })

  test('候補の全選択・全解除トグルが動く', async ({ page }) => {
    await page.getByPlaceholder(/自由記述/).fill('メモ')
    await page.getByRole('button', { name: 'AI整理を実行' }).click()
    await expect(page.getByText('トレーサビリティ強化')).toBeVisible({ timeout: 10000 })
    await page.getByText('全解除').click()
    await page.getByRole('button', { name: /選択した 0 件/ }).click()
    const firstCard = page.locator('text=トレーサビリティ強化').first()
    await firstCard.click()
    await page.getByRole('button', { name: /選択した 1 件/ }).click()
    await expect(page.getByText('トレーサビリティ強化').first()).toBeVisible()
  })
})

test.describe('4-5. AI APIエラー時にエラーメッセージ表示', () => {
  test.beforeEach(async ({ page }) => {
    await mockAnthropicError(page, 500)
    await page.goto('/')
    await page.getByRole('button', { name: /新規テーマ/ }).first().click()
    await page.getByPlaceholder(/例）/).fill('APIエラーテスト')
    await page.getByRole('button', { name: '作成' }).click()
    await page.getByText('APIエラーテスト').first().click()
    await page.getByRole('button', { name: 'AI思考整理' }).click()
  })

  test('API失敗時にパネル内にエラーが表示されパネルは閉じない', async ({ page }) => {
    await page.getByPlaceholder(/自由記述/).fill('任意テキスト')
    await page.getByRole('button', { name: 'AI整理を実行' }).click()
    await expect(page.getByText(/AI補助が一時的に利用できません|500/)).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('AI提案')).toBeVisible()
    await expect(page.getByRole('button', { name: 'AI整理を実行' })).toBeVisible()
  })
})

test.describe('4-6. AIレスポンスパース失敗時のエラー表示', () => {
  test.beforeEach(async ({ page }) => {
    await mockAnthropicInvalidBody(page)
    await page.goto('/')
    await page.getByRole('button', { name: /新規テーマ/ }).first().click()
    await page.getByPlaceholder(/例）/).fill('パースエラーテスト')
    await page.getByRole('button', { name: '作成' }).click()
    await page.getByText('パースエラーテスト').first().click()
    await page.getByRole('button', { name: 'AI思考整理' }).click()
  })

  test('不正フォーマット時に解析エラーメッセージが表示される', async ({ page }) => {
    await page.getByPlaceholder(/自由記述/).fill('テキスト')
    await page.getByRole('button', { name: 'AI整理を実行' }).click()
    await expect(page.getByText(/AIの応答を解析できませんでした/)).toBeVisible({ timeout: 10000 })
  })
})
