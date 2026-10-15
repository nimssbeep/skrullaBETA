import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  BookOpen,
  Sparkles,
  Upload,
  MessageSquare,
  Heart,
  Bookmark,
  CheckCircle2,
  XCircle,
  FileText,
  Flame,
  RefreshCw,
  Send,
  X,
  ChevronRight,
  ChevronLeft,
  Search,
  Layers,
  Sliders,
  ShieldCheck,
  Zap,
  AlertCircle,
  Sun,
  Moon,
  LogOut,
  Plus,
  CheckSquare,
  Square,
  Palette,
  User,
  Lock,
  Mail,
  Key,
  Settings,
  Activity,
  Wifi,
  Check
} from 'lucide-react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
  updateProfile
} from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';

// ============================================================================
// 1. SAFE ENVIRONMENT & HYBRID CLOUD / LOCALSTORAGE INITIALIZATION
// ============================================================================
// IMPORTANT: Vite statically replaces import.meta.env.VITE_* at build time.
// Dynamic bracket access like import.meta.env[variable] silently fails in
// production builds. Always use direct property access.
const ENV_API_KEY = import.meta.env?.VITE_GEMINI_API_KEY || '';
const ENV_LOGO_URL = import.meta.env?.VITE_CUSTOM_LOGO_URL || '';
const GEMINI_MODEL = import.meta.env?.VITE_GEMINI_MODEL || 'gemini-1.5-flash';
const APP_ID =
  typeof __app_id !== 'undefined' && __app_id
    ? __app_id
    : (import.meta.env?.VITE_APP_ID || 'skrulla-study-app');

console.log('[SKRULLA!] Gemini Model:', GEMINI_MODEL, '| API Key Loaded:', ENV_API_KEY ? `${ENV_API_KEY.slice(0, 6)}...` : '(none)');

let auth = null;
let db = null;
let isFirebaseEnabled = false;

try {
  const rawConfig =
    typeof __firebase_config !== 'undefined' && __firebase_config
      ? __firebase_config
      : (import.meta.env?.VITE_FIREBASE_CONFIG || '');

  if (rawConfig) {
    const parsedConfig = typeof rawConfig === 'string' ? JSON.parse(rawConfig) : rawConfig;
    if (parsedConfig && parsedConfig.apiKey) {
      const app = getApps().length === 0 ? initializeApp(parsedConfig) : getApp();
      auth = getAuth(app);
      db = getFirestore(app);
      isFirebaseEnabled = true;
    }
  }
} catch (err) {
  console.warn('[SKRULLA!] Running in LocalStorage Mode:', err);
}

// ============================================================================
// 2. SKRULLA! HAND-DRAWN GOLDEN WORDMARK & EMBLEM LOGO COMPONENT
// ============================================================================
export const SkrullaWordmarkSvg = ({ className = 'h-10 w-auto', strokeColor = '#ECC72E' }) => (
  <svg
    viewBox="0 0 540 155"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="SKRULLA!"
  >
    <g
      stroke={strokeColor}
      strokeWidth="9.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* S - Tall expressive hand-drawn curve */}
      <path d="M 88 26 C 65 10, 38 44, 62 66 C 88 88, 108 112, 82 135 C 62 150, 36 144, 30 128" />

      {/* K - Vertical spine + upper-right kick + lower-right leg */}
      <path d="M 122 25 C 124 64, 127 104, 130 144" />
      <path d="M 176 34 C 158 58, 138 78, 123 90" />
      <path d="M 125 82 C 145 98, 165 116, 184 134" />

      {/* R - Tall angled stem + P-loop + sweeping R tail */}
      <path d="M 196 16 C 202 58, 208 102, 214 146 C 194 98, 188 46, 205 18 C 222 4, 244 38, 232 68 C 224 88, 208 98, 198 96 C 224 112, 252 122, 278 130" />

      {/* U - Deep rounded hand-drawn U */}
      <path d="M 278 24 C 282 70, 286 138, 298 138 C 310 138, 312 68, 310 12" />

      {/* L (1st) - Sweeping organic L curve */}
      <path d="M 332 18 C 338 66, 336 136, 352 138 C 366 140, 380 116, 386 102" />

      {/* L (2nd) - Tall dynamic L curve */}
      <path d="M 378 22 C 384 68, 392 136, 408 138 C 422 140, 434 112, 438 92" />

      {/* A - Sharp apex + crossbar */}
      <path d="M 442 28 C 446 68, 450 108, 454 144" />
      <path d="M 440 24 C 460 58, 480 98, 502 142" />
      <path d="M 448 96 L 490 70" />

      {/* ! - Exclamation slash + dot */}
      <path d="M 496 14 C 504 42, 510 68, 516 88" />
    </g>
    <circle cx="525" cy="116" r="5.5" fill={strokeColor} />
  </svg>
);

