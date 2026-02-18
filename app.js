/* ===========================
   OurApp - Core App Logic
   Uses localStorage to simulate pairing backend
   =========================== */

const App = {

  // ─── Storage Keys ───────────────────────────────────────────
  KEYS: {
    USER:    'ourapp_user',
    PAIR:    'ourapp_pair',
    PARTNER: 'ourapp_partner',
    CODES:   'ourapp_codes',    // registry of {code: userData}
    ANSWERS: 'ourapp_answers',
    STREAK:  'ourapp_streak',
    JOINED:  'ourapp_joined',
  },

  // ─── Helpers ────────────────────────────────────────────────
  save(key, val) { localStorage.setItem(key, JSON.stringify(val)); },
  load(key)      { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } },
  clear()        { Object.values(this.KEYS).forEach(k => localStorage.removeItem(k)); },

  // ─── User ───────────────────────────────────────────────────
  getUser()        { return this.load(this.KEYS.USER); },
  saveUser(u)      { this.save(this.KEYS.USER, u); },
  getPair()        { return this.load(this.KEYS.PAIR); },
  getPartner()     { return this.load(this.KEYS.PARTNER); },
  isPaired()       { return !!this.load(this.KEYS.PARTNER); },

  // ─── Code Registry (simulates a shared DB via localStorage) ─
  getCodeRegistry() { return this.load(this.KEYS.CODES) || {}; },
  registerCode(code, user) {
    const reg = this.getCodeRegistry();
    reg[code] = { ...user, pairCode: code, createdAt: Date.now() };
    this.save(this.KEYS.CODES, reg);
  },
  lookupCode(code) {
    const reg = this.getCodeRegistry();
    return reg[code] || null;
  },
  removeCode(code) {
    const reg = this.getCodeRegistry();
    delete reg[code];
    this.save(this.KEYS.CODES, reg);
  },

  // ─── Generate pairing code ──────────────────────────────────
  generateCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
  },

  // ─── Daily Questions ────────────────────────────────────────
  QUESTIONS: [
    "What's one thing I did recently that made you smile?",
    "If we could go anywhere tomorrow, where would you want to go?",
    "What's your favorite memory of us together?",
    "What's something new you'd love to try with me?",
    "What song makes you think of me?",
    "What's one thing you appreciate about our relationship?",
    "What's a dream you haven't told me yet?",
    "When do you feel most loved by me?",
    "What's something small I do that means a lot to you?",
    "What's a goal you'd love us to achieve together?",
    "What's your love language today?",
    "What's one thing you wish we did more often?",
    "Describe our relationship in three words.",
    "What's your happiest moment from this week?",
    "What's one way I can be a better partner?",
    "If you could relive one day with me, which would it be?",
    "What's something you've always wanted to tell me?",
    "What's the most romantic thing I've ever done for you?",
    "What made you fall in love with me?",
    "What's one thing we should do before the end of the year?",
  ],

  getDailyQuestion() {
    const dayIndex = Math.floor(Date.now() / 86400000) % this.QUESTIONS.length;
    return this.QUESTIONS[dayIndex];
  },

  // ─── Answers ────────────────────────────────────────────────
  saveAnswer(answer) {
    const today = new Date().toDateString();
    const answers = this.load(this.KEYS.ANSWERS) || {};
    answers[today] = { text: answer, ts: Date.now() };
    this.save(this.KEYS.ANSWERS, answers);
    this.markStreakDay();
  },
  getAnswers() { return this.load(this.KEYS.ANSWERS) || {}; },
  getTodayAnswer() {
    const today = new Date().toDateString();
    const answers = this.getAnswers();
    return answers[today] || null;
  },

  // ─── Streak ─────────────────────────────────────────────────
  markStreakDay() {
    const streak = this.load(this.KEYS.STREAK) || [];
    const today = new Date().toDateString();
    if (!streak.includes(today)) streak.push(today);
    this.save(this.KEYS.STREAK, streak);
  },
  getStreakDays() { return this.load(this.KEYS.STREAK) || []; },
  getCurrentStreak() {
    const days = this.getStreakDays();
    if (!days.length) return 0;
    let streak = 0;
    let d = new Date();
    for (let i = 0; i < 365; i++) {
      if (days.includes(d.toDateString())) { streak++; d.setDate(d.getDate() - 1); }
      else break;
    }
    return streak;
  },

  // ─── Joined date ────────────────────────────────────────────
  getJoinedDays() {
    const joined = this.load(this.KEYS.JOINED);
    if (!joined) return 0;
    return Math.floor((Date.now() - joined) / 86400000);
  },

  // ─── Guard: require login ───────────────────────────────────
  requireUser(redirect = 'signup.html') {
    if (!this.getUser()) { window.location.href = redirect; return false; }
    return true;
  },

  // ─── Guard: require pairing ─────────────────────────────────
  requirePaired(redirect = 'pair.html') {
    if (!this.isPaired()) { window.location.href = redirect; return false; }
    return true;
  },

  // ─── Toast helper ───────────────────────────────────────────
  toast(msg, emoji = '💜', duration = 3200) {
    let el = document.getElementById('toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'toast';
      el.className = 'toast';
      document.body.appendChild(el);
    }
    el.innerHTML = `<span>${emoji}</span><span>${msg}</span>`;
    el.classList.add('show');
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove('show'), duration);
  },

  // ─── Logout ─────────────────────────────────────────────────
  logout() {
    // Remove own pairing code from registry
    const pair = this.getPair();
    if (pair) this.removeCode(pair.code);
    this.clear();
    window.location.href = 'index.html';
  },
};

