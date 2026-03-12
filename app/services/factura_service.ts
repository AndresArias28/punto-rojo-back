import Factura from '#models/factura'
import DetalleFactura from '#models/detalle_factura'
import db from '@adonisjs/lucid/services/db'

type FiltrosFacturas = {
  idCliente?: number
  estado?: string
  fechaDesde?: string
  fechaHasta?: string
  page?: number
  limit?: number
}

interface ItemFactura {
  idProducto: number
  cantidad: number
  descuento?: number
  precioUnitario: number
}

interface DatosFactura {
  idCliente: number
  numeroFactura: string
  items: ItemFactura[]
  metodoPago: string
  estado: 'pagada' | 'pendiente' | 'anulada'
  notas?: string
  usuarioCreacion?: string
  total: number
}

export default class FacturaService {
  /**
   * Obtiene el detalle completo de una factura, incluyendo cliente y productos
   */
  async obtenerDetalleFactura(idFactura: number) {
    const factura = await Factura.query()
      .where('id_factura', idFactura)
      .select([
        'id_factura',
        'numero_factura',
        'fecha_emision',
        'estado',
        'subtotal',
        'iva',
        'total',
        'metodo_pago',
        'id_cliente',
      ])
      .preload('cliente', (clienteQuery) => {
        clienteQuery.select(['id_cliente', 'nombre'])
      })
      .preload('detalles', (detalleQuery) => {
        detalleQuery
          .select([
            'id_detalle',
            'id_factura',
            'id_producto',
            'cantidad',
            'precio_unitario',
            'descuento',
          ])
          .preload('producto', (productoQuery) => {
            productoQuery.select(['id_producto', 'nombre'])
          })
      })
      .firstOrFail()

    return {
      idFactura: factura.idFactura,
      numeroTicket: factura.numeroFactura,
      fecha: factura.fechaEmision,
      cliente: factura.cliente?.nombre,
      estado: factura.estado,
      metodoPago: factura.metodoPago,
      subtotal: factura.subtotal,
      iva: factura.iva,
      total: factura.total,
      detalles: factura.detalles.map((detalle) => ({
        idDetalle: detalle.idDetalle,
        producto: detalle.producto?.nombre,
        cantidad: detalle.cantidad,
        precioUnitario: detalle.precioUnitario,
        descuento: detalle.descuento,
      })),
    }
  }

  /**
   * Crea una nueva factura con sus detalles
   */
  async crearFactura(datos: DatosFactura): Promise<Factura> {
    // Usar transacción para asegurar integridad
    const trx = await db.transaction()

    try {
      // Crear factura
      const factura = new Factura()
      factura.numeroFactura = datos.numeroFactura
      factura.idCliente = datos.idCliente
      factura.metodoPago = datos.metodoPago || null
      factura.notas = datos.notas || null
      factura.estado = datos.estado
      factura.total = datos.total

      await factura.useTransaction(trx).save()

      // Crear detalles de factura
      for (const item of datos.items) {
        // Crear detalle
        const detalle = new DetalleFactura()
        detalle.idFactura = factura.idFactura
        detalle.idProducto = item.idProducto
        detalle.cantidad = item.cantidad
        detalle.precioUnitario = item.precioUnitario

        //esto es para guardar en la base de datos
        await detalle.useTransaction(trx).save()
      }

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

  async listarFacturas(filtros?: FiltrosFacturas) {
    const page = filtros?.page || 1
    const limit = filtros?.limit || 20

    const query = Factura.query()
      .select(['id_factura', 'numero_factura', 'fecha_emision', 'estado', 'total'])
      .preload('cliente', (clienteQuery) => {
        clienteQuery.select(['id_cliente', 'nombre'])
      })
      .orderBy('fecha_emision', 'desc')

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

    const resultado = await query.paginate(page, limit)

    return {
      meta: resultado.getMeta(),
      data: resultado.all().map((factura) => ({
        idFactura: factura.idFactura,
        numeroTicket: factura.numeroFactura,
        fecha: factura.fechaEmision,
        cliente: factura.cliente?.nombre ?? 'Cliente no disponible',
        estado: factura.estado,
        total: factura.total,
      })),
    }
  }

  async anularFactura(idFactura: number) {
    const factura = await Factura.findOrFail(idFactura)

    if (factura.estado === 'anulada') {
      throw new Error('La factura ya se encuentra anulada')
    }

    factura.estado = 'anulada'
    await factura.save()

    await factura.load('cliente')
    await factura.load('detalles', (query) => {
      query.preload('producto')
    })

    return {
      idFactura: factura.idFactura,
      numeroTicket: factura.numeroFactura,
      fecha: factura.fechaEmision,
      cliente: factura.cliente?.nombre,
      estado: factura.estado,
      metodoPago: factura.metodoPago,
      subtotal: factura.subtotal,
      iva: factura.iva,
      total: factura.total,
      detalles: factura.detalles.map((detalle) => ({
        idDetalle: detalle.idDetalle,
        producto: detalle.producto?.nombre,
        cantidad: detalle.cantidad,
        precioUnitario: detalle.precioUnitario,
        descuento: detalle.descuento,
        subtotalLinea: detalle.cantidad * detalle.precioUnitario - (detalle.descuento || 0),
      })),
    }
  }
}
