import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Factura from './factura.js'
import PrecioPorCliente from './precio_por_cliente.js'

export default class Cliente extends BaseModel {
  public static table = 'clientes'

  @column({ isPrimary: true, columnName: 'id_cliente' })
  declare idCliente: number

  @column()
  declare nombre: string

  @column()
  declare documento: string

  @column()
  declare direccion: string | null

  @column()
  declare telefono: string | null

  @column()
  declare email: string | null

  @column()
  declare estado: boolean

  @column.dateTime({ autoCreate: true, columnName: 'fecha_creacion' })
  declare fechaCreacion: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'fecha_modificacion' })
  declare fechaModificacion: DateTime

  @hasMany(() => Factura, {
    foreignKey: 'idCliente',
  })
  declare facturas: HasMany<typeof Factura>

  @hasMany(() => PrecioPorCliente, {
    foreignKey: 'idCliente',
  })
  declare preciosEspeciales: HasMany<typeof PrecioPorCliente>
}
