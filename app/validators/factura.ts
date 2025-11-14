import vine from '@vinejs/vine'

export const createFacturaValidator = vine.compile(
  vine.object({
    idCliente: vine.number().positive(),
    items: vine.array(
      vine.object({
        idProducto: vine.number().positive(),
        cantidad: vine.number().positive(),
        descuento: vine.number().min(0).optional(),
      })
    ),
    metodoPago: vine.string().trim().optional(),
    notas: vine.string().trim().optional(),
    usuarioCreacion: vine.string().trim().optional(),
  })
)
