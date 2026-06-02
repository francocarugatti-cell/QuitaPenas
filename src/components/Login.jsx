import { useState } from 'react'

// Credenciales de acceso a la app.
const USUARIO = 'QuitaPenas'
const CLAVE = 'Larapokemon'

/**
 * Pantalla de inicio de sesión. Si el usuario y la contraseña son correctos,
 * avisa al componente padre con onLogin().
 * @param {Function} onLogin Se llama cuando el acceso es válido.
 */
export default function Login({ onLogin }) {
  const [usuario, setUsuario] = useState('')
  const [clave, setClave] = useState('')
  const [verClave, setVerClave] = useState(false)
  const [error, setError] = useState('')

  function entrar(e) {
    e.preventDefault()
    if (usuario.trim() === USUARIO && clave === CLAVE) {
      setError('')
      onLogin()
    } else {
      setError('Usuario o contraseña incorrectos')
    }
  }

  return (
    <div className="login">
      <form className="login__card card" onSubmit={entrar}>
        <div className="login__brand">
          <span className="login__logo" aria-hidden="true">🥐</span>
          <h1 className="login__titulo">Quita Penas</h1>
        </div>
        <p className="login__subtitulo">Ingresá para acceder a tus ventas</p>

        <div className="form__group">
          <label className="form__label" htmlFor="usuario">Usuario</label>
          <input
            id="usuario"
            type="text"
            className={`form__control ${error ? 'is-error' : ''}`}
            placeholder="Tu usuario"
            autoComplete="username"
            value={usuario}
            onChange={(e) => { setUsuario(e.target.value); setError('') }}
          />
        </div>

        <div className="form__group">
          <label className="form__label" htmlFor="clave">Contraseña</label>
          <div className="login__clave">
            <input
              id="clave"
              type={verClave ? 'text' : 'password'}
              className={`form__control ${error ? 'is-error' : ''}`}
              placeholder="Tu contraseña"
              autoComplete="current-password"
              value={clave}
              onChange={(e) => { setClave(e.target.value); setError('') }}
            />
            <button
              type="button"
              className="login__ver"
              onClick={() => setVerClave((v) => !v)}
              aria-label={verClave ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {verClave ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        {error && <span className="form__error login__error">{error}</span>}

        <button type="submit" className="btn btn--primary btn--block">
          🔓 Entrar
        </button>
      </form>
    </div>
  )
}
