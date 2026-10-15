# 📜 SKRULLA! — AI Study & Social Scroll Feed

<p align="center">
  <img src="public/favicon.svg" alt="SKRULLA! Logo" width="90" height="90" />
</p>

<p align="center">
  <strong>Transform dry study notes into an addictive, high-retention social media feed powered by Google Gemini AI.</strong>
</p>

<p align="center">
  <a href="#-key-features"><img src="https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=white" alt="Vite" /></a>
  <a href="#-key-features"><img src="https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black" alt="React" /></a>
  <a href="#-key-features"><img src="https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwind-css&logoColor=white" alt="Tailwind CSS" /></a>
  <a href="#-key-features"><img src="https://img.shields.io/badge/Google%20Gemini-2.5--Flash-4285F4?logo=google&logoColor=white" alt="Google Gemini" /></a>
  <a href="#-key-features"><img src="https://img.shields.io/badge/Firebase-v11-FFCA28?logo=firebase&logoColor=black" alt="Firebase" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License: MIT" /></a>
</p>

---

## ⚡ What is SKRULLA!?

Most students struggle with passive reading and dense textbook pages. **SKRULLA!** flips the script by turning uploaded lecture slides, notes, and PDFs into an engaging, infinite-scroll social media experience. 

Using **Google Gemini AI**, SKRULLA! parses complex academic concepts and delivers them through 5 distinct AI personas with varying pedagogical styles—ranging from chaotic relatable humor to deep step-by-step thread breakdowns and interactive recall polls.

---

## ✨ Key Features

- **🎭 5 Distinct Pedagogical Personas:**
  - `💀 @brainrot_scholar`: Hilarious, relatable student analogies and chaotic memes.
  - `🧵 @deepdive_dan`: Structured, step-by-step numbered breakdown threads.
  - `🍿 @aita_academics`: Dramatic storytelling, systemic conflicts, and memorable framing.
  - `🔥 @hot_take_prof`: Devil's advocate, edge cases, and academic nuances.
  - `🎯 @pop_quiz_bot`: Interactive 4-option active recall polls with instant explanations.

- **🛡️ Hallucination Shield:**
  - Every AI post is backed by a verbatim source citation extracted directly from your study material. One click displays the exact quote to guarantee 100% academic accuracy.

- **🔁 Adaptive Spaced Repetition Remediation:**
  - Flagging a post with **"🤔 Confused"** automatically prompts Gemini AI to generate customized remediation posts that break down the specific concept from simpler angles.

- **⚡ Automatic On-Login Live API Ping:**
  - Instantly verifies Gemini API connectivity upon login, displaying real-time latency telemetry and dynamically refreshing your personal feed.

- **📂 Multi-Format Ingestion:**
  - Upload PDF slide decks, text documents (`.txt`, `.md`), or image notes (`.png`, `.jpg`) up to 10MB, or paste lecture notes directly.

- **🎨 Dual-Palette Material Design System:**
  - **OLED Dark Mode**: Deep void canvas (`#070709`) with hand-drawn golden accents (`#ECC72E`) and subtle perspective grids.
  - **Botanical Editorial Light Mode**: Warm parchment paper background (`#FBF8F3`) with antique bronze typography (`#5C4912`).
  - Built-in **Material Theme Studio** to inspect hex tokens and brand styles.

- **☁️ Hybrid Cloud + Local Storage:**
  - Operates 100% offline via browser `localStorage` out-of-the-box.
  - Seamlessly upgrades to Cloud Firestore sync and Firebase Auth if credentials are provided in `.env`.

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** v18+ (tested on Node v20 & v24)
- **npm** or **pnpm** or **yarn**
- A **Google Gemini API Key** ([Get free key from Google AI Studio](https://aistudio.google.com/))

### 2. Clone the Repository
```bash
git clone https://github.com/your-username/skrulla.git
cd skrulla
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Copy the `.env.example` template to `.env`:
```bash
cp .env.example .env
```
Open `.env` and set your Google Gemini API Key:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```
*(Optional: You can also enter or update your API key directly inside the app UI under the ⚙️ Settings modal).*

### 5. Launch the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Environment Variables Reference

| Variable | Required? | Default | Description |
| :--- | :---: | :---: | :--- |
| `VITE_GEMINI_API_KEY` | **Recommended** | `""` | Google Gemini API key for live feed generation and persona chat. |
| `VITE_GEMINI_MODEL` | Optional | `gemini-flash-latest` | Gemini model variant to utilize (e.g. `gemini-flash-latest`, `gemini-3.5-flash`). |
| `VITE_APP_ID` | Optional | `skrulla-study-app` | Namespace key for Firestore collections. |
| `VITE_CUSTOM_LOGO_URL`| Optional | `""` | Image URL to override the default SVG logo. |
| `VITE_FIREBASE_CONFIG` | Optional | `""` | JSON string of Firebase project configuration for multi-device cloud sync. |

---

## 📦 Project Structure

```
skrulla/
├── .github/
│   └── workflows/
│       └── ci.yml            # Automated GitHub Actions build workflow
├── public/
│   └── favicon.svg           # SKRULLA! golden scroll & mortarboard favicon
├── src/
│   ├── App.jsx               # Main React application & persona feed logic
│   ├── main.jsx              # React DOM mounting entry point
│   └── index.css             # Tailwind CSS directives & scroll utilities
├── .env.example              # Environment variables template
├── .gitignore                # Production git ignore definitions
├── index.html                # HTML entry point with metadata & Google Fonts
├── LICENSE                   # Open-source MIT License
├── package.json              # Project dependencies & scripts
├── postcss.config.js         # PostCSS configuration
├── tailwind.config.js        # Tailwind CSS theme extensions
└── vite.config.js            # Vite configuration
```

---

## 🚢 Production Build & Deployment

To create an optimized production bundle:
```bash
npm run build
```
Preview the built bundle locally:
```bash
npm run preview
```

### Deploying to Vercel
1. Push your repository to GitHub.
2. Import the project in [Vercel](https://vercel.com).
3. Under **Project Settings > Environment Variables**, add:
   - `VITE_GEMINI_API_KEY` = `your_gemini_api_key`
4. Click **Deploy**.

### Deploying to Netlify
1. Connect your repository on [Netlify](https://netlify.com).
2. Set Build Command: `npm run build`
3. Set Publish Directory: `dist`
4. Add `VITE_GEMINI_API_KEY` under **Site configuration > Environment variables**.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for details.
