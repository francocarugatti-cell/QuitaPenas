// Modal de confirmación reutilizable (p. ej. antes de eliminar).
export default function ConfirmDialog({ mensaje, onConfirmar, onCancelar }) {
  return (
    <div className="modal-fondo" onClick={onCancelar}>
      <div
        className="modal"
        role="alertdialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="modal__mensaje">{mensaje}</p>
        <div className="modal__acciones">
          <button className="btn btn--secundario" onClick={onCancelar}>
            Cancelar
          </button>
          <button className="btn btn--peligro-solido" onClick={onConfirmar}>
            🗑️ Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}
