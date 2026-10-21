import { useState } from 'react'
import { useUsuarios, useRegistrarUsuario } from '../hooks/usarDatos.js'
import { Campo, Entrada, Selector } from '../componentes/Campo.jsx'
import { CargandoFilas, EstadoError, EstadoVacio, AvisoRespaldo } from '../componentes/Estados.jsx'
import { iniciales, fechaBonita } from '../utilidades/formato.js'

const VACIO = { nombres: '', correo: '', contrasena: '', rol: '', apartamento: '', telefono: '' }

function validar(datos) {
  const e = {}
  if (datos.nombres.trim().length < 3) e.nombres = 'Mínimo 3 caracteres'
  if (!/^\S+@\S+\.\S+$/.test(datos.correo)) e.correo = 'Ingresa un correo válido'
  if (datos.contrasena.length < 6) e.contrasena = 'Mínimo 6 caracteres'
  if (!datos.rol) e.rol = 'Selecciona un rol'
  return e
}

export default function Usuarios() {
  const { data, isLoading, isError, error, refetch } = useUsuarios()
  const registrar = useRegistrarUsuario()
  const [form, setForm] = useState(VACIO)
  const [errores, setErrores] = useState({})

  const usuarios = data?.datos ?? []

  const cambiar = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const enviar = async (e) => {
    e.preventDefault()
    const errs = validar(form)
    setErrores(errs)
    if (Object.keys(errs).length) return
    try {
      await registrar.mutateAsync(form)
      setForm(VACIO)
      setErrores({})
    } catch {
      /* el toast de error lo maneja el hook */
    }
  }

  return (
    <div className="contenedor seccion">
      <div className="mb-4">
        <span className="chip mb-2"><i className="bi bi-people" /> Módulo de residentes</span>
        <h1 className="titulo-display" style={{ fontSize: 'clamp(1.8rem,4vw,2.6rem)' }}>Residentes y administradores</h1>
        <p className="texto-suave">Registra a los residentes y consulta quiénes pueden reservar las zonas comunes.</p>
      </div>

      <div className="row g-4">
        {/* Formulario de registro (POST /api/usuarios) */}
        <div className="col-lg-5">
          <form className="tarjeta p-4" onSubmit={enviar}>
            <h5 className="fw-bold mb-3"><i className="bi bi-person-plus texto-marca me-2" />Registrar residente</h5>

            <Campo etiqueta="Nombre completo" icono="bi-person" error={errores.nombres}>
              <Entrada name="nombres" placeholder="Ej: Mariana Marín" value={form.nombres} onChange={cambiar} invalido={errores.nombres} />
            </Campo>

            <Campo etiqueta="Correo" icono="bi-envelope" error={errores.correo}>
              <Entrada type="email" name="correo" placeholder="correo@ejemplo.com" value={form.correo} onChange={cambiar} invalido={errores.correo} />
            </Campo>

            <Campo etiqueta="Contraseña" icono="bi-lock" error={errores.contrasena} ayuda="Mínimo 6 caracteres. Se guarda cifrada.">
              <Entrada type="password" name="contrasena" placeholder="••••••" value={form.contrasena} onChange={cambiar} invalido={errores.contrasena} />
            </Campo>

            <div className="row">
              <div className="col-7">
                <Campo etiqueta="Rol" icono="bi-shield-check" error={errores.rol}>
                  <Selector name="rol" value={form.rol} onChange={cambiar} invalido={errores.rol}>
                    <option value="">Seleccionar…</option>
                    <option value="RESIDENTE">Residente</option>
                    <option value="ADMINISTRADOR">Administrador</option>
                  </Selector>
                </Campo>
              </div>
              <div className="col-5">
                <Campo etiqueta="Apto (opcional)" icono="bi-house">
                  <Entrada name="apartamento" placeholder="T2-504" value={form.apartamento} onChange={cambiar} />
                </Campo>
              </div>
            </div>

            <Campo etiqueta="Teléfono (opcional)" icono="bi-telephone">
              <Entrada name="telefono" placeholder="300 000 0000" value={form.telefono} onChange={cambiar} />
            </Campo>

            <button className="btn-marca w-100 mt-2" disabled={registrar.isPending}>
              {registrar.isPending ? (
                <><span className="spinner-border spinner-border-sm me-2" />Guardando…</>
              ) : (
                <><i className="bi bi-check2-circle me-1" />Registrar residente</>
              )}
            </button>
          </form>
        </div>

        {/* Listado (GET /api/usuarios) */}
        <div className="col-lg-7">
          <div className="tarjeta p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">Listado de residentes</h5>
              <span className="chip-neutro chip">{usuarios.length} registrados</span>
            </div>
            <AvisoRespaldo origen={data?.origen} />

            {isLoading ? (
              <CargandoFilas />
            ) : isError ? (
              <EstadoError error={error} alReintentar={refetch} />
            ) : usuarios.length === 0 ? (
              <EstadoVacio icono="bi-person-x" titulo="Aún no hay residentes">
                Registra el primero con el formulario de la izquierda.
              </EstadoVacio>
            ) : (
              <div className="table-responsive">
                <table className="tabla-paseo">
                  <thead>
                    <tr><th>Residente</th><th>Rol</th><th className="d-none d-md-table-cell">Apto</th><th className="d-none d-lg-table-cell">Alta</th></tr>
                  </thead>
                  <tbody>
                    {usuarios.map((u) => (
                      <tr key={u.id} className="aparecer">
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <span className="avatar">{iniciales(u.nombres)}</span>
                            <div>
                              <div className="fw-semibold">{u.nombres}</div>
                              <div className="texto-tenue" style={{ fontSize: '.82rem' }}>{u.correo}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`chip ${u.rol === 'ADMINISTRADOR' ? 'chip-oro' : ''}`}>
                            <i className={`bi ${u.rol === 'ADMINISTRADOR' ? 'bi-shield-lock' : 'bi-person'}`} />
                            {u.rol === 'ADMINISTRADOR' ? 'Admin' : 'Residente'}
                          </span>
                        </td>
                        <td className="d-none d-md-table-cell texto-suave">{u.apartamento || '—'}</td>
                        <td className="d-none d-lg-table-cell texto-tenue" style={{ fontSize: '.82rem' }}>{fechaBonita(u.creadoEn)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
