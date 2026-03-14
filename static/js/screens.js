/* screens.js — One render function per screen */

/* ══════════════════════════════════════════
   SCREEN 1 — START
══════════════════════════════════════════ */
function renderStart(onStart) {
  const screen = document.getElementById('screen-start');
  screen.innerHTML = `
    <div class="start-orbs">
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="orb orb-3"></div>
    </div>
    <div class="start-logo-ring">
      <div class="start-logo-inner">A</div>
    </div>
    <div class="start-tagline">Learn English</div>
    <div class="start-sub">Together · Today</div>
    <button class="play-btn" id="play-btn" aria-label="Start">
      <svg width="38" height="38" viewBox="0 0 24 24" fill="#FF8A3D">
        <polygon points="5,3 19,12 5,21"/>
      </svg>
    </button>
    <div class="lang-pills">
      <div class="lang-pill active">🇺🇸 EN</div>
      <div class="lang-pill">🇦🇲 HY</div>
      <div class="lang-pill">🇸🇾 AR</div>
      <div class="lang-pill">🇺🇦 UK</div>
      <div class="lang-pill">🇪🇸 ES</div>
    </div>
  `;

  screen.querySelector('#play-btn').addEventListener('click', () => {
    SFX.nav();
    onStart();
  });

  // lang pills toggle (visual only for now)
  screen.querySelectorAll('.lang-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      screen.querySelectorAll('.lang-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      SFX.tap();
    });
  });
}

/* ══════════════════════════════════════════
   SCREEN 2 — CATEGORY
══════════════════════════════════════════ */
function renderCategory(categories, onSelect, onBack) {
  const screen = document.getElementById('screen-category');
  screen.innerHTML = '';

  // nav bar
  const navWrap = document.createElement('div');
  renderTopBar(navWrap, { onBack, progress: 20 });
  screen.appendChild(navWrap);

  // scroll area
  const scroll = document.createElement('div');
  scroll.className = 'scroll-area';
  renderScreenHeader(scroll, { icon: '🙋', eyebrow: 'Who are you?' });

  const list = document.createElement('div');
  list.className = 'cat-list';

  categories.forEach(cat => {
    const stars = '⭐'.repeat(cat.stars);
    const card  = createPhotoCard({
      img:           cat.img,
      title:         cat.title,
      emoji:         cat.emoji,
      color:         cat.color,
      badge:         cat.badge,
      cornerContent: stars,
      height:        150,
      extraClass:    'cat-card',
      onClick: () => { SFX.tap(); onSelect(cat); },
    });
    list.appendChild(card);
  });

  scroll.appendChild(list);
  screen.appendChild(scroll);
}

/* ══════════════════════════════════════════
   SCREEN 3 — MODULE TYPE
══════════════════════════════════════════ */
function renderModule(modules, onSelect, onBack) {
  const screen = document.getElementById('screen-module');
  screen.innerHTML = '';

  const navWrap = document.createElement('div');
  renderTopBar(navWrap, { onBack, progress: 40 });
  screen.appendChild(navWrap);

  const scroll = document.createElement('div');
  scroll.className = 'scroll-area';
  renderScreenHeader(scroll, { icon: '🗂️', eyebrow: 'Choose your path' });

  const list = document.createElement('div');
  list.className = 'mod-list';

  modules.forEach(mod => {
    const corner = mod.icons.join('');
    const card   = createPhotoCard({
      img:           mod.img,
      title:         mod.title,
      emoji:         mod.emoji,
      color:         mod.color,
      cornerContent: corner,
      height:        190,
      extraClass:    'mod-card',
      onClick: () => { SFX.tap(); onSelect(mod); },
    });
    list.appendChild(card);
  });

  scroll.appendChild(list);
  screen.appendChild(scroll);
}

