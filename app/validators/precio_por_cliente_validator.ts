import vine from '@vinejs/vine'

export const createPrecioPorClienteValidator = vine.compile(
  vine.object({
    idCliente: vine.number().positive(),
    idProducto: vine.number().positive(),
    precioEspecial: vine.number().min(0), // en COP entero ideal
    estado: vine.boolean().optional(), // opcional, por defecto true
  })
)

export const updatePrecioPorClienteValidator = vine.compile(
  vine.object({
    precioEspecial: vine.number().positive().optional(),
    estado: vine.boolean().optional(),
  })
)
