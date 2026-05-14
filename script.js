// Configuración editable de direcciones finales.
const CONFIG = {
  phase1Address: { line1: 'Avenida __________', line2: '____ PM' },
  phase3Address: { line1: 'Café __________', line2: '____ PM' }
};

const appScene = document.getElementById('scene');
const ambient = document.getElementById('ambient-audio');
const success = document.getElementById('success-audio');
const hintAudio = document.getElementById('hint-audio');

const state = JSON.parse(localStorage.getItem('colibriState') || '{"phase":0,"step":0}');

const phases = [
  {
    name: 'ENCUÉNTRAME',
    riddles: [
      ['Soy pequeño y veloz, llevo historias al amanecer, y aunque tengo alas, mi lugar favorito era tu ventana.', 'colibri'],
      ['No era el sol quien iluminaba mis mañanas, eras tú… ¿Qué sentimiento hacía eterno cada encuentro?', 'amor'],
      ['Cuando me alejé de lo verdadero, seguí luces vacías y efímeras. ¿Qué me hizo perder al colibrí?', 'miedo'],
      ['Tus historias rompieron los límites de mi mente y mi corazón. ¿Qué me enseñaste a hacer?', 'volar'],
      ['Aunque el colibrí se fue, algo suyo aún vive dentro de mí. ¿Qué permanece?', 'recuerdos']
    ]
  },
  {
    name: 'LAS HISTORIAS QUE NUNCA TE CONTÉ',
    riddles: [
      ['¿Qué sentimiento hace que alguien siempre vuelva?', 'amor'],
      ['¿Qué guardan las personas incluso después de despedirse?', 'recuerdos'],
      ['¿Qué lugar puede sentirse como hogar sin ser una casa?', 'corazon'],
      ['¿Qué sigue existiendo aunque no podamos verlo?', 'conexion'],
      ['¿Qué jamás dejó de hacer el colibrí?', 'volver']
    ],
    story: [
      'El colibrí no entendía por qué el cielo se sentía vacío si aún seguía lleno de estrellas.',
      'Había conocido muchos jardines… pero ninguno donde quisiera quedarse.',
      'Hasta que encontró una ventana donde las mañanas se sentían distintas.',
      'Y aunque una vez se alejó, jamás dejó de regresar en silencio.',
      'Porque algunas almas, incluso rotas, siguen reconociéndose.'
    ]
  },
  {
    name: 'LA CONFESIÓN',
    riddles: [
      ['No importa cuánto intenté distraerme… siempre terminaba pensando en ti.', 'amor'],
      ['El lugar más bonito del mundo nunca fue un sitio… fue una persona.', 'tu'],
      ['Aunque pasó el tiempo, hay algo que jamás desapareció.', 'sentimientos'],
      ['El colibrí siempre supo dónde quería quedarse.', 'contigo'],
      ['¿Qué verdad escondió el colibrí todo este tiempo?', 'amarte']
    ]
  }
];

const hintsByPhase = [
  [
    'Sus alas son rápidas, pero siempre encontraba calma en tu ventana.',
    'No era el amanecer… era lo que sentías al verla.',
    'A veces no perdemos a alguien por falta de amor, sino por temor.',
    'El colibrí te enseñó a ir más allá de tus propios límites.',
    'Aunque alguien se vaya, ciertas cosas nunca abandonan el corazón.'
  ],
  [
    'Es lo único que siempre encuentra el camino de regreso.',
    'Viven incluso después de las despedidas.',
    'No tiene puertas, pero puede convertirse en hogar.',
    'No necesitas verla para sentir que sigue existiendo.',
    'El colibrí jamás dejó de intentarlo.'
  ],
  [
    'Era imposible dejar de pensar en ella por esto.',
    'El lugar más bonito no era un lugar.',
    'El tiempo no logró borrarlos.',
    'El colibrí finalmente entendió dónde quería quedarse.',
    'La verdad más difícil de ocultar.'
  ]
];

