import type { HttpContext } from '@adonisjs/core/http'
import Cliente from '#models/cliente'
import { createClienteValidator, updateClienteValidator } from '#validators/cliente'

export default class ClientesController {
  /**
   * GET /clientes
   */

  /**
   * @swagger
   * /clientes:
   *   get:
   *     summary: Listar clientes
   *     tags: [Clientes]
   *     responses:
   *       200:
   *         description: Lista de clientes
   */

  async index({ request, response }: HttpContext) {
    try {
      const page = request.input('page', 1)
      const limit = request.input('limit', 20)
      const search = request.input('search')

      const query = Cliente.query().where('estado', true)

      if (search) {
        query.where((builder) => {
          builder
            .where('nombre', 'ilike', `%${search}%`)
            .orWhere('documento', 'ilike', `%${search}%`)
        })
      }

      const clientes = await query.orderBy('nombre', 'asc').paginate(page, limit)

      return response.ok(clientes)
    } catch (error) {
      return response.badRequest({ message: 'Error al listar clientes', error: error.message })
    }
  }

  /**
   * GET /clientes/:id
   */
  async show({ params, response }: HttpContext) {
    try {
      const cliente = await Cliente.findOrFail(params.id)
      await cliente.load('facturas')
      await cliente.load('preciosEspeciales', (query) => {
        query.preload('producto')
      })

      return response.ok(cliente)
    } catch (error) {
      return response.notFound({ message: 'Cliente no encontrado' })
    }
  }

  /**
   * POST /clientes
   */
  async store({ request, response }: HttpContext) {
    try {
      const data = await request.validateUsing(createClienteValidator)

      const cliente = await Cliente.create(data)

      return response.created(cliente)
    } catch (error) {
      return response.badRequest({
        message: 'Error al crear cliente',
        error: error.messages || error.message,
      })
    }
  }

  /**
   * PUT /clientes/:id
   */
  async update({ params, request, response }: HttpContext) {
    try {
      const cliente = await Cliente.findOrFail(params.id)
      const data = await request.validateUsing(updateClienteValidator)

      cliente.merge(data)
      await cliente.save()

      return response.ok(cliente)
    } catch (error) {
      return response.badRequest({
        message: 'Error al actualizar cliente',
        error: error.messages || error.message,
      })
    }
  }

  /**
   * DELETE /clientes/:id (soft delete)
   */
  async destroy({ params, response }: HttpContext) {
    try {
      const cliente = await Cliente.findOrFail(params.id)
      cliente.estado = false
      await cliente.save()

      return response.ok({ message: 'Cliente desactivado correctamente' })
    } catch (error) {
      return response.badRequest({ message: 'Error al desactivar cliente' })
    }
  }
}
