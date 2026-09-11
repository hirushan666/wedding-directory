// requires node 18+ (fetch builtin)
// requires: npm install dotenv
// load backend/.env when running from backend/test
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const endpoint = process.env.GROQ_RECOMMENDER_ENDPOINT || 'https://api.groq.com/openai/v1/chat/completions';
const key = process.env.GROQ_API_KEY;
const model = process.env.GROQ_RECOMMENDER_MODEL || 'openai/gpt-oss-20b';

(async () => {
  if (!key) { console.error('GROQ_API_KEY not set'); process.exit(1); }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: 'Test' }],
        max_tokens: 5,
      }),
      signal: controller.signal,
    });
    console.log('status', res.status);
    console.log(await res.text());
  } catch (err) {
    if (err && err.name === 'AbortError') {
      console.error('Request timed out after 20s');
    } else {
      console.error('Request failed:');
      // Print stack if available, otherwise the error object
      if (err && err.stack) console.error(err.stack);
      else console.error(err);

      // Attempt to stringify all error properties for extra diagnostics
      try {
        console.error('Error details:', JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
      } catch (e) {
        // ignore stringify errors
      }
    }
  } finally {
    clearTimeout(timeoutId);
  }
})();