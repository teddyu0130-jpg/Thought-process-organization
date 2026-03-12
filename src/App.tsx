import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ThemeListPage from '@/components/theme/ThemeListPage'
import MindMapCanvas from '@/components/canvas/MindMapCanvas'
import { ToastProvider } from '@/components/common/Toast'

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          <Route path="/" element={<ThemeListPage />} />
          <Route path="/canvas/:themeId" element={<MindMapCanvas />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  )
}
