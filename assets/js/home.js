
(() => {
  "use strict";

  const noButton = document.getElementById("noButton");
  const yesButton = document.getElementById("yesButton");
  const microcopy = document.getElementById("microcopy");

  if (!noButton || !yesButton || !microcopy) return;

  const state = {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    width: 0,
    height: 0,
    ready: false,
    attempts: 0,
    lastPointerX: window.innerWidth / 2,
    lastPointerY: window.innerHeight / 2,
    pointerActive: false
  };

  const EDGE_MARGIN = 18;
  const DETECTION_RADIUS = 270;
  const PANIC_RADIUS = 145;
  const MAX_SPEED = 28;
  const NORMAL_ACCELERATION = 2.1;
  const PANIC_ACCELERATION = 7.8;
  const FRICTION = 0.935;
  const EDGE_FORCE = 5.5;

  const messages = [
    "The No button can use the entire page now.",
    "It moves before the cursor can settle on it.",
    "Still visible. Still running.",
    "The whole screen is its escape route.",
    "The other answer remains considerably easier."
  ];

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  function render() {
    noButton.style.transform = `translate3d(${state.x}px, ${state.y}px, 0)`;
  }

  function initialize() {
    const initialRect = noButton.getBoundingClientRect();

    state.width = initialRect.width;
    state.height = initialRect.height;
    state.x = initialRect.left;
    state.y = initialRect.top;

    noButton.classList.add("is-global-runner");
    render();

    state.ready = true;
  }

  function registerAttempt() {
    state.attempts += 1;
    microcopy.textContent =
      messages[Math.min(state.attempts - 1, messages.length - 1)];
  }

  function applyPointerRepulsion(multiplier = 1) {
    if (!state.pointerActive || !state.ready) return;

    const centerX = state.x + state.width / 2;
    const centerY = state.y + state.height / 2;

    let dx = centerX - state.lastPointerX;
    let dy = centerY - state.lastPointerY;
    let distance = Math.hypot(dx, dy);

    if (distance < 0.001) {
      const randomAngle = Math.random() * Math.PI * 2;
      dx = Math.cos(randomAngle);
      dy = Math.sin(randomAngle);
      distance = 1;
    }

    if (distance >= DETECTION_RADIUS) return;

    const nx = dx / distance;
    const ny = dy / distance;
    const closeness = 1 - distance / DETECTION_RADIUS;

    let acceleration =
      NORMAL_ACCELERATION *
      (1 + closeness * 5.2) *
      multiplier;

    if (distance < PANIC_RADIUS) {
      acceleration +=
        PANIC_ACCELERATION *
        (1 - distance / PANIC_RADIUS) *
        multiplier;
    }

    state.vx += nx * acceleration;
    state.vy += ny * acceleration;

    // Add a small sideways component so the button does not get pinned
    // against the same edge while the cursor follows it.
    const side = Math.sin(performance.now() / 180) * closeness * 1.6;
    state.vx += -ny * side;
    state.vy += nx * side;
  }

  function applyEdgeForces() {
    const maxX = Math.max(EDGE_MARGIN, window.innerWidth - state.width - EDGE_MARGIN);
    const maxY = Math.max(EDGE_MARGIN, window.innerHeight - state.height - EDGE_MARGIN);

    if (state.x < EDGE_MARGIN + 70) {
      const strength = 1 - (state.x - EDGE_MARGIN) / 70;
      state.vx += EDGE_FORCE * clamp(strength, 0, 1);
    }

    if (state.x > maxX - 70) {
      const strength = 1 - (maxX - state.x) / 70;
      state.vx -= EDGE_FORCE * clamp(strength, 0, 1);
    }

    if (state.y < EDGE_MARGIN + 70) {
      const strength = 1 - (state.y - EDGE_MARGIN) / 70;
      state.vy += EDGE_FORCE * clamp(strength, 0, 1);
    }

    if (state.y > maxY - 70) {
      const strength = 1 - (maxY - state.y) / 70;
      state.vy -= EDGE_FORCE * clamp(strength, 0, 1);
    }
  }

  function avoidYesButton() {
    const yes = yesButton.getBoundingClientRect();
    const centerX = state.x + state.width / 2;
    const centerY = state.y + state.height / 2;
    const yesCenterX = yes.left + yes.width / 2;
    const yesCenterY = yes.top + yes.height / 2;

    const dx = centerX - yesCenterX;
    const dy = centerY - yesCenterY;
    const distance = Math.hypot(dx, dy);
    const safeDistance = Math.max(state.width, state.height) + 90;

    if (distance > 0 && distance < safeDistance) {
      const strength = (1 - distance / safeDistance) * 4.2;
      state.vx += (dx / distance) * strength;
      state.vy += (dy / distance) * strength;
    }
  }

  function limitSpeed() {
    const speed = Math.hypot(state.vx, state.vy);

    if (speed > MAX_SPEED) {
      state.vx = (state.vx / speed) * MAX_SPEED;
      state.vy = (state.vy / speed) * MAX_SPEED;
    }
  }

  function constrainToViewport() {
    const maxX = Math.max(EDGE_MARGIN, window.innerWidth - state.width - EDGE_MARGIN);
    const maxY = Math.max(EDGE_MARGIN, window.innerHeight - state.height - EDGE_MARGIN);

    if (state.x < EDGE_MARGIN) {
      state.x = EDGE_MARGIN;
      state.vx = Math.abs(state.vx) + 2.4;
    } else if (state.x > maxX) {
      state.x = maxX;
      state.vx = -Math.abs(state.vx) - 2.4;
    }

    if (state.y < EDGE_MARGIN) {
      state.y = EDGE_MARGIN;
      state.vy = Math.abs(state.vy) + 2.4;
    } else if (state.y > maxY) {
      state.y = maxY;
      state.vy = -Math.abs(state.vy) - 2.4;
    }
  }

  function animate() {
    if (state.ready) {
      applyPointerRepulsion(1);
      applyEdgeForces();
      avoidYesButton();

      state.vx *= FRICTION;
      state.vy *= FRICTION;

      limitSpeed();

      state.x += state.vx;
      state.y += state.vy;

      constrainToViewport();
      render();
    }

    requestAnimationFrame(animate);
  }

  function updatePointer(clientX, clientY, multiplier = 1) {
    state.lastPointerX = clientX;
    state.lastPointerY = clientY;
    state.pointerActive = true;

    if (!state.ready) return;

    const centerX = state.x + state.width / 2;
    const centerY = state.y + state.height / 2;
    const distance = Math.hypot(clientX - centerX, clientY - centerY);

    if (distance < DETECTION_RADIUS) {
      applyPointerRepulsion(multiplier);
    }
  }

  document.addEventListener(
    "pointermove",
    (event) => {
      updatePointer(event.clientX, event.clientY, 1.25);
    },
    { passive: true }
  );

  document.addEventListener(
    "pointerdown",
    (event) => {
      updatePointer(event.clientX, event.clientY, 2.8);

      if (!state.ready) return;

      const centerX = state.x + state.width / 2;
      const centerY = state.y + state.height / 2;
      const distance = Math.hypot(
        event.clientX - centerX,
        event.clientY - centerY
      );

      if (distance < DETECTION_RADIUS) {
        registerAttempt();
      }
    },
    { passive: true }
  );

  document.addEventListener("pointerleave", () => {
    state.pointerActive = false;
  });

  window.addEventListener(
    "touchstart",
    (event) => {
      const touch = event.touches[0];
      if (!touch) return;
      updatePointer(touch.clientX, touch.clientY, 3);
      registerAttempt();
    },
    { passive: true }
  );

  window.addEventListener(
    "touchmove",
    (event) => {
      const touch = event.touches[0];
      if (!touch) return;
      updatePointer(touch.clientX, touch.clientY, 1.8);
    },
    { passive: true }
  );

  window.addEventListener(
    "touchend",
    () => {
      state.pointerActive = false;
    },
    { passive: true }
  );

  noButton.addEventListener("focus", () => {
    registerAttempt();

    state.lastPointerX = state.x + state.width / 2;
    state.lastPointerY = state.y + state.height / 2;
    state.pointerActive = true;

    applyPointerRepulsion(4);
    yesButton.focus({ preventScroll: true });
  });

  window.addEventListener("resize", () => {
    if (!state.ready) return;

    state.x = clamp(
      state.x,
      EDGE_MARGIN,
      Math.max(EDGE_MARGIN, window.innerWidth - state.width - EDGE_MARGIN)
    );

    state.y = clamp(
      state.y,
      EDGE_MARGIN,
      Math.max(EDGE_MARGIN, window.innerHeight - state.height - EDGE_MARGIN)
    );

    render();
  });

  window.addEventListener("load", initialize);
  requestAnimationFrame(animate);
})();
