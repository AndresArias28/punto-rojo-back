import Route from '@adonisjs/core/services/router'

const ClientesController = () => import('#controllers/clientes_controller')
const ProductosController = () => import('#controllers/productos_controller')
const FacturasController = () => import('#controllers/facturas_controller')
const PreciosController = () => import('#controllers/precios_controller')
const SwaggerController = () => import('#controllers/swagger_controller')

Route.get('/docs', [SwaggerController, 'ui'])

// Archivos de Swagger UI (CSS, JS, PNG, etc.)
Route.get('/docs/swagger-ui-dist/*', [SwaggerController, 'assets'])

// JSON schema de OpenAPI
Route.get('/docs/swagger.json', [SwaggerController, 'json'])

/* ---------------------------
   🟩 Rutas Clientes
--------------------------- */
Route.group(() => {
  Route.get('/', [ClientesController, 'index'])
  Route.get('/:id', [ClientesController, 'show'])
  Route.post('/', [ClientesController, 'store'])
  Route.put('/:id', [ClientesController, 'update'])
  Route.delete('/:id', [ClientesController, 'destroy'])
  Route.get('/precios', [ClientesController, 'listarConPrecios'])
}).prefix('/clientes')

/* ---------------------------
   🟨 Ruta Raíz
--------------------------- */
Route.get('/', async ({ response }) => {
  return response.redirect().toPath('/docs')
})

/* ---------------------------
    Ruta Productos
--------------------------- */
Route.group(() => {
  Route.get('/', [ProductosController, 'index'])
  Route.get('/:id', [ProductosController, 'show'])
  Route.post('/', [ProductosController, 'store'])
  Route.put('/:id', [ProductosController, 'update'])
  Route.delete('/:id', [ProductosController, 'destroy'])
}).prefix('/productos')

/* ---------------------------
    Ruta Facturas
--------------------------- */
Route.group(() => {
  Route.get('/', [FacturasController, 'index'])
  Route.get('/:id', [FacturasController, 'show'])
  Route.post('/', [FacturasController, 'store'])
  Route.delete('/:id', [FacturasController, 'destroy'])
}).prefix('/facturas')

/* ---------------------------
    Ruta Precios
--------------------------- */
Route.group(() => {
  Route.get('/', [PreciosController, 'listarPreciosCliente'])
  Route.post('/', [PreciosController, 'store'])
  Route.put('/:id', [PreciosController, 'update'])
  Route.delete('/:id', [PreciosController, 'destroy'])
}).prefix('/precios')
