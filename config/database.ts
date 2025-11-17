import { defineConfig } from '@adonisjs/lucid'
import env from '#start/env'

const dbConfig = defineConfig({
  connection: env.get('DB_CONNECTION')!,

  connections: {
    mysql: {
      client: 'mysql2',
      connection: {
        host: env.get('DB_HOST')!,
        port: Number(env.get('DB_PORT')!),
        user: env.get('DB_USER')!,
        password: env.get('DB_PASSWORD')!,
        database: env.get('DB_DATABASE')!,
      },

      migrations: {
        naturalSort: true,
      },
    },
  },
})

export default dbConfig
