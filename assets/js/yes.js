
(() => {
  "use strict";

  const field = document.getElementById("confettiField");
  if (!field) return;

  const colors = ["#ff6b7a", "#ffb4c1", "#ffd998", "#f7f0ff", "#8f7cff"];

  function createPiece() {
    const piece = document.createElement("span");
    piece.className = "confetti";

    const duration = 5.5 + Math.random() * 4;
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.color = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDuration = `${duration}s`;
    piece.style.setProperty("--drift", `${-120 + Math.random() * 240}px`);

    field.appendChild(piece);
    setTimeout(() => piece.remove(), duration * 1000);
  }

  for (let i = 0; i < 28; i += 1) {
    setTimeout(createPiece, i * 90);
  }
})();
