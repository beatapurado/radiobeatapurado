const RADIO_URL="https://beatapurado.github.io/radiobeatapurado/";
let deferredPrompt=null, appInstalled=false;

/* COMPARTILHAR — não é fixo: está no topo e rola normalmente */
document.getElementById("shareBtn")?.addEventListener("click",async()=>{
  try{
    if(navigator.share){await navigator.share({title:"Beat Apurado Radio",text:(window.BeatI18n?.t("shareText")||"🎧 Escuta agora a Beat Apurado Radio! 🚀"),url:RADIO_URL});}
    else{await navigator.clipboard.writeText(RADIO_URL);alert(window.BeatI18n?.t("copied")||"Link da Beat Apurado copiado! 🚀");}
  }catch(e){}
});

/* PWA — botão agora fica no topo, sem congelar a página */
const installTopBtn=document.getElementById("installTopBtn");
function isPWA(){return window.matchMedia("(display-mode: standalone)").matches||window.navigator.standalone||appInstalled}
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredPrompt=e});
installTopBtn?.addEventListener("click",async()=>{
 const ios=/iPad|iPhone|iPod/.test(navigator.userAgent)&&!window.MSStream;
 if(isPWA()) return;
 if(ios){
   alert(window.BeatI18n?.t("iosInstall")||"No iPhone, toque em Compartilhar e depois em 'Adicionar à Tela de Início'. 🚀");
 }else if(deferredPrompt){
   deferredPrompt.prompt();
   const {outcome}=await deferredPrompt.userChoice;
   deferredPrompt=null;
 }else{
   alert(window.BeatI18n?.t("installUnavailable")||"A instalação ainda não está disponível neste momento.");
 }
});
window.addEventListener("appinstalled",()=>{appInstalled=true;deferredPrompt=null});

/* PIX/BMC */
const pixBox=document.getElementById("pix-float"), bmcBox=document.getElementById("bmc-float");
document.getElementById("pixClose")?.addEventListener("click",()=>pixBox.style.display="none");
document.getElementById("bmcClose")?.addEventListener("click",()=>bmcBox.style.display="none");
const LANG_STORAGE_KEY="beatapurado-language";
function requestedLang(){
 const params=new URLSearchParams(window.location.search);
 return window.BeatI18n?.normalizeLang(params.get("lang"));
}
function savedLang(){
 try{return window.BeatI18n?.normalizeLang(localStorage.getItem(LANG_STORAGE_KEY));}catch(e){return null;}
}
function setActiveLanguageButton(lang){
 document.querySelectorAll(".lang-btn").forEach(btn=>btn.classList.toggle("active",btn.dataset.lang===lang));
}
async function chooseLanguage(lang){
 const safe=window.BeatI18n?.normalizeLang(lang)||"pt-BR";
 try{localStorage.setItem(LANG_STORAGE_KEY,safe);}catch(e){}
 await window.BeatI18n?.load(safe);
 setActiveLanguageButton(safe);
}
document.querySelectorAll(".lang-btn").forEach(btn=>btn.addEventListener("click",()=>chooseLanguage(btn.dataset.lang)));
window.addEventListener("beat-language-changed",e=>setActiveLanguageButton(e.detail?.lang));

async function applyCountry(countryCode, source="real") {
 const country=(countryCode||"").trim().toUpperCase();
 const isBrazil=country==="BR";
 if(pixBox) pixBox.style.display=isBrazil?"block":"none";
 if(bmcBox) bmcBox.style.display=isBrazil?"none":"block";
 const params=new URLSearchParams(window.location.search);
 const isCountryTest=params.has("country");
 const lang=requestedLang() || (isCountryTest ? window.BeatI18n?.languageForCountry(country) : savedLang()) || window.BeatI18n?.languageForCountry(country) || "en";
 await window.BeatI18n?.load(lang);
 setActiveLanguageButton(lang);
 console.info(`[Beat Apurado] País ${source === "test" ? "simulado" : "detectado"}: ${country || "desconhecido"} → ${isBrazil ? "PIX" : "Buy Me a Coffee"} | idioma: ${lang}`);
}

async function syncRegion(){
 const params=new URLSearchParams(window.location.search);
 const testCountry=params.get("country");
 if(testCountry){ await applyCountry(testCountry,"test"); return; }
 try{
   const r=await fetch("https://ipapi.co/json/");
   if(!r.ok) throw new Error(`HTTP ${r.status}`);
   const d=await r.json();
   await applyCountry(d.country_code,"real");
 } catch(e){
   if(pixBox) pixBox.style.display="block";
   if(bmcBox) bmcBox.style.display="none";
   const lang=requestedLang() || savedLang() || "pt-BR";
   await window.BeatI18n?.load(lang);
   setActiveLanguageButton(lang);
   console.warn("[Beat Apurado] Falha ao detectar país; usando Brasil/Português como fallback.",e);
 }
}
syncRegion();

/* BUILD 005 — registra/atualiza o mesmo Service Worker do PWA */
if('serviceWorker' in navigator && location.protocol !== 'file:'){
  window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(err=>console.warn('[Beat Apurado] Service Worker:',err)));
}
