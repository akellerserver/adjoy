// NAVBAR SCROLL
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 20);
});

// BURGER
function toggleMenu() {
  document.getElementById('navLinks').classList.toggle('open');
}

// PARTICLE CANVAS
(function() {
  const canvas = document.getElementById('particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, pts = [];

  function resize() {
    const hero = canvas.parentElement;
    W = canvas.width = hero.offsetWidth;
    H = canvas.height = hero.offsetHeight;
  }
  resize();
  new ResizeObserver(resize).observe(canvas.parentElement);

  const N = 90;
  pts = [];
  for (let i = 0; i < N; i++) {
    pts.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - .5) * .18,
      vy: (Math.random() - .5) * .18,
      r: Math.random() * 1.5 + .3,
      a: Math.random() * .35 + .08
    });
  }

  let mx = W / 2, my = H / 2;
  canvas.parentElement.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mx = e.clientX - rect.left;
    my = e.clientY - rect.top;
  });

  function draw() {
    ctx.clearRect(0, 0, W, H);

    pts.forEach(p => {
      const dx = p.x - mx, dy = p.y - my;
      const d = Math.sqrt(dx * dx + dy * dy) || 1;

      if (d < 100) {
        p.vx += dx / d * .008;
        p.vy += dy / d * .008;
      }

      p.vx *= .992;
      p.vy *= .992;
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(37,99,235,${p.a})`;
      ctx.fill();
    });

    const LINK = 120;
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x;
        const dy = pts[i].y - pts[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < LINK) {
          const alpha = .10 * (1 - dist / LINK);
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.strokeStyle = `rgba(37,99,235,${alpha})`;
          ctx.lineWidth = .6;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }
  draw();
})();

// TYPING
(function() {
  const phrases = [
    'Premium IPTV',
    'Ücretsiz Test',
    '4K Güçlü ı',
    'Hızı Kurulum'
  ];

  let pi = 0, ci = 0, del = false;
  const el = document.getElementById('typed');
  if (!el) return;

  const tick = () => {
    const cur = phrases[pi];

    if (!del) {
      el.textContent = cur.slice(0, ci++);
      if (ci > cur.length) {
        del = true;
        setTimeout(tick, 1500);
        return;
      }
    } else {
      el.textContent = cur.slice(0, ci--);
      if (ci < 0) {
        del = false;
        pi = (pi + 1) % phrases.length;
        ci = 0;
      }
    }

    setTimeout(tick, del ? 40 : 75);
  };

  tick();
})();

// SCROLL REVEAL
const ro = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('revealed');
  });
}, { threshold: .1 });

document.querySelectorAll('.reveal,.reveal-left,.reveal-right,.reveal-up').forEach(el => ro.observe(el));

// COUNT UP
const co = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting || e.target.dataset.done) return;
    e.target.dataset.done = 1;
    const tgt = +e.target.dataset.target;
    let cur = 0;

    const step = () => {
      cur = Math.min(cur + tgt / 90, tgt);
      e.target.textContent = Math.floor(cur).toLocaleString('tr-TR');
      if (cur < tgt) requestAnimationFrame(step);
    };
    step();
  });
}, { threshold: .6 });

document.querySelectorAll('.count-up').forEach(el => co.observe(el));

// TABS
function switchTab(region, el) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');

  document.querySelectorAll('.paket-grid').forEach(g => g.classList.add('hidden'));

  const grid = document.getElementById('grid-' + region);
  if (!grid) return;

  grid.classList.remove('hidden');

  grid.querySelectorAll('.reveal-up').forEach((c, i) => {
    c.classList.remove('revealed');
    setTimeout(() => c.classList.add('revealed'), 50 + i * 80);
  });
}

// FAQ
function toggleFaq(btn) {
  const item = btn.parentElement;
  const open = item.classList.contains('open');

  document.querySelectorAll('.faq.open').forEach(f => f.classList.remove('open'));
  if (!open) item.classList.add('open');
}

// SMOOTH SCROLL
document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;

  e.preventDefault();
  const t = document.querySelector(a.getAttribute('href'));
  if (t) t.scrollIntoView({ behavior: 'smooth' });

  document.getElementById('navLinks')?.classList.remove('open');
});
