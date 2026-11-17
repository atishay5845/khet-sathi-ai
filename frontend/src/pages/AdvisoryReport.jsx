import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowUpRight, Check, CloudSun, Download, FileCheck2, Leaf, MapPin, ShieldAlert, ShieldCheck, Sprout, Wheat, Wind, Droplets, CalendarDays, ExternalLink, Sparkles, AlertTriangle } from 'lucide-react'
import { getAdvisory } from '../services/api'
import SourceBadge from '../components/SourceBadge'

const agentOrder = ['Intake Agent', 'Weather Agent', 'Market Agent', 'Scheme Agent', 'Crop Agent', 'Risk Alert Agent', 'Advisor Coordinator']

function Panel({ children, className = '' }) { return <section className={`card p-4 sm:p-5 ${className}`}>{children}</section> }
function Label({ children }) { return <div className="eyebrow">{children}</div> }

export default function AdvisoryReport() {
  const { id } = useParams()
  const location = useLocation()
  const [report, setReport] = useState(location.state?.report || null)
  const [events, setEvents] = useState(location.state?.events || [])
  const [loading, setLoading] = useState(!location.state?.report)
  const [error, setError] = useState('')

  useEffect(() => {
    if (report && events.length) { setLoading(false); return }
    getAdvisory(id).then((data) => { setReport((current) => current || data.report); setEvents(data.events || []) }).catch((err) => { if (!report) setError(err.message || 'Unable to load this advisory.') }).finally(() => setLoading(false))
  // Fetch the persisted trace for freshly-created reports too.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  if (loading) return <div className="card flex min-h-[380px] items-center justify-center"><div className="text-center"><div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#dce8dc] border-t-forest-700"/><div className="mt-3 text-[12px] font-bold text-[#526156]">Opening your field report...</div></div></div>
  if (error || !report) return <div className="card p-8 text-center"><div className="text-[13px] font-bold text-[#a04f43]">{error || 'Advisory not found'}</div><Link className="btn-secondary mt-4" to="/history">Back to history</Link></div>

  const farmer = report.farmer || {}
  const weather = report.weather || {}
  const current = weather.current || {}
  const market = report.market || {}
  const risk = report.risk || {}
  const schemes = report.schemes || []
  const reportDate = report.created_at ? new Date(report.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : new Date().toLocaleDateString('en-IN', { dateStyle: 'medium' })
  const eventByAgent = (name) => events.filter((event) => event.agent === name)
  const exportReport = () => {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${report.run_id || 'khetsathi-advisory'}.json`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><Link to="/new-advisory" className="inline-flex items-center gap-2 text-[11px] font-bold text-[#819086] transition hover:text-forest-700"><ArrowLeft size={14}/> New advisory</Link><div className="flex items-center gap-2"><SourceBadge demo={report.data_quality?.illustrative_data_present} label={report.data_quality?.illustrative_data_present ? 'Contains sample data' : 'Source-checked report'}/><button onClick={exportReport} className="btn-secondary !px-3 !py-2 !text-[10px]"><Download size={13}/> Export</button></div></div>

      <div className="relative overflow-hidden rounded-[22px] bg-[#1d422c] p-5 text-white shadow-[0_18px_40px_rgba(31,70,45,.13)] sm:p-7">
        <div className="absolute -right-8 -top-14 h-56 w-56 rounded-full border border-white/[.08]"/><div className="absolute right-16 top-12 h-32 w-32 rounded-full border border-white/[.08]"/>
        <div className="relative flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[.15em] text-[#bed5c1]"><FileCheck2 size={13}/> Field intelligence report</div><span className="rounded-full border border-white/10 bg-white/[.08] px-2.5 py-1 text-[9px] font-semibold text-[#dce9dd]">{report.run_id}</span></div>
        <h1 className="relative mt-4 max-w-[720px] font-display text-[27px] font-extrabold leading-[1.15] tracking-[-.05em] sm:text-[36px]">A clearer picture<br className="hidden sm:block"/> for your {farmer.crop || 'crop'} field.</h1>
        <p className="relative mt-3 max-w-[760px] text-[11px] leading-[1.8] text-[#c6d8c8]">{report.summary}</p>
        <div className="relative mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/10 pt-4 text-[10px] font-semibold text-[#dce9dd]"><span className="flex items-center gap-1.5"><Wheat size={12}/> {farmer.crop} · {farmer.stage}</span><span className="flex items-center gap-1.5"><MapPin size={12}/> {farmer.location}</span><span className="flex items-center gap-1.5"><Sprout size={12}/> {farmer.land_area} {farmer.unit || 'acres'}</span><span className="flex items-center gap-1.5"><CalendarDays size={12}/> {reportDate}</span></div>
      </div>

      {risk.level === 'high' && <div className="mt-5 flex items-start gap-3 rounded-2xl border border-[#f0d5ce] bg-[#fff8f5] p-4"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f9e6df] text-[#bd6652]"><ShieldAlert size={18}/></div><div><div className="text-[11px] font-extrabold text-[#9c5144]">Weather risk needs attention</div><div className="mt-1 text-[10px] leading-[1.6] text-[#a66e63]">{risk.headline}. Review the individual risk notes below before planning field activity.</div></div></div>}

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="card p-4"><div className="flex items-center justify-between"><Label>Current temperature</Label><CloudSun size={16} className="text-[#91a67f]"/></div><div className="mt-3 font-display text-[26px] font-extrabold tracking-[-.05em] text-[#2c3e30]">{current.temperature ?? '—'}°</div><div className="mt-1 text-[9px] text-[#95a096]">Feels like {current.feels_like ?? '—'}° · {weather.summary || 'Forecast details'}</div></div>
        <div className="card p-4"><div className="flex items-center justify-between"><Label>Humidity</Label><Droplets size={16} className="text-[#7ba0ac]"/></div><div className="mt-3 font-display text-[26px] font-extrabold tracking-[-.05em] text-[#2c3e30]">{current.humidity ?? '—'}%</div><div className="mt-1 text-[9px] text-[#95a096]">Wind {current.wind_kmh ?? '—'} km/h</div></div>
        <div className="card p-4"><div className="flex items-center justify-between"><Label>Modal mandi price</Label><Wheat size={16} className="text-[#a48c58]"/></div><div className="mt-3 font-display text-[26px] font-extrabold tracking-[-.05em] text-[#2c3e30]">{market.modal || market.modal_price ? `₹${Number(market.modal || market.modal_price).toLocaleString('en-IN')}` : '—'}</div><div className="mt-1 text-[9px] text-[#95a096]">{market.unit || '₹ / quintal'} · {market.market || 'Market reference'}</div></div>
        <div className="card p-4"><div className="flex items-center justify-between"><Label>Risk status</Label><ShieldCheck size={16} className="text-[#87a080]"/></div><div className={`mt-3 font-display text-[23px] font-extrabold tracking-[-.05em] ${risk.level === 'high' ? 'text-[#b45a48]' : risk.level === 'watch' ? 'text-[#a77a35]' : 'text-[#477c50]'}`}>{risk.level === 'high' ? 'High alert' : risk.level === 'watch' ? 'Watch' : 'Clear'}</div><div className="mt-1 text-[9px] text-[#95a096]">{risk.count ?? 0} weather signal(s)</div></div>
      </div>

      <div className="mt-5 grid items-start gap-5 xl:grid-cols-[1.2fr_.8fr]">
        <div className="space-y-5">
          <Panel>
            <div className="flex items-center justify-between"><div><Label>01 · Crop guidance</Label><h2 className="mt-1.5 font-display text-[17px] font-extrabold tracking-[-.03em] text-[#2a3c2e]">A practical next step</h2></div><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eff5ec] text-forest-700"><Sprout size={18}/></div></div>
            <div className="mt-4 rounded-xl bg-[#f6f9f4] p-4"><div className="text-[9px] font-bold uppercase tracking-[.14em] text-[#849783]">Recommended field action</div><p className="mt-2 text-[12px] font-semibold leading-[1.75] text-[#45564a]">{report.crop_advice?.action || 'Review the local crop-stage guidance before taking action.'}</p></div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2"><div><div className="text-[9px] font-bold uppercase tracking-[.12em] text-[#98a49a]">Why it matters</div><p className="mt-1.5 text-[10px] leading-[1.7] text-[#6f7e72]">{report.crop_advice?.why || 'No additional explanation was supplied.'}</p></div><div><div className="text-[9px] font-bold uppercase tracking-[.12em] text-[#98a49a]">What to watch</div><p className="mt-1.5 text-[10px] leading-[1.7] text-[#6f7e72]">{report.crop_advice?.watch || report.crop_advice?.confidence_note}</p></div></div>
            <div className="mt-4 border-t border-[#eef1ec] pt-3 text-[9px] leading-[1.7] text-[#98a49a]">{report.crop_advice?.reference || report.crop_advice?.confidence_note}</div>
          </Panel>

          <Panel>
            <div className="flex items-center justify-between"><div><Label>02 · Weather outlook</Label><h2 className="mt-1.5 font-display text-[17px] font-extrabold tracking-[-.03em] text-[#2a3c2e]">Plan around the forecast</h2></div><SourceBadge demo={weather.is_demo} label={weather.source || 'Unavailable'}/></div>
            <div className="mt-4 divide-y divide-[#eef1ec]">{(weather.days || []).slice(0,5).map((day, index) => <div key={day.date} className="flex items-center gap-3 py-3"><div className="w-[62px] text-[10px] font-bold text-[#617166]">{index === 0 ? 'Today' : new Date(day.date).toLocaleDateString('en-IN', { weekday: 'short' })}</div><div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#f2f6f0] text-[#879c7d]"><CloudSun size={16}/></div><div className="flex-1"><div className="text-[10px] font-bold text-[#49594d]">{day.rain_probability ?? '—'}% <span className="font-normal text-[#9ca79e]">rain chance</span></div><div className="mt-1 h-1 overflow-hidden rounded-full bg-[#edf1ea]"><div className="h-full rounded-full bg-[#8eae8d]" style={{width:`${Math.min(day.rain_probability || 0,100)}%`}}/></div></div><div className="text-[10px] font-bold text-[#637368]">{day.max ?? '—'}° <span className="font-normal text-[#9eaaa0]">{day.min ?? '—'}°</span></div></div>)}</div>
            {weather.fallback_reason && <p className="mt-3 text-[9px] leading-[1.6] text-[#ab813f]">{weather.fallback_reason}</p>}
          </Panel>

          <Panel>
            <div className="flex items-center justify-between"><div><Label>03 · Market intelligence</Label><h2 className="mt-1.5 font-display text-[17px] font-extrabold tracking-[-.03em] text-[#2a3c2e]">Know the latest reference</h2></div><SourceBadge demo={market.is_demo} label={market.source || 'Unavailable'}/></div>
            {market.available === false ? <div className="mt-4 rounded-xl bg-[#f8faf7] p-4 text-[10px] text-[#829085]">{market.message}</div> : <div className="mt-4 grid gap-3 sm:grid-cols-3"><div className="rounded-xl bg-[#f7f9f5] p-3"><div className="text-[9px] text-[#929f94]">Minimum</div><div className="mt-1 font-display text-[18px] font-extrabold text-[#334638]">₹{Number(market.min || market.min_price || 0).toLocaleString('en-IN')}</div></div><div className="rounded-xl bg-[#f7f9f5] p-3"><div className="text-[9px] text-[#929f94]">Modal</div><div className="mt-1 font-display text-[18px] font-extrabold text-[#334638]">₹{Number(market.modal || market.modal_price || 0).toLocaleString('en-IN')}</div></div><div className="rounded-xl bg-[#f7f9f5] p-3"><div className="text-[9px] text-[#929f94]">Maximum</div><div className="mt-1 font-display text-[18px] font-extrabold text-[#334638]">₹{Number(market.max || market.max_price || 0).toLocaleString('en-IN')}</div></div></div>}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[9px] text-[#95a096]"><span>{market.market || 'Market name unavailable'} · {market.date || 'Observation date unavailable'}</span><span>Trend: <b className="text-[#607964]">{market.trend?.direction || 'Not assessed'}</b></span></div>
            <p className="mt-3 text-[9px] leading-[1.65] text-[#9aa69c]">Market observations are indicative and may differ by mandi, grade, quality and date. Verify with the local market before trading.</p>
          </Panel>

          <Panel>
            <div className="flex items-center justify-between"><div><Label>04 · Government support</Label><h2 className="mt-1.5 font-display text-[17px] font-extrabold tracking-[-.03em] text-[#2a3c2e]">Schemes worth exploring</h2></div><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f3f2e9] text-[#9c8c53]"><ShieldCheck size={18}/></div></div>
            <div className="mt-4 space-y-3">{schemes.length ? schemes.map((scheme, index) => <div key={`${scheme.name}-${index}`} className="rounded-xl border border-[#edf1eb] p-3"><div className="flex flex-wrap items-center justify-between gap-2"><div className="text-[11px] font-bold text-[#435348]">{scheme.name}</div><span className="rounded-full bg-[#f6f6eb] px-2 py-1 text-[8px] font-bold text-[#8d8755]">Potential match</span></div><p className="mt-1.5 text-[10px] leading-[1.65] text-[#7d8a80]">{scheme.reason}</p>{scheme.evidence && <blockquote className="mt-2 border-l-2 border-[#d7e4d3] pl-2 text-[9px] leading-[1.6] text-[#929d94]">{scheme.evidence.slice(0,260)}{scheme.evidence.length>260?'…':''}</blockquote>}<div className="mt-2 text-[8px] font-semibold text-[#a3ada4]">Source: {scheme.source || 'Local scheme reference'} · {scheme.page || 'Section reference'}</div></div>) : <div className="rounded-xl bg-[#f8faf7] p-4 text-[10px] text-[#8a978d]">No supporting scheme passages were retrieved for this query.</div>}</div>
            <p className="mt-3 text-[9px] leading-[1.6] text-[#9aa69c]">A potential match is not confirmation of eligibility or benefit approval. Check current scheme rules with the official portal or relevant department.</p>
          </Panel>
        </div>

        <div className="space-y-5">
          <Panel>
            <Label>05 · Weather risk monitor</Label>
            <div className="mt-2 flex items-center gap-3"><div className={`flex h-10 w-10 items-center justify-center rounded-xl ${risk.level === 'high' ? 'bg-[#fff0ea] text-[#ba6650]' : risk.level === 'watch' ? 'bg-[#fff7e9] text-[#b2863c]' : 'bg-[#eef6ed] text-[#59885f]'}`}><ShieldAlert size={18}/></div><div><div className="text-[12px] font-extrabold text-[#425247]">{risk.headline || 'No risk signal available'}</div><div className="mt-0.5 text-[9px] text-[#9aa69c]">{risk.count || 0} alert(s) from forecast conditions</div></div></div>
            <div className="mt-4 space-y-2">{risk.alerts?.length ? risk.alerts.map((alert, index) => <div key={index} className="rounded-xl bg-[#fafaf6] p-3"><div className="flex items-center justify-between"><span className="text-[10px] font-bold text-[#526256]">{alert.title}</span><span className={`text-[8px] font-bold uppercase ${alert.level === 'high' ? 'text-[#bb6852]' : 'text-[#a7813f]'}`}>{alert.level}</span></div><p className="mt-1 text-[9px] leading-[1.6] text-[#879389]">{alert.message}</p></div>) : <div className="rounded-xl bg-[#f5f8f3] p-3 text-[10px] text-[#758477]">No immediate weather trigger detected in the available forecast. Continue routine field monitoring.</div>}</div>
          </Panel>

          <Panel>
            <div className="flex items-center justify-between"><div><Label>06 · Agent execution</Label><h2 className="mt-1.5 font-display text-[16px] font-extrabold tracking-[-.03em] text-[#2a3c2e]">Inside the control room</h2></div><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eff5ec] text-forest-700"><Sparkles size={16}/></div></div>
            <div className="mt-4 space-y-0">{agentOrder.map((name, index) => { const agentEvents = eventByAgent(name); const complete = agentEvents.some((event) => event.type === 'agent_completed'); return <div key={name} className="relative flex gap-3 pb-4 last:pb-0"><div className="relative flex w-5 shrink-0 justify-center"><div className={`relative z-10 mt-0.5 flex h-5 w-5 items-center justify-center rounded-full ${complete ? 'bg-[#eaf3e9] text-forest-700' : 'bg-[#f2f4f1] text-[#a0aaa1]'}`}>{complete ? <Check size={11}/> : <span className="text-[8px] font-bold">{index + 1}</span>}</div>{index !== agentOrder.length - 1 && <div className="absolute bottom-[-2px] top-5 w-px bg-[#e8eee6]"/>}</div><div className="min-w-0 flex-1"><div className="text-[10px] font-bold text-[#4c5c50]">{name}</div><div className="mt-0.5 text-[9px] leading-[1.5] text-[#9ba69d]">{agentEvents.find((event) => event.type === 'agent_completed')?.message || (complete ? 'Completed' : 'Execution trace unavailable')}</div>{agentEvents.filter((event) => event.type === 'tool_call').length > 0 && <div className="mt-1.5 flex flex-wrap gap-1">{agentEvents.filter((event) => event.type === 'tool_call').map((event, i) => <span key={i} className="rounded-md bg-[#f4f6f2] px-1.5 py-1 font-mono text-[8px] text-[#859287]">{event.tool || event.message}</span>)}</div>}</div></div>})}</div>
          </Panel>
          <div className="rounded-2xl border border-[#e7ece5] bg-[#fafbf8] p-4"><div className="flex items-start gap-2"><AlertTriangle size={14} className="mt-0.5 shrink-0 text-[#b38c50]"/><p className="text-[9px] leading-[1.7] text-[#8a978c]">Agricultural guidance is informational, not a diagnosis or guaranteed outcome. Verify local weather, mandi prices, scheme eligibility and field recommendations before acting.</p></div></div>
        </div>
      </div>
    </div>
  )
}
