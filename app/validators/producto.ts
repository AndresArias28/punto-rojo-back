import vine from '@vinejs/vine'

export const createProductoValidator = vine.compile(
  vine.object({
    codigo: vine.string().trim().minLength(1).maxLength(50),
    nombre: vine.string().trim().minLength(3).maxLength(200),
    descripcion: vine.string().trim().optional(),
    precioBase: vine.number().positive(),
    stock: vine.number().min(0).optional(),
    unidadMedida: vine.string().trim().optional(),
  })
)

export const updateProductoValidator = vine.compile(
  vine.object({
    nombre: vine.string().trim().minLength(3).maxLength(200).optional(),
    descripcion: vine.string().trim().optional(),
    precioBase: vine.number().positive().optional(),
    stock: vine.number().min(0).optional(),
    unidadMedida: vine.string().trim().optional(),
    estado: vine.boolean().optional(),
  })
)
