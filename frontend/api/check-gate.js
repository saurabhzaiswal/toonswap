export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      authenticated: false,
    })
  }

  const cookies = req.headers.cookie || ''

  const authenticated = cookies
    .split(';')
    .map(cookie => cookie.trim())
    .some(cookie => cookie === 'toon_gate=authenticated')

  if (!authenticated) {
    return res.status(401).json({
      authenticated: false,
    })
  }

  return res.status(200).json({
    authenticated: true,
  })
}