const starPositions = [
  ['9%','17%'],['84%','19%'],['12%','72%'],['79%','69%'],['48%','13%'],
  ['18%','26%'],['83%','49%'],['11%','58%'],['72%','22%'],['56%','77%'],
  ['15%','39%'],['76%','15%'],['18%','79%'],['86%','61%'],['63%','18%']
];

const normalize = (t) => t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim();
const save = () => localStorage.setItem('colibriState', JSON.stringify(state));

function typewriter(el, text, speed = 34) {
  return new Promise((resolve) => {
    el.textContent = '';
    let i = 0;
    const run = () => {
      if (i <= text.length) { el.textContent = text.slice(0, i++); setTimeout(run, speed); }
      else resolve();
    };
    run();
  });
}

function transition(renderFn) {
  appScene.classList.add('fade-out');
  setTimeout(() => {
    renderFn();
    appScene.classList.remove('fade-out');
    appScene.classList.add('fade-in');
  }, 550);
}

function renderIntro() {
  appScene.innerHTML = `<div class="glass-card text-center">
    <h1 class="title mb-3">COLIBRÍ</h1>
    <p id="intro-text" class="subtitle cursor"></p>
    <button id="start-btn" class="btn btn-cine mt-3 d-none">Comenzar el viaje</button>
  </div>`;
  typewriter(document.getElementById('intro-text'), 'Había un colibrí que todas las mañanas llegaba a mi ventana a contarme historias fantásticas…', 38)
    .then(() => document.getElementById('start-btn').classList.remove('d-none'));

  document.getElementById('start-btn').onclick = async () => {
    ambient.volume = 0.45;
    try { await ambient.play(); } catch (_) {}
    state.phase = 1; state.step = 0; save();
    transition(() => renderPhase());
  };
}

function renderPhase() {
  const phaseIndex = state.phase - 1;
  const phase = phases[phaseIndex];
  if (!phase) return renderIntro();

  if (state.step >= 5) return renderPhaseFinal(phaseIndex);
  const [prompt, answer] = phase.riddles[state.step];

  const hintText = hintsByPhase[phaseIndex][state.step];
  const starIndex = (phaseIndex * 5) + state.step;
  const [starLeft, starTop] = starPositions[starIndex];

  appScene.innerHTML = `<div class="glass-card position-relative">
    <p class="mb-1 text-uppercase small text-info-emphasis">Fase ${state.phase} — ${phase.name}</p>
    <h2 class="text-romantic">${prompt}</h2>
    <div class="progress bg-dark-subtle my-3" role="progressbar"><div class="progress-bar" style="width:${(state.step/5)*100}%"></div></div>
    <div class="input-group mt-3">
      <span class="input-group-text bg-transparent text-white"><i class="bi bi-feather"></i></span>
      <input id="answer" class="form-control riddle-input" placeholder="Escribe tu respuesta..." />
      <button id="check" class="btn btn-cine">Revelar</button>
    </div>
    <p id="msg" class="message mt-3"></p>
    ${phase.story ? '<div id="story" class="mt-3 text-light-emphasis"></div>' : ''}
    <button
      id="floating-star"
      class="floating-star glow-effect"
      type="button"
      aria-label="Mostrar pista romántica"
      style="left:${starLeft}; top:${starTop};"
    >
      ✨
      <span class="star-particles" aria-hidden="true"></span>
    </button>
    <div id="hint-popup" class="hint-popup" role="status" aria-live="polite">${hintText}</div>
  </div>`;

  if (phase.story && state.step > 0) {
    document.getElementById('story').innerHTML = phase.story.slice(0, state.step).map(s => `<p>✨ ${s}</p>`).join('');
  }

  document.getElementById('check').onclick = async () => {
    const value = normalize(document.getElementById('answer').value);
    if (value === normalize(answer)) {
      success.currentTime = 0; success.volume = 0.4; try { await success.play(); } catch (_) {}
      state.step += 1; save();
      transition(() => renderPhase());
    } else {
      document.getElementById('msg').textContent = 'No te preocupes, amor… escucha al corazón y vuelve a intentarlo.';
    }
  };

  const star = document.getElementById('floating-star');
  const hintPopup = document.getElementById('hint-popup');
  star.onclick = async () => {
    star.disabled = true;
    star.classList.add('used');
    hintPopup.classList.add('visible');
    hintAudio.currentTime = 0;
    hintAudio.volume = 0.28;
    try { await hintAudio.play(); } catch (_) {}

    setTimeout(() => {
      hintPopup.classList.remove('visible');
      hintPopup.classList.add('hide');
    }, 5000);
  };
}

