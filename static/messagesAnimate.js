class AnimatedEl {
  constructor(el, stepFn, expiry) {
    this.el = el;
    this.stepFn = stepFn;
    this.expiry = expiry;
  }
}

let animatedEls = [];
const container = document.getElementById('animatedEmojis');

const animate = (lastTs) => (ts) => {
  const elapsed = ts - lastTs;

  // Remove any expired els
  const newEls = [];
  animatedEls.forEach((animatedEl) => {
    if (animatedEl.expiry > ts) {
      newEls.push(animatedEl);
    } else {
      container.removeChild(animatedEl.el);
    }
  });
  animatedEls = newEls;

  // Animate
  animatedEls.forEach((animatedEl) => {
    animatedEl.stepFn(animatedEl.el, elapsed);
  });

  if (animatedEls.length > 0) {
    requestAnimationFrame(animate(ts));
  }
};

const BOUNCE_GRAVITY = 1.0;
const BOUNCE_REBOUND = 0.5;
const animateBounce = (initX, initY, initVelX, initVelY) => (el, elapsed) => {
  let x = initX;
  let y = initY;
  let velX = initVelX;
  let velY = initVelY;

  return (el, elapsed) => {
    velY += elapsed * BOUNCE_GRAVITY;
    x += velX;
    y += velY;

    if (y < 0.0 || y > 100.0) {
      y %= 100.0;
      velY *= -BOUNCE_REBOUND;
    }

    el.style.left = `${x}vw`;
    el.style.top = `${y}vh`;
  }
}

const ANIM_COUNT = 10;
const ANIM_VEL_X_MIN = 15.0;
const ANIM_VEL_X_VAR = 10.0;
const ANIM_VEL_Y_MIN = -10.0;
const ANIM_VEL_Y_VAR = 20.0;
const ANIM_X = 0.0;
const ANIM_Y = 50.0;
const ANIM_LIFETIME = 3.0;

const animateEmoji = (emojiHTML) => {
  const triggerAnimationFrame = (animatedEls.length === 0);
  const expiry = performance.now() + ANIM_LIFETIME;

  for (let i = 0; i < ANIM_COUNT; i++) {
    const el = document.createElement('div');
    el.classList.add('animatedEmoji');
    el.innerHTML = emojiHTML;
    container.appendChild(el);

    const x = ANIM_X;
    const y = ANIM_Y;
    const velX = ANIM_VEL_X_MIN + Math.random() * ANIM_VEL_X_VAR;
    const velY = ANIM_VEL_Y_MIN + Math.random() * ANIM_VEL_Y_VAR;

    el.style.left = `${x}vw`;
    el.style.top = `${y}vh`;

    animatedEls.push(new AnimatedEl(
      el,
      animateBounce(ANIM_X, ANIM_Y, velX, velY),
      expiry,
    ));
  }

  if (triggerAnimationFrame) {
    requestAnimationFrame(animate(performance.now()));
  }
}