import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Factura from './factura.js'
import Producto from './producto.js'

export default class DetalleFactura extends BaseModel {
  public static table = 'detalle_factura'

  @column({ isPrimary: true, columnName: 'id_detalle' })
  declare idDetalle: number

  @column({ columnName: 'id_factura' })
  declare idFactura: number

  @column({ columnName: 'id_producto' })
  declare idProducto: number

  @column()
  declare cantidad: number

  @column({ columnName: 'precio_unitario' })
  declare precioUnitario: number

  @column()
  declare descuento: number

  @column({ columnName: 'subtotal_linea' })
  declare subtotalLinea: number

  @belongsTo(() => Factura, {
    foreignKey: 'idFactura',
  })
  declare factura: BelongsTo<typeof Factura>

  @belongsTo(() => Producto, {
    foreignKey: 'idProducto',
  })
  declare producto: BelongsTo<typeof Producto>
}
