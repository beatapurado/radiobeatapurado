/* BEAT APURADO — BUILD 006 — DJ LIVE REAL VIA SUPABASE + COSMIC ALERT */
(() => {
  const card = document.getElementById('djLiveCard');
  const statusText = document.getElementById('djStatusText');
  const nameEl = document.getElementById('djLiveName');
  const messageEl = document.getElementById('djLiveMessage');
  const socials = document.getElementById('djSocials');
  const alertBtn = document.getElementById('djAlertBtn');

  if (!card) return;

  const ALERT_KEY = 'beatapurado-dj-alerts';

  const STATUS_URL =
    'https://qsxtulxbgdlodcwdsgle.supabase.co/functions/v1/dj-status';

  let lastKnownLive = null;
  let polling = false;

  function t(k, fallback) {
    const v = window.BeatI18n?.t(k);
    return (!v || v === k) ? fallback : v;
  }

  function alertsWanted() {
    try {
      return localStorage.getItem(ALERT_KEY) === '1';
    } catch (e) {
      return false;
    }
  }

  function updateAlertButton() {
    if (!alertBtn) return;

    const enabled =
      alertsWanted() &&
      typeof Notification !== 'undefined' &&
      Notification.permission === 'granted';

    alertBtn.classList.toggle('enabled', enabled);

    alertBtn.textContent = enabled
      ? t('alertsEnabled', '🔔 Alertas ativados')
      : t('enableAlerts', '🔔 Alertas DJ ao vivo');
  }

  async function registration() {
    if (!('serviceWorker' in navigator) || location.protocol === 'file:') {
      return null;
    }

    try {
      const reg = await navigator.serviceWorker.register(
        './service-worker.js?v=006-dj-live',
        { scope: './' }
      );

      await reg.update().catch(() => {});

      const ready = await navigator.serviceWorker.ready;

      return ready || reg;
    } catch (e) {
      console.warn('[Beat Apurado] Service Worker indisponível.');
      return null;
    }
  }

  async function enableAlerts() {
    if (
      location.protocol === 'file:' ||
      !('Notification' in window) ||
      !('serviceWorker' in navigator)
    ) {
      alert(
        t(
          'alertsHttps',
          'Para ativar notificações, abra a rádio por HTTPS.'
        )
      );
      return;
    }

    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
      try {
        localStorage.setItem(ALERT_KEY, '1');
      } catch (e) {}

      await registration();
      updateAlertButton();
    } else {
      alert(
        t(
          'alertsDenied',
          'As notificações foram bloqueadas no navegador.'
        )
      );
    }
  }

  async function notifyLive() {
    if (!alertsWanted()) return;

    if (
      typeof Notification === 'undefined' ||
      Notification.permission !== 'granted'
    ) {
      return;
    }

    try {
      const reg = await registration();

      if (!reg) return;

      await reg.showNotification(
        t('alertTitle', '👽 DJ Jordan entrou no ar!'),
        {
          body: t(
            'alertBody',
            '🎧 Beat Apurado está AO VIVO. Toque para embarcar na transmissão.'
          ),
          icon: './img/icon-192.png',
          badge: './img/icon-192.png',
          tag: 'beatapurado-dj-live',
          renotify: false,
          data: {
            url: 'https://beatapurado.github.io/radiobeatapurado/'
          }
        }
      );
    } catch (e) {
      console.warn('[Beat Apurado] Não foi possível exibir o Cosmic Alert.');
    }
  }

  function renderAuto() {
    card.dataset.state = 'auto';

    statusText.textContent = t('djAuto', 'AUTO DJ');

    nameEl.textContent = t(
      'djAutoName',
      'BEAT APURADO'
    );

    messageEl.textContent = t(
      'djAutoMessage',
      '👽 A nave segue transmitindo no piloto automático.'
    );

    socials.hidden = true;

    updateAlertButton();
  }

  function renderLive(djName) {
    card.dataset.state = 'live';

    statusText.textContent = t(
      'djLive',
      'DJ JORDAN AO VIVO'
    );

    nameEl.textContent =
      djName ||
      t(
        'djLiveName',
        'DJ JORDAN'
      );

    messageEl.textContent = t(
      'djLiveMessage',
      '🎧 DJ Jordan assumiu o controle da nave.'
    );

    socials.hidden = false;

    updateAlertButton();
  }

  async function checkStatus() {
    if (polling) return;

    polling = true;

    try {
      const response = await fetch(
        STATUS_URL + '?t=' + Date.now(),
        {
          method: 'GET',
          cache: 'no-store'
        }
      );

      if (!response.ok) {
        throw new Error('HTTP ' + response.status);
      }

      const data = await response.json();

      if (!data || typeof data.live !== 'boolean') {
        throw new Error('Resposta inválida');
      }

      const live = data.live === true;

      if (live) {
        renderLive(data.dj);
      } else {
        renderAuto();
      }

      if (
        lastKnownLive === false &&
        live === true
      ) {
        notifyLive();
      }

      lastKnownLive = live;

    } catch (e) {
      console.warn(
        '[Beat Apurado] Falha temporária ao consultar DJ.'
      );
    } finally {
      polling = false;
    }
  }

  alertBtn?.addEventListener(
    'click',
    enableAlerts
  );

  window.addEventListener(
    'beat-language-changed',
    () => {
      if (lastKnownLive === true) {
        renderLive();
      } else {
        renderAuto();
      }
    }
  );

  document.addEventListener(
    'visibilitychange',
    () => {
      if (!document.hidden) {
        checkStatus();
      }
    }
  );

  renderAuto();

  checkStatus();

  setInterval(
    checkStatus,
    15000
  );
})();