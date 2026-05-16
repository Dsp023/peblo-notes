const NVIDIA_API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';

async function generateAiInsights(content) {
  if (!process.env.NVIDIA_NIM_API_KEY) {
    throw new Error('NVIDIA_NIM_API_KEY is not configured.');
  }

  const prompt = `
    Analyze the following note content and provide:
    1. A short summary (2-3 sentences).
    2. A list of action items extracted from the text.
    3. A suggested title for the note.

    Format the output strictly as JSON with this structure:
    {
      "summary": "...",
      "actionItems": ["...", "..."],
      "suggestedTitle": "..."
    }

    Note content:
    """
    ${content}
    """
  `;

  try {
    const response = await fetch(NVIDIA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NVIDIA_NIM_API_KEY}`
      },
      body: JSON.stringify({
        model: "meta/llama-3.3-70b-instruct", 
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
        top_p: 0.7,
        max_tokens: 1024,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`NVIDIA API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const resultContent = data.choices[0].message.content;
    
    return JSON.parse(resultContent);
  } catch (error) {
    console.error('Error generating AI insights:', error);
    throw error;
  }
}

module.exports = { generateAiInsights };
