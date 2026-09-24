/* ============================================================
   BEAT APURADO RADIO
   BEAT CHAT — BUILD 003.7 — EMOJI BRIDGE
   Google Auth + Supabase Realtime + i18n
   ============================================================ */

(() => {

  const SUPABASE_URL =
    'https://qsxtulxbgdlodcwdsgle.supabase.co';

  /*
    IMPORTANTE:
    mantenha aqui a MESMA SUPABASE_KEY (anon/publishable)
    que já existia no seu arquivo original.
  */
  const SUPABASE_KEY =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzeHR1bHhiZ2Rsb2Rjd2RzZ2xlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5MDcxMDMsImV4cCI6MjA3ODQ4MzEwM30.87mcKSYBZxcgzMWVQGrevuVd1yEBV400_Y7wgfj6uMc';

  if (!window.supabase) {
    console.error(
      '[Beat Chat] Biblioteca Supabase não carregada.'
    );
    return;
  }

  const client =
    window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_KEY
    );


  /* ============================================================
     ELEMENTOS
     ============================================================ */

  const messagesEl =
    document.getElementById('beatChatMessages');

  const loginBtn =
    document.getElementById('beatChatLogin');

  const logoutBtn =
    document.getElementById('beatChatLogout');

  const loggedOut =
    document.getElementById('beatChatLoggedOut');

  const loggedIn =
    document.getElementById('beatChatLoggedIn');

  const avatarEl =
    document.getElementById('beatChatAvatar');

  const userNameEl =
    document.getElementById('beatChatUserName');

  const form =
    document.getElementById('beatChatForm');

  const input =
    document.getElementById('beatChatInput');

  const sendBtn =
    document.getElementById('beatChatSend');

  const emojiBtn =
    document.getElementById('beatChatEmoji');

  const emojiPanel =
    document.getElementById('beatChatEmojiPanel');

  const emojiPicker =
    document.getElementById('beatChatEmojiPicker');

  if (!messagesEl || !form) return;

  let currentUser = null;


  /* ============================================================
     TRADUÇÕES
     ============================================================ */

  function t(key, fallback = '') {

    const value =
      window.BeatI18n?.t?.(key);

    return (
      !value ||
      value === key
    )
      ? fallback
      : value;
  }


  function currentLocale() {

    const lang =
      document.documentElement.lang ||
      'pt-BR';

    const locales = {
      'pt-BR': 'pt-BR',
      'pt': 'pt-BR',
      'en': 'en-US',
      'en-US': 'en-US',
      'es': 'es-ES',
      'es-ES': 'es-ES',
      'ja': 'ja-JP',
      'ja-JP': 'ja-JP'
    };

    return locales[lang] || lang;
  }


  /* ============================================================
     UTILITÁRIOS
     ============================================================ */

  function escapeHtml(value = '') {

    return value.replace(
      /[&<>"']/g,
      char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      })[char]
    );
  }


  function getDisplayName(user) {

    return (
      user?.user_metadata?.full_name ||
      user?.user_metadata?.name ||
      user?.email?.split('@')[0] ||
      'Terráqueo'
    );
  }


  function getAvatar(user) {

    return (
      user?.user_metadata?.avatar_url ||
      user?.user_metadata?.picture ||
      ''
    );
  }


  function formatTime(dateString) {

    try {

      return new Intl.DateTimeFormat(
        currentLocale(),
        {
          hour: '2-digit',
          minute: '2-digit'
        }
      ).format(
        new Date(dateString)
      );

    } catch {

      return '';
    }
  }


  function scrollChat() {

    messagesEl.scrollTop =
      messagesEl.scrollHeight;
  }


  function updateEmojiLanguage() {

    if (!emojiBtn) return;

    const label = t(
      'beatChatEmojiTitle',
      'Emojis da Nave'
    );

    emojiBtn.title = label;

    emojiBtn.setAttribute(
      'aria-label',
      label
    );
  }


  /* ============================================================
     INSERIR EMOJI NO CAMPO
     ============================================================ */

  function insertEmoji(emoji) {

    if (
      !input ||
      input.disabled ||
      !emoji
    ) return;

    const start =
      input.selectionStart ??
      input.value.length;

    const end =
      input.selectionEnd ??
      start;

    const nextValue =
      input.value.slice(0, start) +
      emoji +
      input.value.slice(end);

    const maxLength =
      Number(input.maxLength) || 500;

    if (
      nextValue.length >
      maxLength
    ) return;

    input.value =
      nextValue;

    const nextCursor =
      start +
      emoji.length;

    input.focus();

    input.setSelectionRange(
      nextCursor,
      nextCursor
    );
  }


  /* ============================================================
     RENDERIZAÇÃO DAS MENSAGENS
     ============================================================ */

  function renderMessage(message) {

    if (
      document.getElementById(
        `beat-message-${message.id}`
      )
    ) {
      return;
    }

    const mine =
      currentUser &&
      currentUser.id ===
        message.user_id;

    const wrapper =
      document.createElement('div');

    wrapper.className =
      `beat-chat-message${
        mine ? ' mine' : ''
      }`;

    wrapper.id =
      `beat-message-${message.id}`;

    const avatar =
      message.user_avatar
        ? `
          <img
            src="${escapeHtml(
              message.user_avatar
            )}"
            class="beat-message-avatar"
            alt=""
          >
        `
        : `
          <div
            class="beat-message-avatar fallback"
          >
            👽
          </div>
        `;

    wrapper.innerHTML = `
      ${avatar}

      <div class="beat-message-body">

        <div class="beat-message-meta">

          <strong>
            ${escapeHtml(
              message.user_name
            )}
          </strong>

          <span>
            ${formatTime(
              message.created_at
            )}
          </span>

        </div>

        <div class="beat-message-text">
          ${escapeHtml(
            message.message
          )}
        </div>

      </div>
    `;

    messagesEl.appendChild(
      wrapper
    );
  }


  /* ============================================================
     CARREGAR MENSAGENS
     ============================================================ */

  async function loadMessages() {

    const { data, error } =
      await client
        .from(
          'beat_chat_messages'
        )
        .select('*')
        .order(
          'created_at',
          {
            ascending: true
          }
        )
        .limit(100);

    if (error) {

      console.error(
        '[Beat Chat] Falha ao carregar mensagens:',
        error
      );

      messagesEl.innerHTML = `
        <div class="beat-chat-empty">
          ${t(
            'beatChatLoadError',
            '👽 Não foi possível carregar o Beat Chat.'
          )}
        </div>
      `;

      return;
    }

    messagesEl.innerHTML = '';

    if (!data?.length) {

      messagesEl.innerHTML = `
        <div
          class="beat-chat-empty"
          id="beatChatEmpty"
        >

          ${t(
            'beatChatEmpty',
            '👽 Seja o primeiro terráqueo a mandar uma mensagem.'
          )}

        </div>
      `;

      return;
    }

    data.forEach(
      renderMessage
    );

    scrollChat();
  }


  /* ============================================================
     INTERFACE DE AUTENTICAÇÃO
     ============================================================ */

  function updateAuthUI(user) {

    currentUser =
      user || null;

    if (currentUser) {

      loggedOut.hidden = true;
      loggedIn.hidden = false;

      userNameEl.textContent =
        getDisplayName(
          currentUser
        );

      const avatar =
        getAvatar(
          currentUser
        );

      if (avatar) {

        avatarEl.src =
          avatar;

        avatarEl.hidden =
          false;

      } else {

        avatarEl.hidden =
          true;
      }

      input.disabled =
        false;

      sendBtn.disabled =
        false;

      if (emojiBtn) {
        emojiBtn.disabled =
          false;
      }

      input.placeholder =
        t(
          'beatChatPlaceholder',
          'Digite sua mensagem para a nave...'
        );

    } else {

      loggedOut.hidden =
        false;

      loggedIn.hidden =
        true;

      input.disabled =
        true;

      sendBtn.disabled =
        true;

      if (emojiBtn) {
        emojiBtn.disabled =
          true;
      }

      if (emojiPanel) {
        emojiPanel.hidden =
          true;
      }

      input.placeholder =
        t(
          'beatChatPlaceholderGuest',
          'Entre com Google para enviar mensagem...'
        );
    }
  }


  /* ============================================================
     LOGIN GOOGLE
     ============================================================ */

  async function loginGoogle() {

    const redirectTo =
      'https://beatapurado.github.io/radiobeatapurado/';

    const { error } =
      await client.auth
        .signInWithOAuth({

          provider:
            'google',

          options: {
            redirectTo
          }

        });

    if (error) {

      console.error(
        '[Beat Chat] Erro no login Google:',
        error
      );

      alert(
        t(
          'beatChatLoginError',
          'Não foi possível entrar com Google.'
        )
      );
    }
  }


  /* ============================================================
     LOGOUT
     ============================================================ */

  async function logout() {

    await client.auth
      .signOut();
  }


  /* ============================================================
     ENVIAR MENSAGEM
     ============================================================ */

  async function sendMessage(
    event
  ) {

    event.preventDefault();

    if (!currentUser) return;

    const message =
      input.value.trim();

    if (!message) return;

    if (
      message.length > 500
    ) return;

    sendBtn.disabled =
      true;

    const payload = {

      user_id:
        currentUser.id,

      user_name:
        getDisplayName(
          currentUser
        ),

      user_avatar:
        getAvatar(
          currentUser
        ),

      message
    };

    const { error } =
      await client
        .from(
          'beat_chat_messages'
        )
        .insert(
          payload
        );

    sendBtn.disabled =
      false;

    if (error) {

      console.error(
        '[Beat Chat] Erro ao enviar:',
        error
      );

      alert(
        t(
          'beatChatSendError',
          'Não foi possível enviar sua mensagem.'
        )
      );

      return;
    }

    input.value = '';

    input.focus();
  }


  /* ============================================================
     EVENTOS
     ============================================================ */

  loginBtn?.addEventListener(
    'click',
    loginGoogle
  );


  logoutBtn?.addEventListener(
    'click',
    logout
  );


  form.addEventListener(
    'submit',
    sendMessage
  );


  /*
    Abre / fecha o painel de emojis.
  */

  emojiBtn?.addEventListener(
    'click',
    event => {

      event.stopPropagation();

      if (
        emojiBtn.disabled ||
        !emojiPanel
      ) return;

      emojiPanel.hidden =
        !emojiPanel.hidden;
    }
  );


  /*
    ============================================================
    BUILD 003.7
    PONTE DO EMOJI-PICKER-ELEMENT

    Este é o trecho novo.

    O componente <emoji-picker> dispara "emoji-click".
    Pegamos event.detail.unicode e enviamos para insertEmoji().
    ============================================================
  */

