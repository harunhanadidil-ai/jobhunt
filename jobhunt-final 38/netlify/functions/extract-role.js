exports.handler = async (event) => {
  const { cvData } = JSON.parse(event.body || '{}');
  if (!cvData) return { statusCode: 400, body: JSON.stringify({ error: 'No CV data' }) };

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{
          role: 'user',
          content: `Based on this CV, what is the most suitable job title to search for? Reply with ONLY the job title, nothing else, no punctuation, no explanation. Keep it short e.g. "Data Analyst" or "Software Engineer".\n\nCV:\n${cvData.substring(0, 2000)}`
        }],
        max_tokens: 20,
        temperature: 0.3
      })
    });
    const data = await res.json();
    const role = data.choices?.[0]?.message?.content?.trim() || 'developer';
    return { statusCode: 200, body: JSON.stringify({ role }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
