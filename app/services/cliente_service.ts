import Cliente from '#models/cliente'

export default class ClienteService {
  /**
   * Obtiene un cliente por su ID
   */
  async listarConPrecios() {
    const clientes = await Cliente.query()
      .select(['id_cliente', 'nombre'])
      .preload('preciosEspeciales', (preciosQuery) => {
        preciosQuery
          .select(['id_precio_cliente', 'id_cliente', 'id_producto', 'precio_especial', 'estado'])
          .where('estado', true)
          .preload('producto', (productoQuery) => {
            productoQuery.select(['id_producto', 'nombre'])
          })
      })

    return clientes
  }
}