// ─── Page-specific initializers ─────────────────────────────────────────────

// NAV scroll effect (homepage)
document.addEventListener('DOMContentLoaded', () => {
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
    });
  }
});

/* ========================
   SIGNUP PAGE
   ======================== */
function initSignup() {
  const form = document.getElementById('signupForm');
  if (!form) return;

  // If already logged in and paired → dashboard
  if (App.getUser() && App.isPaired()) {
    window.location.href = 'dashboard.html';
    return;
  }
  // If logged in but not paired → pair
  if (App.getUser()) {
    window.location.href = 'pair.html';
    return;
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    const name  = form.name.value.trim();
    const email = form.email.value.trim();
    const emoji = form.emoji.value;

    if (!name || !email) return showFormError('signupError', 'Please fill in all fields.');

    // Clear any stale pair/partner data from a previous session
    // (keeps the code registry intact so existing codes still work)
    localStorage.removeItem(App.KEYS.PAIR);
    localStorage.removeItem(App.KEYS.PARTNER);
    localStorage.removeItem(App.KEYS.JOINED);
    localStorage.removeItem(App.KEYS.ANSWERS);
    localStorage.removeItem(App.KEYS.STREAK);

    const user = { name, email, emoji, id: Date.now().toString(36) };
    App.saveUser(user);
    App.toast(`Welcome, ${name}! 🎉`);
    setTimeout(() => window.location.href = 'pair.html', 700);
  });
}

/* ========================
   PAIR PAGE
   ======================== */