function conectarEmojiPicker() {

  const picker =
    document.getElementById('beatChatEmojiPicker');

  if (!picker) {
    console.warn('[Beat Chat] Emoji Picker ainda não encontrado.');
    return;
  }

picker.addEventListener(
  'emoji-click',
  event => {

    const emoji =
      event.detail?.unicode;

    if (!emoji) return;

    // Emojis que podem receber tom de pele
    const baseEmoji =
      emoji.replace(/[\u{1F3FB}-\u{1F3FF}]/gu, '');

    const emojisComTom = new Set([
      '👋', '🤚', '🖐️', '✋', '🖖',
      '👌', '🤌', '🤏', '✌️', '🤞',
      '🫰', '🤟', '🤘', '🤙',
      '👈', '👉', '👆', '👇', '☝️',
      '🫵', '👍', '👎', '✊', '👊',
      '🤛', '🤜', '👏', '🙌', '🫶',
      '👐', '🤲', '🙏', '✍️',
      '💪', '🦾'
    ]);

    if (!emojisComTom.has(baseEmoji)) {
      insertEmoji(emoji);
      return;
    }

    // Remove seletor anterior, caso exista
    document
      .getElementById('beatSkinTonePicker')
      ?.remove();

    const tons = [
      '',
      '\u{1F3FB}',
      '\u{1F3FC}',
      '\u{1F3FD}',
      '\u{1F3FE}',
      '\u{1F3FF}'
    ];

    const seletor =
      document.createElement('div');

    seletor.id =
      'beatSkinTonePicker';

    seletor.style.cssText = `
      position: fixed;
      z-index: 999999;
      display: flex;
      gap: 6px;
      padding: 8px;
      background: #050505;
      border: 1px solid #39ff14;
      border-radius: 12px;
      box-shadow: 0 0 18px rgba(57,255,20,.35);
    `;

    tons.forEach(tom => {

      const botao =
        document.createElement('button');

      botao.type =
        'button';

      botao.textContent =
        baseEmoji + tom;

      botao.style.cssText = `
        background: transparent;
        border: 0;
        font-size: 25px;
        cursor: pointer;
        padding: 4px;
      `;

      botao.addEventListener(
        'click',
        e => {

          e.stopPropagation();

          insertEmoji(
            baseEmoji + tom
          );

          seletor.remove();
        }
      );

      seletor.appendChild(botao);
    });

    document.body.appendChild(seletor);

    // Posiciona próximo ao emoji clicado
    const rect =
      picker.getBoundingClientRect();

    const largura =
      seletor.offsetWidth;

    const altura =
      seletor.offsetHeight;

    let left =
      rect.left +
      (rect.width / 2) -
      (largura / 2);

    let top =
      rect.bottom - altura - 10;

    left = Math.max(
      8,
      Math.min(
        left,
        window.innerWidth - largura - 8
      )
    );

    top = Math.max(
      8,
      top
    );

    seletor.style.left =
      `${left}px`;

    seletor.style.top =
      `${top}px`;
  }
);

  console.log('[Beat Chat] Emoji Picker conectado 👽');
}

