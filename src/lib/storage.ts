import type { Theme, ThemeRepository, StorageUsage } from '@/types'

const STORAGE_KEY = 'dx-thought-map:themes'
const STORAGE_LIMIT = 5 * 1024 * 1024 // 5MB

export class LocalStorageAdapter implements ThemeRepository {
  loadThemes(): Theme[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return []
      return JSON.parse(raw) as Theme[]
    } catch {
      return []
    }
  }

  saveThemes(themes: Theme[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(themes))
  }

  getStorageUsage(): StorageUsage {
    const raw = localStorage.getItem(STORAGE_KEY) ?? ''
    const used = new Blob([raw]).size
    return {
      used,
      limit: STORAGE_LIMIT,
      ratio: used / STORAGE_LIMIT,
    }
  }
}

export const storageAdapter = new LocalStorageAdapter()
