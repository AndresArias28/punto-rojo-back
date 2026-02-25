# Punto Rojo Backend API

Backend del sistema **Punto Rojo** para una app móvil en **Flutter/Dart**. Este repositorio expone una API REST para gestionar clientes, productos, facturación y precios especiales por cliente.

> ⚠️ Nota importante: este proyecto es el **backend** (Node.js + AdonisJS). La app Flutter consume estos endpoints.

---

## Stack y tecnologías

- **Node.js + TypeScript**
- **AdonisJS v6** (Core, Lucid ORM, CORS)
- **VineJS** para validaciones
- **Swagger/OpenAPI** para documentación
- **PostgreSQL** (configurado en `.env.example`)
- Dependencias de driver disponibles para **Postgres (`pg`)** y **MySQL (`mysql2`)**

---

## Estructura funcional implementada

### 1) Clientes

Implementado:
- Listado de clientes activos con:
  - paginación (`page`, `limit`)
  - búsqueda por `nombre` o `documento` (`search`)
- Obtener cliente por ID con relaciones (`facturas`, `preciosEspeciales` + `producto`)
- Crear cliente
- Actualizar cliente
- "Eliminar" cliente por **desactivación lógica** (`estado = false`)
- Endpoint para listar clientes con sus precios especiales

### 2) Productos

Implementado:
- Listado de productos activos con:
  - paginación (`page`, `limit`)
  - búsqueda por `nombre` o `codigo` (`search`)
- Obtener producto por ID
- Crear producto
- Actualizar producto
- "Eliminar" producto por **desactivación lógica** (`estado = false`)

### 3) Precios especiales por cliente

Implementado:
- Crear/actualizar precio especial por combinación `cliente + producto` (upsert)
- Listar precios especiales por cliente
- Actualizar precio especial por ID
- Desactivar precio especial por ID
- Lógica de precio especial centralizada en servicio (`PrecioService`)

### 4) Facturación

Implementado:
- Crear factura con:
  - generación automática de número (`FAC-00001`, `FAC-00002`, ...)
  - detalle de ítems
  - cálculo de subtotal, IVA (19%) y total
  - descuento por ítem
  - actualización automática de stock
  - manejo transaccional (rollback si falla)
- Listado de facturas con filtros:
  - `idCliente`
  - `estado`
  - rango de fechas (`fechaDesde`, `fechaHasta`)
  - paginación (`page`, `limit`)
- Obtener factura por ID con cliente y detalles
- Anular factura:
  - cambio de estado a `anulada`
  - reposición de stock
  - manejo transaccional
- Método de impresión (`imprimir`) implementado en controlador (formatea respuesta)

---

## Modelo de datos (entidades)

Entidades principales definidas en modelos Lucid:

- `Cliente`
- `Producto`
- `Factura`
- `DetalleFactura`
- `PrecioPorCliente`

Relaciones implementadas:
- Cliente 1:N Facturas
- Cliente 1:N Precios especiales
- Producto 1:N Detalles de factura
- Producto 1:N Precios especiales
- Factura 1:N Detalles
- Detalle N:1 Factura
- Detalle N:1 Producto

---

## Validaciones implementadas

Con VineJS:

- `cliente` (create/update)
- `producto` (create/update)
- `factura` (create)
- `precio_por_cliente` (create/update)

Esto garantiza payloads válidos antes de ejecutar lógica de negocio.

---

## Endpoints disponibles

### Base

- `GET /` → redirige a `/docs`

### Clientes (`/clientes`)

- `GET /clientes`
- `GET /clientes/:id`
- `POST /clientes`
- `PUT /clientes/:id`
- `DELETE /clientes/:id`
- `GET /clientes/productos` (lista clientes con precios)

### Productos (`/productos`)

- `GET /productos`
- `GET /productos/:id`
- `POST /productos`
- `PUT /productos/:id`
- `DELETE /productos/:id`

### Facturas (`/facturas`)

- `GET /facturas`
- `GET /facturas/:id`
- `POST /facturas`
- `DELETE /facturas/:id` (anular)

### Precios (`/precios`)

- `GET /precios` (en código espera `idCliente` por params para listar por cliente)
- `POST /precios/cliente-precio` (upsert)
- `PUT /precios/:id`
- `DELETE /precios/:id`

---

## Documentación API

Disponible Swagger/OpenAPI en:

- **UI**: `http://localhost:3333/docs`
- Especificación en repo: `docs/swagger.json`

---

## Configuración del entorno

Crear archivo `.env` tomando como base `.env.example`:

```env
TZ=UTC
PORT=3333
HOST=localhost
LOG_LEVEL=info
APP_KEY=
NODE_ENV=development
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=root
DB_PASSWORD=root
DB_DATABASE=app
```

> Importante: `APP_KEY` es obligatorio para iniciar AdonisJS.

---

## Scripts del proyecto

- `npm run dev` → desarrollo con hot reload
- `npm run build` → build de producción
- `npm start` → correr build (`bin/server.js`)
- `npm run test` → ejecutar tests (Japa)
- `npm run lint` → lint con ESLint
- `npm run format` → formatear con Prettier
- `npm run typecheck` → validación TypeScript

---

## Cómo levantar el backend local

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Configurar variables en `.env`
3. Levantar en modo desarrollo:
   ```bash
   npm run dev
   ```
4. Abrir Swagger:
   ```
   http://localhost:3333/docs
   ```

---

## Estado actual del proyecto

### Ya implementado

- API base organizada por módulos (clientes, productos, facturas, precios)
- Validaciones de entrada
- Soft delete para clientes/productos/precios
- Facturación con transacciones y actualización de stock
- Filtros y búsquedas principales
- Documentación Swagger
- Middleware para forzar respuesta JSON y CORS habilitado

### Observaciones técnicas

- Hay diferencias entre algunos nombres del `swagger.json` y los payloads reales de validadores/modelos (por ejemplo snake_case vs camelCase en algunos campos).
- No se observan migraciones en este repositorio, por lo que la estructura de tablas debe existir previamente en la base de datos.
- Existe método `imprimir` en `FacturasController`, pero actualmente no está expuesto en rutas.

---

## Relación con tu app móvil Flutter

Para tu app en Flutter/Dart, este backend ya cubre:
- Gestión de catálogo (clientes y productos)
- Reglas de precio especial por cliente
- Flujo de facturación con impacto en inventario
- Consulta histórica de facturas

Recomendación para integración Flutter:
- Centralizar `baseUrl` y cliente HTTP (Dio/http)
- Modelos Dart alineados con los payloads reales del backend
- Manejo de errores leyendo `message` y `error` en respuestas 4xx

---

## Próximos pasos sugeridos

- Agregar migraciones y seeders versionados
- Alinear 100% Swagger con contratos reales de validación
- Añadir autenticación/autorización (si aplica)
- Incorporar pruebas automatizadas de servicios/controladores
- Exponer ruta de impresión (`GET /facturas/:id/imprimir`) si será usada por Flutter

