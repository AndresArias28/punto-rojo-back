import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Cliente from './cliente.js'
import DetalleFactura from './detalle_factura.js'

export default class Factura extends BaseModel {
  public static table = 'facturas'

  @column({ isPrimary: true, columnName: 'id_factura' })
  declare idFactura: number

  @column({ columnName: 'numero_factura' })
  declare numeroFactura: string

  @column({ columnName: 'id_cliente' })
  declare idCliente: number

  @column.dateTime({ columnName: 'fecha_emision' })
  declare fechaEmision: DateTime

  @column()
  declare subtotal: number

  @column()
  declare iva: number

  @column()
  declare total: number

  @column()
  declare estado: 'pagada' | 'pendiente' | 'anulada'

  @column({ columnName: 'metodo_pago' })
  declare metodoPago: string | null

  @column()
  declare notas: string | null

  @column({ columnName: 'usuario_creacion' })
  declare usuarioCreacion: string | null

  @column.dateTime({ autoCreate: true, columnName: 'fecha_creacion' })
  declare fechaCreacion: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'fecha_modificacion' })
  declare fechaModificacion: DateTime

  @belongsTo(() => Cliente, {
    foreignKey: 'idCliente',
  })
  declare cliente: BelongsTo<typeof Cliente>

  @hasMany(() => DetalleFactura, {
    foreignKey: 'idFactura',
  })
  declare detalles: HasMany<typeof DetalleFactura>
}
