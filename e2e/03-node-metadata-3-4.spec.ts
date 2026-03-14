// E2E test case 3-4: ステータス変更に応じてノードの見た目が変化する
import { test, expect } from '@playwright/test'

test.describe('3-4. ステータス変更に応じてノードの見た目が変化する', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /新規テーマ/ }).first().click()
    await page.getByPlaceholder(/例）/).fill('E2Eテーマ3-4')
    await page.getByRole('button', { name: '作成' }).click()
    await expect(page.getByText('E2Eテーマ3-4')).toBeVisible()
    await page.getByText('E2Eテーマ3-4').first().click()
    await expect(page).toHaveURL(/\/canvas\//)
    // 子ノードを2つ追加（ノードA, ノードB）
    await page.getByTitle('子ノードを追加').first().click()
    await page.getByTitle('子ノードを追加').first().click()
  })

  test('ノードAを選定済み、ノードBを却下にすると見た目が変わり、テーマ一覧のバッジも反映される', async ({ page }) => {
    // 非ルートのノードは2つ（ラベル「新しいノード」）。1つ目をクリックして詳細パネルを開く
    const childNodes = page.locator('.react-flow__node').filter({ hasText: '新しいノード' })
    await expect(childNodes).toHaveCount(2)
    await childNodes.first().click()
    // 詳細パネルで「選定済み」をクリック（StatusBadge）
    await page.getByText('選定済み', { exact: true }).click()
    await page.getByRole('button', { name: '保存' }).click()
    // 2つ目のノードをクリックして「却下」に変更
    await childNodes.nth(1).click()
    await page.getByText('却下', { exact: true }).click()
    await page.getByRole('button', { name: '保存' }).click()
    // キャンバス上で選定済み・却下のバッジが表示されている
    await expect(page.getByText('選定済み').first()).toBeVisible()
    await expect(page.getByText('却下').first()).toBeVisible()
    // テーマ一覧に戻る
    await page.getByRole('button', { name: /テーマ一覧に戻る/ }).click()
    await expect(page).toHaveURL('/')
    // テーマカードにステータスバッジが表示されている
    await expect(page.getByText('E2Eテーマ3-4').first()).toBeVisible()
    await expect(page.getByText('選定済み').or(page.getByText('検討中')).or(page.getByText('却下'))).toBeVisible()
  })
})
