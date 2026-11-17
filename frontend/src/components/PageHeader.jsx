import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function PageHeader({ eyebrow, title, description, action, actionTo = '/new-advisory', actionLabel = 'Create advisory' }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-7 sm:flex-row sm:items-end sm:justify-between">
      <div className="animate-in"><div className="eyebrow mb-2">{eyebrow}</div><h1 className="page-title">{title}</h1>{description && <p className="page-subtitle">{description}</p>}</div>
      {action !== false && <Link to={actionTo} className="btn-primary animate-in self-start sm:self-auto">{actionLabel} <ArrowRight size={14}/></Link>}
    </div>
  )
}