/* ══════════════════════════════════════════
   SCREEN 4 — SCENARIO SELECTION
══════════════════════════════════════════ */
function renderScenario(scenarios, onSelect, onBack) {
  const screen = document.getElementById('screen-scenario');
  screen.innerHTML = '';

  const navWrap = document.createElement('div');
  renderTopBar(navWrap, { onBack, progress: 60 });
  screen.appendChild(navWrap);

  const scroll = document.createElement('div');
  scroll.className = 'scroll-area';
  renderScreenHeader(scroll, { icon: '🗺️', eyebrow: 'Choose a place' });

  const grid = document.createElement('div');
  grid.className = 'scenario-grid';

  scenarios.forEach(sc => {
    const card = createPhotoCard({
      img:           sc.img,
      title:         sc.title,
      emoji:         sc.emoji,
      color:         sc.color,
      cornerContent: sc.emoji,
      height:        155,
      extraClass:    'sc-card',
      onClick: () => { SFX.tap(); onSelect(sc); },
    });
    grid.appendChild(card);
  });

  scroll.appendChild(grid);
  screen.appendChild(scroll);
}

/* ══════════════════════════════════════════
   SCREEN 5 — LEARNING
══════════════════════════════════════════ */
function renderLearning(scenario, onBack, onComplete) {
  const screen = document.getElementById('screen-learning');
  screen.innerHTML = '';

  let lessonIdx   = 0;
  let answered    = false;
  let isSpeaking  = false;
  let isRecording = false;
  let recTimer    = null;
  const total     = scenario.lessons.length;

  /* ── hero image ── */
  const hero = document.createElement('div');
  hero.className = 'learn-hero';

  const heroImg = document.createElement('img');
  heroImg.src = scenario.img;
  heroImg.alt = scenario.title;
  hero.appendChild(heroImg);

  const heroOverlay = document.createElement('div');
  heroOverlay.className = 'learn-hero-overlay';
  hero.appendChild(heroOverlay);

  const sceneTag = document.createElement('div');
  sceneTag.className   = 'learn-scene-tag';
  sceneTag.textContent = `${scenario.emoji} ${scenario.title}`;
  hero.appendChild(sceneTag);

  const backBtn = document.createElement('button');
  backBtn.className = 'learn-back';
  backBtn.setAttribute('aria-label', 'Back');
  backBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="#333" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="15 18 9 12 15 6"/></svg>`;
  backBtn.addEventListener('click', () => { SFX.tap(); onBack(); });
  hero.appendChild(backBtn);
  screen.appendChild(hero);

  /* ── lesson body ── */
  const body = document.createElement('div');
  body.className = 'learn-body';

  // progress dots
  const dotsWrap = document.createElement('div');
  dotsWrap.className = 'lesson-dots';
  body.appendChild(dotsWrap);

  // word + phrase
  const wordWrap = document.createElement('div');
  wordWrap.className = 'learn-word-wrap';
  const wordEl   = document.createElement('div');
  wordEl.className   = 'learn-word';
  const phraseEl = document.createElement('div');
  phraseEl.className = 'learn-phrase';
  wordWrap.appendChild(wordEl);
  wordWrap.appendChild(phraseEl);
  body.appendChild(wordWrap);

  // chips label + wrap
  const chipsLabel = document.createElement('div');
  chipsLabel.className   = 'chips-label';
  chipsLabel.textContent = 'TAP THE WORD';
  body.appendChild(chipsLabel);

  const chipsWrap = document.createElement('div');
  chipsWrap.className = 'chips-wrap';
  body.appendChild(chipsWrap);

  // action row
  const actionRow = document.createElement('div');
  actionRow.className = 'action-row';

  const speakerBtn = document.createElement('button');
  speakerBtn.className = 'act-btn btn-speaker';
  speakerBtn.setAttribute('aria-label', 'Listen');
  speakerBtn.textContent = '🔊';

  const micBtn = document.createElement('button');
  micBtn.className = 'act-btn btn-mic';
  micBtn.setAttribute('aria-label', 'Speak');
  micBtn.textContent = '🎤';

  const nextBtn = document.createElement('button');
  nextBtn.className = 'act-btn btn-next';
  nextBtn.setAttribute('aria-label', 'Next');
  nextBtn.textContent = '➡️';

  actionRow.appendChild(speakerBtn);
  actionRow.appendChild(micBtn);
  actionRow.appendChild(nextBtn);
  body.appendChild(actionRow);
  screen.appendChild(body);

  /* ── load a lesson ── */
  function loadLesson() {
    const lesson = scenario.lessons[lessonIdx];
    answered  = false;

    // update word / phrase
    wordEl.textContent   = lesson.word;
    phraseEl.textContent = `"${lesson.phrase}"`;

    // update dots
    dotsWrap.innerHTML = '';
    scenario.lessons.forEach((_, i) => {
      const dot = document.createElement('div');
      dot.className = 'lesson-dot' +
        (i < lessonIdx ? ' done' : i === lessonIdx ? ' active' : '');
      dotsWrap.appendChild(dot);
    });

    // update chips (shuffled)
    const choices = [...lesson.choices].sort(() => Math.random() - 0.5);
    chipsWrap.innerHTML = '';
    choices.forEach(word => {
      const chip = document.createElement('div');
      chip.className   = 'chip';
      chip.textContent = word;
      chip.addEventListener('click', () => handleChip(chip, word === lesson.word, lesson.word));
      chipsWrap.appendChild(chip);
    });

    // reset next button
    nextBtn.classList.remove('ready');
    nextBtn.textContent = lessonIdx + 1 >= total ? '🏆' : '➡️';

    // animate hero emoji swap
    heroImg.style.transition = 'opacity .2s';
    heroImg.style.opacity    = '0';
    setTimeout(() => {
      heroImg.style.opacity = '1';
    }, 200);
  }

  function handleChip(chip, isCorrect, correctWord) {
    if (answered) return;
    answered = true;

    // lock all chips
    chipsWrap.querySelectorAll('.chip').forEach(c => c.classList.add('locked'));

    if (isCorrect) {
      chip.classList.add('correct');
      showToast('✅');
      SFX.correct();
    } else {
      chip.classList.add('wrong');
      SFX.wrong();
      showToast('❌');
      // reveal correct
      chipsWrap.querySelectorAll('.chip').forEach(c => {
        if (c.textContent === correctWord) c.classList.add('reveal');
      });
    }
    nextBtn.classList.add('ready');
  }

  speakerBtn.addEventListener('click', () => {
    if (isSpeaking) return;
    isSpeaking = true;
    SFX.tap();
    speakerBtn.classList.add('playing');
    const lesson = scenario.lessons[lessonIdx];
    speakPhrase(lesson.phrase, () => {
      isSpeaking = false;
      speakerBtn.classList.remove('playing');
    });
  });

  micBtn.addEventListener('click', () => {
    if (isRecording) {
      clearTimeout(recTimer);
      isRecording = false;
      micBtn.classList.remove('recording');
      micBtn.textContent = '🎤';
      showToast('👏');
      SFX.correct();
    } else {
      isRecording = true;
      micBtn.classList.add('recording');
      micBtn.textContent = '⏹️';
      SFX.tap();
      recTimer = setTimeout(() => {
        isRecording = false;
        micBtn.classList.remove('recording');
        micBtn.textContent = '🎤';
        showToast('👍');
      }, 3000);
    }
  });

  nextBtn.addEventListener('click', () => {
    SFX.nav();
    lessonIdx++;
    if (lessonIdx >= total) {
      SFX.complete();
      onComplete(scenario);
    } else {
      loadLesson();
    }
  });

  loadLesson();
}

/* ══════════════════════════════════════════
   SCREEN 6 — COMPLETION
══════════════════════════════════════════ */
function renderComplete(scenario, onMore) {
  const screen = document.getElementById('screen-complete');
  const total  = scenario.lessons.length;
  screen.innerHTML = `
    <div class="complete-ring">🎉</div>
    <div class="complete-title">Well Done!</div>
    <div class="complete-stars">${'⭐'.repeat(Math.min(3, total))}</div>
    <div class="complete-sub">${scenario.title} · ${total} lessons complete</div>
    <button class="complete-btn" id="more-btn">🗺️ More Lessons</button>
  `;
  screen.querySelector('#more-btn').addEventListener('click', () => {
    SFX.nav();
    onMore();
  });
}
