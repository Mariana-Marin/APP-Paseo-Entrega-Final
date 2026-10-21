import { QRCodeSVG } from 'qrcode.react'
import { fechaBonita, rangoHoras } from '../utilidades/formato.js'

/**
 * Pase de acceso de una reserva, con código QR verificable por portería.
 * El QR codifica el código de acceso; portería lo valida en /porteria.
 */
export default function PaseReserva({ reserva, alCerrar }) {
  if (!reserva) return null
  const url = `${window.location.origin}${import.meta.env.BASE_URL}porteria?codigo=${reserva.codigoAcceso}`

  return (
    <div className="cmdk-fondo" onClick={alCerrar}>
      <div className="cmdk-caja tarjeta p-0 aparecer" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
        <div className="fran-cabecera" style={{ justifyContent: 'space-between' }}>
          <span><i className="bi bi-patch-check me-2" />Reserva confirmada</span>
          <button className="btn-fantasma text-white" onClick={alCerrar}><i className="bi bi-x-lg" /></button>
        </div>
        <div className="p-4 text-center">
          <p className="texto-suave mb-3">Muestra este pase en portería el día de tu reserva.</p>
          <div className="pase-qr mb-3">
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
          <button className="btn-contorno w-100 mt-3" onClick={alCerrar}>Entendido</button>
        </div>
      </div>
    </div>
  )
}
