/* app.js — Main controller: state machine + screen routing */

(function () {
  /* ── Data from server (injected by Jinja2 template) ── */
  const { categories, modules, scenarios } = window.APP_DATA;

  /* ── App state ── */
  const state = {
    screen:   'start',
    category: null,
    module:   null,
    scenario: null,
  };

  /* ── Build the static screen skeletons ── */
  const SCREEN_IDS = [
    'screen-start',
    'screen-category',
    'screen-module',
    'screen-scenario',
    'screen-learning',
    'screen-complete',
  ];

  const app = document.getElementById('app');
  SCREEN_IDS.forEach(id => {
    const div = document.createElement('div');
    div.id        = id;
    div.className = 'screen';
    app.appendChild(div);
  });

  /* ── Navigation helper ── */
  function goTo(screenId) {
    const current = document.querySelector('.screen.active');
    const next    = document.getElementById(screenId);
    if (!next) return;

    if (current && current !== next) {
      // slide current out, then hide it
      current.classList.add('exit');
      setTimeout(() => current.classList.remove('active', 'exit'), 400);
    }

    // slide next in
    next.classList.add('active');
    state.screen = screenId;
  }

  /* ── Screen flow ── */
  function showStart() {
    renderStart(() => showCategory());
    goTo('screen-start');
  }

  function showCategory() {
    renderCategory(
      categories,
      (cat) => { state.category = cat; showModule(); },
      ()    => showStart()
    );
    goTo('screen-category');
  }

  function showModule() {
    renderModule(
      modules,
      (mod) => { state.module = mod; showScenario(); },
      ()    => showCategory()
    );
    goTo('screen-module');
  }

  function showScenario() {
    renderScenario(
      scenarios,
      (sc) => { state.scenario = sc; showLearning(); },
      ()   => showModule()
    );
    goTo('screen-scenario');
  }

  function showLearning() {
    renderLearning(
      state.scenario,
      () => showScenario(),
      (sc) => { showComplete(sc); }
    );
    goTo('screen-learning');
  }

  function showComplete(sc) {
    renderComplete(sc, () => showScenario());
    goTo('screen-complete');
  }

  /* ── Boot ── */
  showStart();
})();