function initPair() {
  if (!App.requireUser()) return;
  if (App.isPaired()) { window.location.href = 'dashboard.html'; return; }

  const user = App.getUser();
  document.querySelectorAll('.user-name').forEach(el => el.textContent = user.name);

  // Generate & display code
  let pairData = App.getPair();
  if (!pairData) {
    const code = App.generateCode();
    pairData = { code, createdAt: Date.now() };
    App.save(App.KEYS.PAIR, pairData);
    App.registerCode(code, user);
  }

  displayCode(pairData.code);

  // Copy button
  const copyBtn = document.getElementById('copyBtn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(pairData.code).then(() => {
        App.toast('Code copied to clipboard!', '📋');
      }).catch(() => {
        App.toast('Code: ' + pairData.code, '🔑');
      });
    });
  }

  // Share button
  const shareBtn = document.getElementById('shareBtn');
  if (shareBtn) {
    shareBtn.addEventListener('click', () => {
      const msg = `Join me on OurApp! Use my code: ${pairData.code} 💜`;
      if (navigator.share) {
        navigator.share({ title: 'OurApp Pairing Code', text: msg });
      } else {
        navigator.clipboard.writeText(msg).then(() => App.toast('Message copied!', '📤'));
      }
    });
  }

  // Regen code
  const regenBtn = document.getElementById('regenBtn');
  if (regenBtn) {
    regenBtn.addEventListener('click', () => {
      App.removeCode(pairData.code);
      const code = App.generateCode();
      pairData = { code, createdAt: Date.now() };
      App.save(App.KEYS.PAIR, pairData);
      App.registerCode(code, user);
      displayCode(code);
      App.toast('New code generated!', '🔄');
    });
  }

  // Poll for partner joining (every 3s)
  const pollInterval = setInterval(() => {
    const reg = App.getCodeRegistry();
    const entry = reg[pairData.code];
    if (entry && entry.partner) {
      clearInterval(pollInterval);
      App.save(App.KEYS.PARTNER, entry.partner);
      App.save(App.KEYS.JOINED, Date.now());
      App.toast(`${entry.partner.name} joined! You're now paired! 💜`, '💜');
      setTimeout(() => window.location.href = 'dashboard.html', 1200);
    }
  }, 3000);
}

function displayCode(code) {
  const container = document.getElementById('codeDisplay');
  if (!container) return;
  container.innerHTML = '';
  code.split('').forEach((ch, i) => {
    const d = document.createElement('div');
    d.className = 'code-digit';
    d.textContent = ch;
    d.style.animationDelay = `${i * 80}ms`;
    d.classList.add('animate');
    container.appendChild(d);
  });
}

/* ========================
   JOIN PAGE
   ======================== */
function initJoin() {
  if (!App.requireUser()) return;
  if (App.isPaired()) { window.location.href = 'dashboard.html'; return; }

  const user = App.getUser();
  document.querySelectorAll('.user-name').forEach(el => el.textContent = user.name);

  const inputs = document.querySelectorAll('.code-input input');
  inputs.forEach((inp, idx) => {
    inp.addEventListener('input', e => {
      e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (e.target.value && idx < inputs.length - 1) inputs[idx + 1].focus();
      if (getCodeValue(inputs).length === 6) attemptJoin(inputs, user);
    });
    inp.addEventListener('keydown', e => {
      if (e.key === 'Backspace' && !e.target.value && idx > 0) inputs[idx - 1].focus();
    });
    inp.addEventListener('paste', e => {
      e.preventDefault();
      const text = (e.clipboardData || window.clipboardData).getData('text').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
      text.split('').forEach((ch, i) => { if (inputs[i]) inputs[i].value = ch; });
      if (text.length === 6) { inputs[5].focus(); attemptJoin(inputs, user); }
    });
  });

  const joinBtn = document.getElementById('joinBtn');
  if (joinBtn) {
    joinBtn.addEventListener('click', () => {
      if (getCodeValue(inputs).length < 6) return showFormError('joinError', 'Please enter the full 6-character code.');
      attemptJoin(inputs, user);
    });
  }
}

function getCodeValue(inputs) {
  return Array.from(inputs).map(i => i.value).join('').toUpperCase();
}

