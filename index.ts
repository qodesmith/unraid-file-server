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
      GET: async (req, _server) => {
        if (
          SECRET_HEADER &&
          HEADER_SECRET &&
          req.headers.get(SECRET_HEADER) === HEADER_SECRET
        ) {
          const {pathname} = new URL(req.url)

          // TODO - funnel IP info into the error handler when this throws
          new Response(Bun.file(pathname))
        }

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
    log.error(errorToObject(error))

    return new Response('Not found', {
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
      },
    })
  },
})

// biome-ignore lint/suspicious/noConsole: it's ok
console.log(`🚀 Server running at ${bunServer.url.href}`)
