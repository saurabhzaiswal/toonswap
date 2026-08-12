function getCookieOptions() {
  return [
    'Path=/',
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
    'Max-Age=86400',
  ].join('; ')
}

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    })
  }

  const { password } = req.body || {}

  if (!password) {
    return res.status(400).json({
      success: false,
      message: 'Password is required',
    })
  }

  const correctPassword = process.env.GATE_PASSWORD

  if (!correctPassword) {
    console.error('GATE_PASSWORD is not configured')

    return res.status(500).json({
      success: false,
      message: 'Server configuration error',
    })
  }

  if (password !== correctPassword) {
    return res.status(401).json({
      success: false,
      message: 'Wrong password, try again',
    })
  }

  res.setHeader(
    'Set-Cookie',
    `toon_gate=authenticated; ${getCookieOptions()}`
  )

  return res.status(200).json({
    success: true,
  })
}