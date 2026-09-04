/* BACKGROUND CINEMÁTICO */
const videoA=document.getElementById("bg-video-a"),videoB=document.getElementById("bg-video-b");
const playlist=["https://beatapurado.github.io/radiobeatapurado/fundo.mp4","https://beatapurado.github.io/radiobeatapurado/fundo2.mp4","https://beatapurado.github.io/radiobeatapurado/fundo3.mp4","https://beatapurado.github.io/radiobeatapurado/fundo4.mp4","https://beatapurado.github.io/radiobeatapurado/fundo5.mp4"];
let currentIndex=0,activeVideo=videoA,nextVideo=videoB,switching=false;
function loadVideo(video,src){return new Promise(resolve=>{video.src=src;video.load();const done=()=>{video.removeEventListener("canplaythrough",done);resolve()};video.addEventListener("canplaythrough",done,{once:true});setTimeout(done,8000)})}
async function startBackground(){await loadVideo(activeVideo,playlist[currentIndex]);try{await activeVideo.play();activeVideo.style.opacity=1;scheduleTransition()}catch(e){}}
function scheduleTransition(){const duration=activeVideo.duration;if(!duration||!isFinite(duration)){setTimeout(scheduleTransition,1000);return}setTimeout(switchBackground,Math.max(1000,duration*1000-2000))}
async function switchBackground(){if(switching)return;switching=true;currentIndex=(currentIndex+1)%playlist.length;await loadVideo(nextVideo,playlist[currentIndex]);nextVideo.currentTime=0;try{await nextVideo.play();nextVideo.style.opacity=1;activeVideo.style.opacity=0;setTimeout(()=>{activeVideo.pause();activeVideo.removeAttribute("src");activeVideo.load();[activeVideo,nextVideo]=[nextVideo,activeVideo];switching=false;scheduleTransition()},1400)}catch(e){switching=false}}
startBackground();
