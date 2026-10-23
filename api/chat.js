export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { message } = req.body;

  const portfolioInfo = `
    Name: Ayush Kumar
    Education: JECRC UNIVERSITY, B.Tech, 2nd year
    Skills: Python, HTML, CSS, JavaScript, Git, GitHub, Cursor AI
    Projects:
      1. Python Programs Collection - Factorial, Fibonacci, Structure-to-Dictionary. Tech: Python.
      2. Messy Python Code Improvement - Improved messy Python code using AI. Tech: Python, AI.
      3. Bug Fixing Using Cursor AI - Found and fixed bugs using Cursor AI. Tech: Python, Cursor AI.
      4. Interactive Quiz Application - Quiz app with multiple choice questions. Tech: HTML, CSS, JavaScript. Live: https://quiz-6ensgl1b5-ayush-kr1.vercel.app/
      5. Book Reading List Application - Track books to read. Tech: HTML, CSS, JavaScript.
    GitHub: https://github.com/asharma22739-commits
  `;

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.API_KEY },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are a helpful assistant for this developer's portfolio. Answer ONLY using the portfolio information below. If the question is unrelated, politely say you can only answer about this portfolio.\n\nPortfolio Info:\n${portfolioInfo}\n\nUser question: ${message}`
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a response.";
    res.status(200).json({ reply });

  } catch (err) {
    res.status(500).json({ error: "Chat request failed" });
  }
}