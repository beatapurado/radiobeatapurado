/* ============================================================
   BEAT APURADO RADIO
   BEAT CHAT — BUILD 001
   Google Auth + Supabase Realtime
   ============================================================ */

(() => {

  const SUPABASE_URL =
    'https://qsxtulxbgdlodcwdsgle.supabase.co';

  const SUPABASE_KEY =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzeHR1bHhiZ2Rsb2Rjd2RzZ2xlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5MDcxMDMsImV4cCI6MjA3ODQ4MzEwM30.87mcKSYBZxcgzMWVQGrevuVd1yEBV400_Y7wgfj6uMc';

  if (!window.supabase) {
    console.error('[Beat Chat] Biblioteca Supabase não carregada.');
    return;
  }

  const client = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );

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

  if (!messagesEl || !form) return;

  let currentUser = null;

  function escapeHtml(value = '') {
    return value.replace(/[&<>"']/g, char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    })[char]);
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
        'pt-BR',
        {
          hour: '2-digit',
          minute: '2-digit'
        }
      ).format(new Date(dateString));

    } catch {

      return '';

    }

  }

  function scrollChat() {

    messagesEl.scrollTop =
      messagesEl.scrollHeight;

  }

  function renderMessage(message) {

    if (
      document.getElementById(
        `beat-message-${message.id}`
      )
    ) return;

    const mine =
      currentUser &&
      currentUser.id === message.user_id;

    const wrapper =
      document.createElement('div');

    wrapper.className =
      `beat-chat-message${mine ? ' mine' : ''}`;

    wrapper.id =
      `beat-message-${message.id}`;

    const avatar =
      message.user_avatar
        ? `<img
             src="${escapeHtml(message.user_avatar)}"
             class="beat-message-avatar"
             alt="">`
        : `<div class="beat-message-avatar fallback">👽</div>`;

    wrapper.innerHTML = `
      ${avatar}

      <div class="beat-message-body">

        <div class="beat-message-meta">
          <strong>${escapeHtml(message.user_name)}</strong>
          <span>${formatTime(message.created_at)}</span>
        </div>

        <div class="beat-message-text">
          ${escapeHtml(message.message)}
        </div>

      </div>
    `;

    messagesEl.appendChild(wrapper);

  }

  async function loadMessages() {

    const { data, error } =
      await client
        .from('beat_chat_messages')
        .select('*')
        .order('created_at', {
          ascending: true
        })
        .limit(100);

    if (error) {

      console.error(
        '[Beat Chat] Falha ao carregar mensagens:',
        error
      );

      messagesEl.innerHTML = `
        <div class="beat-chat-empty">
          👽 Não foi possível carregar o Beat Chat.
        </div>
      `;

      return;
    }

    messagesEl.innerHTML = '';

    if (!data?.length) {

      messagesEl.innerHTML = `
        <div
          class="beat-chat-empty"
          id="beatChatEmpty">

          👽 Seja o primeiro terráqueo
          a mandar uma mensagem.

        </div>
      `;

      return;
    }

    data.forEach(renderMessage);

    scrollChat();

  }

  function updateAuthUI(user) {

    currentUser = user || null;

    if (currentUser) {

      loggedOut.hidden = true;
      loggedIn.hidden = false;

      userNameEl.textContent =
        getDisplayName(currentUser);

      const avatar =
        getAvatar(currentUser);

      if (avatar) {

        avatarEl.src = avatar;
        avatarEl.hidden = false;

      } else {

        avatarEl.hidden = true;

      }

      input.disabled = false;
      sendBtn.disabled = false;

      input.placeholder =
        'Digite sua mensagem para a nave...';

    } else {

      loggedOut.hidden = false;
      loggedIn.hidden = true;

      input.disabled = true;
      sendBtn.disabled = true;

      input.placeholder =
        'Entre com Google para enviar mensagem...';

    }

  }

  async function loginGoogle() {

    const redirectTo =
      'https://beatapurado.github.io/radiobeatapurado/';

    const { error } =
      await client.auth.signInWithOAuth({
        provider: 'google',

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
        'Não foi possível entrar com Google.'
      );

    }

  }

  async function logout() {

    await client.auth.signOut();

  }

  async function sendMessage(event) {

    event.preventDefault();

    if (!currentUser) return;

    const message =
      input.value.trim();

    if (!message) return;

    if (message.length > 500) return;

    sendBtn.disabled = true;

    const payload = {

      user_id:
        currentUser.id,

      user_name:
        getDisplayName(currentUser),

      user_avatar:
        getAvatar(currentUser),

      message

    };

    const { error } =
      await client
        .from('beat_chat_messages')
        .insert(payload);

    sendBtn.disabled = false;

    if (error) {

      console.error(
        '[Beat Chat] Erro ao enviar:',
        error
      );

      return;

    }

    input.value = '';
    input.focus();

  }

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

  client.auth.onAuthStateChange(
    (event, session) => {

      updateAuthUI(
        session?.user || null
      );

      loadMessages();

    }
  );

  client
    .channel('beat-chat-live')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'beat_chat_messages'
      },

      payload => {

        const empty =
          document.getElementById(
            'beatChatEmpty'
          );

        empty?.remove();

        renderMessage(payload.new);

        scrollChat();

      }
    )
    .subscribe();

  async function init() {

    const {
      data: { session }
    } =
      await client.auth.getSession();

    updateAuthUI(
      session?.user || null
    );

    await loadMessages();

  }

  init();

})();