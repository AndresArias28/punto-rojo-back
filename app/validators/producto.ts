import vine from '@vinejs/vine'

export const createProductoValidator = vine.compile(
  vine.object({
    codigo: vine.string().trim().minLength(1).maxLength(50).optional(),
    nombre: vine.string().trim().minLength(3).maxLength(200),
    descripcion: vine.string().trim().optional(),
    stock: vine.number().min(0).optional(),
  })
)

export const updateProductoValidator = vine.compile(
  vine.object({
    nombre: vine.string().trim().minLength(3).maxLength(200),
    descripcion: vine.string().trim().optional(),
    stock: vine.number().min(0).optional(),
    estado: vine.boolean().optional(),
  })
)
