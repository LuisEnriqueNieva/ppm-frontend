// Fondo decorativo con burbujas, mini tarjetas y checks que suben lentamente.
// Baja opacidad y pointer-events-none: no estorba al formulario.

type Forma = 'burbuja' | 'anillo' | 'tarjeta' | 'check'

const COLORES = ['#a78bfa', '#f9a8d4', '#6ee7b7', '#fdba74', '#7dd3fc', '#fde047']

// [forma, izquierda %, tamaño px, duración s, retraso s, color]
const PARTICULAS: [Forma, number, number, number, number, number][] = [
  ['burbuja', 4, 46, 26, 0, 0],
  ['tarjeta', 12, 70, 34, 9, 1],
  ['check', 22, 34, 24, 4, 2],
  ['anillo', 30, 58, 30, 15, 4],
  ['burbuja', 38, 22, 20, 7, 1],
  ['tarjeta', 47, 64, 36, 20, 2],
  ['burbuja', 55, 70, 32, 2, 3],
  ['check', 63, 30, 22, 13, 0],
  ['anillo', 70, 36, 25, 5, 5],
  ['tarjeta', 78, 76, 38, 17, 0],
  ['burbuja', 86, 40, 27, 10, 4],
  ['check', 93, 38, 29, 1, 1],
  ['burbuja', 17, 28, 23, 19, 5],
  ['anillo', 59, 24, 21, 24, 2],
  ['burbuja', 74, 18, 19, 12, 1],
  ['tarjeta', 2, 56, 33, 26, 3],
]

function Figura({ forma, tam, color }: { forma: Forma; tam: number; color: string }) {
  if (forma === 'burbuja')
    return (
      <div className="relative rounded-full" style={{ width: tam, height: tam, background: color }}>
        <span className="absolute left-[22%] top-[20%] h-[22%] w-[22%] rounded-full bg-white/70" />
      </div>
    )
  if (forma === 'anillo')
    return <div className="rounded-full" style={{ width: tam, height: tam, border: `${Math.max(3, tam / 9)}px solid ${color}` }} />
  if (forma === 'check')
    return (
      <div
        className="flex items-center justify-center rounded-full font-black text-white"
        style={{ width: tam, height: tam, background: color, fontSize: tam * 0.55 }}
      >
        ✓
      </div>
    )
  // mini tarjeta de Kanban
  return (
    <div className="rounded-xl bg-white p-2 shadow-sm" style={{ width: tam, border: `2px solid ${color}` }}>
      <div className="mb-1.5 h-1.5 w-3/4 rounded-full" style={{ background: color }} />
      <div className="mb-1.5 h-1.5 w-1/2 rounded-full bg-slate-200" />
      <div className="h-1.5 rounded-full bg-slate-100">
        <div className="h-full w-2/3 rounded-full" style={{ background: color }} />
      </div>
    </div>
  )
}

export default function FondoAnimado() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      {/* manchas grandes y difusas */}
      <div className="anim-blob absolute -left-24 -top-24 h-96 w-96 bg-lila/50 blur-3xl" />
      <div className="anim-blob absolute -right-20 top-1/3 h-80 w-80 bg-rosa/50 blur-3xl" style={{ animationDelay: '-4s' }} />
      <div className="anim-blob absolute -bottom-24 left-1/3 h-96 w-96 bg-menta/50 blur-3xl" style={{ animationDelay: '-8s' }} />
      {/* partículas que suben */}
      {PARTICULAS.map(([forma, izq, tam, dur, retraso, c], i) => (
        <div
          key={i}
          className="anim-subir absolute opacity-30"
          style={{ left: `${izq}%`, top: '105%', animationDuration: `${dur}s`, animationDelay: `-${retraso}s` }}
        >
          <Figura forma={forma} tam={tam} color={COLORES[c]} />
        </div>
      ))}
    </div>
  )
}
