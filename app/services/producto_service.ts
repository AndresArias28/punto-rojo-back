import Producto from '#models/producto'

interface ListarProductosParams {
  page: number
  limit: number
  search?: string
}

export default class ProductoService {
  /**
   * crear producto
   * @param data
   */
  async crearProducto(data: Partial<Producto>): Promise<Producto> {
    const producto = await Producto.create(data)
    return producto
  }

  public async listarProductos(params: ListarProductosParams) {
    const { page, limit, search } = params
    const query = Producto.query().where('estado', true)

    if (search) {
      query.where((builder) => {
        builder.where('nombre', 'ilike', `%${search}%`).orWhere('codigo', 'ilike', `%${search}%`)
      })
    }

    const productos = await query.offset((page - 1) * limit).limit(limit)

    return productos
  }
}
