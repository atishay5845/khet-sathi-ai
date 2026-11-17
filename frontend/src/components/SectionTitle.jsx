export default function SectionTitle({ title, subtitle, action }) {
  return <div className="mb-4 flex items-end justify-between gap-3"><div><h2 className="font-display text-[15px] font-extrabold tracking-[-.025em] text-[#26392b]">{title}</h2>{subtitle && <p className="mt-1 text-[11px] text-[#8a978d]">{subtitle}</p>}</div>{action}</div>
}
