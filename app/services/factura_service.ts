import Factura from '#models/factura'
import DetalleFactura from '#models/detalle_factura'
import Producto from '#models/producto'
import PrecioService from './precio_service.js'
import db from '@adonisjs/lucid/services/db'

interface ItemFactura {
  idProducto: number
  cantidad: number
  descuento?: number
}

interface DatosFactura {
  idCliente: number
  items: ItemFactura[]
  metodoPago?: string
  notas?: string
  usuarioCreacion?: string
}

export default class FacturaService {
  private precioService: PrecioService

  constructor() {
    this.precioService = new PrecioService()
  }

  /**
   * Genera el siguiente número de factura
   */
  private async generarNumeroFactura(): Promise<string> {
    const ultimaFactura = await Factura.query().orderBy('id_factura', 'desc').first()

    if (!ultimaFactura) {
      return 'FAC-00001'
    }

    const numeroActual = Number.parseInt(ultimaFactura.numeroFactura.split('-')[1])
    const nuevoNumero = numeroActual + 1
    return `FAC-${nuevoNumero.toString().padStart(5, '0')}`
  }

  /**
   * Crea una nueva factura con sus detalles
   */
  async crearFactura(datos: DatosFactura): Promise<Factura> {
    // Usar transacción para asegurar integridad
    const trx = await db.transaction()

    try {
      // Generar número de factura
      const numeroFactura = await this.generarNumeroFactura()

      // Crear factura
      const factura = new Factura()
      factura.numeroFactura = numeroFactura
      factura.idCliente = datos.idCliente
      factura.metodoPago = datos.metodoPago || null
      factura.notas = datos.notas || null
      factura.estado = 'pagada'

      await factura.useTransaction(trx).save()

      let subtotalTotal = 0

      // Crear detalles de factura
      for (const item of datos.items) {
        // Verificar stock
        const producto = await Producto.findOrFail(item.idProducto)

        // Obtener precio correcto según cliente
        const precioUnitario = await this.precioService.obtenerPrecioParaCliente(
          item.idProducto,
          datos.idCliente
        )

        const descuento = item.descuento || 0
        const subtotalLinea = item.cantidad * precioUnitario - descuento

        // Crear detalle
        const detalle = new DetalleFactura()
        detalle.idFactura = factura.idFactura
        detalle.idProducto = item.idProducto
        detalle.cantidad = item.cantidad
        detalle.precioUnitario = precioUnitario
        detalle.descuento = descuento

        //esto es para guardar en la base de datos
        await detalle.useTransaction(trx).save()

        // Actualizar stock
        producto.stock -= item.cantidad
        await producto.useTransaction(trx).save()

        subtotalTotal += subtotalLinea
      }

      // Calcular IVA (19% en Colombia, ajusta según tu país)
      const iva = subtotalTotal * 0.19
      const total = subtotalTotal + iva

      // Actualizar totales de factura
      factura.subtotal = subtotalTotal
      factura.iva = iva
      factura.total = total
      await factura.useTransaction(trx).save()

      await trx.commit()

      // Cargar relaciones
      await factura.load('cliente')
      await factura.load('detalles', (query) => {
        query.preload('producto')
      })

      return factura
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }

  /**
   * Obtiene una factura con todos sus detalles
   */
  async obtenerFactura(idFactura: number): Promise<Factura> {
    const factura = await Factura.query()
      .where('id_factura', idFactura)
      .preload('cliente')
      .preload('detalles', (query) => {
        query.preload('producto')
      })
      .firstOrFail()

    return factura
  }

  /**
   * Lista facturas con filtros opcionales
   */
  async listarFacturas(filtros?: {
    idCliente?: number
    estado?: string
    fechaDesde?: string
    fechaHasta?: string
    page?: number
    limit?: number
  }) {
    const page = filtros?.page || 1
    const limit = filtros?.limit || 20

    const query = Factura.query().preload('cliente').orderBy('fecha_emision', 'desc')

    if (filtros?.idCliente) {
      query.where('id_cliente', filtros.idCliente)
    }

    if (filtros?.estado) {
      query.where('estado', filtros.estado)
    }

    if (filtros?.fechaDesde) {
      query.where('fecha_emision', '>=', filtros.fechaDesde)
    }

    if (filtros?.fechaHasta) {
      query.where('fecha_emision', '<=', filtros.fechaHasta)
    }

    return await query.paginate(page, limit)
  }

  /**
   * Anula una factura
   */
  async anularFactura(idFactura: number): Promise<Factura> {
    const trx = await db.transaction()

    try {
      const factura = await Factura.findOrFail(idFactura)

      if (factura.estado === 'anulada') {
        throw new Error('La factura ya está anulada')
      }

      // Cargar detalles
      await factura.load('detalles')

      // Devolver stock
      for (const detalle of factura.detalles) {
        const producto = await Producto.findOrFail(detalle.idProducto)
        producto.stock += detalle.cantidad
        await producto.useTransaction(trx).save()
      }

      // Anular factura
      factura.estado = 'anulada'
      await factura.useTransaction(trx).save()

      await trx.commit()
      return factura
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }
}
