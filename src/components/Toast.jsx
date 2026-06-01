// Mensaje flotante de feedback (éxito / error).
export default function Toast({ tipo = 'exito', children }) {
  return (
    <div className={`toast toast--${tipo}`} role="status">
      {children}
    </div>
  )
}
