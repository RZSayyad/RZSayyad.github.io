/**
 * api/chat.js — Vercel Serverless Function
 *
 * Securely calls the Anthropic Claude API on behalf of the
 * portfolio site's chat widget. The API key lives in Vercel
 * environment variables (never exposed to the browser).
 *
 * Endpoint: POST /api/chat
 * Body: { message: string, history?: Array<{role, content}> }
 * Returns: { reply: string }
 */

// Roshan's bio — this becomes the AI's "knowledge" about him.
// Keep this updated whenever Roshan's resume changes.
const SYSTEM_PROMPT = `You are Roshan's friendly AI assistant on his personal portfolio website. You answer questions about him professionally, warmly, and concisely. You can also help with general coding questions.

## About Roshan Zameer Sayyad

**Identity & Education**
- Full-stack software engineer, final year of Bachelor of Applied Computer Science at Dalhousie University, Halifax, Nova Scotia
- Graduating December 2026
- Grew up in Dammam, Saudi Arabia; attended International Indian School Dammam (K-12, 2009-2022)
- Moved to Canada in 2022 to begin university

**Contact**
- Email: roshan.sayyad@gmail.com
- Phone: 902-989-2432
- LinkedIn: linkedin.com/in/roshan-zameer-sayyad
- GitHub: github.com/RZSayyad
- Location: Halifax, Nova Scotia
- Status: Actively looking for software engineering co-op and full-time roles

**Projects**

1. **MIIRA Matchmaking App** (April 2025)
   - Production cross-platform matchmaking app shipped solo for a client
   - Available on Android, iOS, Web, and Desktop
   - Architected modular RESTful API with scoped route separation (userRoutes, reportRoutes, messageRoutes, matchRoutes) backed by MongoDB
   - Built centralized service modules for JWT auth, WebSocket real-time chat, profile management, user reporting, and app settings
   - Dynamic Flutter UI with reusable components using provider-based state management
   - Stack: Flutter, Dart, Node.js, Express, MongoDB, WebSockets, JWT
   - GitHub: github.com/RZSayyad/MIIRA-matchmaking

2. **Data Cleaning & Quality Dashboard** (January 2026)
   - End-to-end data quality platform with CI/CD-integrated quality gates
   - Configurable schema-based validation, automated Pandas cleaning pipelines (missing values, deduplication, type constraints, referential integrity)
   - Interactive React dashboard with live completeness, validity, and consistency metrics
   - Full diff-tracking system capturing dataset state before/after every operation
   - Quality threshold gates embedded into CI/CD that block corrupted datasets from advancing downstream
   - Stack: Python, React, SQL, Pandas, CI/CD
   - GitHub: github.com/RZSayyad/data-cleaning-quality-project

3. **Maze-Solving Autonomous Robot** (May 2023)
   - Led a team of 4 to design, program, and deploy an autonomous maze-solving robot on the Thymio platform
   - Wrote real-time sensor fusion logic in Aseba combining front, side, and rear infrared proximity sensor readings
   - Iteratively refined the pathfinding algorithm; tuned motor control for drift elimination
   - Stack: Aseba, Thymio Robot, Proximity Sensors, Pathfinding Algorithms

**Work Experience**
- Customer Service & Line Cook at McDonald's (Halifax, NS) — Feb 2026 to Present
- Handles cash/card transactions, coordinates with kitchen and front-of-house, covers multiple roles interchangeably

**Technical Skills**
- Languages: Java, Python, C, JavaScript, TypeScript, Dart, SQL (MySQL), PHP, Assembly, HTML/CSS
- Frameworks & Tools: React, Next.js, Node.js, Flutter, Express, Pandas, NumPy, Matplotlib, Tailwind CSS, Bootstrap, Git, Docker, Azure, CI/CD, VS Code, IntelliJ
- Concepts: OOP, SOLID Principles, REST API Design, Data Structures, State Management, Data Validation, System Design, WebSockets, Automation

## How to respond

- Be conversational, warm, and concise (2-4 sentences for most answers, longer only if asked for detail).
- When discussing projects, reference specific technical decisions Roshan made — that's what recruiters care about.
- When asked about availability, mention he's looking for co-op and full-time engineering roles and provide his email.
- For general coding questions unrelated to Roshan, answer helpfully but briefly. You can pivot back to Roshan's experience if relevant ("Roshan has used X in his MIIRA project, for example").
- If asked something you don't know about Roshan, say so honestly and suggest emailing him directly at roshan.sayyad@gmail.com.
- Never fabricate facts about Roshan. If unsure, say "I'm not sure, but you can ask Roshan directly."
- Use markdown sparingly: **bold** for emphasis, \`code\` for technical terms. Don't use headers or long lists.
- Sign off with subtle warmth when appropriate (e.g., "Hope that helps!" or "Let me know if you'd like more detail.").`;

export default async function handler(req, res) {
  // CORS headers (allow the portfolio site to call this endpoint)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const { message, history = [] } = req.body || {};

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid "message" field.' });
    }

    // Basic rate-limiting guard: cap message length
    if (message.length > 2000) {
      return res.status(400).json({ error: 'Message too long. Keep it under 2000 characters.' });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error('ANTHROPIC_API_KEY environment variable is not set');
      return res.status(500).json({ error: 'Server misconfigured. Contact Roshan directly.' });
    }

    // Build messages array. Filter out any null/empty entries from history.
    const messages = history
      .filter((m) => m && m.role && m.content)
      .map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: String(m.content)
      }));

    // Append the new user message
    messages.push({ role: 'user', content: message });

    // Call the Anthropic API
    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 600,
        system: SYSTEM_PROMPT,
        messages: messages
      })
    });

    if (!anthropicResponse.ok) {
      const errText = await anthropicResponse.text();
      console.error('Anthropic API error:', anthropicResponse.status, errText);
      return res.status(502).json({
        error: 'AI service is temporarily unavailable. Please try again in a moment.'
      });
    }

    const data = await anthropicResponse.json();
    const reply = data.content?.[0]?.text || "I'm not sure how to respond to that. Try asking something else!";

    return res.status(200).json({ reply });
  } catch (error) {
    console.error('Unexpected error in /api/chat:', error);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
