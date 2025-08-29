/** biome-ignore-all lint/style/useNamingConvention: it's ok */

import {serve} from 'bun'
import process from 'node:process'

import {createLogger, errorToObject, invariant} from '@qodestack/utils'

const {PORT, SECRET_HEADER, HEADER_SECRET} = process.env
const log = createLogger({timeZone: 'America/New_York'})

invariant(PORT, '`PORT` env variable not defined')
invariant(SECRET_HEADER, '`SECRET_HEADER` env variable not defined')
invariant(HEADER_SECRET, '`HEADER_SECRET` env variable not defined')

const bunServer = serve({
  routes: {
    '/files/*': {
      GET: async (req, server) => {
        const {pathname} = new URL(req.url)

        if (
          SECRET_HEADER &&
          HEADER_SECRET &&
          req.headers.get(SECRET_HEADER) === HEADER_SECRET
        ) {
          return new Response(Bun.file(pathname))
        }

        log.error({
          message: 'Missing or bad header data',
          pathname,
          ip: server.requestIP(req),
          headers: req.headers,
        })

        return new Response('-_-', {
          status: 400,
          headers: {
            'Content-Type': 'text/plain',
          },
        })
      },
    },
  },
  port: PORT,
  development: false,
  error: error => {
    if (error.code === 'ENOENT') {
      return new Response('Not found', {
        status: 404,
        headers: {
          'Content-Type': 'text/plain',
        },
      })
    }

    log.error(errorToObject(error))

    return new Response(null, {status: 500})
  },
})

// biome-ignore lint/suspicious/noConsole: it's ok
console.log(`🚀 Server running at ${bunServer.url.href}`)
