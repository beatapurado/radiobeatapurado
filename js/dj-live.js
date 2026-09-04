/* BEAT APURADO — BUILD 005 PRODUÇÃO — DJ LIVE + COSMIC ALERT */
(() => {
  const card=document.getElementById('djLiveCard');
  const statusText=document.getElementById('djStatusText');
  const nameEl=document.getElementById('djLiveName');
  const messageEl=document.getElementById('djLiveMessage');
  const socials=document.getElementById('djSocials');
  const alertBtn=document.getElementById('djAlertBtn');
  if(!card) return;

  const ALERT_KEY='beatapurado-dj-alerts';

  // PRODUÇÃO: até a integração com a API real do AzuraCast, o painel permanece em Auto DJ.
  // Nenhum parâmetro de URL pode simular falsamente um DJ ao vivo no site público.
  const state='auto';

  function t(k,fallback){const v=window.BeatI18n?.t(k); return (!v||v===k)?fallback:v;}
  function render(){
    card.dataset.state=state;
    statusText.textContent=t('djAuto','AUTO DJ');
    nameEl.textContent=t('djAutoName','BEAT APURADO');
    messageEl.textContent=t('djAutoMessage','👽 A nave segue transmitindo no piloto automático.');
    socials.hidden=true;
    updateAlertButton();
  }

  async function registration(){
    if(!('serviceWorker' in navigator) || location.protocol==='file:') return null;
    try{
      const reg=await navigator.serviceWorker.register('./service-worker.js?v=005-prod',{scope:'./'});
      await reg.update().catch(()=>{});
      const ready=await navigator.serviceWorker.ready;
      return ready || reg;
    }catch(e){
      console.error('[Beat Apurado] Falha no Service Worker para notificações:',e);
      return null;
    }
  }

  function alertsWanted(){
    try{return localStorage.getItem(ALERT_KEY)==='1';}catch(e){return false;}
  }

  function updateAlertButton(){
    if(!alertBtn) return;
    const enabled=alertsWanted() && typeof Notification!=='undefined' && Notification.permission==='granted';
    alertBtn.classList.toggle('enabled',enabled);
    alertBtn.textContent=enabled?t('alertsEnabled','🔔 Alertas ativados'):t('enableAlerts','🔔 Alertas DJ ao vivo');
  }

  async function enableAlerts(){
    if(location.protocol==='file:' || !('Notification' in window) || !('serviceWorker' in navigator)){
      alert(t('alertsHttps','Para ativar notificações, abra a rádio por HTTPS.'));
      return;
    }
    const permission=await Notification.requestPermission();
    if(permission==='granted'){
      try{localStorage.setItem(ALERT_KEY,'1');}catch(e){}
      const reg=await registration();
      updateAlertButton();
      if(!reg) alert('Permissão concedida, mas o serviço de notificações não ficou pronto. Recarregue a página e tente novamente.');
    }else{
      alert(t('alertsDenied','As notificações foram bloqueadas no navegador.'));
    }
  }

  alertBtn?.addEventListener('click',enableAlerts);
  window.addEventListener('beat-language-changed',render);
  render();
})();
