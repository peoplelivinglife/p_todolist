import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import TopNav from './components/TopNav'
import BottomCTA from './components/BottomCTA'
import CalendarPage from './pages/CalendarPage'
import AddPage from './pages/AddPage'
import BacklogPage from './pages/BacklogPage'
import SettingsPage from './pages/SettingsPage'

function ShellLayout(){
  return (
    <div className="min-h-screen pb-16 sm:pb-20 md:pb-24">
      <TopNav />
      <main className="container-narrow py-4 sm:py-6 md:py-8">
        <Outlet />
      </main>
      <BottomCTA />
    </div>
  )
}

export default function App(){
  return (
    <Routes>
      <Route element={<ShellLayout/>}>
        <Route path="/" element={<CalendarPage/>} />
        <Route path="/add" element={<AddPage/>} />
        <Route path="/backlog" element={<BacklogPage/>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}