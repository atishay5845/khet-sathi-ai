import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Sprout, ChartNoAxesCombined, Landmark, History, Plus, Leaf, ChevronRight } from 'lucide-react'

const links = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/new-advisory', label: 'New advisory', icon: Plus },
  { to: '/market', label: 'Mandi intelligence', icon: ChartNoAxesCombined },
  { to: '/schemes', label: 'Scheme library', icon: Landmark },
  { to: '/history', label: 'Advisory history', icon: History },
]

export default function Sidebar() {
  return (
    <>
      <aside className="sidebar-scroll fixed inset-y-0 left-0 z-40 hidden w-[252px] flex-col border-r border-[#e8ede6] bg-white md:flex">
        <div className="flex h-[88px] items-center gap-3 px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-forest-700 text-white shadow-[0_7px_16px_rgba(47,102,64,.2)]"><Sprout size={22} strokeWidth={2.1}/></div>
          <div>
            <div className="font-display text-[17px] font-extrabold tracking-[-.055em] text-[#1c3223]">khet<span className="text-forest-600">sathi</span><span className="ml-1 text-[11px] font-bold text-[#94a297]">AI</span></div>
            <div className="mt-0.5 text-[9px] font-bold uppercase tracking-[.18em] text-[#a0aaa1]">Field intelligence</div>
          </div>
        </div>

        <div className="px-4 pt-5">
          <div className="mb-3 px-3 text-[9px] font-extrabold uppercase tracking-[.18em] text-[#a0aaa1]">Workspace</div>
          <nav className="space-y-1">
            {links.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end} className={({ isActive }) => `group flex items-center gap-3 rounded-xl px-3 py-[11px] text-[12px] font-semibold transition ${isActive ? 'bg-forest-50 text-forest-800' : 'text-[#78857b] hover:bg-[#f7f9f6] hover:text-[#334439]'}`}>
                {({ isActive }) => <><span className={`flex h-7 w-7 items-center justify-center rounded-lg ${isActive ? 'bg-white text-forest-700 shadow-sm' : 'text-[#9aa69c] group-hover:text-forest-700'}`}><Icon size={16} strokeWidth={2.1}/></span><span className="flex-1">{label}</span>{isActive && <span className="h-1.5 w-1.5 rounded-full bg-forest-600"/>}</>}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="mt-auto px-4 pb-5">
          <div className="relative overflow-hidden rounded-2xl bg-[#1d422c] p-4 text-white">
            <div className="absolute -right-6 -top-7 h-24 w-24 rounded-full border border-white/10"/><div className="absolute -right-1 top-7 h-14 w-14 rounded-full border border-white/10"/>
            <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-white/10"><Leaf size={16}/></div>
            <div className="relative mt-3 font-display text-[13px] font-bold">Grow with clarity.</div>
            <p className="relative mt-1 text-[10px] leading-[1.6] text-white/65">Thoughtful field insights, backed by useful information.</p>
            <div className="relative mt-3 flex items-center gap-1 text-[10px] font-bold text-[#d5e8d8]">Explore your insights <ChevronRight size={12}/></div>
          </div>
          <div className="mt-4 flex items-center gap-2 px-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e8f0e7] text-[10px] font-extrabold text-forest-800">KS</div>
            <div className="min-w-0 flex-1"><div className="truncate text-[11px] font-bold text-[#34463a]">Field workspace</div><div className="mt-0.5 text-[9px] text-[#98a49a]">Punjab region</div></div>
            <span className="h-1.5 w-1.5 rounded-full bg-[#6ba778]"/>
          </div>
        </div>
      </aside>

      <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-[#e7ece5] bg-white/95 px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 backdrop-blur md:hidden">
        {links.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} className={({ isActive }) => `flex min-w-0 flex-col items-center gap-1 px-2 py-1 text-[9px] font-bold ${isActive ? 'text-forest-700' : 'text-[#9aa69c]'}`}><Icon size={18}/><span className="max-w-[66px] truncate">{label === 'Mandi intelligence' ? 'Market' : label === 'Advisory history' ? 'History' : label === 'Scheme library' ? 'Schemes' : label === 'New advisory' ? 'Create' : 'Home'}</span></NavLink>)}
      </nav>
    </>
  )
}
