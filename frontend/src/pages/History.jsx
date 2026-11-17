import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, CalendarDays, ChevronRight, FileText, History as HistoryIcon, MapPin, Sprout, Wheat } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { getHistory } from '../services/api'

export default function History() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => { getHistory().then(setItems).catch(()=>setItems([])).finally(()=>setLoading(false)) }, [])
  return (
    <div>
      <PageHeader eyebrow="Your field journal" title="Every decision, remembered." description="Revisit your previous field briefings and the information behind them." actionLabel="Create new advisory"/>
      <section className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#edf1eb] px-4 py-4 sm:px-5"><div><div className="font-display text-[14px] font-extrabold text-[#2e4033]">Recent advisories</div><div className="mt-1 text-[9px] text-[#96a198]">Your saved field reports</div></div><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eff5ec] text-forest-700"><HistoryIcon size={16}/></div></div>
        {loading ? <div className="py-14 text-center text-[11px] text-[#9aa69c]">Loading your field journal...</div> : items.length ? <div className="divide-y divide-[#eef1ec]">{items.map((item)=> <Link key={item.id} to={`/advisory/${item.id}`} className="group flex flex-wrap items-center gap-3 px-4 py-4 transition hover:bg-[#fafcf9] sm:px-5"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eff5ec] text-forest-700"><Wheat size={17}/></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="text-[11px] font-bold text-[#415246]">{item.crop} advisory</span><span className="rounded-full bg-[#eff6ed] px-2 py-0.5 text-[8px] font-bold text-[#5b8a61]">{item.status}</span></div><div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[9px] text-[#96a198]"><span className="flex items-center gap-1"><MapPin size={10}/>{item.location}</span><span className="flex items-center gap-1"><Sprout size={10}/>{item.stage}</span><span className="flex items-center gap-1"><CalendarDays size={10}/>{new Date(item.created_at).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'})}</span></div></div><div className="flex items-center gap-2 text-[9px] font-bold text-forest-700">Open report <ChevronRight size={14} className="transition group-hover:translate-x-0.5"/></div></Link>)}</div> : <div className="px-5 py-16 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eff5ec] text-forest-700"><FileText size={21}/></div><div className="mt-3 font-display text-[15px] font-extrabold text-[#435448]">Your journal starts here.</div><p className="mx-auto mt-1 max-w-[290px] text-[10px] leading-[1.7] text-[#98a49a]">Once you generate a field advisory, it will appear here for quick reference.</p><Link to="/new-advisory" className="btn-primary mt-4">Create your first advisory <ArrowUpRight size={13}/></Link></div>}
      </section>
    </div>
  )
}
