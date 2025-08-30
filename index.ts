import {serve} from 'bun'
import {readdirSync} from 'node:fs'

import {createLogger, errorToObject} from '@qodestack/utils'
import {Hono} from 'hono'

const log = createLogger({timeZone: 'America/New_York'})

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

log.success(`🚀 Server running at ${bunServer.url.href}`)
