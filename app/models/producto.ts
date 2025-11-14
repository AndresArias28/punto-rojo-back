import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import DetalleFactura from './detalle_factura.js'
import PrecioPorCliente from './precio_por_cliente.js'

export default class Producto extends BaseModel {
  public static table = 'productos'

  @column({ isPrimary: true, columnName: 'id_producto' })
  declare idProducto: number

  @column()
  declare codigo: string

  @column()
  declare nombre: string

  @column()
  declare descripcion: string | null

  @column({ columnName: 'precio_base' })
  declare precioBase: number

  @column()
  declare stock: number

  @column({ columnName: 'unidad_medida' })
  declare unidadMedida: string

  @column()
  declare estado: boolean

  @column.dateTime({ autoCreate: true, columnName: 'fecha_creacion' })
  declare fechaCreacion: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'fecha_modificacion' })
  declare fechaModificacion: DateTime

  @hasMany(() => DetalleFactura, {
    foreignKey: 'idProducto',
  })
  declare detalles: HasMany<typeof DetalleFactura>

  @hasMany(() => PrecioPorCliente, {
    foreignKey: 'idProducto',
  })
  declare preciosEspeciales: HasMany<typeof PrecioPorCliente>
}
