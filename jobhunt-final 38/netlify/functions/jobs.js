exports.handler = async (event) => {
  const q = event.queryStringParameters?.q || 'developer';
  const appId = process.env.ADZUNA_APP_ID;
  const apiKey = process.env.ADZUNA_API_KEY;

  if (!appId || !apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Adzuna credentials not configured' }) };
  }

  try {
    const url = `https://api.adzuna.com/v1/api/jobs/gb/search/1?app_id=${appId}&app_key=${apiKey}&results_per_page=12&what=${encodeURIComponent(q)}&content-type=application/json`;
    const res = await fetch(url);
    const data = await res.json();
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ results: data.results || [] })
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
