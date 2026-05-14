// ===============================
// CONFIGURACIÓN EDITABLE
// ===============================
// Cambia estas respuestas o textos de forma sencilla.
const SECRET_DIRECTION = {
  avenue: '_________',
  hour: '______'
};

const RIDDLES = [
  {
    phase: 1,
    text: `Soy pequeño y veloz,\nllevo historias al amanecer,\ny aunque tengo alas,\nmi lugar favorito era tu ventana.`,
    answer: 'colibri'
  },
  {
    phase: 1,
    text: `No era el sol quien iluminaba mis mañanas,\neras tú…\n¿Qué sentimiento hacía eterno cada encuentro?`,
    answer: 'amor'
  },
  {
    phase: 1,
    text: `Cuando me alejé de lo verdadero,\nseguí luces vacías y efímeras.\n¿Qué me hizo perder al colibrí?`,
    answer: 'ego'
  },
  {
    phase: 1,
    text: `Tus historias rompieron los límites\nde mi mente y mi corazón.\n¿Qué me enseñaste a hacer?`,
    answer: 'volar'
  },
  {
    phase: 1,
    text: `Aunque el colibrí se fue,\nalgo suyo aún vive dentro de mí.\n¿Qué permanece?`,
    answer: 'recuerdos'
  },
  {
    phase: 2,
    text: `No importa cuántas veces el tiempo pase,\nmi corazón siempre vuelve a ti.\n¿Qué nunca cambió?`,
    answer: 'amor'
  },
  {
    phase: 2,
    text: `Aunque el miedo me hizo perderte,\njamás logró borrar esto de mí.`,
    answer: 'sentimientos'
  },
  {
    phase: 2,
    text: `Fuiste el refugio de mis pensamientos\ny el hogar de mi alma.`,
    answer: 'corazon'
  },
  {
    phase: 2,
    text: `No todas las historias terminan cuando alguien se va.\nAlgunas esperan ser retomadas.`,
    answer: 'destino'
  },
  {
    phase: 2,
    text: `Si un colibrí regresa a tu ventana,\nquizás nunca dejó de buscarte.`,
    answer: 'volver'
  }
];

const romanticMistakes = [
  'Casi... intenta de nuevo con el corazón.',
  'El colibrí susurra que estás muy cerca.',
  'Respira... recuerda lo que sentías en esa historia.',
  'Bonito intento, vuelve a escuchar la memoria.'
];

const state = {
  current: 0,
  introDone: false,
  finalDone: false
};

const els = {
  introTyping: document.getElementById('intro-typing'),
  startBtn: document.getElementById('start-journey'),
  submitBtn: document.getElementById('submit-answer'),
  answerInput: document.getElementById('riddle-answer'),
  riddleText: document.getElementById('riddle-text'),
  feedback: document.getElementById('feedback'),
  progressBar: document.getElementById('progress-bar'),
  riddleCounter: document.getElementById('riddle-counter'),
  phaseTitle: document.getElementById('phase-title'),
  continuePhase2: document.getElementById('continue-phase2'),
  restartStory: document.getElementById('restart-story'),
  resetProgress: document.getElementById('reset-progress'),
  finalPhrase: document.getElementById('final-phrase'),
  finalThanks: document.getElementById('final-thanks'),
  secretAvenue: document.getElementById('secret-avenue'),
  secretHour: document.getElementById('secret-hour'),
  musicToggle: document.getElementById('music-toggle'),
  ambientMusic: document.getElementById('ambient-music'),
  successSound: document.getElementById('success-sound')
};

const screens = {
  intro: document.getElementById('screen-intro'),
  game: document.getElementById('screen-game'),
  phase1Reveal: document.getElementById('screen-phase1-reveal'),
  final: document.getElementById('screen-final')
};

function normalizeText(value) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function saveState() {
  localStorage.setItem('colibri_progress', JSON.stringify(state));
}

function loadState() {
  const raw = localStorage.getItem('colibri_progress');
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw);
    Object.assign(state, parsed);
  } catch {
    localStorage.removeItem('colibri_progress');
  }
}

function showScreen(target) {
  Object.values(screens).forEach((screen) => {
    screen.classList.add('d-none');
    screen.classList.remove('active-screen');
  });
  target.classList.remove('d-none');
  requestAnimationFrame(() => target.classList.add('active-screen'));
}

function renderRiddle() {
  const riddle = RIDDLES[state.current];
  if (!riddle) return;

  els.phaseTitle.textContent = riddle.phase === 1
    ? 'Fase 1 — Los 5 acertijos del colibrí'
    : 'Fase 2 — Los 5 acertijos del corazón';

  els.riddleCounter.textContent = `Acertijo ${state.current + 1}/${RIDDLES.length}`;
  els.riddleText.textContent = riddle.text;
  els.answerInput.value = '';
  els.feedback.textContent = '';
  els.progressBar.style.width = `${(state.current / RIDDLES.length) * 100}%`;
}

