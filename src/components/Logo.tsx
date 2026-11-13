// Logo de Tuesday: tres burbujas pastel con un brillo cada una.
export function Burbujas({ className = 'h-7 w-7' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <circle cx="15" cy="24" r="11" fill="#a78bfa" />
      <circle cx="29" cy="13.5" r="7.5" fill="#f9a8d4" />
      <circle cx="30.5" cy="30" r="5" fill="#6ee7b7" />
      <circle cx="11" cy="19.5" r="3" fill="#fff" opacity=".55" />
      <circle cx="26.5" cy="10.5" r="2" fill="#fff" opacity=".6" />
      <circle cx="29" cy="28.3" r="1.3" fill="#fff" opacity=".65" />
    </svg>
  )
}

export function Logo({ texto = true, className = '' }: { texto?: boolean; className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Burbujas />
      {texto ? <span className="text-[17px] font-semibold tracking-tight text-texto">Tuesday</span> : null}
    </div>
  )
}