function renderPhaseFinal(phaseIndex) {
  if (phaseIndex === 0) {
    appScene.innerHTML = `<div class="final-block glass-card">
      <p class="text-romantic">Hay conversaciones que nunca debieron terminar…</p>
      <p class="mt-4 mb-0">📍 ${CONFIG.phase1Address.line1}</p>
      <p>🕰️ ${CONFIG.phase1Address.line2}</p>
      <p class="subtitle">Te esperaré ahí, como antes esperaba tus historias.</p>
      <button id="next" class="btn btn-cine">Continuar</button>
    </div>`;
    document.getElementById('next').onclick = () => { state.phase = 2; state.step = 0; save(); transition(() => renderPhase()); };
  } else if (phaseIndex === 1) {
    const text = phases[1].story.join(' ');
    appScene.innerHTML = `<div class="glass-card final-block">
      <p id="full-story" class="text-romantic cursor"></p>
      <p class="mt-4">Hay historias que no terminan…<br>solo esperan el momento correcto.</p>
      <button id="next" class="btn btn-cine mt-2 d-none">Una última verdad</button>
    </div>`;
    typewriter(document.getElementById('full-story'), text, 20).then(() => document.getElementById('next').classList.remove('d-none'));
    document.getElementById('next').onclick = () => { state.phase = 3; state.step = 0; save(); transition(() => renderPhase()); };
  } else {
    appScene.innerHTML = `<div class="glass-card final-block">
      <p class="text-romantic">Intenté convencerme de que podía seguir sin ti…</p>
      <p class="text-romantic mt-3">Pero la verdad…</p>
      <p class="title mt-2" style="font-size: clamp(2rem,6vw,3.4rem);">es que nunca dejé de amarte.</p>
      <p class="mt-3">Siempre te he amado.</p>
      <p>Y si todavía existe una pequeña posibilidad…</p>
      <p class="mt-4 mb-0">📍 ${CONFIG.phase3Address.line1}</p>
      <p>🕰️ ${CONFIG.phase3Address.line2}</p>
      <p class="subtitle">Me gustaría comenzar otra historia contigo.</p>
      <button id="finish" class="btn btn-cine">Fin del viaje</button>
    </div>`;
    document.getElementById('finish').onclick = () => {
      localStorage.removeItem('colibriState');
      state.phase = 0; state.step = 0;
      transition(() => renderIntro());
    };
  }
}

function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  const ctx = canvas.getContext('2d');
  let w, h, stars;
  const init = () => {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    stars = Array.from({ length: Math.min(110, Math.floor(w / 12)) }, () => ({ x: Math.random()*w, y: Math.random()*h, r: Math.random()*1.9+.3, v: Math.random()*.25+.03 }));
  };
  const draw = () => {
    ctx.clearRect(0,0,w,h);
    stars.forEach(s => {
      s.y -= s.v; if (s.y < -4) s.y = h + 4;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(188, 214, 255, ${0.4 + s.r/3})`;
      ctx.shadowBlur = 10; ctx.shadowColor = '#91b9ff';
      ctx.fill();
    });
    requestAnimationFrame(draw);
  };
  window.addEventListener('resize', init);
  init(); draw();
}

initParticles();
(state.phase ? renderPhase : renderIntro)();
