import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function AppLayout() {
  return (
    <div className="flex flex-col lg:flex-row h-screen bg-kfe-bg">
      <Sidebar />
      <main className="flex-1 overflow-auto pb-20 lg:pb-0">
        <Outlet />
      </main>
    </div>
  )
}
