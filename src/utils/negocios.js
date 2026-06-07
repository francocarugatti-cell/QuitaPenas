// Los 3 negocios (canales) de Quita Penas. Cada uno tiene sus propios
// productos, ventas y resumen. El "id" es el valor que se guarda en la
// columna "canal" de la base de datos.
export const NEGOCIOS = [
  { id: 'panaderia', label: 'Panadería', icono: '🏠' },
  { id: 'comercio', label: 'Ventas a comercio', icono: '🏪' },
  { id: 'pasteleria', label: 'Ventas pastelería', icono: '🧁' },
]

// Negocio por defecto (la tienda física, que es la versión original).
export const NEGOCIO_DEFECTO = 'panaderia'

/** Devuelve los datos de un negocio a partir de su id. */
export function negocioPorId(id) {
  return NEGOCIOS.find((n) => n.id === id) || NEGOCIOS[0]
}
