import { FlaskConical, Radio } from 'lucide-react'
export default function SourceBadge({ demo = false, label }) {
  return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[9px] font-bold ${demo ? 'bg-[#fff6e9] text-[#a9772d]' : 'bg-[#eff7ef] text-[#4a8655]'}`}>{demo ? <FlaskConical size={10}/> : <Radio size={10}/>} {label || (demo ? 'Sample data' : 'Live source')}</span>
}
