import Producto from '#models/producto'
import PrecioPorCliente from '#models/precio_por_cliente'
import { DateTime } from 'luxon'

export default class PrecioService {
  /**
   * Obtiene el precio correcto para un producto según el cliente
   * Prioridad: 1. Precio especial del cliente, 2. Precio base del producto
   */
  async obtenerPrecioParaCliente(idProducto: number, idCliente: number): Promise<number> {
    // Buscar precio especial del cliente
    const precioEspecial = await PrecioPorCliente.query()
      .where('id_cliente', idCliente)
      .where('id_producto', idProducto)
      .where('estado', true)
      .where('fecha_inicio', '<=', DateTime.now().toSQLDate()!)
      .where((query) => {
        query.whereNull('fecha_fin').orWhere('fecha_fin', '>=', DateTime.now().toSQLDate()!)
      })
      .first()

    if (precioEspecial) {
      return precioEspecial.precioEspecial
    }

    // Si no hay precio especial, usar precio base
    const producto = await Producto.findOrFail(idProducto)
    return producto.precioBase
  }

  /**
   * Obtiene los precios de múltiples productos para un cliente
   */
  async obtenerPreciosParaCliente(
    idCliente: number,
    productosIds: number[]
  ): Promise<Map<number, number>> {
    const precios = new Map<number, number>()

    for (const idProducto of productosIds) {
      const precio = await this.obtenerPrecioParaCliente(idProducto, idCliente)
      precios.set(idProducto, precio)
    }

    return precios
  }
}
