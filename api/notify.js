function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, phone, condition, services, message } = req.body || {};

  if (!name || !phone) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const html = `
    <h2>위드케어 - 새 상담 신청이 접수되었습니다</h2>
    <p><strong>이름:</strong> ${escapeHtml(name)}</p>
    <p><strong>연락처:</strong> ${escapeHtml(phone)}</p>
    <p><strong>어르신 상태:</strong> ${escapeHtml(condition)}</p>
    <p><strong>희망 서비스:</strong> ${escapeHtml((services || []).join(', ') || '-')}</p>
    <p><strong>추가 문의:</strong> ${escapeHtml(message) || '-'}</p>
  `;

  try {
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: process.env.NOTIFY_EMAIL,
        subject: '[위드케어] 새 상담 신청이 접수되었습니다',
        html,
      }),
    });

    if (!resendRes.ok) {
      const errText = await resendRes.text();
      console.error('Resend error:', errText);
      return res.status(502).json({ error: 'Email send failed' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal error' });
  }
}