function typeWriter(element, text, speed = 45, cb) {
  element.textContent = '';
  let i = 0;
  const timer = setInterval(() => {
    element.textContent += text[i] || '';
    i += 1;
    if (i > text.length) {
      clearInterval(timer);
      if (cb) cb();
    }
  }, speed);
}

function playSuccess() {
  els.successSound.currentTime = 0;
  els.successSound.play().catch(() => {});
}

function handleAnswer() {
  const currentRiddle = RIDDLES[state.current];
  const answer = normalizeText(els.answerInput.value);
  if (!answer) {
    els.feedback.textContent = 'Escribe algo bonito antes de continuar.';
    return;
  }

  if (answer === normalizeText(currentRiddle.answer)) {
    playSuccess();
    els.feedback.textContent = '✨ Correcto... el colibrí sonríe.';
    state.current += 1;
    saveState();

    setTimeout(() => {
      if (state.current === 5) {
        showPhase1Reveal();
      } else if (state.current >= RIDDLES.length) {
        showFinal();
      } else {
        showScreen(screens.game);
        renderRiddle();
      }
    }, 700);
  } else {
    const msg = romanticMistakes[Math.floor(Math.random() * romanticMistakes.length)];
    els.feedback.textContent = msg;
  }
}

function showPhase1Reveal() {
  els.progressBar.style.width = '50%';
  showScreen(screens.phase1Reveal);
}

function showFinal() {
  showScreen(screens.final);
  els.progressBar.style.width = '100%';
  if (!state.finalDone) {
    typeWriter(els.finalPhrase, 'Siempre te he amado.', 95, () => {
      typeWriter(els.finalThanks, 'Gracias por volver a escuchar al colibrí.', 45);
    });
    state.finalDone = true;
    saveState();
  }
}

function setupIntro() {
  const introText = 'Había un colibrí que todas las mañanas llegaba a mi ventana a contarme historias fantásticas…';
  typeWriter(els.introTyping, introText, 42, () => {
    state.introDone = true;
    saveState();
  });
}

function setupMusic() {
  let playing = false;
  els.musicToggle.addEventListener('click', async () => {
    if (!playing) {
      await els.ambientMusic.play().catch(() => {});
      playing = true;
      els.musicToggle.innerHTML = '<i class="bi bi-pause-circle"></i> Música';
    } else {
      els.ambientMusic.pause();
      playing = false;
      els.musicToggle.innerHTML = '<i class="bi bi-play-circle"></i> Música';
    }
  });
}

function setupParticles() {
  const canvas = document.getElementById('particles-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createParticles() {
    particles = Array.from({ length: Math.min(80, Math.floor(window.innerWidth / 20)) }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2 + 0.4,
      v: Math.random() * 0.4 + 0.15,
      a: Math.random() * 0.5 + 0.2
    }));
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of particles) {
      p.y -= p.v;
      if (p.y < -10) p.y = canvas.height + 10;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${p.a})`;
      ctx.fill();
    }
    requestAnimationFrame(animate);
  }

  resize();
  createParticles();
  animate();
  window.addEventListener('resize', () => {
    resize();
    createParticles();
  });
}

function init() {
  loadState();
  els.secretAvenue.textContent = SECRET_DIRECTION.avenue;
  els.secretHour.textContent = SECRET_DIRECTION.hour;

  setupParticles();
  setupMusic();

  els.startBtn.addEventListener('click', () => {
    showScreen(screens.game);
    renderRiddle();
  });
  els.submitBtn.addEventListener('click', handleAnswer);
  els.answerInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleAnswer();
  });

  els.continuePhase2.addEventListener('click', () => {
    showScreen(screens.game);
    renderRiddle();
  });

  els.restartStory.addEventListener('click', () => {
    localStorage.removeItem('colibri_progress');
    location.reload();
  });

  els.resetProgress.addEventListener('click', () => {
    localStorage.removeItem('colibri_progress');
    state.current = 0;
    state.finalDone = false;
    showScreen(screens.intro);
    setupIntro();
  });

  if (state.finalDone || state.current >= RIDDLES.length) {
    showFinal();
  } else if (state.current >= 5) {
    showPhase1Reveal();
  } else if (state.current > 0) {
    showScreen(screens.game);
    renderRiddle();
  } else {
    showScreen(screens.intro);
    setupIntro();
  }
}

init();
