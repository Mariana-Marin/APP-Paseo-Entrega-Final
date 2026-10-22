import { useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { toast } from 'sonner'
import { fechaBonita, rangoHoras } from '../utilidades/formato.js'

/**
 * Pase de acceso de una reserva, con UN código QR verificable por portería.
 * El QR codifica el enlace de verificación; portería lo valida en /porteria.
 * Incluye un botón para descargar el pase como imagen PNG.
 */
export default function PaseReserva({ reserva, alCerrar }) {
  const qrRef = useRef(null)
  if (!reserva) return null

  const url = `${window.location.origin}${import.meta.env.BASE_URL}porteria?codigo=${reserva.codigoAcceso}`

  // Dibuja el QR + los datos de la reserva en un canvas y lo descarga como PNG.
  const descargar = () => {
    const svg = qrRef.current?.querySelector('svg')
    if (!svg) return
    const xml = new XMLSerializer().serializeToString(svg)
    const img = new Image()
    const svgUrl = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(xml)))

    img.onload = () => {
      const W = 720
      const H = 980
      const canvas = document.createElement('canvas')
      canvas.width = W
      canvas.height = H
      const ctx = canvas.getContext('2d')

      // Fondo con franja de marca
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, W, H)
      ctx.fillStyle = '#0b3d2e'
      ctx.fillRect(0, 0, W, 150)
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 40px "Segoe UI", system-ui, sans-serif'
      ctx.fillText('Paseo de San Francisco', 48, 72)
      ctx.font = '22px "Segoe UI", system-ui, sans-serif'
      ctx.fillStyle = '#6ee7b7'
      ctx.fillText('Pase de acceso · zonas comunes', 48, 110)

      // QR centrado
      const qrSize = 360
      ctx.drawImage(img, (W - qrSize) / 2, 190, qrSize, qrSize)

      // Código de acceso
      ctx.fillStyle = '#0f1b16'
      ctx.textAlign = 'center'
      ctx.font = '18px "Segoe UI", system-ui, sans-serif'
      ctx.fillStyle = '#5b6b63'
      ctx.fillText('CÓDIGO DE ACCESO', W / 2, 600)
      ctx.fillStyle = '#0b3d2e'
      ctx.font = 'bold 56px "Segoe UI", monospace'
      ctx.fillText(reserva.codigoAcceso, W / 2, 660)

      // Detalles
      ctx.textAlign = 'left'
      const filas = [
        ['Espacio', reserva.espacioNombre],
        ['Fecha', fechaBonita(reserva.fecha)],
        ['Horario', rangoHoras(reserva.fecha, reserva.tiempo)],
        ['Personas', String(reserva.personas)],
        ['Residente', reserva.usuarioNombre ?? ''],
      ]
      let y = 730
      for (const [k, v] of filas) {
        ctx.fillStyle = '#8a988f'
        ctx.font = '20px "Segoe UI", system-ui, sans-serif'
        ctx.fillText(k, 60, y)
        ctx.fillStyle = '#0f1b16'
        ctx.font = 'bold 22px "Segoe UI", system-ui, sans-serif'
        ctx.textAlign = 'right'
        ctx.fillText(v, W - 60, y)
        ctx.textAlign = 'left'
        y += 44
      }

      canvas.toBlob((blob) => {
        if (!blob) { toast.error('No se pudo generar la imagen'); return }
        const href = URL.createObjectURL(blob)
        const enlace = document.createElement('a')
        enlace.download = `pase-${reserva.codigoAcceso}.png`
        enlace.href = href
        document.body.appendChild(enlace)
        enlace.click()
        document.body.removeChild(enlace)
        setTimeout(() => URL.revokeObjectURL(href), 1000)
        toast.success('Pase descargado como imagen')
      }, 'image/png')
    }
    img.onerror = () => toast.error('No se pudo generar la imagen')
    img.src = svgUrl
  }

  return (
    <div className="cmdk-fondo" onClick={alCerrar}>
      <div className="cmdk-caja tarjeta p-0 aparecer" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
        <div className="fran-cabecera" style={{ justifyContent: 'space-between' }}>
          <span><i className="bi bi-patch-check me-2" />Reserva confirmada</span>
          <button className="btn-fantasma text-white" onClick={alCerrar}><i className="bi bi-x-lg" /></button>
        </div>
        <div className="p-4 text-center">
          <p className="texto-suave mb-3">Muestra este pase en portería el día de tu reserva.</p>
          <div className="pase-qr mb-3" ref={qrRef}>
            <QRCodeSVG value={url} size={176} level="M" />
          </div>
          <div className="mb-3">
            <div className="texto-tenue small">Código de acceso</div>
            <div className="mono fw-bold" style={{ fontSize: '1.8rem', letterSpacing: '.3em' }}>{reserva.codigoAcceso}</div>
          </div>
          <div className="tarjeta p-3 text-start">
            <div className="d-flex justify-content-between"><span className="texto-suave">Espacio</span><strong>{reserva.espacioNombre}</strong></div>
            <div className="d-flex justify-content-between"><span className="texto-suave">Fecha</span><strong>{fechaBonita(reserva.fecha)}</strong></div>
            <div className="d-flex justify-content-between"><span className="texto-suave">Horario</span><strong>{rangoHoras(reserva.fecha, reserva.tiempo)}</strong></div>
            <div className="d-flex justify-content-between"><span className="texto-suave">Personas</span><strong>{reserva.personas}</strong></div>
          </div>
          <button className="btn-marca w-100 mt-3" onClick={descargar}>
            <i className="bi bi-download me-2" />Descargar QR (PNG)
          </button>
          <button className="btn-contorno w-100 mt-2" onClick={alCerrar}>Cerrar</button>
        </div>
      </div>
    </div>
  )
}
