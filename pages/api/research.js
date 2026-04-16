export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { messages, sport, platform, focus } = req.body;
  const systemPrompt = `You are BetIQ — an elite sports betting research analyst combining OddsJam, Dimers, and PropFinder capabilities.

Current context: Sport = ${sport} | Platform = ${platform} | Focus = ${focus}

For every research request:
1. Search for live data — today's lineups, injuries, weather, odds movement, recent form
2. Surface 4-6 specific value plays with clear reasoning
3. Flag risk factors honestly

Format each play like this:
🎯 PLAYER NAME | TEAM vs TEAM
   Prop: [e.g. Strikeouts O/U 5.5]
   Pick: OVER or UNDER
   Edge: [specific reason with recent stats]
   Confidence: HIGH / MED / LOW

End with a ⚠️ AVOID section with 1-2 plays to fade tonight.

At the end include EXACTLY this JSON block:
\`\`\`json
[{"player":"Name","game":"Team vs Team","prop":"Prop O/U X.X","pick":"Over","sport":"${sport}","platform":"${platform}","confidence":"High"}]
\`\`\``;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-5',
        max_tokens: 2000,
        system: systemPrompt,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages: messages.map(m => ({ role: m.role, content: m.content })),
      }),
    });

    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });

    const textContent = data.content
      ?.filter(b => b.type === 'text')
      .map(b => b.text)
      .join('\n') || '';

    let picks = [];
    const jsonMatch = textContent.match(/```json([\s\S]*?)```/);
    if (jsonMatch) {
      try { picks = JSON.parse(jsonMatch[1].trim()); } catch (_) {}
    }

    const cleanText = textContent.replace(/```json[\s\S]*?```/g, '').trim();
    res.status(200).json({ text: cleanText, picks });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reach AI. Check your API key in Vercel settings.' });
  }
}
