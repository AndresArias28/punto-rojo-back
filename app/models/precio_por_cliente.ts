import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Cliente from './cliente.js'
import Producto from './producto.js'

export default class PrecioPorCliente extends BaseModel {
  public static table = 'precios_por_cliente'

  @column({ isPrimary: true, columnName: 'id_precio_cliente' })
  declare idPrecioCliente: number

  @column({ columnName: 'id_cliente' })
  declare idCliente: number

  @column({ columnName: 'id_producto' })
  declare idProducto: number

  @column({ columnName: 'precio_especial' })
  declare precioEspecial: number

  @column()
  declare estado: boolean

  @belongsTo(() => Cliente, {
    foreignKey: 'idCliente',
  })
  declare cliente: BelongsTo<typeof Cliente>

  @belongsTo(() => Producto, {
    foreignKey: 'idProducto',
  })
  declare producto: BelongsTo<typeof Producto>
}
