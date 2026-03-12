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
        metodoPago: request.input('metodoPago'),
        page: Number(request.input('page', 1)),
        limit: Number(request.input('limit', 20)),
      }

      const facturas = await this.facturaService.listarFacturas(filtros)

      return response.ok(facturas)
    } catch (error) {
      return response.badRequest({
        message: 'Error al listar facturas',
        error: error.message,
      })
    }
  }

  /**
   * GET /facturas/:id
   */
  async show({ params, response }: HttpContext) {
    try {
      const idFactura = Number(params.id)

      if (!idFactura || Number.isNaN(idFactura)) {
        return response.badRequest({ message: 'ID de factura inválido' })
      }

      const factura = await this.facturaService.obtenerDetalleFactura(idFactura)
      return response.ok(factura)
    } catch (error) {
      return response.badRequest({
        message: 'Error al obtener el detalle de la factura',
        error: error.message,
      })
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
   * Anular /facturas/:id (anular)
   */
  async anular({ params, response }: HttpContext) {
    try {
      const idFactura = Number(params.id)

      if (!idFactura || Number.isNaN(idFactura)) {
        return response.badRequest({ message: 'ID de factura inválido' })
      }

      const factura = await this.facturaService.anularFactura(idFactura)

      return response.ok({
        message: 'Factura anulada exitosamente',
        factura,
      })
    } catch (error) {
      return response.badRequest({
        message: 'Error al anular la factura',
        error: error.message,
      })
    }
  }
}
