import { useEffect, useState } from 'react'
import { ExternalLink, Landmark, Search, ShieldCheck, FileText, ArrowUpRight, BookOpen, ChevronRight } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { getSchemes } from '../services/api'

const featured = [
  { name: 'PM-KISAN', full: 'Pradhan Mantri Kisan Samman Nidhi', desc: 'Income support for eligible landholding farmer families, subject to government conditions.', url: 'https://pmkisan.gov.in/', tag: 'Income support', tone: 'bg-[#edf5ea] text-[#56805b]' },
  { name: 'PMFBY', full: 'Pradhan Mantri Fasal Bima Yojana', desc: 'Crop insurance coverage under notified crops, areas and seasonal enrolment windows.', url: 'https://pmfby.gov.in/', tag: 'Crop insurance', tone: 'bg-[#f5f1e6] text-[#a38a4f]' },
  { name: 'KCC', full: 'Kisan Credit Card', desc: 'A credit facility for eligible farmers, subject to lender assessment and applicable guidelines.', url: 'https://www.myscheme.gov.in/', tag: 'Farm credit', tone: 'bg-[#edf2f6] text-[#607e9a]' },
  { name: 'PMKSY', full: 'Pradhan Mantri Krishi Sinchayee Yojana', desc: 'Programmes focused on irrigation access and improving water-use efficiency.', url: 'https://pmksy.gov.in/', tag: 'Water management', tone: 'bg-[#f1f3e8] text-[#8d965e]' },
]

export default function Schemes() {
  const [query, setQuery] = useState('wheat farmer support Punjab')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  async function search(e) {
    e?.preventDefault()
    setLoading(true)
    try { const data = await getSchemes(query); setResults(data.results || []); setSearched(true) } catch { setResults([]); setSearched(true) } finally { setLoading(false) }
  }
  useEffect(() => { search() }, [])

  return (
    <div>
      <PageHeader eyebrow="Government support" title="Find support that fits." description="Explore scheme references and understand what to verify before applying." action={false}/>
      <div className="relative mb-6 overflow-hidden rounded-[22px] bg-[#1d422c] p-5 text-white sm:p-7"><div className="absolute -right-10 -top-14 h-56 w-56 rounded-full border border-white/10"/><div className="relative flex flex-wrap items-center gap-4"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-[#dce9dc]"><Landmark size={22}/></div><div className="max-w-[550px]"><div className="font-display text-[21px] font-extrabold tracking-[-.04em]">The right information makes a difference.</div><p className="mt-1.5 text-[10px] leading-[1.7] text-[#c3d7c5]">Search a locally indexed collection of scheme references. Every result includes the source document used for retrieval.</p></div></div><form onSubmit={search} className="relative mt-5 flex flex-col gap-2 rounded-xl bg-white p-1.5 sm:flex-row"><div className="flex flex-1 items-center gap-2 px-3"><Search size={15} className="text-[#91a095]"/><input className="w-full bg-transparent py-2 text-[11px] text-[#3c4c40] outline-none placeholder:text-[#a6b0a7]" value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search by crop, region or support need"/></div><button className="btn-primary !rounded-lg !px-5 !py-2.5" disabled={loading}>{loading?'Searching...':'Search schemes'} <ArrowUpRight size={13}/></button></form></div>

      <div className="mb-4 flex items-end justify-between"><div><div className="eyebrow">Commonly explored</div><h2 className="mt-1.5 font-display text-[17px] font-extrabold text-[#2c3e30]">Explore key programmes</h2></div><div className="text-[9px] text-[#9aa69c]">Official destinations</div></div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{featured.map((item)=> <a key={item.name} href={item.url} target="_blank" rel="noreferrer" className="card group p-4 transition hover:-translate-y-0.5 hover:shadow-soft"><div className="flex items-center justify-between"><div className={`flex h-9 w-9 items-center justify-center rounded-xl ${item.tone}`}><FileText size={16}/></div><ArrowUpRight size={14} className="text-[#a1aca2] transition group-hover:text-forest-700"/></div><div className="mt-4 font-display text-[16px] font-extrabold text-[#2f4033]">{item.name}</div><div className="mt-1 text-[10px] font-semibold text-[#65756a]">{item.full}</div><p className="mt-2 min-h-[44px] text-[9px] leading-[1.65] text-[#8d998f]">{item.desc}</p><div className="mt-3 inline-flex rounded-full bg-[#f5f7f3] px-2 py-1 text-[8px] font-bold text-[#809084]">{item.tag}</div></a>)}</div>

      <div className="mt-7 grid gap-5 xl:grid-cols-[1fr_.7fr]">
        <section className="card p-4 sm:p-5"><div className="flex items-center justify-between"><div><div className="eyebrow">Local RAG knowledge base</div><h2 className="mt-1.5 font-display text-[17px] font-extrabold text-[#2c3e30]">Retrieved references</h2></div><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eff5ec] text-forest-700"><BookOpen size={16}/></div></div>
          {loading ? <div className="py-10 text-center text-[10px] text-[#9aa69c]">Searching the scheme library...</div> : results.length ? <div className="mt-4 space-y-3">{results.map((item,index)=><div key={`${item.source}-${index}`} className="rounded-xl border border-[#edf1eb] p-3"><div className="flex items-center justify-between gap-3"><div className="text-[10px] font-bold text-[#45564a]">{item.source}</div><span className="rounded-full bg-[#f4f7f1] px-2 py-1 text-[8px] font-bold text-[#7e907f]">Retrieved passage</span></div><p className="mt-2 text-[10px] leading-[1.75] text-[#77857a]">{item.text}</p><div className="mt-2 text-[8px] text-[#a1aba3]">{item.page || 'Document section'}</div></div>)}</div> : <div className="mt-4 rounded-xl bg-[#f8faf7] p-5 text-center text-[10px] text-[#97a198]">{searched?'No matching passages found. Try a broader query.':'Search to retrieve source passages.'}</div>}
        </section>
        <section className="card h-fit p-4 sm:p-5"><div className="eyebrow">How to use this library</div><h2 className="mt-1.5 font-display text-[17px] font-extrabold text-[#2c3e30]">A careful match, not a promise.</h2><div className="mt-4 space-y-3">{[{title:'Search the source',desc:'The agent retrieves relevant passages from locally stored scheme documents.'},{title:'Read the conditions',desc:'Check whether your location, crop, season and farmer category are covered.'},{title:'Verify before applying',desc:'Use the official portal or local department to confirm current rules.'}].map((item,i)=><div className="flex gap-3" key={item.title}><div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#eff5ec] text-[10px] font-extrabold text-forest-700">0{i+1}</div><div><div className="text-[10px] font-bold text-[#4c5c50]">{item.title}</div><p className="mt-1 text-[9px] leading-[1.65] text-[#96a198]">{item.desc}</p></div></div>)}</div><div className="mt-5 rounded-xl bg-[#f7f9f5] p-3 text-[9px] leading-[1.7] text-[#879489]">Eligibility depends on current official guidelines, documents and verification. KhetSathi AI does not approve applications or guarantee benefits.</div><a href="https://www.myscheme.gov.in/" target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-bold text-forest-700">Open myScheme portal <ExternalLink size={11}/></a></section>
      </div>
    </div>
  )
}
