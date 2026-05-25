# Roshan Zameer Sayyad — Personal Portfolio

> A personal portfolio website featuring an AI assistant powered by Claude. Built with vanilla HTML, CSS, and JavaScript — no frameworks, no build step.

🌐 **Live site:** [rzsayyad.github.io](https://rzsayyad.github.io)

---

## ✨ Features

- 🎨 Hand-coded responsive design with a warm dark aesthetic
- 🤖 **AI chat assistant** powered by Anthropic's Claude API
- 📱 Interactive timeline showcasing key milestones
- 🎯 Custom CSS visualizations for each project (no static screenshots)
- ⚡ Zero JavaScript frameworks — fast initial load
- 🔒 Server-side API key handling via Vercel serverless functions

---

## 📁 Project Structure

```
.
├── index.html              ← Main HTML (markup only)
├── css/
│   ├── base.css            ← Design tokens, resets, typography
│   ├── layout.css          ← Nav, sections, hero, footer
│   ├── components.css      ← Cards, buttons, project mockups
│   └── chatbot.css         ← AI chat widget styles
├── js/
│   ├── main.js             ← Page interactivity (timeline, animations)
│   └── chatbot.js          ← Chat widget logic + API integration
├── api/
│   └── chat.js             ← Vercel serverless function (Claude API)
├── assets/
│   └── photo.jpg           ← Profile photo
├── vercel.json             ← Vercel deployment config
├── package.json            ← Project metadata
├── .gitignore              ← Git exclusions
├── .env.example            ← Environment variable template
└── README.md               ← This file
```

---

## 🚀 Local Development

This is a fully static site with one serverless function. You can run it two ways:

### Option 1: View the static site only (no chatbot)

Just open `index.html` in your browser. Everything except the AI chatbot will work.

### Option 2: Run the full project with chatbot (using Vercel CLI)

1. **Install the Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` and add your Anthropic API key. Get one at [console.anthropic.com](https://console.anthropic.com).

3. **Run the dev server:**
   ```bash
   vercel dev
   ```
   Visit `http://localhost:3000`.

---

## 🌐 Deployment (Vercel)

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com), import the repo
3. In the project settings → Environment Variables, add:
   - **Key:** `ANTHROPIC_API_KEY`
   - **Value:** Your Anthropic API key
4. Click **Deploy**

The site will be live in under a minute.

---

## 🤖 How the AI Chatbot Works

```
┌─────────────────┐     POST /api/chat      ┌─────────────────┐
│  Browser        │ ──────────────────────► │  Vercel         │
│  (chatbot.js)   │                         │  Serverless     │
└─────────────────┘                         │  Function       │
        ▲                                   │  (api/chat.js)  │
        │                                   └────────┬────────┘
        │ reply JSON                                 │
        │                                            │ API call w/
        │                                            │ system prompt
        └────────────────────────────────────────────┤
                                                     ▼
                                            ┌─────────────────┐
                                            │  Claude API     │
                                            │  (Anthropic)    │
                                            └─────────────────┘
```

The API key never leaves the server. The browser only knows about `/api/chat`.

---

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3 (custom properties, grid, flexbox), Vanilla JavaScript (ES6+)
- **Backend:** Vercel Serverless Functions (Node.js 18)
- **AI:** Anthropic Claude API (`claude-haiku-4-5`)
- **Hosting:** Vercel (free tier)
- **Fonts:** Inter Tight, JetBrains Mono, Instrument Serif (via Google Fonts)

---

## 📬 Contact

- 📧 [roshan.sayyad@gmail.com](mailto:roshan.sayyad@gmail.com)
- 💼 [LinkedIn](https://linkedin.com/in/roshan-zameer-sayyad)
- 🐙 [GitHub](https://github.com/RZSayyad)

---

## 📄 License

MIT — feel free to use this as a reference for your own portfolio.