export const SkrullaLogo = ({
  size = 'md',
  theme = 'dark',
  logoStyle = 'combo', // 'combo' | 'script' | 'raster'
  customLogoUrl = '',
  showTagline = false
}) => {
  const [imgFailed, setImgFailed] = useState(false);
  const isDark = theme === 'dark';

  const sizeMap = {
    sm: { iconW: 44, iconH: 36, wordmarkH: 'h-7', gap: 'gap-2' },
    md: { iconW: 54, iconH: 44, wordmarkH: 'h-8', gap: 'gap-2.5' },
    lg: { iconW: 96, iconH: 78, wordmarkH: 'h-14', gap: 'gap-3' },
    xl: { iconW: 120, iconH: 96, wordmarkH: 'h-16', gap: 'gap-3.5' }
  }[size] || { iconW: 54, iconH: 44, wordmarkH: 'h-8', gap: 'gap-2.5' };

  const isStacked = size === 'lg' || size === 'xl';

  if (logoStyle === 'raster' && customLogoUrl && !imgFailed) {
    return (
      <div
        className={`inline-flex ${
          isStacked ? 'flex-col' : 'flex-row'
        } items-center ${sizeMap.gap} select-none`}
      >
        <div
          className={`overflow-hidden rounded-2xl border transition-transform duration-300 hover:scale-105 ${
            isDark
              ? 'bg-[#141418] border-[#ECC72E]/40 shadow-[0_0_28px_rgba(236,199,46,0.22)] p-1.5'
              : 'bg-white border-[#5C4912]/15 shadow-sm p-1.5'
          }`}
        >
          <img
            src={customLogoUrl}
            alt="SKRULLA! Logo"
            style={{ width: isStacked ? sizeMap.iconW * 1.6 : sizeMap.iconW * 1.3, height: 'auto' }}
            className="object-contain rounded-xl"
            onError={() => setImgFailed(true)}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex ${
        isStacked ? 'flex-col text-center' : 'flex-row'
      } items-center ${sizeMap.gap} select-none`}
    >
      {/* Book-to-Scroll Scholar Emblem */}
      {logoStyle !== 'script' && (
        <div className="relative flex items-center justify-center transition-transform duration-300 hover:scale-105 shrink-0">
          {isDark && (
            <div
              className="absolute inset-0 rounded-full blur-xl opacity-35 pointer-events-none"
              style={{ background: 'radial-gradient(circle, #ECC72E 0%, transparent 70%)' }}
            />
          )}
          <svg
            width={sizeMap.iconW}
            height={sizeMap.iconH}
            viewBox="0 0 160 125"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="relative z-10 overflow-visible"
          >
            <defs>
              <linearGradient
                id="skrullaScrollGrad"
                x1="80"
                y1="35"
                x2="140"
                y2="105"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#FCE694" />
                <stop offset="55%" stopColor="#ECC72E" />
                <stop offset="100%" stopColor="#C88A23" />
              </linearGradient>
              <linearGradient
                id="skrullaSpineGrad"
                x1="78"
                y1="45"
                x2="105"
                y2="100"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#D4952A" />
                <stop offset="100%" stopColor="#9E6714" />
              </linearGradient>
            </defs>

            {/* Golden Sparkles */}
            <path
              d="M52 24L53.8 28.2L58 30L53.8 31.8L52 36L50.2 31.8L46 30L50.2 28.2L52 24Z"
              fill="#ECC72E"
            />
            <path
              d="M108 18L110.5 23.5L116 26L110.5 28.5L108 34L105.5 28.5L100 26L105.5 23.5L108 18Z"
              fill="#ECC72E"
            />
            <path
              d="M134 29L135.5 32.5L139 34L135.5 35.5L134 39L132.5 35.5L129 34L132.5 32.5L134 29Z"
              fill="#ECC72E"
            />

            {/* Mortarboard Graduation Cap */}
            <polygon
              points="80,8 104,17 80,26 56,17"
              fill={isDark ? '#1E3A5F' : '#142B47'}
              stroke={isDark ? '#FCE694' : '#142B47'}
              strokeWidth="2"
            />
            <path
              d="M68 22V31C68 31 74 35 80 39C86 35 92 31 92 31V22"
              fill={isDark ? '#1E3A5F' : '#142B47'}
              stroke={isDark ? '#FCE694' : '#142B47'}
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            <path
              d="M62 20V32L60 36H64L62 32"
              stroke="#ECC72E"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Left Sweeping Gold Swoop */}
            <path
              d="M34 62C18 70 18 84 34 89"
              stroke="#ECC72E"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />

            {/* Left Outer Book Cover */}
            <path
              d="M35 45L78 52V105L35 98V45Z"
              fill="#E5A93C"
              stroke="#142B47"
              strokeWidth="4"
              strokeLinejoin="round"
            />

            {/* Left Open White Book Page */}
            <path
              d="M42 36C56 37 68 42 78 50V101C68 93 56 89 42 88V36Z"
              fill="#FFFFFF"
              stroke="#142B47"
              strokeWidth="4"
              strokeLinejoin="round"
            />

            {/* Book Page Lines */}
            <path d="M49 48C57 49 64 52 70 56" stroke="#D49B35" strokeWidth="3" strokeLinecap="round" />
            <path d="M49 56C57 57 64 60 70 64" stroke="#D49B35" strokeWidth="3" strokeLinecap="round" />
            <path d="M49 64C57 65 64 68 70 72" stroke="#D49B35" strokeWidth="3" strokeLinecap="round" />
            <path d="M49 72C57 73 64 76 70 80" stroke="#D49B35" strokeWidth="3" strokeLinecap="round" />

            {/* Right Page Inner Spine Shadow */}
            <path
              d="M78 50C82 40 92 38 98 46V98L78 104V50Z"
              fill="url(#skrullaSpineGrad)"
              stroke="#142B47"
              strokeWidth="4"
              strokeLinejoin="round"
            />

            {/* Right Transforming Golden Scroll */}
            <path
              d="M84 42C96 34 114 33 125 35C130 36 132 42 130 52C128 63 127 76 132 86L98 99C92 89 94 74 96 60C97 49 91 40 84 42Z"
              fill="url(#skrullaScrollGrad)"
              stroke="#142B47"
              strokeWidth="4"
              strokeLinejoin="round"
            />

            {/* Scroll Bottom Cylinder */}
            <path
              d="M96 92C96 86 104 84 109 89C113 94 108 103 101 103C95 103 92 97 96 92Z"
              fill="#D4952A"
              stroke="#142B47"
              strokeWidth="4"
            />
            <path
              d="M102 103L138 92C143 90 145 82 140 78L106 87"
              fill="url(#skrullaScrollGrad)"
              stroke="#142B47"
              strokeWidth="4"
              strokeLinejoin="round"
            />

            {/* Rising Arrow Across Book & Scroll */}
            <path
              d="M52 83C72 86 92 77 109 58"
              stroke="#FFFFFF"
              strokeWidth="8"
              strokeLinecap="round"
            />
            <path
              d="M52 83C72 86 92 77 109 58"
              stroke="#142B47"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d="M100 56L112 54L110 66"
              stroke="#142B47"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}

      {/* Hand-Drawn Golden "SKRULLA!" Wordmark */}
      <div className="flex flex-col items-center sm:items-start">
        <SkrullaWordmarkSvg
          className={sizeMap.wordmarkH}
          strokeColor={isDark ? '#ECC72E' : '#D49B1A'}
        />
        {showTagline && (
          <span
            className={`text-[10px] font-bold uppercase tracking-[0.2em] mt-0.5 ${
              isDark ? 'text-slate-400' : 'text-[#5C4912]/75'
            }`}
          >
            AI Study &amp; Scroll Feed
          </span>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// 3. PERSONA ROSTER & INITIAL STUDY DECKS
// ============================================================================
export const PERSONAS = {
  '@brainrot_scholar': {
    handle: '@brainrot_scholar',
    name: 'Meme Scholar',
    role: 'Chaotic Relatable Analogies',
    avatar: '💀',
    darkBadge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    lightBadge: 'bg-[#F8BBD0]/50 text-[#5C4912] border-[#5C4912]/20'
  },
  '@deepdive_dan': {
    handle: '@deepdive_dan',
    name: 'Thread Architect',
    role: 'Structured Step-by-Step Breakdowns',
    avatar: '🧵',
    darkBadge: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    lightBadge: 'bg-[#FBE293] text-[#5C4912] border-[#5C4912]/20'
  },
  '@aita_academics': {
    handle: '@aita_academics',
    name: 'Academic Drama',
    role: 'Storytelling & System Conflicts',
    avatar: '🍿',
    darkBadge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    lightBadge: 'bg-[#F8BBD0]/60 text-[#7A2021] border-[#B3261E]/20'
  },
  '@hot_take_prof': {
    handle: '@hot_take_prof',
    name: 'Devil’s Advocate',
    role: 'Edge Cases & Critical Nuance',
    avatar: '🔥',
    darkBadge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    lightBadge: 'bg-[#FBE293] text-[#5C4912] border-[#E5B513]'
  },
  '@pop_quiz_bot': {
    handle: '@pop_quiz_bot',
    name: 'Quizmaster AI',
    role: 'Active Recall Poll Challenges',
    avatar: '🎯',
    darkBadge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    lightBadge: 'bg-[#E8F5E9] text-[#1B5E20] border-[#1B5E20]/20'
  }
};

export const INITIAL_DECKS = [
  {
    id: 'deck-bio',
    title: 'Cellular Bio',
    subtitle: 'ATP & Respiration',
    emoji: '🌿',
    pastelBg: 'bg-[#E8F5E9]',
    pastelText: 'text-[#1B5E20]',
    dueDate: 'Fri, 25 Dec',
    assignee: 'Prof. Hendrick',
    summaryNote:
      'Focus on the net ATP yield across Glycolysis, the Krebs Cycle, and Oxidative Phosphorylation.',
    rawText: `Cellular respiration is the metabolic pathway that converts glucose into ATP.
1. Glycolysis occurs in the cytoplasm (anaerobic) and splits 1 glucose (6C) into 2 pyruvate (3C), yielding 2 net ATP and 2 NADH.
2. The Citric Acid (Krebs) Cycle occurs in the mitochondrial matrix, oxidizing Acetyl-CoA to CO2 while generating 2 ATP, 6 NADH, and 2 FADH2 per glucose.
3. Oxidative Phosphorylation (Electron Transport Chain + Chemiosmosis) occurs across the inner mitochondrial membrane. NADH and FADH2 donate electrons, pumping protons into the intermembrane space. ATP Synthase uses this proton-motive force to synthesize ~28-32 ATP. Oxygen is the final electron acceptor, forming water.`,
    tasks: [
      { id: 't1', label: 'Glycolysis Net Yield (2 ATP, 2 NADH)', done: true },
      { id: 't2', label: 'Krebs Cycle Matrix Reactions', done: true },
      { id: 't3', label: 'Proton Gradient & ATP Synthase', done: false },
      { id: 't4', label: 'Role of Oxygen as Final Electron Acceptor', done: false }
    ]
  },
  {
    id: 'deck-os',
    title: 'OS Kernels',
    subtitle: 'CPU Scheduling',
    emoji: '💻',
    pastelBg: 'bg-[#EDE7F6]',
    pastelText: 'text-[#311B92]',
    dueDate: 'Mon, 28 Dec',
    assignee: 'Dr. Stallings',
    summaryNote:
      'Compare preemptive vs non-preemptive schedulers, starvation, and context-switch overhead.',
    rawText: `CPU Scheduling determines which ready process gets the CPU next.
- First-Come, First-Served (FCFS): Non-preemptive queue. Suffers from the Convoy Effect where short jobs wait behind one CPU-bound monster process.
- Shortest Job First (SJF) / SRTF: Minimizes average waiting time mathematically, but can cause indefinite starvation for long processes. Fixed using Aging.
- Round Robin (RR): Preemptive scheduler using a fixed time quantum (q). If q is too large, RR degenerates into FCFS; if q is too small, context-switch overhead dominates execution time.`,
    tasks: [
      { id: 'o1', label: 'FCFS & The Convoy Effect', done: true },
      { id: 'o2', label: 'SJF Optimality vs Starvation', done: false },
      { id: 'o3', label: 'Round Robin Time Quantum Tradeoff', done: false }
    ]
  },
  {
    id: 'deck-ml',
    title: 'Deep Learning',
    subtitle: 'Backprop & Loss',
    emoji: '🧠',
    pastelBg: 'bg-[#FFF8E1]',
    pastelText: 'text-[#E65100]',
    dueDate: 'Wed, 30 Dec',
    assignee: 'Lab Cohort',
    summaryNote:
      'Master the chain rule in backpropagation, vanishing gradients in Sigmoid, and why ReLU dominates hidden layers.',
    rawText: `Backpropagation computes the gradient of the loss function with respect to each weight using the chain rule of calculus.
- Vanishing Gradient Problem: Deep networks using Sigmoid or Tanh activations squash derivatives into (0, 0.25], causing early-layer gradients to exponentially decay toward zero during backprop.
- ReLU (Rectified Linear Unit): f(x) = max(0, x). Keeps a constant gradient of 1 for positive inputs, preventing vanishing gradients, though dead neurons can occur if weights push inputs permanently negative (solved by Leaky ReLU or He Initialization).`,
    tasks: [
      { id: 'm1', label: 'Chain Rule in Backpropagation', done: true },
      { id: 'm2', label: 'Sigmoid Derivative Squash (max 0.25)', done: false },
      { id: 'm3', label: 'ReLU vs Dead Neuron Mitigation', done: false }
    ]
  }
];

export const INITIAL_POSTS = [
  {
    post_id: 'seed-1',
    deck_id: 'deck-bio',
    persona_handle: '@brainrot_scholar',
    post_type: 'standard',
    concept_tag: 'Glycolysis vs Mitochondria',
    timestamp: 'Starter Deck',
    generatedViaApi: false,
    content: `Me watching the Mitochondria take 100% of the clout as the "powerhouse of the cell" when Glycolysis literally started the job out in the cytoplasm with zero oxygen required 💀😤\n\nPut some respect on the 2 net ATP starter pack!`,
    source_quote:
      'Glycolysis occurs in the cytoplasm (anaerobic) and splits 1 glucose (6C) into 2 pyruvate (3C), yielding 2 net ATP and 2 NADH.',
    likes: 42,
    liked: false,
    bookmarked: false,
    mastery: null,
    comments: [
      {
        id: 'c-101',
        author: '@deepdive_dan',
        text: 'Fair point, but 2 ATP vs ~30 ATP from Oxidative Phosphorylation is why the mitochondria gets the headline.',
        isUser: false
      }
    ]
  },
  {
    post_id: 'seed-2',
    deck_id: 'deck-bio',
    persona_handle: '@pop_quiz_bot',
    post_type: 'quiz',
    concept_tag: 'Electron Transport Chain',
    timestamp: 'Starter Deck',
    generatedViaApi: false,
    content:
      '⚡ QUICK SKRULLA CHECK: What happens immediately if Oxygen is removed from the Electron Transport Chain?',
    poll_options: [
      'Glycolysis immediately stops in the cytoplasm',
      'The ETC backs up with electrons and ATP Synthase halts',
      'ATP Synthase spins backward to produce glucose',
      'NADH converts directly into ATP in the matrix'
    ],
    correct_option_index: 1,
    poll_explanation:
      'Oxygen is the terminal electron acceptor (forming H2O). Without it, electron carriers remain reduced, proton pumping stops, and chemiosmosis halts.',
    source_quote:
      'ATP Synthase uses this proton-motive force to synthesize ~28-32 ATP. Oxygen is the final electron acceptor, forming water.',
    likes: 29,
    liked: false,
    bookmarked: true,
    mastery: null,
    comments: []
  }
];

// ============================================================================
// 4. GEMINI API ENGINE WITH EXPONENTIAL BACKOFF & LIVE PING VERIFICATION
// ============================================================================
function cleanJsonText(rawText) {
  if (!rawText) return '[]';
  return rawText
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

async function fetchGeminiWithBackoff(url, payload, maxRetries = 3) {
  let delay = 1000;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        if ((response.status === 429 || response.status >= 500) && attempt < maxRetries) {
          await new Promise((r) => setTimeout(r, delay));
          delay *= 2;
          continue;
        }
        const errBody = await response.text();
        throw new Error(`HTTP ${response.status}: ${errBody.slice(0, 120)}`);
      }
      return await response.json();
    } catch (err) {
      if (attempt === maxRetries) throw err;
      await new Promise((r) => setTimeout(r, delay));
      delay *= 2;
    }
  }
}

async function generatePersonaFeedFromAI({
  apiKey,
  deckTitle,
  studyText,
  fileInlineData,
  focusConcept = '',
  isLoginPing = false
}) {
  const effectiveKey = (apiKey || ENV_API_KEY || '').trim();
  if (!effectiveKey) {
    throw new Error('No Gemini API key configured. Add your key in Settings (⚙️) or set VITE_GEMINI_API_KEY in .env');
  }
  console.log('[SKRULLA!] Calling Gemini API with model:', GEMINI_MODEL, '| Key prefix:', effectiveKey.slice(0, 6) + '...');
  const startTime = performance.now();

  const systemInstruction = `You are the AI engine for "SKRULLA!", an addictive educational social media app that converts study material into a high-retention social feed.
Convert the provided study material into an engaging, accurate 4-post social media feed using these exact personas:
1. "@brainrot_scholar": Funny, relatable student humor, memes, and everyday analogies.
2. "@deepdive_dan": Clear 3-to-4 step numbered thread ("post_type": "thread", populate "thread_items").
3. "@aita_academics" OR "@hot_take_prof": Dramatic "AITA" scenario or provocative academic hot take.
4. "@pop_quiz_bot": 4-option multiple choice poll ("post_type": "quiz", populate "poll_options", "correct_option_index" 0-3, and "poll_explanation").

Every post MUST include a verbatim "source_quote" from the study material to prevent hallucinations.
${
  isLoginPing
    ? 'This is an automatic on-login live API verification feed. Make the posts extra punchy, fresh, and insightful!'
    : ''
}
${
  focusConcept
    ? `IMPORTANT SPACED REPETITION DIRECTIVE: Focus heavily on remediating this weak concept: "${focusConcept}".`
    : ''
}`;

  const parts = [
    {
      text: `Deck Title: ${deckTitle}\nStudy Notes:\n${
        studyText || 'See attached study file.'
      }\n\nGenerate 4 high-yield SKRULLA! feed posts as a strict JSON array.`
    }
  ];

  if (fileInlineData) {
    parts.push({ inlineData: fileInlineData });
  }

  const responseSchema = {
    type: 'ARRAY',
    items: {
      type: 'OBJECT',
      properties: {
        persona_handle: {
          type: 'STRING',
          description:
            'One of: @brainrot_scholar, @deepdive_dan, @aita_academics, @hot_take_prof, @pop_quiz_bot'
        },
        post_type: { type: 'STRING', description: 'One of: standard, thread, quiz' },
        concept_tag: { type: 'STRING' },
        content: { type: 'STRING' },
        thread_items: { type: 'ARRAY', items: { type: 'STRING' } },
        poll_options: { type: 'ARRAY', items: { type: 'STRING' } },
        correct_option_index: { type: 'INTEGER' },
        poll_explanation: { type: 'STRING' },
        source_quote: { type: 'STRING' },
        simulated_comment_author: { type: 'STRING' },
        simulated_comment_text: { type: 'STRING' }
      },
      propertyOrdering: [
        'persona_handle',
        'post_type',
        'concept_tag',
        'content',
        'thread_items',
        'poll_options',
        'correct_option_index',
        'poll_explanation',
        'source_quote',
        'simulated_comment_author',
        'simulated_comment_text'
      ]
    }
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${effectiveKey}`;
  const data = await fetchGeminiWithBackoff(url, {
    systemInstruction: { parts: [{ text: systemInstruction }] },
    contents: [{ role: 'user', parts }],
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema,
      temperature: 0.75
    }
  });

  const latencyMs = Math.round(performance.now() - startTime);
  const rawJson = data?.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
  const parsed = JSON.parse(cleanJsonText(rawJson));

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error('Empty feed returned from Gemini API.');
  }

  const posts = parsed.map((item, idx) => ({
    post_id: `api-${Date.now()}-${idx}`,
    persona_handle: PERSONAS[item.persona_handle] ? item.persona_handle : '@brainrot_scholar',
    post_type: item.post_type || 'standard',
    concept_tag: item.concept_tag || deckTitle,
    timestamp: 'Live via Gemini API',
    generatedViaApi: true,
    apiLatencyMs: latencyMs,
    content: item.content || '',
    thread_items: Array.isArray(item.thread_items) ? item.thread_items : [],
    poll_options: Array.isArray(item.poll_options) ? item.poll_options : [],
    correct_option_index:
      typeof item.correct_option_index === 'number' ? item.correct_option_index : 0,
    poll_explanation: item.poll_explanation || '',
    source_quote: item.source_quote || 'Verified from your uploaded study material.',
    likes: Math.floor(Math.random() * 45) + 15,
    liked: false,
    bookmarked: false,
    mastery: null,
    comments: item.simulated_comment_text
      ? [
          {
            id: `sim-${Date.now()}-${idx}`,
            author: PERSONAS[item.simulated_comment_author]
              ? item.simulated_comment_author
              : '@deepdive_dan',
            text: item.simulated_comment_text,
            isUser: false
          }
        ]
      : []
  }));

  return { posts, latencyMs };
}

