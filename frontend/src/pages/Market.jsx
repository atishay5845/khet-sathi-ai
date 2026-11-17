import { useEffect, useMemo, useState } from 'react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ArrowDownRight, ArrowUpRight, ChartNoAxesCombined, MapPin, Search, Wheat, RefreshCw, Info } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import SourceBadge from '../components/SourceBadge'
import { getMarketPrices, getMarketTrends } from '../services/api'

export default function Market() {
  const [crop, setCrop] = useState('Wheat')
  const [location, setLocation] = useState('Punjab')
  const [data, setData] = useState(null)
  const [trend, setTrend] = useState(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const [price, history] = await Promise.allSettled([getMarketPrices(crop, location), getMarketTrends(crop, location)])
    if (price.status === 'fulfilled') setData(price.value)
    if (history.status === 'fulfilled') setTrend(history.value)
    setLoading(false)
  }
  useEffect(() => { load() }, [crop, location])

  const series = useMemo(() => (trend?.observations || data?.observations || []).map((item) => ({ date: item.date?.slice(5) || '—', modal: item.modal_price })), [trend, data])
  const price = data?.modal || data?.modal_price
  const trendDirection = data?.trend?.direction || trend?.trend?.direction || '—'

  return (
    <div>
      <PageHeader eyebrow="Mandi intelligence" title="Read the market pulse." description="A clear view of mandi observations for the crops you care about." action={false}/>
      <div className="card mb-5 flex flex-wrap items-center gap-3 p-4 sm:p-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eff5ec] text-forest-700"><Search size={16}/></div>
        <div className="flex-1"><div className="text-[11px] font-bold text-[#435448]">Choose your market view</div><div className="mt-0.5 text-[9px] text-[#9aa69c]">Filter recent modal price observations</div></div>
        <select className="field !w-auto min-w-[130px] !py-2.5" value={crop} onChange={(e) => setCrop(e.target.value)}><option>Wheat</option><option>Paddy</option></select>
        <select className="field !w-auto min-w-[130px] !py-2.5" value={location} onChange={(e) => setLocation(e.target.value)}><option>Punjab</option><option>Madhya Pradesh</option><option>Haryana</option></select>
        <button className="btn-secondary !px-3 !py-2.5" onClick={load}><RefreshCw size={13}/></button>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-4"><div className="eyebrow">Modal price</div><div className="mt-2 font-display text-[27px] font-extrabold tracking-[-.05em] text-[#293c2d]">{price ? `₹${Number(price).toLocaleString('en-IN')}` : '—'}</div><div className="mt-1 text-[9px] text-[#96a198]">Per quintal · {data?.market || 'Market reference'}</div></div>
        <div className="card p-4"><div className="eyebrow">Price direction</div><div className="mt-2 flex items-center gap-2 font-display text-[24px] font-extrabold tracking-[-.04em] text-[#293c2d]">{trendDirection === 'Rising' ? <ArrowUpRight className="text-[#5d9565]"/> : trendDirection === 'Falling' ? <ArrowDownRight className="text-[#c27c63]"/> : <ChartNoAxesCombined className="text-[#8a9b8c]"/>}{trendDirection}</div><div className="mt-1 text-[9px] text-[#96a198]">Based on available observations</div></div>
        <div className="card p-4"><div className="eyebrow">Observation source</div><div className="mt-3"><SourceBadge demo={data?.is_demo ?? true} label={data?.source || 'Awaiting data'}/></div><div className="mt-2 text-[9px] text-[#96a198]">{data?.date || 'Latest available date'}</div></div>
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.55fr_.85fr]">
        <section className="card p-4 sm:p-5"><div className="flex items-start justify-between gap-3"><div><div className="eyebrow">Price history</div><h2 className="mt-1.5 font-display text-[17px] font-extrabold text-[#2c3e30]">{crop} · modal price</h2><p className="mt-1 text-[10px] text-[#9aa69c]">Recent observations, ₹ per quintal</p></div><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eff5ec] text-forest-700"><ChartNoAxesCombined size={17}/></div></div>
          <div className="mt-5 h-[290px]">{loading ? <div className="flex h-full items-center justify-center text-[11px] text-[#96a198]">Loading market observations...</div> : <ResponsiveContainer width="100%" height="100%"><AreaChart data={series} margin={{top:10,right:8,left:-18,bottom:0}}><defs><linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#79a77d" stopOpacity={.24}/><stop offset="100%" stopColor="#79a77d" stopOpacity={0}/></linearGradient></defs><CartesianGrid vertical={false} strokeDasharray="3 5" stroke="#edf1eb"/><XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill:'#9aa69d',fontSize:10}}/><YAxis axisLine={false} tickLine={false} tick={{fill:'#9aa69d',fontSize:10}}/><Tooltip formatter={(v)=>[`₹${Number(v).toLocaleString('en-IN')}`,'Modal price']} contentStyle={{borderRadius:12,borderColor:'#e7ece5',fontSize:11}}/><Area dataKey="modal" type="monotone" stroke="#5c9163" fill="url(#priceFill)" strokeWidth={2.5} activeDot={{r:4,stroke:'white',strokeWidth:2}}/></AreaChart></ResponsiveContainer>}</div>
          <div className="mt-3 border-t border-[#eef1ec] pt-3 text-[9px] text-[#9aa69c]">{data?.source || 'Market source'} · Price observations can differ by market, grade and arrival date.</div>
        </section>
        <section className="card p-4 sm:p-5"><div className="eyebrow">Market range</div><h2 className="mt-1.5 font-display text-[17px] font-extrabold text-[#2c3e30]">Today's price bands</h2><p className="mt-1 text-[10px] text-[#9aa69c]">Published minimum, modal and maximum values</p>
          <div className="mt-7 space-y-5">{[{label:'Minimum price',value:data?.min ?? data?.min_price,tone:'bg-[#b8c9b0]'},{label:'Modal price',value:data?.modal ?? data?.modal_price,tone:'bg-[#5b9063]'},{label:'Maximum price',value:data?.max ?? data?.max_price,tone:'bg-[#9eb9a0]'}].map((item)=> <div key={item.label}><div className="mb-2 flex justify-between text-[10px]"><span className="font-semibold text-[#6f7f73]">{item.label}</span><b className="text-[#3e5043]">{item.value ? `₹${Number(item.value).toLocaleString('en-IN')}` : '—'}</b></div><div className="h-2 overflow-hidden rounded-full bg-[#f0f3ee]"><div className={`h-full rounded-full ${item.tone}`} style={{width:item.value?`${Math.min(Number(item.value)/(Number(data?.max || data?.max_price || item.value)*1.12)*100,100)}%`:'0%'}}/></div></div>)}</div>
          <div className="mt-8 rounded-xl bg-[#f7f9f5] p-3"><div className="flex gap-2"><Info size={13} className="mt-0.5 shrink-0 text-[#8d9d8e]"/><p className="text-[9px] leading-[1.7] text-[#869388]">These observations are not a guaranteed future price or a personalised sell/hold recommendation. Check your nearest mandi for grade-specific rates.</p></div></div>
        </section>
      </div>
    </div>
  )
}
