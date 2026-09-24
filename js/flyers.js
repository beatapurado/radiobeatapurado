/* FLYERS — carrossel + fullscreen + navegação manual */

const flyers = [
  ...document.querySelectorAll(".flyer-container img")
];

let flyerIndex = 0;
let flyerPaused = false;


function showFlyer(index) {

  if (!flyers.length) return;

  flyerIndex =
    (index + flyers.length) %
    flyers.length;

  flyers.forEach(
    (img, i) =>
      img.classList.toggle(
        "active",
        i === flyerIndex
      )
  );
}


function trocarFlyer() {

  if (!flyerPaused) return;

  /* pausa manual abaixo controla */
}


/* Rotação automática — somente quando não estiver pausado */

setInterval(() => {

  if (!flyerPaused) {
    showFlyer(flyerIndex + 1);
  }

}, 6000);


/* ============================================================
   MODAL DOS ANÚNCIOS
   ============================================================ */

const flyerModal =
  document.getElementById("flyerModal");

const flyerZoom =
  document.getElementById("flyerZoom");

const mkBtn =
  document.getElementById("mkWhatsappBtn");

const an02Btn =
  document.getElementById("an02FormBtn");


function openFlyer(index) {

  showFlyer(index);

  const img =
    flyers[flyerIndex];

  flyerZoom.src =
    img.currentSrc || img.src;


  /* MK ATELIÊ DOS SONHOS */

  if (mkBtn) {

    mkBtn.style.display =
      img.src.includes("mk.png")
        ? "inline-block"
        : "none";
  }


  /* ANÚNCIO AN02 — FORMULÁRIO GOOGLE */

  if (an02Btn) {

    an02Btn.style.display =
      img.src.includes("AN02.jpeg")
        ? "inline-block"
        : "none";
  }


  flyerModal.classList.add(
    "active"
  );

  flyerModal.setAttribute(
    "aria-hidden",
    "false"
  );
}


/* CLIQUE NOS FLYERS */

flyers.forEach(
  (img, index) =>
    img.addEventListener(
      "click",
      e => {

        e.preventDefault();
        e.stopPropagation();

        openFlyer(index);
      }
    )
);


/* FECHAR MODAL */

function closeFlyer() {

  flyerModal.classList.remove(
    "active"
  );

  flyerModal.setAttribute(
    "aria-hidden",
    "true"
  );

  if (mkBtn) {
    mkBtn.style.display =
      "none";
  }

  if (an02Btn) {
    an02Btn.style.display =
      "none";
  }
}


document
  .getElementById("closeFlyer")
  .addEventListener(
    "click",
    closeFlyer
  );


/* ANÚNCIO ANTERIOR */

document
  .getElementById("flyerPrev")
  .addEventListener(
    "click",
    e => {

      e.stopPropagation();

      openFlyer(
        flyerIndex - 1
      );
    }
  );


/* PRÓXIMO ANÚNCIO */

document
  .getElementById("flyerNext")
  .addEventListener(
    "click",
    e => {

      e.stopPropagation();

      openFlyer(
        flyerIndex + 1
      );
    }
  );


/* CLIQUE FORA DO ANÚNCIO */

flyerModal.addEventListener(
  "click",
  e => {

    if (
      e.target === flyerModal
    ) {
      closeFlyer();
    }
  }
);


/* ============================================================
   PAUSAR / CONTINUAR CARROSSEL
   ============================================================ */

const toggleFlyer =
  document.getElementById(
    "toggleFlyer"
  );


toggleFlyer.addEventListener(
  "click",
  () => {

    flyerPaused =
      !flyerPaused;

    toggleFlyer.classList.toggle(
      "paused",
      flyerPaused
    );

    toggleFlyer.textContent =
      flyerPaused
        ? (
            window.BeatI18n?.t(
              "resume"
            ) ||
            "▶ CONTINUAR"
          )
        : (
            window.BeatI18n?.t(
              "pauseAds"
            ) ||
            "⏸ PAUSAR | STOP"
          );
  }
);