import type { HttpContext } from '@adonisjs/core/http'
import FacturaService from '#services/factura_service'
import { createFacturaValidator } from '#validators/factura'

export default class FacturasController {
  private facturaService: FacturaService

  constructor() {
    this.facturaService = new FacturaService()
  }

  /**
   * GET /facturas
   */
  async index({ request, response }: HttpContext) {
    try {
      const filtros = {
        idCliente: request.input('idCliente'),
        estado: request.input('estado'),
        fechaDesde: request.input('fechaDesde'),
        fechaHasta: request.input('fechaHasta'),
        page: request.input('page', 1),
        limit: request.input('limit', 20),
      }

      const facturas = await this.facturaService.listarFacturas(filtros)

      return response.ok(facturas)
    } catch (error) {
      return response.badRequest({ message: 'Error al listar facturas', error: error.message })
    }
  }

  /**
   * GET /facturas/:id
   */
  async show({ params, response }: HttpContext) {
    try {
      const factura = await this.facturaService.obtenerFactura(params.id)
      return response.ok(factura)
    } catch (error) {
      return response.notFound({ message: 'Factura no encontrada' })
    }
  }

  /**
   * POST /facturas
   */
  async store({ request, response }: HttpContext) {
    try {
      const data = await request.validateUsing(createFacturaValidator)
      const factura = await this.facturaService.crearFactura(data)

      return response.created(factura)
    } catch (error) {
      return response.badRequest({
        message: 'Error al crear factura',
        error: error.messages || error.message,
      })
    }
  }

  /**
   * DELETE /facturas/:id (anular)
   */
  async destroy({ params, response }: HttpContext) {
    try {
      const factura = await this.facturaService.anularFactura(params.id)
      return response.ok({ message: 'Factura anulada correctamente', factura })
    } catch (error) {
      return response.badRequest({ message: 'Error al anular factura', error: error.message })
    }
  }

  /**
   * GET /facturas/:id/imprimir
   * Retorna los datos formateados para impresión
   */
  async imprimir({ params, response }: HttpContext) {
    try {
      const factura = await this.facturaService.obtenerFactura(params.id)

      // Formatear datos para impresión
      const facturaImpresion = {
        numero: factura.numeroFactura,
        fecha: factura.fechaEmision.toFormat('dd/MM/yyyy HH:mm'),
        cliente: {
          nombre: factura.cliente.nombre,
          documento: factura.cliente.documento,
          direccion: factura.cliente.direccion,
          telefono: factura.cliente.telefono,
        },
        items: factura.detalles.map((detalle) => ({
          producto: detalle.producto.nombre,
          cantidad: detalle.cantidad,
          precioUnitario: detalle.precioUnitario,
          descuento: detalle.descuento,
          subtotal: detalle.subtotalLinea,
        })),
        subtotal: factura.subtotal,
        iva: factura.iva,
        total: factura.total,
        metodoPago: factura.metodoPago,
        notas: factura.notas,
      }

      return response.ok(facturaImpresion)
    } catch (error) {
      return response.notFound({ message: 'Factura no encontrada' })
    }
  }
}
