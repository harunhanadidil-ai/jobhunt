exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { cvData, jobDesc } = JSON.parse(event.body);

  if (!cvData || !jobDesc) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing CV or job description' }) };
  }

  const prompt = `You are a professional CV writer with 15 years of experience helping candidates land jobs at top companies. Your task is to tailor the candidate's CV specifically for the job below.

RULES FOR THE TAILORED CV:
- Keep ALL of the candidate's real experience, education, and skills — do not invent anything
- Rewrite bullet points using the EXACT keywords and language from the job description
- Reorder sections and bullet points so the most relevant experience appears first
- Quantify achievements wherever possible (e.g. "increased sales by 30%")
- Remove or minimise anything irrelevant to this specific role
- Match the seniority level and tone of the job description
- Output the full CV — do not truncate or summarise

RULES FOR THE COVER LETTER:
- 3 paragraphs: why this role, why this candidate, call to action
- Sound like a confident human professional, NOT like AI
- Reference specific details from both the CV and job description
- No clichés like "I am writing to apply" or "I would be a great fit"

Format your response EXACTLY like this with nothing before or after:
===TAILORED CV===
[full tailored cv here]
===COVER LETTER===
[cover letter here]

CANDIDATE CV:
${cvData}

JOB DESCRIPTION:
${jobDesc}`;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 8000
    })
  });

  const data = await response.json();

  if (data.error) {
    return { statusCode: 500, body: JSON.stringify({ error: data.error.message }) };
  }

  const text = data.choices?.[0]?.message?.content || '';
  const parts = text.split(/===TAILORED CV===|===COVER LETTER===/);
  const tailoredCV = parts[1]?.trim() || text;
  const tailoredCover = parts[2]?.trim() || '';

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tailoredCV, tailoredCover })
  };
};
