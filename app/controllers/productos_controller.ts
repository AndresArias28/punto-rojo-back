import type { HttpContext } from '@adonisjs/core/http'
import Producto from '#models/producto'
import { createProductoValidator, updateProductoValidator } from '#validators/producto'

export default class ProductosController {
  /**
   * GET /productos
   */
  async index({ request, response }: HttpContext) {
    try {
      const page = request.input('page', 1)
      const limit = request.input('limit', 20)
      const search = request.input('search')

      const query = Producto.query().where('estado', true)

      if (search) {
        query.where((builder) => {
          builder.where('nombre', 'ilike', `%${search}%`).orWhere('codigo', 'ilike', `%${search}%`)
        })
      }

      const productos = await query.orderBy('nombre', 'asc').paginate(page, limit)

      return response.ok(productos)
    } catch (error) {
      return response.badRequest({ message: 'Error al listar productos', error: error.message })
    }
  }

  /**
   * GET /productos/:id
   */
  async show({ params, response }: HttpContext) {
    try {
      const producto = await Producto.findOrFail(params.id)
      return response.ok(producto)
    } catch (error) {
      return response.notFound({ message: 'Producto no encontrado' })
    }
  }

  /**
   * POST /productos
   */
  async store({ request, response }: HttpContext) {
    try {
      const data = await request.validateUsing(createProductoValidator)
      const producto = await Producto.create(data)

      return response.created(producto)
    } catch (error) {
      return response.badRequest({
        message: 'Error al crear producto',
        error: error.messages || error.message,
      })
    }
  }

  /**
   * PUT /productos/:id
   */
  async update({ params, request, response }: HttpContext) {
    try {
      const producto = await Producto.findOrFail(params.id)
      const data = await request.validateUsing(updateProductoValidator)

      producto.merge(data)
      await producto.save()

      return response.ok(producto)
    } catch (error) {
      return response.badRequest({
        message: 'Error al actualizar producto',
        error: error.messages || error.message,
      })
    }
  }

  /**
   * DELETE /productos/:id (soft delete)
   */
  async destroy({ params, response }: HttpContext) {
    try {
      const producto = await Producto.findOrFail(params.id)
      producto.estado = false
      await producto.save()

      return response.ok({ message: 'Producto desactivado correctamente' })
    } catch (error) {
      return response.badRequest({ message: 'Error al desactivar producto' })
    }
  }
}
