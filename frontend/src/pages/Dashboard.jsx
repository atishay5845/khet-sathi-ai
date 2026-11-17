import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ArrowUpRight, ArrowRight, CloudSun, Droplets, Wind, Sprout, Wheat, TrendingUp, ShieldCheck, Sparkles, MapPin, CalendarDays, ChevronRight, Leaf, Sun, CloudRain, Activity } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import SectionTitle from '../components/SectionTitle'
import SourceBadge from '../components/SourceBadge'
import { getMarketTrends, getWeather, getHealth } from '../services/api'

const fallbackTrend = [
  { day: '11 Nov', price: 2360 }, { day: '12 Nov', price: 2375 }, { day: '13 Nov', price: 2394 },
  { day: '14 Nov', price: 2386 }, { day: '15 Nov', price: 2408 }, { day: '16 Nov', price: 2416 }, { day: '17 Nov', price: 2425 },
]

function Metric({ icon: Icon, label, value, suffix, note, tone = 'green' }) {
  const tones = { green: 'bg-[#eff6ef] text-[#4b8355]', amber: 'bg-[#fff6e9] text-[#b4833a]', blue: 'bg-[#edf4f8] text-[#58809a]', slate: 'bg-[#f1f3ef] text-[#768477]' }
  return <div className="card flex items-start gap-3 p-4"><div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}><Icon size={18}/></div><div className="min-w-0"><div className="text-[10px] font-semibold text-[#8b978d]">{label}</div><div className="mt-1 font-display text-[23px] font-extrabold tracking-[-.05em] text-[#223529]">{value}<span className="ml-0.5 text-[12px] font-bold text-[#8a978d]">{suffix}</span></div><div className="mt-1 text-[9px] text-[#97a299]">{note}</div></div></div>
}

function WeatherIcon({ code }) {
  if (code >= 61) return <CloudRain size={20}/>;
  if (code >= 2) return <CloudSun size={20}/>;
  return <Sun size={20}/>;
}

