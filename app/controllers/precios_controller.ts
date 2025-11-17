import type { HttpContext } from '@adonisjs/core/http'
import PrecioPorCliente from '#models/precio_por_cliente'
import PrecioService from '#services/precio_service'
import vine from '@vinejs/vine'

export default class PreciosController {
  private precioService: PrecioService

  constructor() {
    this.precioService = new PrecioService()
  }

  /**
   * GET /precios/cliente/:idCliente/producto/:idProducto
   * Obtiene el precio de un producto para un cliente específico
   */
  async obtenerPrecio({ params, response }: HttpContext) {
    try {
      const precio = await this.precioService.obtenerPrecioParaCliente(
        params.idProducto,
        params.idCliente
      )

      return response.ok({
        idCliente: params.idCliente,
        idProducto: params.idProducto,
        precio,
      })
    } catch (error) {
      return response.badRequest({ message: 'Error al obtener precio', error: error.message })
    }
  }

  /**
   * GET /precios/cliente/:idCliente
   * Lista todos los precios especiales de un cliente
   */
  async listarPreciosCliente({ params, response }: HttpContext) {
    try {
      const precios = await PrecioPorCliente.query()
        .where('id_cliente', params.idCliente)
        .where('estado', true)
        .preload('producto')
        .orderBy('id_precio_cliente', 'desc')

      return response.ok(precios)
    } catch (error) {
      return response.badRequest({
        message: 'Error al listar precios del cliente',
        error: error.message,
      })
    }
  }

  /**
   * POST /precios
   * Crea o actualiza un precio especial para un cliente
   */
  async store({ request, response }: HttpContext) {
    try {
      const validator = vine.compile(
        vine.object({
          idCliente: vine.number().positive(),
          idProducto: vine.number().positive(),
          precioEspecial: vine.number().positive(),
          fechaInicio: vine.date().optional(),
          fechaFin: vine.date().optional(),
        })
      )

      const data = await request.validateUsing(validator)

      const precio = await PrecioPorCliente.create(data)
      await precio.load('cliente')
      await precio.load('producto')

      return response.created(precio)
    } catch (error) {
      return response.badRequest({
        message: 'Error al crear precio especial',
        error: error.messages || error.message,
      })
    }
  }

  /**
   * PUT /precios/:id
   * Actualiza un precio especial
   */
  async update({ params, request, response }: HttpContext) {
    try {
      const precio = await PrecioPorCliente.findOrFail(params.id)

      const validator = vine.compile(
        vine.object({
          precioEspecial: vine.number().positive().optional(),
          estado: vine.boolean().optional(),
        })
      )

      const data = await request.validateUsing(validator)
      precio.merge(data)
      await precio.save()

      return response.ok(precio)
    } catch (error) {
      return response.badRequest({
        message: 'Error al actualizar precio especial',
        error: error.messages || error.message,
      })
    }
  }

  /**
   * DELETE /precios/:id
   * Desactiva un precio especial
   */
  async destroy({ params, response }: HttpContext) {
    try {
      const precio = await PrecioPorCliente.findOrFail(params.id)
      precio.estado = false
      await precio.save()

      return response.ok({ message: 'Precio especial desactivado correctamente' })
    } catch (error) {
      return response.badRequest({ message: 'Error al desactivar precio especial' })
    }
  }
}
