import { Bell, Search, MapPin, ChevronDown, Menu } from 'lucide-react'

export default function Topbar({ title }) {
  return (
    <header className="sticky top-0 z-30 flex h-[70px] items-center justify-between border-b border-[#e9eee7] bg-[#f8faf6]/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <div className="md:hidden"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest-700 text-white"><Menu size={18}/></div></div>
        <div><div className="font-display text-[14px] font-extrabold tracking-[-.025em] text-[#25362a]">{title}</div><div className="mt-0.5 hidden text-[10px] text-[#94a096] sm:block">Tuesday, 17 November 2026</div></div>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden h-9 w-[205px] items-center gap-2 rounded-xl border border-[#e8ede6] bg-white px-3 text-[#9ba69d] lg:flex"><Search size={14}/><span className="text-[10px]">Search anything...</span><kbd className="ml-auto rounded border border-[#e8ede6] bg-[#fafbf9] px-1.5 py-0.5 text-[9px]">⌘ K</kbd></div>
        <button className="hidden h-9 items-center gap-2 rounded-xl border border-[#e8ede6] bg-white px-3 text-[10px] font-bold text-[#59685d] sm:flex"><MapPin size={13} className="text-forest-600"/> Punjab, India <ChevronDown size={12} className="text-[#a2ada4]"/></button>
        <button aria-label="Notifications" className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-[#e8ede6] bg-white text-[#7e8c81] transition hover:text-forest-700"><Bell size={16}/><span className="absolute right-[8px] top-[7px] h-1.5 w-1.5 rounded-full border border-white bg-[#d89a42]"/></button>
        <div className="ml-1 hidden h-8 w-8 items-center justify-center rounded-full bg-[#dfeadf] text-[10px] font-extrabold text-forest-800 sm:flex">KS</div>
      </div>
    </header>
  )
}