if (document.readyState === 'loading') {

  document.addEventListener(
    'DOMContentLoaded',
    conectarEmojiPicker,
    { once: true }
  );

} else {

  conectarEmojiPicker();
}


  /*
    Clique fora fecha o painel.
  */

  document.addEventListener(
    'click',
    event => {

      if (
        !emojiPanel ||
        emojiPanel.hidden
      ) return;

      if (
        emojiPanel.contains(
          event.target
        ) ||
        emojiBtn?.contains(
          event.target
        )
      ) return;

      emojiPanel.hidden =
        true;
    }
  );


  /*
    ESC fecha o painel.
  */

  document.addEventListener(
    'keydown',
    event => {

      if (
        event.key ===
          'Escape' &&
        emojiPanel
      ) {

        emojiPanel.hidden =
          true;
      }
    }
  );


  /* ============================================================
     AUTH STATE
     ============================================================ */

  client.auth
    .onAuthStateChange(
      (
        event,
        session
      ) => {

        updateAuthUI(
          session?.user ||
          null
        );

        loadMessages();
      }
    );


  /* ============================================================
     SUPABASE REALTIME
     ============================================================ */

  client
    .channel(
      'beat-chat-live'
    )
    .on(
      'postgres_changes',

      {
        event: 'INSERT',
        schema: 'public',
        table:
          'beat_chat_messages'
      },

      payload => {

        const empty =
          document.getElementById(
            'beatChatEmpty'
          );

        empty?.remove();

        renderMessage(
          payload.new
        );

        scrollChat();
      }
    )
    .subscribe();


  /* ============================================================
     TROCA DE IDIOMA
     ============================================================ */

  window.addEventListener(
    'beat-language-changed',
    () => {

      updateAuthUI(
        currentUser
      );

      updateEmojiLanguage();

      loadMessages();
    }
  );


  /* ============================================================
     INICIALIZAÇÃO
     ============================================================ */

  async function init() {

    const {
      data: {
        session
      }
    } =
      await client.auth
        .getSession();

    updateAuthUI(
      session?.user ||
      null
    );

    updateEmojiLanguage();

    await loadMessages();
  }


  init();

})();
