export async function POST(request) {
  try {
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)
    const { to, subject, html } = await request.json()

    if (!to || !subject || !html) {
      return Response.json({ error: 'Missing fields' }, { status: 400 })
    }

    const { data, error } = await resend.emails.send({
      from: 'OACIntel <intel@oacintel.com>',
      to,
      subject,
      html,
    })

    if (error) {
      return Response.json({ error }, { status: 500 })
    }

    return Response.json({ success: true, data })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