function attemptJoin(inputs, user) {
  const code = getCodeValue(inputs);
  const err  = document.getElementById('joinError');
  const suc  = document.getElementById('joinSuccess');

  if (err) err.style.display = 'none';
  if (suc) suc.style.display = 'none';

  const entry = App.lookupCode(code);

  if (!entry) {
    if (err) { err.textContent = '❌ Code not found. Double-check and try again.'; err.style.display = 'flex'; }
    return;
  }

  if (entry.id === user.id) {
    if (err) { err.textContent = '😅 That\'s your own code! Share it with your partner.'; err.style.display = 'flex'; }
    return;
  }

  // Pair them: write partner info into the code registry so the host detects it
  const reg = App.getCodeRegistry();
  reg[code] = { ...reg[code], partner: user };
  App.save(App.KEYS.CODES, reg);

  // Save partner locally too
  App.save(App.KEYS.PARTNER, entry);
  App.save(App.KEYS.JOINED, Date.now());

  if (suc) { suc.textContent = `💜 Paired with ${entry.name}! Redirecting to your dashboard…`; suc.style.display = 'flex'; }
  App.toast(`You're now paired with ${entry.name}! 🎉`, '💜');
  setTimeout(() => window.location.href = 'dashboard.html', 1500);
}

/* ========================
   DASHBOARD PAGE
   ======================== */
function initDashboard() {
  if (!App.requireUser()) return;
  if (!App.requirePaired()) return;

  const user    = App.getUser();
  const partner = App.getPartner();

  // Names
  document.getElementById('coupleNames').textContent = `${user.name} & ${partner.name}`;
  document.getElementById('userGreeting').textContent = `Hey, ${user.name}!`;
  const navAvatar = document.getElementById('navAvatar');
  if (navAvatar) navAvatar.textContent = user.emoji || '😊';

  // Stats
  document.getElementById('streakCount').textContent  = App.getCurrentStreak();
  document.getElementById('daysCount').textContent    = App.getJoinedDays();
  document.getElementById('answersCount').textContent = Object.keys(App.getAnswers()).length;

  // Daily question
  const q = App.getDailyQuestion();
  document.getElementById('dailyQuestion').textContent = q;

  // Saved answer
  const saved = App.getTodayAnswer();
  const area  = document.getElementById('answerArea');
  const saveBtn = document.getElementById('saveAnswerBtn');
  const savedMsg = document.getElementById('savedMsg');

  if (saved && area) {
    area.value = saved.text;
    if (savedMsg) savedMsg.style.display = 'flex';
    if (saveBtn)  saveBtn.textContent = '✓ Saved';
  }

  if (saveBtn && area) {
    saveBtn.addEventListener('click', () => {
      const ans = area.value.trim();
      if (!ans) { App.toast('Write something first!', '✏️'); return; }
      App.saveAnswer(ans);
      if (savedMsg) savedMsg.style.display = 'flex';
      saveBtn.textContent = '✓ Saved';
      App.toast('Answer saved! 💜');
      document.getElementById('streakCount').textContent = App.getCurrentStreak();
      document.getElementById('answersCount').textContent = Object.keys(App.getAnswers()).length;
    });
  }

  // Streak calendar (last 21 days)
  buildStreakCalendar();

  // Partner card
  const partnerEmoji = document.getElementById('partnerEmoji');
  const partnerName  = document.getElementById('partnerName');
  if (partnerEmoji) partnerEmoji.textContent = partner.emoji || '💜';
  if (partnerName)  partnerName.textContent  = partner.name;

  // Logout
  document.getElementById('logoutBtn')?.addEventListener('click', () => {
    if (confirm('Are you sure you want to log out and unpair?')) App.logout();
  });
}

function buildStreakCalendar() {
  const container = document.getElementById('streakCalendar');
  if (!container) return;
  const days  = App.getStreakDays();
  const today = new Date();
  container.innerHTML = '';
  for (let i = 20; i >= 0; i--) {
    const d   = new Date(today);
    d.setDate(today.getDate() - i);
    const div = document.createElement('div');
    div.className = 'streak-day';
    if (days.includes(d.toDateString())) div.classList.add('done');
    if (i === 0) div.classList.add('today');
    div.title = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    div.textContent = d.getDate();
    container.appendChild(div);
  }
}

// ─── Shared utility ──────────────────────────────────────────────────────────
function showFormError(id, msg) {
  const el = document.getElementById(id);
  if (el) { el.textContent = '❌ ' + msg; el.style.display = 'flex'; }
}
