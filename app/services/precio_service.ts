import PrecioPorCliente from '#models/precio_por_cliente'
import { DateTime } from 'luxon'

export default class PrecioService {
  async obtenerPrecioParaCliente(idProducto: number, idCliente: number): Promise<number> {
    // Buscar precio especial del cliente
    const precioEspecial = await PrecioPorCliente.query()
      .where('id_cliente', idCliente)
      .where('id_producto', idProducto)
      .where('estado', true)
      .where('fecha_creacion', '<=', DateTime.now().toSQLDate()!)
      .where((query) => {
        query
          .whereNull('fecha_creacion')
          .orWhere('fecha_creacion', '>=', DateTime.now().toSQLDate()!)
      })
      .first()

    if (precioEspecial) {
      return precioEspecial.precioEspecial
    }
    return 0
  }

  /**
   * Obtiene los precios de múltiples productos para un cliente
   */
  // async obtenerPreciosParaCliente(
  //   idCliente: number,
  //   productosIds: number[]
  // ): Promise<Map<number, number>> {
  //   const precios = new Map<number, number>()

  //   for (const idProducto of productosIds) {
  //     const precio = await this.obtenerPrecioParaCliente(idProducto, idCliente)
  //     precios.set(idProducto, precio)
  //   }

  //   return precios
  // }

  async upsertPrecio(idCliente: number, idProducto: number, precioEspecial: number) {
    // Buscar si ya existe la relación cliente-producto
    const existente = await PrecioPorCliente.query()
      .where('id_cliente', idCliente)
      .where('id_producto', idProducto)
      .first()

    if (existente) {
      existente.precioEspecial = precioEspecial
      existente.estado = true
      await existente.save()
      return { registro: existente, creado: false }
    }

    const nuevo = await PrecioPorCliente.create({
      idCliente,
      idProducto,
      precioEspecial,
      estado: true,
    })

    return { registro: nuevo, creado: true }
  }
}
