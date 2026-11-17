import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'

export default function AppShell() {
  const location = useLocation()
  const titles = {
    '/': ['Overview', 'Your agricultural command centre'],
    '/new-advisory': ['New advisory', 'A clearer view of what your field needs next'],
    '/market': ['Mandi intelligence', 'Market movement, without the guesswork'],
    '/schemes': ['Scheme library', 'Explore official agricultural support programmes'],
    '/history': ['Advisory history', 'Your field decisions, all in one place'],
  }
  const title = titles[location.pathname] || (location.pathname.startsWith('/advisory/') ? ['Advisory report', 'Your farm intelligence briefing'] : ['KhetSathi AI', 'Agricultural intelligence'])
  return (
    <div className="min-h-screen bg-sand">
      <Sidebar />
      <div className="min-h-screen md:pl-[252px]">
        <Topbar title={title[0]} />
        <main className="mobile-safe mx-auto w-full max-w-[1600px] px-4 pb-10 pt-6 sm:px-6 lg:px-8 lg:pt-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
