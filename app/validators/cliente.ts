import vine from '@vinejs/vine'

export const createClienteValidator = vine.compile(
  vine.object({
    nombre: vine.string().trim().minLength(3).maxLength(200),
    documento: vine.string().trim().minLength(5).maxLength(50),
    direccion: vine.string().trim().optional(),
    telefono: vine.string().trim().optional(),
    email: vine.string().email().optional(),
    tipoCliente: vine.string().trim().optional(),
  })
)

export const updateClienteValidator = vine.compile(
  vine.object({
    nombre: vine.string().trim().minLength(3).maxLength(200).optional(),
    direccion: vine.string().trim().optional(),
    telefono: vine.string().trim().optional(),
    email: vine.string().email().optional(),
    tipoCliente: vine.string().trim().optional(),
    estado: vine.boolean().optional(),
  })
)
