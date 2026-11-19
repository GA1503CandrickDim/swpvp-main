





const MAX_MESSAGE_LENGTH = 2000;

const SYSTEM_PROMPT = `You are SAV BOT, the assistant on the SAVAGE WRAITH // CEEJAY VANIX app (ONEBLOOD).
Wallet (HESOYAM): Cash App $CeeWraith, Venmo @CJ-Dim, PayPal, Chime $Candrick-Dim, SoFi/Zelle. QR order: Cash App, Bitcoin, PayPal, Zelle.
Projects: GoldResidence with Samhel (09481541132), Myorigami with Boris, Chasing Cultures (not Cee's).
HIDEOUT playlists, click to unlock: GHOST, WSP, BOO.
Game: DON'T PAUSE THE TIME on the F.U.N tab.
Socials are on the BLOODNET tab.
When someone asks what this app is, answer in Cee's own words: it's just a side hustle he does for fun, he guesses. Keep it short, in his voice.
Talk like a helpful friend texting in chat, not like a formal bot: short, concrete, warm and direct. Use contractions and plain words. Never start with "Great question!" or "I'd be happy to help!" — just answer. One thing at a time, and if you do not know something, say so plainly instead of guessing. Never invent prices, links, or contact details.`;

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'POST only' });
    return;
  }
  const key = process.env.GROQ_API_KEY;
  if (!key) {
    res.status(503).json({ error: 'SAV BOT is not configured. Set GROQ_API_KEY and redeploy.' });
    return;
  }
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }
  if (!body || typeof body !== 'object') body = {};
  let message = '';
  if (typeof body.message === 'string') message = body.message.trim();
  if (!message && Array.isArray(body.messages)) {
    const users = body.messages.filter(m => m && m.role === 'user' && typeof m.content === 'string');
    if (users.length) message = users[users.length - 1].content.trim();
  }
  if (!message) {
    res.status(400).json({ error: 'A message is required.' });
    return;
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    res.status(400).json({ error: 'Message must be 2000 characters or fewer.' });
    return;
  }
  
  if (/what('s| is) this (site|website|page|app)/i.test(message)) {
    res.status(200).json({ reply: 'Just a side hustle I do for fun, I guess.' });
    return;
  }
  // Cee's own answer for "what is next" — SAV BOT turns it back as a question, fixed wording.
  if (/what('s| is) next/i.test(message)) {
    res.status(200).json({ reply: 'If u could achieve anything in life what would it be and when do u start? Or where do u start?' });
    return;
  }
  if (/why bother/i.test(message)) {
    res.status(200).json({ reply: 'If u could achieve anything in life what would it be and when do u start? Or where do u start?' });
    return;
  }
  try {
    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key },
      body: JSON.stringify({
        model: process.env.AGENT_MODEL || 'openai/gpt-oss-120b',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 300
      })
    });
    if (!r.ok) {
      let detail = '';
      try { detail = (await r.text()).slice(0, 200); } catch (e) {}
      res.status(502).json({ error: 'SAV BOT could not respond. Please try again shortly. (Groq ' + r.status + (detail ? ': ' + detail : '') + ')' });
      return;
    }
    const data = await r.json();
    const reply = data && data.choices && data.choices[0] && data.choices[0].message ? String(data.choices[0].message.content || '').trim() : '';
    if (!reply) {
      res.status(502).json({ error: 'SAV BOT could not respond. Please try again shortly.' });
      return;
    }
    res.status(200).json({ reply });
  } catch (e) {
    res.status(502).json({ error: 'Could not reach SAV BOT. Please try again shortly.' });
  }
};
