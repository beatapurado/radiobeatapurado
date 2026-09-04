/* FLYERS — carrossel + fullscreen + navegação manual */
const flyers=[...document.querySelectorAll(".flyer-container img")];
let flyerIndex=0, flyerPaused=false;
function showFlyer(index){
 if(!flyers.length)return;
 flyerIndex=(index+flyers.length)%flyers.length;
 flyers.forEach((img,i)=>img.classList.toggle("active",i===flyerIndex));
}
function trocarFlyer(){if(!flyerPaused)return; /* pausa manual abaixo controla */}
// Rotação automática — somente quando não estiver pausado
setInterval(()=>{if(!flyerPaused)showFlyer(flyerIndex+1)},6000);

const flyerModal=document.getElementById("flyerModal"), flyerZoom=document.getElementById("flyerZoom"), mkBtn=document.getElementById("mkWhatsappBtn");
function openFlyer(index){
 showFlyer(index);
 const img=flyers[flyerIndex];
 flyerZoom.src=img.currentSrc||img.src;
 mkBtn.style.display=img.src.includes("mk.png")?"inline-block":"none";
 flyerModal.classList.add("active");flyerModal.setAttribute("aria-hidden","false");
}
flyers.forEach((img,index)=>img.addEventListener("click",e=>{e.preventDefault();e.stopPropagation();openFlyer(index)}));
function closeFlyer(){flyerModal.classList.remove("active");flyerModal.setAttribute("aria-hidden","true");mkBtn.style.display="none"}
document.getElementById("closeFlyer").addEventListener("click",closeFlyer);
document.getElementById("flyerPrev").addEventListener("click",e=>{e.stopPropagation();openFlyer(flyerIndex-1)});
document.getElementById("flyerNext").addEventListener("click",e=>{e.stopPropagation();openFlyer(flyerIndex+1)});
flyerModal.addEventListener("click",e=>{if(e.target===flyerModal)closeFlyer()});

const toggleFlyer=document.getElementById("toggleFlyer");
toggleFlyer.addEventListener("click",()=>{flyerPaused=!flyerPaused;toggleFlyer.classList.toggle("paused",flyerPaused);toggleFlyer.textContent=flyerPaused?(window.BeatI18n?.t("resume")||"▶ CONTINUAR"):(window.BeatI18n?.t("pauseAds")||"⏸ PAUSAR | STOP")});
