import { Hono } from 'hono'

const API_KEY = 'ckey_0249960de588ad8ac09ba52094f6'
const REFERRER = 'https://localhost/'

const app = new Hono()

async function makeSpamFilterRequest(
  body: {
    email?: string,
    fields?: Record<string, string>,
    ipAddress?: string 
  }
) {
  const resp = await fetch(`https://eu.altcha.org/api/v1/classify?apiKey=${API_KEY}`, {
    body: JSON.stringify(body),
    headers: {
      'content-type': 'application/json',
      'referer': REFERRER
    },
    method: 'POST',
  })
  if (resp.status !== 200) {
    throw new Error('Unexpected server response')
  }
  return resp.json()
}

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.post('/submit', async (c) => {
  const ipAddress = c.req.header('x-forwarded-for')?.split(',')[0]
  const body = await c.req.parseBody()

  const { classification } = await makeSpamFilterRequest({
    email: String(body.email),
    fields: {
      name: String(body.name),
      message: String(body.message),
    },
    ipAddress,
  })

  if (classification === 'BAD') {
    return c.json({
      error: 'Cannot submit spam.',
      success: false,
    }, 400)
  } else {
    // Process the data, send to email, etc.
  }

  return c.json({
    success: true,
  })
})

export default app
