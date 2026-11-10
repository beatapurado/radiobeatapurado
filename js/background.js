/* BACKGROUND CINEMÁTICO — caminhos relativos + fallback */
const videoA = document.getElementById("bg-video-a");
const videoB = document.getElementById("bg-video-b");

const playlist = [
  "./videos/fundo.mp4",
  "./videos/fundo2.mp4",
  "./videos/fundo3.mp4",
  "./videos/fundo4.mp4",
  "./videos/fundo5.mp4"
];

let currentIndex = 0;
let activeVideo = videoA;
let nextVideo = videoB;
let switching = false;

function loadVideo(video, src) {
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      video.removeEventListener("canplaythrough", ready);
      video.removeEventListener("loadedmetadata", ready);
      video.removeEventListener("error", failed);
      clearTimeout(timer);
    };
    const ready = () => { cleanup(); resolve(); };
    const failed = () => { cleanup(); reject(new Error(`Falha ao carregar ${src}`)); };
    const timer = setTimeout(() => { cleanup(); reject(new Error(`Timeout ao carregar ${src}`)); }, 8000);

    video.addEventListener("canplaythrough", ready, { once: true });
    video.addEventListener("loadedmetadata", ready, { once: true });
    video.addEventListener("error", failed, { once: true });
    video.src = src;
    video.load();
  });
}

async function loadNextPlayable(video, startIndex) {
  for (let tries = 0; tries < playlist.length; tries++) {
    const idx = (startIndex + tries) % playlist.length;
    try {
      await loadVideo(video, playlist[idx]);
      return idx;
    } catch (err) {
      console.warn("Beat Apurado: vídeo ignorado:", playlist[idx], err.message);
    }
  }
  throw new Error("Nenhum vídeo de fundo pôde ser carregado.");
}

async function startBackground() {
  try {
    currentIndex = await loadNextPlayable(activeVideo, currentIndex);
    await activeVideo.play();
    activeVideo.style.opacity = 1;
    scheduleTransition();
  } catch (err) {
    console.warn("Beat Apurado: fundo em vídeo indisponível.", err);
  }
}

function scheduleTransition() {
  const duration = activeVideo.duration;
  if (!duration || !isFinite(duration)) {
    setTimeout(scheduleTransition, 1000);
    return;
  }
  setTimeout(switchBackground, Math.max(1000, duration * 1000 - 2000));
}

async function switchBackground() {
  if (switching) return;
  switching = true;
  try {
    currentIndex = await loadNextPlayable(nextVideo, currentIndex + 1);
    nextVideo.currentTime = 0;
    await nextVideo.play();
    nextVideo.style.opacity = 1;
    activeVideo.style.opacity = 0;

    setTimeout(() => {
      activeVideo.pause();
      activeVideo.removeAttribute("src");
      activeVideo.load();
      [activeVideo, nextVideo] = [nextVideo, activeVideo];
      switching = false;
      scheduleTransition();
    }, 1400);
  } catch (err) {
    switching = false;
    console.warn("Beat Apurado: não foi possível alternar o fundo.", err);
    setTimeout(switchBackground, 5000);
  }
}

startBackground();
