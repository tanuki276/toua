export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { name, email, message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'メッセージは必須です。' });
  }
  if (message.length > 100) {
    return res.status(400).json({ error: 'メッセージは100文字以内でお願いします。' });
  }

  const urlPattern = /(https?:\/\/)/i;
  if (urlPattern.test(message) || (name && urlPattern.test(name)) || (email && urlPattern.test(email))) {
    return res.status(400).json({ error: 'URLの入力は禁止されています。' });
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: '正しいメールアドレスを入力してください。' });
  }

  const webhookURL = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookURL) {
    return res.status(500).json({ error: 'Webhook URLが設定されていません。' });
  }

  try {
    await fetch(webhookURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: `**お問い合わせがありました**\n名前: ${name || 'なし'}\nメール: ${email || 'なし'}\n内容: ${message}`
      }),
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: '送信に失敗しました。' });
  }
}
