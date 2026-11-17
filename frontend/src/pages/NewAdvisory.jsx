import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Activity, ArrowRight, Check, ChevronRight, CloudSun, FileText, Leaf, LoaderCircle, MapPin, ShieldCheck, Sparkles, Sprout, Wheat, XCircle } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { streamAdvisory } from '../services/api'

const agents = [
  { name: 'Intake Agent', icon: FileText, detail: 'Validating your field profile' },
  { name: 'Weather Agent', icon: CloudSun, detail: 'Reading the local forecast' },
  { name: 'Market Agent', icon: Activity, detail: 'Checking mandi observations' },
  { name: 'Scheme Agent', icon: ShieldCheck, detail: 'Searching scheme references' },
  { name: 'Crop Agent', icon: Sprout, detail: 'Preparing crop-stage guidance' },
  { name: 'Risk Alert Agent', icon: ShieldCheck, detail: 'Scanning for weather risks' },
  { name: 'Advisor Coordinator', icon: Sparkles, detail: 'Bringing the findings together' },
]

export default function NewAdvisory() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ crop: 'Wheat', location: 'Ludhiana, Punjab', stage: 'Growing', land_area: '3', unit: 'acres', language: 'English' })
  const [running, setRunning] = useState(false)
  const [events, setEvents] = useState([])
  const [error, setError] = useState('')
  const [activeAgent, setActiveAgent] = useState('')

  const statuses = useMemo(() => {
    const map = {}
    for (const event of events) {
      if (event.type === 'agent_started') map[event.agent] = 'working'
      if (event.type === 'agent_completed') map[event.agent] = 'completed'
    }
    return map
  }, [events])

  const update = (key, value) => setForm((old) => ({ ...old, [key]: value }))

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setEvents([])
    setRunning(true)
    setActiveAgent('Intake Agent')
    try {
      await streamAdvisory({ ...form, land_area: Number(form.land_area) }, (event) => {
        if (event.type !== 'workflow_completed') setEvents((old) => [...old, event])
        if (event.agent) setActiveAgent(event.agent)
        if (event.type === 'workflow_error') setError(event.message)
        if (event.type === 'workflow_completed' && event.report) {
          navigate(`/advisory/${event.report.run_id}`, { state: { report: event.report } })
        }
      })
    } catch (err) {
      setError(err.message || 'Unable to generate the advisory. Check that the backend is running.')
    } finally {
      setRunning(false)
    }
  }

  const doneCount = agents.filter((agent) => statuses[agent.name] === 'completed').length

  return (
    <div>
      <PageHeader eyebrow="Your field · Your context" title="Let's understand your field." description="A few details help the agent team prepare a more relevant field briefing." action={false}/>
      <div className="grid items-start gap-5 xl:grid-cols-[1.15fr_.85fr]">
        <form onSubmit={handleSubmit} className="card animate-in p-5 sm:p-7">
          <div className="flex items-center justify-between border-b border-[#eef1ec] pb-4"><div><div className="font-display text-[16px] font-extrabold tracking-[-.03em] text-[#293b2e]">Tell us about your farm</div><p className="mt-1 text-[10px] text-[#8e9a90]">Your information is used only to prepare this advisory.</p></div><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eff5ed] text-forest-700"><Sprout size={19}/></div></div>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div><label className="input-label" htmlFor="crop">What are you growing?</label><div className="relative"><Wheat size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#91a095]"/><select id="crop" className="field appearance-none pl-10" value={form.crop} onChange={(e) => update('crop', e.target.value)}><option>Wheat</option><option>Paddy</option></select><ChevronRight size={14} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 rotate-90 text-[#9aa69c]"/></div></div>
            <div><label className="input-label" htmlFor="stage">Current crop stage</label><select id="stage" className="field" value={form.stage} onChange={(e) => update('stage', e.target.value)}><option>Sowing</option><option>Growing</option><option>Flowering</option><option>Harvesting</option></select></div>
            <div className="sm:col-span-2"><label className="input-label" htmlFor="location">Where is your farm located?</label><div className="relative"><MapPin size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#91a095]"/><input id="location" className="field pl-10" value={form.location} onChange={(e) => update('location', e.target.value)} placeholder="Village, district or city" required minLength={2}/></div><p className="mt-1.5 text-[9px] text-[#9aa69c]">A village, town or district name helps us locate nearby weather and market information.</p></div>
            <div><label className="input-label" htmlFor="area">Cultivated land area</label><input id="area" type="number" className="field" min="0.1" step="0.1" value={form.land_area} onChange={(e) => update('land_area', e.target.value)} required/></div>
            <div><label className="input-label" htmlFor="unit">Area unit</label><select id="unit" className="field" value={form.unit} onChange={(e) => update('unit', e.target.value)}><option value="acres">Acres</option><option value="hectares">Hectares</option></select></div>
            <div className="sm:col-span-2"><label className="input-label" htmlFor="language">Advisory language</label><select id="language" className="field" value={form.language} onChange={(e) => update('language', e.target.value)}><option>English</option><option>Hindi</option></select></div>
          </div>
          {error && <div className="mt-5 flex items-start gap-2 rounded-xl border border-[#f1d7d1] bg-[#fff8f6] p-3 text-[11px] text-[#a34f42]"><XCircle size={15} className="mt-0.5 shrink-0"/>{error}</div>}
          <div className="mt-6 flex flex-col gap-3 border-t border-[#eef1ec] pt-5 sm:flex-row sm:items-center sm:justify-between"><p className="max-w-[260px] text-[9px] leading-[1.6] text-[#9aa69c]">The advisory is informational. Confirm important field decisions with local agricultural experts.</p><button className="btn-primary min-w-[190px]" type="submit" disabled={running || !form.land_area || Number(form.land_area) <= 0}>{running ? <><LoaderCircle size={15} className="animate-spin"/> Working on it...</> : <>Generate my advisory <ArrowRight size={14}/></>}</button></div>
        </form>

        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-[22px] bg-[#1d422c] p-5 text-white sm:p-6"><div className="absolute -right-8 -top-8 h-40 w-40 rounded-full border border-white/10"/><div className="absolute right-5 top-16 h-20 w-20 rounded-full border border-white/10"/><div className="relative flex items-center justify-between"><div className="eyebrow !text-[#b7d1ba]">Your agent team</div><div className="rounded-full bg-white/10 px-2.5 py-1 text-[9px] font-bold text-[#dbe9dd]">7 specialists</div></div><div className="relative mt-4 font-display text-[20px] font-extrabold leading-[1.2] tracking-[-.04em]">Seven perspectives.<br/>One clearer picture.</div><p className="relative mt-2 max-w-[290px] text-[10px] leading-[1.7] text-[#c0d4c3]">Each specialist checks a different part of the picture, then shares its findings on one common advisory board.</p><div className="relative mt-5 flex items-center gap-3"><div className="flex -space-x-2">{agents.slice(0, 5).map((a, i) => <div key={a.name} className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#1d422c] bg-[#e5efe3] text-forest-700" style={{ opacity: 1 - i * .08 }}><a.icon size={12}/></div>)}</div><span className="text-[9px] font-semibold text-[#d0e0d1]">Working together for your field</span></div></div>

          <div className="card p-5">
            <div className="flex items-center justify-between"><div><div className="font-display text-[14px] font-extrabold text-[#2a3c2e]">Control room activity</div><div className="mt-1 text-[9px] text-[#94a096]">Live agent execution trace</div></div><div className={`rounded-full px-2.5 py-1 text-[9px] font-bold ${running ? 'bg-[#fff6e9] text-[#a9772d]' : 'bg-[#f0f3ef] text-[#849187]'}`}>{running ? `${doneCount}/7 complete` : 'Ready'}</div></div>
            {running && <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#eef2ec]"><div className="h-full rounded-full bg-forest-600 transition-all" style={{ width: `${doneCount / 7 * 100}%` }}/></div>}
            <div className="mt-4 space-y-1.5">
              {agents.map(({ name, icon: Icon, detail }, index) => {
                const status = statuses[name] || 'queued'
                const isActive = activeAgent === name && status !== 'completed'
                return <div key={name} className={`flex items-center gap-3 rounded-xl px-2.5 py-2 transition ${status === 'working' ? 'bg-[#f4f8f2]' : ''}`}><div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${status === 'completed' ? 'bg-[#eaf3e9] text-forest-700' : status === 'working' ? 'bg-[#fff4df] text-[#b48134]' : 'bg-[#f4f6f3] text-[#a0aba2]'}`}>{status === 'completed' ? <Check size={15}/> : status === 'working' ? <LoaderCircle size={15} className="animate-spin"/> : <Icon size={15}/>}</div><div className="min-w-0 flex-1"><div className="text-[10px] font-bold text-[#45554a]">{name}</div><div className="mt-0.5 text-[9px] text-[#9aa69c]">{status === 'completed' ? 'Findings posted to the board' : status === 'working' || isActive ? detail : 'Waiting for its turn'}</div></div><div className={`text-[8px] font-bold uppercase tracking-[.1em] ${status === 'completed' ? 'text-forest-700' : status === 'working' ? 'text-[#b48134]' : 'text-[#b0b9b1]'}`}>{status === 'completed' ? 'Done' : status === 'working' ? 'Active' : 'Queued'}</div></div>
              })}
            </div>
            {events.length > 0 && <div className="mt-4 border-t border-[#eef1ec] pt-3"><div className="mb-2 text-[9px] font-bold uppercase tracking-[.12em] text-[#96a197]">Latest activity</div><div className="max-h-28 space-y-1.5 overflow-auto">{events.slice(-4).reverse().map((event, index) => <div key={`${event.type}-${index}`} className="flex gap-2 text-[9px] leading-4 text-[#7f8c82]"><span className="mt-[5px] h-1 w-1 shrink-0 rounded-full bg-[#83a786]"/><span><b className="text-[#56655a]">{event.agent}:</b> {event.message}</span></div>)}</div></div>}
          </div>
          <div className="flex items-start gap-2 rounded-xl border border-[#e7ece5] bg-[#fafbf8] p-3"><ShieldCheck size={14} className="mt-0.5 shrink-0 text-[#809782]"/><p className="text-[9px] leading-[1.7] text-[#8b988e]">Your report will identify where information came from and clearly mark illustrative data. A scheme match is not an eligibility approval.</p></div>
        </div>
      </div>
    </div>
  )
}
