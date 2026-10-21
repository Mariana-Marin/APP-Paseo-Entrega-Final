import { useQuery } from '@tanstack/react-query'

// Sabaneta, Antioquia (coordenadas aproximadas). API pública y gratuita, sin llave.
const LAT = 6.1518
const LON = -75.6166

const ICONOS = {
  0: 'bi-sun', 1: 'bi-sun', 2: 'bi-cloud-sun', 3: 'bi-clouds',
  45: 'bi-cloud-fog', 48: 'bi-cloud-fog',
  51: 'bi-cloud-drizzle', 61: 'bi-cloud-rain', 63: 'bi-cloud-rain', 65: 'bi-cloud-rain-heavy',
  80: 'bi-cloud-rain', 95: 'bi-cloud-lightning-rain',
}

async function traerClima(fecha) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
    `&timezone=America%2FBogota&start_date=${fecha}&end_date=${fecha}`
  const r = await fetch(url)
  if (!r.ok) throw new Error('clima no disponible')
  const j = await r.json()
  return {
    code: j.daily?.weather_code?.[0],
    max: j.daily?.temperature_2m_max?.[0],
    min: j.daily?.temperature_2m_min?.[0],
    lluvia: j.daily?.precipitation_probability_max?.[0],
  }
}

/** Mini pronóstico para zonas al aire libre en la fecha elegida. */
export default function ClimaZona({ fecha }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['clima', fecha],
    queryFn: () => traerClima(fecha),
    enabled: Boolean(fecha),
    staleTime: 30 * 60 * 1000,
  })

  if (!fecha) return null
  if (isLoading) return <div className="skeleton" style={{ height: 52 }} />
  if (isError || !data || data.max == null) return null

  const icono = ICONOS[data.code] ?? 'bi-cloud-sun'
  const consejo = data.lluvia >= 60 ? 'Alta probabilidad de lluvia, ten un plan B.' : 'Buen pronóstico para una zona al aire libre.'

  return (
    <div className="tarjeta p-3 d-flex align-items-center gap-3">
      <i className={`bi ${icono} texto-marca`} style={{ fontSize: '1.9rem' }} />
      <div>
        <div className="fw-semibold">{Math.round(data.max)}° / {Math.round(data.min)}° · lluvia {data.lluvia ?? 0}%</div>
        <div className="texto-tenue small">{consejo}</div>
      </div>
    </div>
  )
}
