/** biome-ignore-all lint/style/useNamingConvention: it's ok */

import {serve} from 'bun'
import {readdirSync} from 'node:fs'
import process from 'node:process'

import {createLogger, errorToObject, invariant} from '@qodestack/utils'
import {Hono} from 'hono'
import {getConnInfo} from 'hono/bun'

const {SECRET_HEADER, HEADER_SECRET} = process.env
const log = createLogger({timeZone: 'America/New_York'})

invariant(SECRET_HEADER, '`SECRET_HEADER` env variable not defined')
invariant(HEADER_SECRET, '`HEADER_SECRET` env variable not defined')

const honoServer = new Hono()
  .get('/', c => {
    const styles = {
      color: 'white',
      background: 'black',
      display: 'grid',
      'place-items': 'center',
      'font-family': 'monospace',
      'font-size': '2em',
      'text-align': 'center',
    }

    const style = Object.entries(styles).reduce((acc, [key, value]) => {
      return `${acc}${key}:${value};`
    }, '')

    return c.html(
      `<body style="${style}"><div><div>Unraid File Server</div><div>-_-</div></div></body>`
    )
  })
  .use(async (c, next) => {
    const headerSecret = c.req.header(SECRET_HEADER)
    const {pathname} = new URL(c.req.url)

    if (headerSecret && headerSecret === HEADER_SECRET) {
      await next()
    } else {
      log.error({
        message: 'Missing or bad header data',
        pathname,
        ipInfo: getConnInfo(c),
        headers: c.req.raw.headers,
      })

      return c.json({nope: true})
    }
  })
  .get('/list', c => {
    const listPath = c.req.query('path')

    if (!listPath) {
      return c.json({'/list': readdirSync('/files')})
    }

    try {
      const list = readdirSync(listPath)
      return c.json({[listPath]: list})
    } catch (e) {
      return c.json({error: errorToObject(e), listPath})
    }
  })
  .get('/files/*', c => {
    const {pathname} = new URL(c.req.url)

    try {
      return new Response(Bun.file(pathname))
    } catch (e) {
      return c.json({pathname, error: errorToObject(e)})
    }
  })

const bunServer = serve({
  fetch: honoServer.fetch,
  port: 2500,
  development: false,
  error: error => {
    log.error('BUN SERVER ERROR', errorToObject(error))
    return Response.json({}, 500)
  },
})

// biome-ignore lint/suspicious/noConsole: it's ok
console.log(`🚀 Server running at ${bunServer.url.href}`)