export default function Dashboard() {
  const [weather, setWeather] = useState(null)
  const [market, setMarket] = useState(null)
  const [health, setHealth] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    Promise.allSettled([getWeather('Ludhiana, Punjab'), getMarketTrends('Wheat', 'Punjab'), getHealth()]).then(([w, m, h]) => {
      if (!active) return
      if (w.status === 'fulfilled') setWeather(w.value)
      if (m.status === 'fulfilled') setMarket(m.value)
      if (h.status === 'fulfilled') setHealth(h.value)
      setLoading(false)
    })
    return () => { active = false }
  }, [])

  const current = weather?.current || { temperature: 26, humidity: 58, wind_kmh: 12 }
  const days = weather?.days || []
  const chartData = useMemo(() => {
    const observations = market?.observations || []
    return observations.length ? observations.map((item) => ({ day: item.date?.slice(5) || '—', price: item.modal_price })) : fallbackTrend
  }, [market])
  const modal = market?.observations?.at(-1)?.modal_price || market?.trend?.series?.at(-1) || 2425
  const risk = days.slice(0, 3).some((day) => (day.rain_probability || 0) >= 80)

  return (
    <div>
      <PageHeader eyebrow="Tuesday · 17 November 2026" title="Good morning, farmer." description="A little more clarity for every decision in the field." actionLabel="Generate advisory"/>

      <div className="grid gap-5 xl:grid-cols-[1.65fr_1fr]">
        <section className="animate-in overflow-hidden rounded-[22px] bg-[#1d422c] p-5 text-white shadow-[0_18px_40px_rgba(31,70,45,.14)] sm:p-6 lg:p-7">
          <div className="relative">
            <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full border border-white/[.08]"/><div className="absolute -right-1 top-1 h-32 w-32 rounded-full border border-white/[.08]"/><div className="absolute bottom-[-70px] right-[18%] h-36 w-36 rounded-full border border-white/[.07]"/>
            <div className="relative flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.14em] text-[#bfd7c3]"><MapPin size={12}/> Ludhiana, Punjab</div><SourceBadge demo={weather?.is_demo ?? true} label={weather?.is_demo ? 'Illustrative forecast' : 'Open-Meteo'}/></div>
            <div className="relative mt-6 flex items-end justify-between gap-3 sm:mt-8">
              <div><div className="text-[11px] font-semibold text-[#bfd2c2]">Your local weather</div><div className="mt-1 flex items-start gap-1 font-display text-[58px] font-extrabold leading-none tracking-[-.075em] sm:text-[68px]">{current.temperature ?? '—'}<span className="mt-2 text-[24px] font-semibold tracking-normal">°</span></div><div className="mt-2 text-[12px] font-semibold text-[#e3eee4]">{weather?.summary || 'Partly cloudy'} <span className="font-normal text-[#b1c9b5]">· Feels like {current.feels_like ?? current.temperature ?? '—'}°</span></div></div>
              <div className="mb-2 flex h-[86px] w-[86px] items-center justify-center rounded-[25px] border border-white/10 bg-white/[.08] text-[#f1d99c] shadow-inner sm:h-[102px] sm:w-[102px]"><WeatherIcon code={current.weather_code || 2}/></div>
            </div>
            <div className="relative mt-7 grid grid-cols-3 divide-x divide-white/10 border-t border-white/10 pt-4 sm:mt-8">
              <div className="pr-3"><div className="flex items-center gap-1.5 text-[9px] font-semibold text-[#b6cdb9]"><Droplets size={12}/> Humidity</div><div className="mt-1.5 text-[16px] font-bold">{current.humidity ?? '—'}<span className="ml-0.5 text-[10px] font-medium text-[#b6cdb9]">%</span></div></div>
              <div className="px-3"><div className="flex items-center gap-1.5 text-[9px] font-semibold text-[#b6cdb9]"><Wind size={12}/> Wind speed</div><div className="mt-1.5 text-[16px] font-bold">{current.wind_kmh ?? '—'}<span className="ml-0.5 text-[10px] font-medium text-[#b6cdb9]">km/h</span></div></div>
              <div className="pl-3"><div className="flex items-center gap-1.5 text-[9px] font-semibold text-[#b6cdb9]"><CloudRain size={12}/> Rain chance</div><div className="mt-1.5 text-[16px] font-bold">{days[0]?.rain_probability ?? '—'}<span className="ml-0.5 text-[10px] font-medium text-[#b6cdb9]">%</span></div></div>
            </div>
          </div>
        </section>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <div className="card flex min-h-[139px] flex-col justify-between p-4 sm:p-5"><div className="flex items-start justify-between"><div><div className="eyebrow">Today's mandi pulse</div><div className="mt-2 font-display text-[28px] font-extrabold tracking-[-.06em] text-[#253a2a]">₹{Number(market?.observations?.at(-1)?.modal_price || market?.modal_price || 2425).toLocaleString('en-IN')}<span className="ml-1 text-[11px] font-bold tracking-normal text-[#8c9a8f]">/ qtl</span></div><div className="mt-1 text-[10px] text-[#91a096]">Wheat · Punjab reference</div></div><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eff6ef] text-forest-600"><Wheat size={19}/></div></div><div className="flex items-center justify-between"><SourceBadge demo={market?.is_demo ?? true}/><Link to="/market" className="inline-flex items-center gap-1 text-[10px] font-bold text-forest-700">Market details <ArrowUpRight size={12}/></Link></div></div>
          <div className="card flex min-h-[139px] items-center justify-between gap-3 overflow-hidden bg-[#fbfaf5] p-4 sm:p-5"><div><div className="eyebrow">Field watch</div><div className="mt-2 font-display text-[17px] font-extrabold tracking-[-.035em] text-[#2c3c30]">{risk ? 'Rain in the outlook' : 'Stay one step ahead.'}</div><p className="mt-1 max-w-[230px] text-[10px] leading-[1.6] text-[#87948a]">{risk ? 'Review field moisture before your next irrigation decision.' : 'Your crop, market and weather insights in one calm view.'}</p><Link to="/new-advisory" className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold text-forest-700">Get field advice <ArrowRight size={12}/></Link></div><div className="relative flex h-[76px] w-[76px] shrink-0 items-center justify-center rounded-full bg-[#edf2e7]"><div className="absolute inset-2 rounded-full border border-[#d8e4d3]"/><Sprout size={32} className="relative text-[#6b936b]"/></div></div>
        </div>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1.55fr_1fr]">
        <section className="card animate-in animate-delay-1 p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3"><div><SectionTitle title="Market movement" subtitle="Recent modal price observations · Wheat"/></div><Link to="/market" className="btn-secondary !px-3 !py-2 !text-[10px]">View market <ArrowUpRight size={12}/></Link></div>
          <div className="mb-1 flex items-end gap-2"><span className="font-display text-[26px] font-extrabold tracking-[-.05em] text-[#253a2a]">₹{Number(modal).toLocaleString('en-IN')}</span><span className="mb-1 text-[10px] font-semibold text-[#7a9b7e]">per quintal</span></div>
          <div className="h-[190px] w-full"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{ top: 12, right: 4, left: -22, bottom: 0 }}><defs><linearGradient id="marketFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#76a77c" stopOpacity={0.22}/><stop offset="95%" stopColor="#76a77c" stopOpacity={0}/></linearGradient></defs><CartesianGrid vertical={false} strokeDasharray="3 5" stroke="#edf1eb"/><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#9aa69d', fontSize: 9 }}/><YAxis domain={['dataMin - 70', 'dataMax + 70']} axisLine={false} tickLine={false} tick={{ fill: '#9aa69d', fontSize: 9 }}/><Tooltip formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Modal price']} contentStyle={{ borderRadius: 12, borderColor: '#e7ece5', fontSize: 11 }}/><Area type="monotone" dataKey="price" stroke="#548b5d" strokeWidth={2.5} fill="url(#marketFill)" activeDot={{ r: 4, fill: '#548b5d', stroke: 'white', strokeWidth: 2 }}/></AreaChart></ResponsiveContainer></div>
          <div className="mt-2 flex items-center justify-between border-t border-[#eef1ec] pt-3"><SourceBadge demo={market?.is_demo ?? true} label={market?.source || undefined}/><span className="text-[9px] text-[#9ca89e]">Prices shown in ₹ / quintal</span></div>
        </section>

        <section className="card animate-in animate-delay-2 p-4 sm:p-5">
          <SectionTitle title="The next five days" subtitle="A little context for field planning"/>
          <div className="mt-1 divide-y divide-[#eef1ec]">
            {(days.length ? days : [{date:'Today',max:29,min:18,rain_probability:10,code:1},{date:'Tomorrow',max:30,min:19,rain_probability:15,code:2},{date:'Thu',max:28,min:18,rain_probability:72,code:61},{date:'Fri',max:27,min:17,rain_probability:35,code:2},{date:'Sat',max:29,min:18,rain_probability:12,code:1}]).slice(0,5).map((day, index) => (
              <div key={day.date} className="flex items-center gap-3 py-[11px]"><div className="w-[52px] text-[10px] font-bold text-[#637267]">{index === 0 ? 'Today' : new Date(day.date).toLocaleDateString('en-IN', { weekday: 'short' })}</div><div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#f3f6f0] text-[#8a9a7b]"><WeatherIcon code={day.code}/></div><div className="flex-1"><div className="text-[10px] font-bold text-[#455449]">{day.rain_probability ?? 0}% <span className="font-normal text-[#9aa69c]">rain chance</span></div><div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-[#edf1ea]"><div className="h-full rounded-full bg-[#88ac8b]" style={{ width: `${Math.min(day.rain_probability || 0, 100)}%` }}/></div></div><div className="w-[62px] text-right text-[11px] font-bold text-[#607064]">{day.max ?? '—'}° <span className="font-medium text-[#a1aba3]">{day.min ?? '—'}°</span></div></div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-[#eef1ec] pt-3"><SourceBadge demo={weather?.is_demo ?? true} label={weather?.is_demo ? 'Demo forecast' : 'Live forecast'}/><span className="text-[9px] text-[#a1aba3]">Location: Ludhiana</span></div>
        </section>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
        <section className="card animate-in animate-delay-2 p-4 sm:p-5">
          <SectionTitle title="Your field workspace" subtitle="A simple snapshot of what matters today"/>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-[#f7f9f5] p-4"><div className="flex items-center justify-between"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eaf2e7] text-forest-700"><Wheat size={17}/></div><span className="rounded-full bg-white px-2 py-1 text-[8px] font-bold uppercase tracking-[.1em] text-[#829285]">Main crop</span></div><div className="mt-3 font-display text-[15px] font-extrabold text-[#2c3e30]">Wheat</div><div className="mt-1 text-[10px] text-[#89978c]">Growing stage · Punjab</div></div>
            <div className="rounded-xl bg-[#f7f9f5] p-4"><div className="flex items-center justify-between"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eef1df] text-[#89914b]"><Leaf size={17}/></div><span className="rounded-full bg-white px-2 py-1 text-[8px] font-bold uppercase tracking-[.1em] text-[#829285]">Season note</span></div><div className="mt-3 font-display text-[15px] font-extrabold text-[#2c3e30]">Rabi season</div><div className="mt-1 text-[10px] text-[#89978c]">Review local sowing guidance</div></div>
          </div>
          <Link to="/new-advisory" className="mt-3 flex items-center justify-between rounded-xl border border-dashed border-[#cbd9ca] px-4 py-3 text-[11px] font-bold text-forest-700 transition hover:bg-forest-50"><span className="flex items-center gap-2"><Sparkles size={15}/> Create a fresh field advisory</span><ArrowRight size={14}/></Link>
        </section>
        <section className="card animate-in animate-delay-3 p-4 sm:p-5">
          <SectionTitle title="A more connected farm" subtitle="One place for your field decisions"/>
          <div className="space-y-3">
            {[{icon:CloudSun,title:'Weather-aware planning',desc:'Bring the local forecast into everyday field decisions.',to:'/new-advisory'},{icon:TrendingUp,title:'Know the market pulse',desc:'Follow mandi observations and compare price movement.',to:'/market'},{icon:ShieldCheck,title:'Find useful support',desc:'Explore scheme references and the conditions to verify.',to:'/schemes'}].map(({icon:Icon,title,desc,to})=><Link key={title} to={to} className="group flex gap-3 rounded-xl p-2 transition hover:bg-[#f8faf6]"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#eff5ed] text-forest-700"><Icon size={16}/></div><div className="min-w-0 flex-1"><div className="text-[11px] font-bold text-[#45564a]">{title}</div><p className="mt-1 text-[9px] leading-[1.5] text-[#98a49a]">{desc}</p></div><ChevronRight size={14} className="mt-2 text-[#aab4ab] transition group-hover:translate-x-0.5 group-hover:text-forest-700"/></Link>)}
          </div>
        </section>
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-2 px-1 text-[9px] text-[#a1aba3]"><span className="flex items-center gap-1.5"><Activity size={11}/> {health?.agent_framework?.enabled ? 'Gemini agent reasoning connected' : 'Control room ready · demo / deterministic mode'}</span><span>Insights are informational and should be verified locally.</span></div>
    </div>
  )
}
