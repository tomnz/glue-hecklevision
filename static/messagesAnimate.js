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
  let elapsed = 0.001;
  if (lastTs > 0) {
    elapsed = (ts - lastTs) / 1000.0;
  }

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
    animatedEl.stepFn(elapsed, (animatedEl.expiry - ts) / 1000.0);
  });

  if (animatedEls.length > 0) {
    requestAnimationFrame(animate(ts));
  }
};

const w = () => window.innerWidth;
const h = () => window.innerHeight;

const BOUNCE_GRAVITY = 18.0;
const BOUNCE_REBOUND = 0.9;
const BOUNCE_DAMP = 0.02;
const BOUNCE_SIZE = 80;
const BOUNCE_VEL_X_MIN = 5.0;
const BOUNCE_VEL_X_VAR = 20.0;
const BOUNCE_VEL_Y_MIN = -50.0;
const BOUNCE_VEL_Y_VAR = 40.0;
const BOUNCE_X = -20.0;
const BOUNCE_X_VAR = 15.0;
const BOUNCE_Y = 50.0;
const BOUNCE_FADE = 1.0;


const animateBounce = (el) => {
  let x = BOUNCE_X + Math.random() * BOUNCE_X_VAR;
  let y = BOUNCE_Y;
  let velX = BOUNCE_VEL_X_MIN + Math.random() * BOUNCE_VEL_X_VAR;
  let velY = BOUNCE_VEL_Y_MIN + Math.random() * BOUNCE_VEL_Y_VAR;

  el.style.left = `${x}vw`;
  el.style.top = `${y}vh`;
  el.style.fontSize = `${BOUNCE_SIZE}px`;
  el.style.height = `${BOUNCE_SIZE}px`;
  el.style.width = `${BOUNCE_SIZE}px`;

  const bottom = 100.0 - (BOUNCE_SIZE * 100.0 / h());

  return (elapsed, remaining) => {
    velY += elapsed * BOUNCE_GRAVITY;

    velX *= 1.0 - (BOUNCE_DAMP * elapsed);
    velY *= 1.0 - (BOUNCE_DAMP * elapsed);

    x += velX * elapsed;
    y += velY * elapsed;

    if (y > bottom) {
      y = bottom * 2.0 - y;
      velY *= -BOUNCE_REBOUND;
    }

    let opacity = 1.0;
    if (remaining < BOUNCE_FADE) {
      opacity = remaining / BOUNCE_FADE;
    }

    el.style.left = `${x}vw`;
    el.style.top = `${y}vh`;
    el.style.opacity = `${opacity}`;
  }
}

const ANIM_COUNT = 6;
const ANIM_LIFETIME = 15000.0;

const animateEmoji = (emojiHTML) => {
  const triggerAnimationFrame = (animatedEls.length === 0);
  const now = performance.now();
  const expiry = now + ANIM_LIFETIME;

  for (let i = 0; i < ANIM_COUNT; i++) {
    const el = document.createElement('div');
    el.classList.add('animatedEmoji');
    el.innerHTML = emojiHTML;
    container.appendChild(el);

    animatedEls.push(new AnimatedEl(
      el,
      animateBounce(el),
      expiry,
    ));
  }

  if (triggerAnimationFrame) {
    requestAnimationFrame(animate(0));
  }
}