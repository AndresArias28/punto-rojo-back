export default {
  enabled: true,
  mountPoint: '/docs',
  uiEnabled: true,
  uiIndex: 'swagger-ui/index.html',
  specEnabled: true,
  specFile: 'swagger.json',
  specFormat: 'json',
  options: {
    openapi: '3.0.0',
    info: {
      title: 'Punto Rojo API',
      version: '1.0.0',
      description: 'Documentación API del sistema de facturación',
    },
    servers: [
      {
        url: 'http://localhost:3333',
      },
    ],
  },
}

