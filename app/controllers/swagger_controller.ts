import { HttpContext } from '@adonisjs/core/http'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import swaggerUiDist from 'swagger-ui-dist'

export default class SwaggerController {
  public async ui({ response }: HttpContext) {
    const distPath = swaggerUiDist.getAbsoluteFSPath()

    // Cargar index.html
    let html = readFileSync(resolve(distPath, 'index.html'), 'utf8')

    // Reemplazar rutas relativas para que Swagger pueda acceder a los assets
    html = html.replace(/href="\.\/(.*?)"/g, 'href="/docs/swagger-ui-dist/$1"')
    html = html.replace(/src="\.\/(.*?)"/g, 'src="/docs/swagger-ui-dist/$1"')

    response.header('Content-Type', 'text/html')
    return html
  }

  public async assets({ request, response }: HttpContext) {
    const distPath = swaggerUiDist.getAbsoluteFSPath()
    const file = request.param('*')

    const filename = Array.isArray(file) ? file.join('/') : file
    let assetContent = readFileSync(resolve(distPath, filename), 'utf8')

    // SOLO si es swagger-initializer.js, reemplazamos la URL de Petstore
    if (filename === 'swagger-initializer.js') {
      assetContent = assetContent.replace(/url: "(.*?)"/, `url: "/docs/swagger.json"`)
    }

    // Si es .js o .css devolvemos texto, si es imagen, devolvemos binario
    if (filename.endsWith('.js')) {
      response.header('Content-Type', 'text/javascript')
      return assetContent
    }

    if (filename.endsWith('.css')) {
      response.header('Content-Type', 'text/css')
      return assetContent
    }

    // Archivos binarios (png, etc)
    return response.download(resolve(distPath, filename))
  }

  public json({ response }: HttpContext) {
    const schemaFile = resolve(process.cwd(), 'docs/swagger.json')
    return response.download(schemaFile)
  }
}
