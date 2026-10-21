// Utilidades de presentación y datos de la marca.

export const CATEGORIAS = {
  PISCINA: { etiqueta: 'Piscina', icono: 'bi-water' },
  SALON: { etiqueta: 'Salón social', icono: 'bi-bank' },
  GIMNASIO: { etiqueta: 'Gimnasio', icono: 'bi-dribbble' },
  BBQ: { etiqueta: 'Zona BBQ', icono: 'bi-fire' },
  DEPORTIVO: { etiqueta: 'Deportivo', icono: 'bi-trophy' },
  COWORKING: { etiqueta: 'Coworking', icono: 'bi-laptop' },
  OTRO: { etiqueta: 'Otro', icono: 'bi-grid' },
}

export function categoria(valor) {
  return CATEGORIAS[valor] ?? CATEGORIAS.OTRO
}

export function iniciales(nombre = '') {
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')
}

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

/** Convierte una fecha ISO a algo como "20 nov 2026 · 15:00". */
export function fechaBonita(iso) {
  if (!iso) return '—'
  const d = new Date(iso.length === 10 ? `${iso}T00:00` : iso)
  if (Number.isNaN(d.getTime())) return iso
  const hora = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  const soloFecha = iso.length === 10
  return `${d.getDate()} ${MESES[d.getMonth()]} ${d.getFullYear()}${soloFecha ? '' : ` · ${hora}:${min}`}`
}

export function rangoHoras(fechaInicio, tiempo) {
  if (!fechaInicio) return '—'
  const d = new Date(fechaInicio)
  if (Number.isNaN(d.getTime())) return '—'
  const h0 = d.getHours()
  const h1 = h0 + (tiempo ?? 1)
  return `${String(h0).padStart(2, '0')}:00 – ${String(h1).padStart(2, '0')}:00`
}

/** Fecha de hoy en formato yyyy-MM-dd (para inputs date). */
export function hoyISO() {
  const d = new Date()
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mes}-${dia}`
}

export function etiquetaEstado(estado) {
  return { CONFIRMADA: 'Confirmada', PENDIENTE: 'Pendiente', CANCELADA: 'Cancelada' }[estado] ?? estado
}