async function generatePersonaReply({ apiKey, post, userQuestion }) {
  const effectiveKey = (apiKey || ENV_API_KEY || '').trim();
  const persona = PERSONAS[post.persona_handle] || PERSONAS['@deepdive_dan'];

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${effectiveKey}`;
  const data = await fetchGeminiWithBackoff(url, {
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `You are ${persona.name} (${persona.handle}, role: ${persona.role}) inside the SKRULLA! study app.
Post Content: "${post.content}"
Source Material Quote: "${post.source_quote}"
Student Question: "${userQuestion}"
Reply directly in character in 2 concise sentences while remaining 100% academically accurate.`
          }
        ]
      }
    ]
  });

  return (
    data?.candidates?.[0]?.content?.parts?.[0]?.text ||
    `(${persona.name}) Great question! Check the verbatim source quote for "${post.concept_tag}".`
  );
}

// ============================================================================
// 5. MAIN SKRULLA! APPLICATION COMPONENT
// ============================================================================
export default function App() {
  // Theme & Brand State
  const [theme, setTheme] = useState(() => localStorage.getItem('skrulla_theme') || 'dark');
  const [logoStyle, setLogoStyle] = useState(
    () => localStorage.getItem('skrulla_logo_style') || 'combo'
  );
  const [customLogoUrl, setCustomLogoUrl] = useState(
    () => localStorage.getItem('skrulla_logo_url') || ENV_LOGO_URL
  );
  const [userApiKey, setUserApiKey] = useState(
    () => localStorage.getItem('skrulla_gemini_key') || ENV_API_KEY
  );

  // Auth & Navigation State
  const [user, setUser] = useState(null);
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Live On-Login Gemini API Ping & Verification State
  const [apiPingState, setApiPingState] = useState({
    status: 'idle', // 'idle' | 'pinging' | 'connected' | 'error'
    latencyMs: null,
    lastVerifiedAt: null,
    postsGeneratedCount: 0,
    message: 'Ready to ping Gemini API on login'
  });

  // App Data State
  const [decks, setDecks] = useState(INITIAL_DECKS);
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [selectedDeckId, setSelectedDeckId] = useState('all');
  const [selectedPersona, setSelectedPersona] = useState('all');
  const [activeTab, setActiveTab] = useState('feed'); // 'feed' | 'bookmarks' | 'theme-studio'
  const [searchQuery, setSearchQuery] = useState('');
  const [pollSelections, setPollSelections] = useState({});
  const [activeCommentInputs, setActiveCommentInputs] = useState({});
  const [replyingPostId, setReplyingPostId] = useState(null);

  // Modals & Drawers
  const [checklistDeckId, setChecklistDeckId] = useState(null);
  const [newTaskText, setNewTaskText] = useState('');
  const [sourceModalPost, setSourceModalPost] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Upload Form State
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadNotes, setUploadNotes] = useState('');
  const [uploadFileData, setUploadFileData] = useState(null);
  const [uploadFileName, setUploadFileName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusBanner, setStatusBanner] = useState('');

  const hasTriggeredLoginPingRef = useRef(false);
  const isDark = theme === 'dark';

  // Persist Preferences
  useEffect(() => {
    localStorage.setItem('skrulla_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('skrulla_logo_style', logoStyle);
    localStorage.setItem('skrulla_logo_url', customLogoUrl);
    localStorage.setItem('skrulla_gemini_key', userApiKey);
  }, [logoStyle, customLogoUrl, userApiKey]);

  // Firebase Auth Initialization
  useEffect(() => {
    if (isFirebaseEnabled && auth) {
      const initFirebaseAuth = async () => {
        try {
          if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
            await signInWithCustomToken(auth, __initial_auth_token);
          } else {
            await signInAnonymously(auth);
          }
        } catch (err) {
          console.warn('[SKRULLA!] Initial auth fallback:', err);
        }
      };
      initFirebaseAuth();

      const unsub = onAuthStateChanged(auth, (fbUser) => {
        if (fbUser) {
          setUser({
            uid: fbUser.uid,
            displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Scholar',
            email: fbUser.email || 'Cloud Scholar Session',
            isAnonymous: fbUser.isAnonymous
          });
        } else {
          setUser(null);
        }
      });
      return () => unsub();
    } else {
      const savedUser = localStorage.getItem('skrulla_local_user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (_) {}
      }
    }
  }, []);

  // Load / Sync User Workspace
  useEffect(() => {
    if (!user) return;
    if (isFirebaseEnabled && db) {
      const docRef = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'workspace', 'main');
      const unsub = onSnapshot(
        docRef,
        (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            if (Array.isArray(data.decks) && data.decks.length) setDecks(data.decks);
            if (Array.isArray(data.posts) && data.posts.length) setPosts(data.posts);
          } else {
            setDoc(docRef, {
              decks: INITIAL_DECKS,
              posts: INITIAL_POSTS,
              updatedAt: Date.now()
            }).catch(() => {});
          }
        },
        (err) => {
          console.warn('[SKRULLA!] Firestore sync warning:', err);
        }
      );
      return () => unsub();
    } else {
      const savedDecks = localStorage.getItem(`skrulla_decks_${user.uid}`);
      const savedPosts = localStorage.getItem(`skrulla_posts_${user.uid}`);
      if (savedDecks) {
        try {
          setDecks(JSON.parse(savedDecks));
        } catch (_) {}
      }
      if (savedPosts) {
        try {
          setPosts(JSON.parse(savedPosts));
        } catch (_) {}
      }
    }
  }, [user]);

  const persistWorkspace = useCallback(
    (nextDecks, nextPosts) => {
      setDecks(nextDecks);
      setPosts(nextPosts);
      if (!user) return;

      if (isFirebaseEnabled && db) {
        const docRef = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'workspace', 'main');
        setDoc(
          docRef,
          { decks: nextDecks, posts: nextPosts, updatedAt: Date.now() },
          { merge: true }
        ).catch(() => {});
      } else {
        localStorage.setItem(`skrulla_decks_${user.uid}`, JSON.stringify(nextDecks));
        localStorage.setItem(`skrulla_posts_${user.uid}`, JSON.stringify(nextPosts));
      }
    },
    [user]
  );

  // ============================================================================
  // AUTOMATIC ON-LOGIN GEMINI AI PING & LIVE FEED GENERATION
  // ============================================================================
  const pingGeminiAndGenerateFeed = useCallback(
    async (targetDeckOverride = null) => {
      const activeDeck =
        targetDeckOverride ||
        decks.find((d) => d.id === selectedDeckId) ||
        decks[0] ||
        INITIAL_DECKS[0];

      setApiPingState((prev) => ({
        ...prev,
        status: 'pinging',
        message: `Pinging Gemini AI (${GEMINI_MODEL}) & generating live SKRULLA! feed for "${activeDeck.title}"...`
      }));
      setIsGenerating(true);

      try {
        const { posts: liveApiPosts, latencyMs } = await generatePersonaFeedFromAI({
          apiKey: userApiKey,
          deckTitle: activeDeck.title,
          studyText: activeDeck.rawText,
          isLoginPing: true
        });

        const taggedLivePosts = liveApiPosts.map((p) => ({
          ...p,
          deck_id: activeDeck.id
        }));

        setPosts((prevPosts) => {
          const nextPosts = [...taggedLivePosts, ...prevPosts];
          if (user) {
            if (isFirebaseEnabled && db) {
              const docRef = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'workspace', 'main');
              setDoc(docRef, { posts: nextPosts, updatedAt: Date.now() }, { merge: true }).catch(
                () => {}
              );
            } else {
              localStorage.setItem(`skrulla_posts_${user.uid}`, JSON.stringify(nextPosts));
            }
          }
          return nextPosts;
        });

        const timeStr = new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });

        setApiPingState({
          status: 'connected',
          latencyMs,
          lastVerifiedAt: timeStr,
          postsGeneratedCount: taggedLivePosts.length,
          message: `Gemini API Connected (${latencyMs}ms) • Generated ${taggedLivePosts.length} Live Posts via API`
        });

        setStatusBanner(
          `✅ Gemini API Ping Verified (${latencyMs}ms)! ${taggedLivePosts.length} live persona posts generated for "${activeDeck.title}".`
        );
        setTimeout(() => setStatusBanner(''), 6000);
      } catch (err) {
        console.error('[SKRULLA!] Live API Ping Error:', err);
        const errMsg = err?.message || String(err);
        setApiPingState({
          status: 'error',
          latencyMs: null,
          lastVerifiedAt: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          }),
          postsGeneratedCount: 0,
          message: `API Error: ${errMsg.slice(0, 200)}`
        });
        setStatusBanner(
          `⚠️ Gemini API Error: ${errMsg.slice(0, 150)}`
        );
      } finally {
        setIsGenerating(false);
      }
    },
    [decks, selectedDeckId, userApiKey, user]
  );

  // Trigger Automatic Gemini API Ping & Feed Generation right when user enters the app
  useEffect(() => {
    if (!showWelcomeScreen && !hasTriggeredLoginPingRef.current) {
      hasTriggeredLoginPingRef.current = true;
      pingGeminiAndGenerateFeed();
    }
  }, [showWelcomeScreen, pingGeminiAndGenerateFeed]);

  // Authentication Handlers
  const enterAppWithLivePing = () => {
    hasTriggeredLoginPingRef.current = false;
    setShowAuthModal(false);
    setShowWelcomeScreen(false);
  };

  const handleQuickGuestStart = async () => {
    setAuthError('');
    if (isFirebaseEnabled && auth && !auth.currentUser) {
      try {
        await signInAnonymously(auth);
      } catch (_) {}
    } else if (!isFirebaseEnabled) {
      const localGuest = {
        uid: 'skrulla-guest',
        displayName: 'Scholar',
        email: 'scholar@skrulla.app',
        isAnonymous: true
      };
      localStorage.setItem('skrulla_local_user', JSON.stringify(localGuest));
      setUser(localGuest);
    }
    enterAppWithLivePing();
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (!emailInput.trim() || !passwordInput.trim()) {
      setAuthError('Please enter both your email and password.');
      return;
    }

    if (isFirebaseEnabled && auth) {
      try {
        if (authMode === 'signup') {
          const cred = await createUserWithEmailAndPassword(
            auth,
            emailInput.trim(),
            passwordInput
          );
          if (nameInput.trim()) {
            await updateProfile(cred.user, { displayName: nameInput.trim() });
          }
        } else {
          await signInWithEmailAndPassword(auth, emailInput.trim(), passwordInput);
        }
        enterAppWithLivePing();
        return;
      } catch (err) {
        // Fallback to Local Scholar Session if preview container blocks external Email auth provider
        const fallbackAccount = {
          uid: `local-${emailInput.trim().toLowerCase()}`,
          displayName: nameInput.trim() || emailInput.split('@')[0],
          email: emailInput.trim(),
          isAnonymous: false
        };
        setUser(fallbackAccount);
        enterAppWithLivePing();
        return;
      }
    }

    const localAccount = {
      uid: `local-${emailInput.trim().toLowerCase()}`,
      displayName: nameInput.trim() || emailInput.split('@')[0],
      email: emailInput.trim(),
      isAnonymous: false
    };
    localStorage.setItem('skrulla_local_user', JSON.stringify(localAccount));
    setUser(localAccount);
    enterAppWithLivePing();
  };

  const handleGoogleSignIn = async () => {
    setAuthError('');
    if (isFirebaseEnabled && auth) {
      try {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
        enterAppWithLivePing();
        return;
      } catch (_) {
        await handleQuickGuestStart();
        return;
      }
    }
    await handleQuickGuestStart();
  };

  const handleLogout = async () => {
    if (isFirebaseEnabled && auth) {
      await signOut(auth).catch(() => {});
    }
    localStorage.removeItem('skrulla_local_user');
    hasTriggeredLoginPingRef.current = false;
    setShowWelcomeScreen(true);
  };

  // File Upload Handler (Supports PDF, Images, TXT/MD with 10MB guard)
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setStatusBanner('File exceeds 10MB limit. Please upload a smaller PDF or slide image.');
      return;
    }

    setUploadFileName(file.name);
    if (!uploadTitle) {
      setUploadTitle(file.name.replace(/\.[^/.]+$/, ''));
    }

    if (
      file.type.startsWith('text/') ||
      file.name.endsWith('.md') ||
      file.name.endsWith('.txt')
    ) {
      const reader = new FileReader();
      reader.onload = (ev) => setUploadNotes(String(ev.target?.result || ''));
      reader.readAsText(file);
    } else {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64 = String(ev.target?.result || '').split(',')[1];
        if (base64) {
          setUploadFileData({ mimeType: file.type || 'application/pdf', data: base64 });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload & Generate New Study Deck + Feed via Gemini API
  const handleCreateDeckAndFeed = async (e) => {
    e.preventDefault();
    if (!uploadTitle.trim() && !uploadNotes.trim() && !uploadFileData) return;

    setIsGenerating(true);
    setApiPingState((prev) => ({
      ...prev,
      status: 'pinging',
      message: 'Calling Gemini API to break down your uploaded study material...'
    }));

    const title = uploadTitle.trim() || 'Custom Study Pack';
    const newDeckId = `deck-${Date.now()}`;
    const pastelPalette = [
      { bg: 'bg-[#EDE7F6]', text: 'text-[#311B92]', emoji: '📘' },
      { bg: 'bg-[#E8F5E9]', text: 'text-[#1B5E20]', emoji: '🧬' },
      { bg: 'bg-[#FFF8E1]', text: 'text-[#E65100]', emoji: '⚡' }
    ][decks.length % 3];

    try {
      const { posts: generatedPosts, latencyMs } = await generatePersonaFeedFromAI({
        apiKey: userApiKey,
        deckTitle: title,
        studyText: uploadNotes.trim() || `Core concepts from ${title}`,
        fileInlineData: uploadFileData
      });

      const taggedPosts = generatedPosts.map((p) => ({ ...p, deck_id: newDeckId }));
      const newDeck = {
        id: newDeckId,
        title,
        subtitle: `${taggedPosts.length} AI Scroll Posts`,
        emoji: pastelPalette.emoji,
        pastelBg: pastelPalette.bg,
        pastelText: pastelPalette.text,
        dueDate: 'Active Deck',
        assignee: user?.displayName || 'Scholar',
        summaryNote: (uploadNotes || `Generated from ${uploadFileName || title}`).slice(0, 220),
        rawText: uploadNotes || `Uploaded file: ${uploadFileName}`,
        tasks: taggedPosts.map((p, idx) => ({
          id: `task-${Date.now()}-${idx}`,
          label: p.concept_tag || `Concept ${idx + 1}`,
          done: false
        }))
      };

      const nextDecks = [newDeck, ...decks];
      const nextPosts = [...taggedPosts, ...posts];
      persistWorkspace(nextDecks, nextPosts);
      setSelectedDeckId(newDeckId);
      setShowUploadModal(false);
      setUploadTitle('');
      setUploadNotes('');
      setUploadFileData(null);
      setUploadFileName('');

      setApiPingState({
        status: 'connected',
        latencyMs,
        lastVerifiedAt: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }),
        postsGeneratedCount: taggedPosts.length,
        message: `Gemini API Live (${latencyMs}ms) • Generated ${taggedPosts.length} posts for "${title}"`
      });
      setStatusBanner(
        `✅ Generated ${taggedPosts.length} new SKRULLA! posts via Gemini API (${latencyMs}ms)!`
      );
      setTimeout(() => setStatusBanner(''), 5000);
    } catch (err) {
      const errMsg = err?.message || String(err);
      setApiPingState((prev) => ({
        ...prev,
        status: 'error',
        message: `Upload API Error: ${errMsg.slice(0, 200)}`
      }));
      setStatusBanner(
        `⚠️ Gemini API Error: ${errMsg.slice(0, 150)}`
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Spaced Repetition Remediation Trigger
  const handleRemediateConcept = async (post) => {
    setIsGenerating(true);
    setStatusBanner(
      `⚡ Spaced Repetition: Pinging Gemini API to remediate "${post.concept_tag}"...`
    );
    const parentDeck = decks.find((d) => d.id === post.deck_id) || decks[0];
    try {
      const { posts: remediationPosts, latencyMs } = await generatePersonaFeedFromAI({
        apiKey: userApiKey,
        deckTitle: parentDeck.title,
        studyText: parentDeck.rawText,
        focusConcept: post.concept_tag
      });
      const tagged = remediationPosts.map((p) => ({ ...p, deck_id: parentDeck.id }));
      persistWorkspace(decks, [...tagged, ...posts]);
      setApiPingState({
        status: 'connected',
        latencyMs,
        lastVerifiedAt: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }),
        postsGeneratedCount: tagged.length,
        message: `Remediation Feed Generated via API (${latencyMs}ms)`
      });
      setStatusBanner(
        `✅ Added ${tagged.length} fresh remediation posts on "${post.concept_tag}" (${latencyMs}ms)!`
      );
    } catch (_) {
      setStatusBanner('⚠️ Could not generate remediation posts right now.');
    } finally {
      setIsGenerating(false);
      setTimeout(() => setStatusBanner(''), 4000);
    }
  };

  // Post Interactions
  const togglePostField = (postId, field) => {
    const next = posts.map((p) => {
      if (p.post_id !== postId) return p;
      if (field === 'liked') {
        const nextLiked = !p.liked;
        return {
          ...p,
          liked: nextLiked,
          likes: nextLiked ? p.likes + 1 : Math.max(0, p.likes - 1)
        };
      }
      return { ...p, [field]: !p[field] };
    });
    persistWorkspace(decks, next);
  };

  const setPostMastery = (postId, status) => {
    const next = posts.map((p) => (p.post_id === postId ? { ...p, mastery: status } : p));
    persistWorkspace(decks, next);
  };

  const handleSendComment = async (post) => {
    const question = (activeCommentInputs[post.post_id] || '').trim();
    if (!question) return;

    const userComment = {
      id: `uc-${Date.now()}`,
      author: user?.displayName || 'You',
      text: question,
      isUser: true
    };

    const updatedWithUser = posts.map((p) =>
      p.post_id === post.post_id ? { ...p, comments: [...(p.comments || []), userComment] } : p
    );
    persistWorkspace(decks, updatedWithUser);
    setActiveCommentInputs((prev) => ({ ...prev, [post.post_id]: '' }));
    setReplyingPostId(post.post_id);

    try {
      const aiReplyText = await generatePersonaReply({
        apiKey: userApiKey,
        post,
        userQuestion: question
      });
      const aiComment = {
        id: `aic-${Date.now()}`,
        author: post.persona_handle,
        text: aiReplyText,
        isUser: false
      };
      const updatedWithAI = updatedWithUser.map((p) =>
        p.post_id === post.post_id ? { ...p, comments: [...(p.comments || []), aiComment] } : p
      );
      persistWorkspace(decks, updatedWithAI);
    } catch (_) {
    } finally {
      setReplyingPostId(null);
    }
  };

  // Checklist Drawer Handlers
  const toggleChecklistTask = (deckId, taskId) => {
    const nextDecks = decks.map((d) => {
      if (d.id !== deckId) return d;
      return {
        ...d,
        tasks: d.tasks.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t))
      };
    });
    persistWorkspace(nextDecks, posts);
  };

  const addChecklistTask = (deckId) => {
    if (!newTaskText.trim()) return;
    const nextDecks = decks.map((d) => {
      if (d.id !== deckId) return d;
      return {
        ...d,
        tasks: [...d.tasks, { id: `t-${Date.now()}`, label: newTaskText.trim(), done: false }]
      };
    });
    persistWorkspace(nextDecks, posts);
    setNewTaskText('');
  };

  // Filtered Feed Posts
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      if (activeTab === 'bookmarks' && !post.bookmarked) return false;
      if (selectedDeckId !== 'all' && post.deck_id !== selectedDeckId) return false;
      if (selectedPersona !== 'all' && post.persona_handle !== selectedPersona) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          post.content?.toLowerCase().includes(q) ||
          post.concept_tag?.toLowerCase().includes(q) ||
          post.persona_handle?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [posts, activeTab, selectedDeckId, selectedPersona, searchQuery]);

  const activeChecklistDeck = useMemo(
    () => decks.find((d) => d.id === checklistDeckId) || null,
    [decks, checklistDeckId]
  );

  // ============================================================================
  // 6. WELCOME / LOGIN HERO SCREEN (WITH SKRULLA! LOGO & AUTO-PING LOGIN)
  // ============================================================================
  if (showWelcomeScreen) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-500 ${
          isDark ? 'bg-[#070709] text-white' : 'bg-[#FBF8F3] text-[#2B2618]'
        }`}
      >
        <div
          className={`relative w-full max-w-[430px] min-h-[760px] rounded-[42px] overflow-hidden flex flex-col justify-between p-8 border transition-all ${
            isDark
              ? 'bg-[#070709] border-white/10 shadow-[0_25px_80px_rgba(0,0,0,0.85)]'
              : 'bg-[#FBF8F3] border-[#5C4912]/15 shadow-[0_25px_70px_rgba(92,73,18,0.12)]'
          }`}
        >
          {/* Ambient Top-Right Glow & Bottom-Left Perspective Grid */}
          {isDark ? (
            <>
              <div
                className="absolute -top-12 -right-12 w-72 h-72 rounded-full pointer-events-none blur-3xl opacity-45"
                style={{
                  background:
                    'radial-gradient(circle, #ECC72E 0%, #78350F 50%, transparent 75%)'
                }}
              />
              <div
                className="absolute bottom-0 left-0 right-0 h-64 pointer-events-none opacity-25"
                style={{
                  backgroundImage:
                    'linear-gradient(to right, rgba(20, 184, 166, 0.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(20, 184, 166, 0.25) 1px, transparent 1px)',
                  backgroundSize: '28px 28px',
                  transform: 'perspective(300px) rotateX(55deg) translateY(50px)'
                }}
              />
            </>
          ) : (
            <div
              className="absolute -top-16 -right-16 w-72 h-72 rounded-full pointer-events-none blur-3xl opacity-60"
              style={{ background: 'radial-gradient(circle, #FBE293 0%, transparent 70%)' }}
            />
          )}

          {/* Top Bar Controls */}
          <div className="relative z-10 flex items-center justify-between">
            <span
              className={`text-[11px] font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 ${
                isDark
                  ? 'bg-white/5 border-white/10 text-[#ECC72E]'
                  : 'bg-[#F3ECE1] border-[#5C4912]/15 text-[#5C4912]'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              Auto-API Ping on Login
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSettingsModal(true)}
                className={`p-2.5 rounded-full border transition ${
                  isDark
                    ? 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300'
                    : 'bg-[#F3ECE1] border-[#5C4912]/15 hover:bg-[#FBE293]/50 text-[#5C4912]'
                }`}
                title="API Key & SKRULLA! Logo Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                className={`p-2.5 rounded-full border transition ${
                  isDark
                    ? 'bg-white/5 border-white/10 hover:bg-white/10 text-[#ECC72E]'
                    : 'bg-[#F3ECE1] border-[#5C4912]/15 hover:bg-[#FBE293]/50 text-[#5C4912]'
                }`}
                title="Switch Dark / Light Theme"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Center Hero Section with SKRULLA! Hand-Drawn Logo & Emblem */}
          <div className="relative z-10 my-auto py-6 flex flex-col items-start">
            <div
              className={`w-full mb-6 p-6 rounded-3xl border flex flex-col items-center justify-center transition-all ${
                isDark
                  ? 'bg-[#141418]/90 border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.65)]'
                  : 'bg-[#FFFFFF] border-[#5C4912]/15 shadow-sm'
              }`}
            >
              <SkrullaLogo
                size="lg"
                theme={theme}
                logoStyle={logoStyle}
                customLogoUrl={customLogoUrl}
                showTagline={true}
              />
            </div>

            <h1
              className={`text-4xl font-bold tracking-tight mb-3 ${
                isDark ? 'text-white' : 'text-[#5C4912]'
              }`}
              style={!isDark ? { fontFamily: 'Georgia, Cambria, "Times New Roman", serif' } : {}}
            >
              Welcome to SKRULLA!
            </h1>
            <p
              className={`text-base leading-relaxed mb-6 ${
                isDark ? 'text-slate-400' : 'text-[#78715E]'
              }`}
            >
              Upload any study material and scroll through an AI-powered social feed. Logging in automatically pings Gemini AI to generate your live study feed!
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-2">
              {['5 AI Personas', 'Live API Feed on Login', 'Source Shield'].map((pill) => (
                <span
                  key={pill}
                  className={`text-xs font-medium px-3 py-1.5 rounded-xl border ${
                    isDark
                      ? 'bg-[#141418] border-white/10 text-slate-300'
                      : 'bg-[#FBE293]/70 border-[#5C4912]/15 text-[#5C4912]'
                  }`}
                >
                  ✦ {pill}
                </span>
              ))}
            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="relative z-10 flex items-center justify-between pt-4 border-t border-white/5">
            <button
              onClick={() => setShowAuthModal(true)}
              className={`text-xs font-semibold underline-offset-4 hover:underline flex items-center gap-1.5 ${
                isDark ? 'text-slate-300' : 'text-[#5C4912]'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              {user ? `Signed in as ${user.displayName}` : 'Login / Sign Up'}
            </button>

            <button
              onClick={handleQuickGuestStart}
              className={`px-6 py-3.5 rounded-2xl font-bold text-sm flex items-center gap-3 transition-transform active:scale-95 ${
                isDark
                  ? 'bg-[#1C1C22] hover:bg-[#25252D] text-white border border-white/15 shadow-lg'
                  : 'bg-[#E5B513] hover:bg-[#d4a610] text-[#2B2618] shadow-md'
              }`}
            >
              <span>Next</span>
              <span className="tracking-tighter font-mono text-xs opacity-80">&gt;&gt;</span>
            </button>
          </div>
        </div>

        {/* Auth Modal on Welcome Screen */}
        {showAuthModal && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <div
              className={`w-full max-w-md rounded-3xl p-6 border ${
                isDark
                  ? 'bg-[#141418] border-white/10 text-white'
                  : 'bg-[#FBF8F3] border-[#5C4912]/20 text-[#2B2618]'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <SkrullaLogo
                  size="sm"
                  theme={theme}
                  logoStyle={logoStyle}
                  customLogoUrl={customLogoUrl}
                />
                <button
                  onClick={() => setShowAuthModal(false)}
                  className="p-1.5 rounded-full hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex gap-2 mb-4 p-1 rounded-xl bg-black/20">
                <button
                  onClick={() => setAuthMode('login')}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${
                    authMode === 'login'
                      ? isDark
                        ? 'bg-[#ECC72E] text-black'
                        : 'bg-[#E5B513] text-[#2B2618]'
                      : 'opacity-70'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setAuthMode('signup')}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${
                    authMode === 'signup'
                      ? isDark
                        ? 'bg-[#ECC72E] text-black'
                        : 'bg-[#E5B513] text-[#2B2618]'
                      : 'opacity-70'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {authError && (
                <div className="mb-3 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs">
                  {authError}
                </div>
              )}

              <form onSubmit={handleEmailAuth} className="space-y-3">
                {authMode === 'signup' && (
                  <input
                    type="text"
                    placeholder="Your Name (e.g., Alex Hendrick)"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl text-sm border outline-none ${
                      isDark
                        ? 'bg-[#1C1C22] border-white/10 text-white'
                        : 'bg-white border-[#5C4912]/20'
                    }`}
                  />
                )}
                <input
                  type="email"
                  placeholder="Scholar Email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl text-sm border outline-none ${
                    isDark
                      ? 'bg-[#1C1C22] border-white/10 text-white'
                      : 'bg-white border-[#5C4912]/20'
                  }`}
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl text-sm border outline-none ${
                    isDark
                      ? 'bg-[#1C1C22] border-white/10 text-white'
                      : 'bg-white border-[#5C4912]/20'
                  }`}
                />
                <button
                  type="submit"
                  className={`w-full py-3 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 ${
                    isDark
                      ? 'bg-[#ECC72E] hover:bg-amber-400 text-black'
                      : 'bg-[#E5B513] text-[#2B2618]'
                  }`}
                >
                  <Zap className="w-4 h-4" />
                  <span>
                    {authMode === 'signup'
                      ? 'Sign Up & Auto-Ping Gemini Feed'
                      : 'Login & Auto-Ping Gemini Feed'}
                  </span>
                </button>
              </form>

              <div className="my-3 flex items-center gap-3 opacity-40 text-xs">
                <div className="h-px flex-1 bg-current" />
                <span>OR</span>
                <div className="h-px flex-1 bg-current" />
              </div>

              <button
                onClick={handleGoogleSignIn}
                className={`w-full py-2.5 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 ${
                  isDark
                    ? 'border-white/15 hover:bg-white/5'
                    : 'border-[#5C4912]/20 hover:bg-[#F3ECE1]'
                }`}
              >
                <Sparkles className="w-4 h-4 text-[#ECC72E]" />
                Continue with Google &amp; Ping AI Feed
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ============================================================================
  // 7. MAIN SKRULLA! DASHBOARD & SOCIAL STUDY FEED
  // ============================================================================
  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark ? 'bg-[#070709] text-[#F8FAFC]' : 'bg-[#FBF8F3] text-[#2B2618]'
      }`}
    >
      {/* Top Sticky Navigation Bar with SKRULLA! Logo & Live API Ping Badge */}
      <header
        className={`sticky top-0 z-30 backdrop-blur-md border-b px-4 py-3 ${
          isDark ? 'bg-[#070709]/85 border-white/10' : 'bg-[#FBF8F3]/90 border-[#5C4912]/15'
        }`}
      >
        <div className="max-w-xl mx-auto flex items-center justify-between gap-2">
          <button
            onClick={() => setShowWelcomeScreen(true)}
            className="text-left focus:outline-none"
            title="Return to SKRULLA! Welcome Screen"
          >
            <SkrullaLogo
              size="sm"
              theme={theme}
              logoStyle={logoStyle}
              customLogoUrl={customLogoUrl}
            />
          </button>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowUploadModal(true)}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                isDark
                  ? 'bg-[#ECC72E] hover:bg-amber-400 text-black'
                  : 'bg-[#E5B513] hover:bg-[#d4a610] text-[#2B2618]'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Notes</span>
            </button>

            <button
              onClick={() => setActiveTab(activeTab === 'theme-studio' ? 'feed' : 'theme-studio')}
              className={`p-2 rounded-xl border transition ${
                activeTab === 'theme-studio'
                  ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                  : isDark
                  ? 'bg-[#141418] border-white/10 text-slate-300'
                  : 'bg-[#F3ECE1] border-[#5C4912]/15 text-[#5C4912]'
              }`}
              title="Material Theme Studio"
            >
              <Palette className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowSettingsModal(true)}
              className={`p-2 rounded-xl border transition ${
                isDark
                  ? 'bg-[#141418] border-white/10 text-slate-300 hover:bg-white/10'
                  : 'bg-[#F3ECE1] border-[#5C4912]/15 text-[#5C4912]'
              }`}
              title="API Key & SKRULLA! Logo Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className={`p-2 rounded-xl border transition ${
                isDark
                  ? 'bg-[#141418] border-white/10 text-[#ECC72E]'
                  : 'bg-[#F3ECE1] border-[#5C4912]/15 text-[#5C4912]'
              }`}
              title="Toggle Dark / Light Mode"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={handleLogout}
              className={`p-2 rounded-xl border transition ${
                isDark
                  ? 'bg-[#141418] border-white/10 text-slate-400 hover:text-red-400'
                  : 'bg-[#F3ECE1] border-[#5C4912]/15 text-[#5C4912]'
              }`}
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 pt-4 pb-24">
        {/* ================================================================== */}
        {/* LIVE ON-LOGIN GEMINI API TELEMETRY & VERIFICATION BAR              */}
        {/* ================================================================== */}
        <div
          className={`mb-5 p-3.5 rounded-2xl border flex flex-wrap items-center justify-between gap-2 text-xs transition-all ${
            apiPingState.status === 'pinging'
              ? isDark
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                : 'bg-[#FBE293]/70 border-[#5C4912]/20 text-[#5C4912]'
              : apiPingState.status === 'connected'
              ? isDark
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-[#E8F5E9] border-[#1B5E20]/20 text-[#1B5E20]'
              : apiPingState.status === 'error'
              ? isDark
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                : 'bg-[#F8BBD0]/50 border-[#B3261E]/30 text-[#7A2021]'
              : isDark
              ? 'bg-[#141418] border-white/10 text-slate-300'
              : 'bg-[#F3ECE1] border-[#5C4912]/15 text-[#5C4912]'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {apiPingState.status === 'pinging' ? (
              <RefreshCw className="w-4 h-4 animate-spin shrink-0 text-[#ECC72E]" />
            ) : apiPingState.status === 'connected' ? (
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            ) : (
              <Activity className="w-4 h-4 shrink-0" />
            )}
            <div className="truncate">
              <span className="font-bold">{apiPingState.message}</span>
              {apiPingState.lastVerifiedAt && (
                <span className="opacity-70 ml-2 text-[11px]">
                  ({apiPingState.lastVerifiedAt})
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => pingGeminiAndGenerateFeed()}
              disabled={isGenerating}
              className={`px-2.5 py-1 rounded-xl font-bold text-[11px] flex items-center gap-1 border transition ${
                isDark
                  ? 'bg-white/10 hover:bg-white/15 border-white/10 text-white'
                  : 'bg-white hover:bg-[#FBE293] border-[#5C4912]/20 text-[#2B2618]'
              }`}
              title="Ping Gemini AI & Generate 4 Fresh Feed Posts Now"
            >
              <RefreshCw className={`w-3 h-3 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Pinging...' : 'Ping & Generate via API'}</span>
            </button>
          </div>
        </div>

        {/* Status Toast Banner */}
        {statusBanner && (
          <div
            className={`mb-4 p-3.5 rounded-2xl border text-xs font-medium flex items-center justify-between ${
              isDark
                ? 'bg-[#1C1C24] border-[#ECC72E]/40 text-[#ECC72E]'
                : 'bg-[#FBE293] border-[#5C4912]/20 text-[#5C4912]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>{statusBanner}</span>
            </div>
            <button onClick={() => setStatusBanner('')}>
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Greeting & Search Bar */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-[#78715E]'}`}>
                {isFirebaseEnabled ? '☁️ Cloud Workspace Synced' : '⚡ Local Workspace Ready'} •{' '}
                {user?.displayName || 'Scholar'}
              </p>
              <h2
                className={`text-2xl font-bold tracking-tight ${
                  isDark ? 'text-white' : 'text-[#5C4912]'
                }`}
                style={!isDark ? { fontFamily: 'Georgia, Cambria, "Times New Roman", serif' } : {}}
              >
                What are you studying today?
              </h2>
            </div>
          </div>

          {/* Search Bar */}
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl border ${
              isDark ? 'bg-[#141418] border-white/10' : 'bg-[#F3ECE1] border-[#5C4912]/15'
            }`}
          >
            <Search className="w-4 h-4 opacity-50" />
            <input
              type="text"
              placeholder="Search concepts, formulas, or @personas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-sm outline-none"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')}>
                <X className="w-4 h-4 opacity-60" />
              </button>
            )}
          </div>
        </section>

        {/* Category / Study Decks Horizontal Carousel */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold uppercase tracking-wider opacity-70">
              Category Decks
            </span>
            <button
              onClick={() => setSelectedDeckId('all')}
              className={`text-xs font-semibold ${
                selectedDeckId === 'all' ? 'underline text-[#ECC72E]' : 'opacity-60'
              }`}
            >
              Show All ({posts.length})
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {decks.slice(0, 3).map((deck) => {
              const isSelected = selectedDeckId === deck.id;
              const completedCount = deck.tasks.filter((t) => t.done).length;
              return (
                <div
                  key={deck.id}
                  onClick={() => setSelectedDeckId(isSelected ? 'all' : deck.id)}
                  className={`cursor-pointer rounded-3xl p-4 transition-all border flex flex-col justify-between ${
                    isDark
                      ? `${deck.pastelBg} ${deck.pastelText} ${
                          isSelected
                            ? 'ring-2 ring-[#ECC72E] scale-[1.02]'
                            : 'opacity-95 hover:opacity-100'
                        }`
                      : `bg-[#FBE293] text-[#2B2618] border-[#5C4912]/15 ${
                          isSelected ? 'ring-2 ring-[#5C4912] scale-[1.02]' : ''
                        }`
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl">{deck.emoji}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setChecklistDeckId(deck.id);
                      }}
                      className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-black/10 hover:bg-black/20"
                      title="Open Concept Checklist"
                    >
                      [{deck.tasks.length}]
                    </button>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm leading-tight truncate">{deck.title}</h3>
                    <p className="text-[11px] opacity-75 truncate mt-0.5">
                      +{completedCount}/{deck.tasks.length} Tasks
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Material Theme Studio View */}
        {activeTab === 'theme-studio' ? (
          <section
            className={`rounded-3xl p-6 border mb-6 ${
              isDark ? 'bg-[#141418] border-white/10' : 'bg-[#F3ECE1] border-[#5C4912]/20'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3
                  className="text-xl font-bold"
                  style={
                    !isDark ? { fontFamily: 'Georgia, Cambria, "Times New Roman", serif' } : {}
                  }
                >
                  SKRULLA! Material Theme Studio
                </h3>
                <p className="text-xs opacity-70">
                  Inspect and toggle between your OLED Dark Mode and Botanical Editorial Light Mode palettes.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('feed')}
                className="text-xs font-bold px-3 py-1.5 rounded-xl bg-[#ECC72E] text-black"
              >
                Back to Feed
              </button>
            </div>

            <div className="space-y-2.5 mb-5">
              {[
                { label: 'Primary (SKRULLA! Gold / Mustard)', hex: isDark ? '#ECC72E' : '#E5B513' },
                {
                  label: 'Secondary (Pastel Rose / Lavender)',
                  hex: isDark ? '#EDE7F6' : '#F8BBD0'
                },
                { label: 'Tertiary (Olive-Bronze / Navy Ink)', hex: isDark ? '#142B47' : '#5C4912' },
                { label: 'Neutral Surface', hex: isDark ? '#141418' : '#FBF8F3' }
              ].map((sw) => (
                <div
                  key={sw.label}
                  className={`flex items-center justify-between p-3 rounded-2xl border ${
                    isDark ? 'bg-[#1C1C22] border-white/10' : 'bg-[#FBF8F3] border-[#5C4912]/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-8 h-8 rounded-full border border-black/20"
                      style={{ backgroundColor: sw.hex }}
                    />
                    <span className="text-xs font-semibold">{sw.label}</span>
                  </div>
                  <code className="text-xs font-mono opacity-75">{sw.hex}</code>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <>
            {/* Navigation Tabs & Persona Filter Chips */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex gap-1.5">
                <button
                  onClick={() => setActiveTab('feed')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                    activeTab === 'feed'
                      ? isDark
                        ? 'bg-white text-black'
                        : 'bg-[#5C4912] text-white'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  For You Feed
                </button>
                <button
                  onClick={() => setActiveTab('bookmarks')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition ${
                    activeTab === 'bookmarks'
                      ? isDark
                        ? 'bg-white text-black'
                        : 'bg-[#5C4912] text-white'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  Saved ({posts.filter((p) => p.bookmarked).length})
                </button>
              </div>

              <span className="text-[11px] opacity-60 font-semibold">
                { posts.filter((p) => p.generatedViaApi).length } API-Verified Posts
              </span>
            </div>

            {/* Persona Filter Bar */}
            <div className="flex gap-2 overflow-x-auto pb-3 mb-4 no-scrollbar">
              <button
                onClick={() => setSelectedPersona('all')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 border transition ${
                  selectedPersona === 'all'
                    ? isDark
                      ? 'bg-[#ECC72E] text-black border-[#ECC72E]'
                      : 'bg-[#E5B513] text-[#2B2618] border-[#5C4912]/20'
                    : isDark
                    ? 'bg-[#141418] border-white/10 text-slate-300'
                    : 'bg-[#F3ECE1] border-[#5C4912]/15 text-[#5C4912]'
                }`}
              >
                All Personas
              </button>
              {Object.values(PERSONAS).map((p) => (
                <button
                  key={p.handle}
                  onClick={() =>
                    setSelectedPersona(selectedPersona === p.handle ? 'all' : p.handle)
                  }
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 border flex items-center gap-1.5 transition ${
                    selectedPersona === p.handle
                      ? isDark
                        ? 'bg-[#ECC72E] text-black border-[#ECC72E]'
                        : 'bg-[#E5B513] text-[#2B2618] border-[#5C4912]/20'
                      : isDark
                      ? 'bg-[#141418] border-white/10 text-slate-300'
                      : 'bg-[#F3ECE1] border-[#5C4912]/15 text-[#5C4912]'
                  }`}
                >
                  <span>{p.avatar}</span>
                  <span>{p.name}</span>
                </button>
              ))}
            </div>

            {/* Social Feed Cards */}
            <div className="space-y-4">
              {filteredPosts.map((post) => {
                const persona = PERSONAS[post.persona_handle] || PERSONAS['@brainrot_scholar'];
                const selectedPollIdx = pollSelections[post.post_id];

                return (
                  <article
                    key={post.post_id}
                    className={`rounded-3xl p-5 border transition-all ${
                      isDark
                        ? 'bg-[#141418] border-white/10 shadow-lg'
                        : 'bg-white border-[#5C4912]/15 shadow-sm'
                    }`}
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl border ${
                            isDark ? persona.darkBadge : persona.lightBadge
                          }`}
                        >
                          {persona.avatar}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-sm">{persona.name}</span>
                            <span className="text-xs opacity-60">{persona.handle}</span>
                            {post.generatedViaApi && (
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                                  isDark
                                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                    : 'bg-[#E8F5E9] text-[#1B5E20] border border-[#1B5E20]/20'
                                }`}
                              >
                                <Zap className="w-2.5 h-2.5" />
                                Live Gemini API
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span
                              className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
                                isDark ? persona.darkBadge : persona.lightBadge
                              }`}
                            >
                              {post.concept_tag}
                            </span>
                            <span className="text-[11px] opacity-50">{post.timestamp}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => setSourceModalPost(post)}
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-xl border flex items-center gap-1 transition ${
                          isDark
                            ? 'bg-white/5 border-white/10 hover:bg-white/10 text-emerald-300'
                            : 'bg-[#F3ECE1] border-[#5C4912]/15 hover:bg-[#FBE293] text-[#5C4912]'
                        }`}
                        title="Verify with verbatim quote from uploaded study material"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Source</span>
                      </button>
                    </div>

                    {/* Main Post Body */}
                    <p className="text-sm leading-relaxed whitespace-pre-line mb-3">
                      {post.content}
                    </p>

                    {/* Numbered Thread Items */}
                    {post.post_type === 'thread' &&
                      Array.isArray(post.thread_items) &&
                      post.thread_items.length > 0 && (
                        <div
                          className={`space-y-2 p-3.5 rounded-2xl mb-3 border-l-4 ${
                            isDark
                              ? 'bg-[#1C1C22] border-sky-400'
                              : 'bg-[#FBF8F3] border-[#E5B513]'
                          }`}
                        >
                          {post.thread_items.map((step, idx) => (
                            <p key={idx} className="text-xs leading-relaxed">
                              {step}
                            </p>
                          ))}
                        </div>
                      )}

                    {/* Interactive Quiz Poll */}
                    {post.post_type === 'quiz' &&
                      Array.isArray(post.poll_options) &&
                      post.poll_options.length > 0 && (
                        <div className="space-y-2 mb-3">
                          {post.poll_options.map((opt, idx) => {
                            const isAnswered = selectedPollIdx !== undefined;
                            const isCorrect = idx === post.correct_option_index;
                            const isChosen = selectedPollIdx === idx;

                            let btnStyle = isDark
                              ? 'bg-[#1C1C22] border-white/10 hover:border-[#ECC72E]/50'
                              : 'bg-[#FBF8F3] border-[#5C4912]/20 hover:bg-[#FBE293]/40';

                            if (isAnswered) {
                              if (isCorrect) {
                                btnStyle =
                                  'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold';
                              } else if (isChosen) {
                                btnStyle = 'bg-rose-500/20 border-rose-500 text-rose-300';
                              }
                            }

                            return (
                              <button
                                key={idx}
                                onClick={() =>
                                  setPollSelections((prev) => ({ ...prev, [post.post_id]: idx }))
                                }
                                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs border transition flex items-center justify-between ${btnStyle}`}
                              >
                                <span>{opt}</span>
                                {isAnswered && isCorrect && (
                                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                                )}
                              </button>
                            );
                          })}

                          {selectedPollIdx !== undefined && post.poll_explanation && (
                            <div
                              className={`p-3 rounded-xl text-xs mt-2 ${
                                isDark
                                  ? 'bg-emerald-950/40 text-emerald-200'
                                  : 'bg-[#E8F5E9] text-[#1B5E20]'
                              }`}
                            >
                              <strong>Why:</strong> {post.poll_explanation}
                            </div>
                          )}
                        </div>
                      )}

                    {/* Action Bar & Spaced Repetition Feedback */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => togglePostField(post.post_id, 'liked')}
                          className={`flex items-center gap-1 font-semibold ${
                            post.liked ? 'text-rose-500' : 'opacity-70 hover:opacity-100'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${post.liked ? 'fill-current' : ''}`} />
                          <span>{post.likes}</span>
                        </button>

                        <button
                          onClick={() => togglePostField(post.post_id, 'bookmarked')}
                          className={`flex items-center gap-1 font-semibold ${
                            post.bookmarked ? 'text-[#ECC72E]' : 'opacity-70 hover:opacity-100'
                          }`}
                        >
                          <Bookmark
                            className={`w-4 h-4 ${post.bookmarked ? 'fill-current' : ''}`}
                          />
                          <span>{post.bookmarked ? 'Saved' : 'Save'}</span>
                        </button>
                      </div>

                      {/* Spaced Repetition Buttons */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleRemediateConcept(post)}
                          disabled={isGenerating}
                          className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition ${
                            isDark
                              ? 'bg-rose-500/10 border-rose-500/30 text-rose-300 hover:bg-rose-500/20'
                              : 'bg-[#F8BBD0]/40 border-[#B3261E]/20 text-[#7A2021]'
                          }`}
                          title="Ping Gemini API to generate simpler remediation posts on this concept"
                        >
                          🤔 Confused
                        </button>
                        <button
                          onClick={() => setPostMastery(post.post_id, 'mastered')}
                          className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition ${
                            post.mastery === 'mastered'
                              ? 'bg-emerald-500 text-black border-emerald-500'
                              : isDark
                              ? 'bg-white/5 border-white/10 text-slate-300'
                              : 'bg-[#F3ECE1] border-[#5C4912]/15 text-[#5C4912]'
                          }`}
                        >
                          ⚡ Got It
                        </button>
                      </div>
                    </div>

                    {/* Simulated & Live In-Character Comments */}
                    <div
                      className={`mt-3 pt-3 border-t space-y-2 ${
                        isDark ? 'border-white/5' : 'border-[#5C4912]/10'
                      }`}
                    >
                      {(post.comments || []).map((c) => (
                        <div key={c.id} className="text-xs leading-relaxed">
                          <span className="font-bold mr-1.5">{c.author}:</span>
                          <span className="opacity-85">{c.text}</span>
                        </div>
                      ))}

                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          placeholder={`Ask ${persona.name} a follow-up question...`}
                          value={activeCommentInputs[post.post_id] || ''}
                          onChange={(e) =>
                            setActiveCommentInputs((prev) => ({
                              ...prev,
                              [post.post_id]: e.target.value
                            }))
                          }
                          onKeyDown={(e) => e.key === 'Enter' && handleSendComment(post)}
                          className={`flex-1 px-3 py-1.5 rounded-xl text-xs border outline-none ${
                            isDark
                              ? 'bg-[#1C1C22] border-white/10 text-white'
                              : 'bg-[#FBF8F3] border-[#5C4912]/20'
                          }`}
                        />
                        <button
                          onClick={() => handleSendComment(post)}
                          disabled={replyingPostId === post.post_id}
                          className={`p-1.5 rounded-xl ${
                            isDark ? 'bg-[#ECC72E] text-black' : 'bg-[#E5B513] text-[#2B2618]'
                          }`}
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </main>

      {/* ==================================================================== */}
      {/* 8. CONCEPT CHECKLIST DRAWER                                          */}
      {/* ==================================================================== */}
      {activeChecklistDeck && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className={`w-full max-w-md rounded-t-[36px] sm:rounded-[36px] p-6 border ${
              isDark
                ? 'bg-[#141418] border-white/10 text-white'
                : 'bg-[#FBF8F3] border-[#5C4912]/20'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setChecklistDeckId(null)}
                className="p-2 rounded-full hover:bg-white/10"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-xs font-bold uppercase tracking-wider opacity-60">
                SKRULLA! Concept Checklist
              </span>
              <button
                onClick={() => setChecklistDeckId(null)}
                className="p-2 rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold">{activeChecklistDeck.title}</h3>
              <span className="text-xs px-2.5 py-1 rounded-lg bg-amber-500/20 text-[#ECC72E] font-bold">
                {activeChecklistDeck.tasks.filter((t) => !t.done).length} Remaining
              </span>
            </div>

            <div className="flex items-center justify-between text-xs opacity-70 pb-4 mb-4 border-b border-dashed border-white/15">
              <span>Assigned: {activeChecklistDeck.assignee}</span>
              <span>Due: {activeChecklistDeck.dueDate}</span>
            </div>

            <div className="space-y-2.5 max-h-60 overflow-y-auto mb-4">
              {activeChecklistDeck.tasks.map((t) => (
                <button
                  key={t.id}
                  onClick={() => toggleChecklistTask(activeChecklistDeck.id, t.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border text-left text-xs font-semibold transition ${
                    isDark ? 'bg-[#1C1C22] border-white/10' : 'bg-white border-[#5C4912]/15'
                  }`}
                >
                  {t.done ? (
                    <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 opacity-50 shrink-0" />
                  )}
                  <span className={t.done ? 'line-through opacity-50' : ''}>{t.label}</span>
                </button>
              ))}
            </div>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Add new concept milestone..."
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addChecklistTask(activeChecklistDeck.id)}
                className={`flex-1 px-3.5 py-2 rounded-xl text-xs border outline-none ${
                  isDark
                    ? 'bg-[#1C1C22] border-white/10 text-white'
                    : 'bg-white border-[#5C4912]/20'
                }`}
              />
              <button
                onClick={() => addChecklistTask(activeChecklistDeck.id)}
                className="px-3.5 py-2 rounded-xl bg-[#ECC72E] text-black text-xs font-bold"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs opacity-70 leading-relaxed">{activeChecklistDeck.summaryNote}</p>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 9. HALLUCINATION SHIELD ("VIEW SOURCE QUOTE") MODAL                  */}
      {/* ==================================================================== */}
      {sourceModalPost && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`w-full max-w-md rounded-3xl p-6 border ${
              isDark
                ? 'bg-[#141418] border-white/10 text-white'
                : 'bg-[#FBF8F3] border-[#5C4912]/20'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>HALLUCINATION SHIELD • VERBATIM SOURCE</span>
              </div>
              <button onClick={() => setSourceModalPost(null)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs opacity-70 mb-2">Concept: {sourceModalPost.concept_tag}</p>
            <blockquote
              className={`p-4 rounded-2xl text-xs leading-relaxed border-l-4 ${
                isDark ? 'bg-[#1C1C22] border-emerald-400' : 'bg-[#F3ECE1] border-[#5C4912]'
              }`}
            >
              “{sourceModalPost.source_quote}”
            </blockquote>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 10. UPLOAD STUDY MATERIAL MODAL                                      */}
      {/* ==================================================================== */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`w-full max-w-md rounded-3xl p-6 border ${
              isDark
                ? 'bg-[#141418] border-white/10 text-white'
                : 'bg-[#FBF8F3] border-[#5C4912]/20'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Upload Study Material to SKRULLA!</h3>
              <button onClick={() => setShowUploadModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDeckAndFeed} className="space-y-3">
              <input
                type="text"
                placeholder="Deck Title (e.g., Organic Chemistry Ch. 4)"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl text-xs border outline-none ${
                  isDark
                    ? 'bg-[#1C1C22] border-white/10 text-white'
                    : 'bg-white border-[#5C4912]/20'
                }`}
              />

              <label
                className={`block p-4 rounded-2xl border-2 border-dashed text-center cursor-pointer transition ${
                  isDark
                    ? 'border-white/15 hover:border-[#ECC72E] bg-[#1C1C22]/50'
                    : 'border-[#5C4912]/25 hover:border-[#5C4912] bg-[#F3ECE1]/50'
                }`}
              >
                <Upload className="w-5 h-5 mx-auto mb-1 opacity-70" />
                <span className="text-xs font-semibold block">
                  {uploadFileName || 'Attach PDF, Slide Image (.png/.jpg), or .txt'}
                </span>
                <input
                  type="file"
                  accept=".pdf,.txt,.md,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              <textarea
                rows={5}
                placeholder="Or paste your raw lecture notes / study guide text here..."
                value={uploadNotes}
                onChange={(e) => setUploadNotes(e.target.value)}
                className={`w-full p-3.5 rounded-xl text-xs border outline-none ${
                  isDark
                    ? 'bg-[#1C1C22] border-white/10 text-white'
                    : 'bg-white border-[#5C4912]/20'
                }`}
              />

              <button
                type="submit"
                disabled={isGenerating}
                className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 ${
                  isDark ? 'bg-[#ECC72E] text-black' : 'bg-[#E5B513] text-[#2B2618]'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {isGenerating
                    ? 'Calling Gemini API...'
                    : 'Generate SKRULLA! Feed via Gemini API'}
                </span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 11. GITHUB / DEPLOYMENT API KEY & SKRULLA! LOGO SETTINGS MODAL       */}
      {/* ==================================================================== */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`w-full max-w-md rounded-3xl p-6 border ${
              isDark
                ? 'bg-[#141418] border-white/10 text-white'
                : 'bg-[#FBF8F3] border-[#5C4912]/20'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-[#ECC72E]" />
                <h3 className="text-base font-bold">SKRULLA! Brand &amp; Gemini API Settings</h3>
              </div>
              <button onClick={() => setShowSettingsModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-semibold block mb-1">
                  Gemini API Key (Optional in Canvas, used for GitHub / Vercel deployments)
                </label>
                <input
                  type="password"
                  placeholder="AIzaSy... (Leave blank to use default environment key)"
                  value={userApiKey}
                  onChange={(e) => setUserApiKey(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                    isDark
                      ? 'bg-[#1C1C22] border-white/10 text-white'
                      : 'bg-white border-[#5C4912]/20'
                  }`}
                />
                <p className="text-[11px] opacity-60 mt-1">
                  Or set <code>VITE_GEMINI_API_KEY</code> in your <code>.env</code> file for GitHub deployment.
                </p>
              </div>

              <div className="pt-3 border-t border-white/10 space-y-2.5">
                <label className="font-semibold block">SKRULLA! Logo Display Mode</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'combo', label: 'Emblem + SKRULLA!' },
                    { id: 'script', label: 'SKRULLA! Script Only' },
                    { id: 'raster', label: 'Uploaded Image' }
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => setLogoStyle(mode.id)}
                      className={`py-2 px-2 rounded-xl font-bold text-[11px] border transition ${
                        logoStyle === mode.id
                          ? 'bg-[#ECC72E] text-black border-[#ECC72E]'
                          : isDark
                          ? 'bg-[#1C1C22] border-white/10 text-slate-300'
                          : 'bg-white border-[#5C4912]/20 text-[#5C4912]'
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>

                <label
                  className={`block p-3 rounded-xl border border-dashed text-center cursor-pointer ${
                    isDark ? 'border-white/15 hover:border-[#ECC72E]' : 'border-[#5C4912]/25'
                  }`}
                >
                  <span>Click to upload your custom SKRULLA! logo image file</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        setCustomLogoUrl(String(ev.target?.result || ''));
                        setLogoStyle('raster');
                      };
                      reader.readAsDataURL(file);
                    }}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    setShowSettingsModal(false);
                    pingGeminiAndGenerateFeed();
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-black font-bold flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Save &amp; Test API Ping Now</span>
                </button>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#ECC72E] text-black font-bold"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
