/* PLAYER */
const audio=document.getElementById("radioAudio"),playBtn=document.getElementById("playBtn"),pauseBtn=document.getElementById("pauseBtn"),eq=document.getElementById("eq"),volumeControl=document.getElementById("volumeControl"),statusPlayer=document.getElementById("statusPlayer");
playBtn.addEventListener("click",async()=>{try{await audio.play();eq.classList.add("playing");statusPlayer.textContent=window.BeatI18n?.t("onAir")||"● AO VIVO";statusPlayer.style.color="#39ff14"}catch(e){alert(window.BeatI18n?.t("playError")||"Não foi possível iniciar a rádio. Tente novamente.")}});
pauseBtn.addEventListener("click",()=>{audio.pause();eq.classList.remove("playing");statusPlayer.textContent=window.BeatI18n?.t("paused")||"● PAUSADO";statusPlayer.style.color="#ff00ff"});
volumeControl.addEventListener("input",()=>audio.volume=Number(volumeControl.value));
audio.addEventListener("error",()=>{statusPlayer.textContent=window.BeatI18n?.t("reconnecting")||"● RECONECTANDO...";setTimeout(()=>{audio.load();audio.play().then(()=>{eq.classList.add("playing");statusPlayer.textContent=window.BeatI18n?.t("onAir")||"● AO VIVO"}).catch(()=>{})},3000)});
