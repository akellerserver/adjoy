// Burger Menü
const burger = document.getElementById("burger");
const navLinks = document.getElementById("navLinks");

if (burger && navLinks) {
  burger.addEventListener("click", () => {
    navLinks.classList.toggle("show");
  });
}

// Slider
const slides = document.querySelectorAll(".slide-item");
let currentSlide = 0;
const intervalTime = 5000;
let slideInterval;

function showSlide(index) {
  slides.forEach((slide) => slide.classList.remove("active"));
  if (slides[index]) {
    slides[index].classList.add("active");
  }
}

function nextSlide() {
  currentSlide++;
  if (currentSlide >= slides.length) currentSlide = 0;
  showSlide(currentSlide);
  restartSlider();
}

function prevSlide() {
  currentSlide--;
  if (currentSlide < 0) currentSlide = slides.length - 1;
  showSlide(currentSlide);
  restartSlider();
}

function startSlider() {
  slideInterval = setInterval(() => {
    currentSlide++;
    if (currentSlide >= slides.length) currentSlide = 0;
    showSlide(currentSlide);
  }, intervalTime);
}

function restartSlider() {
  clearInterval(slideInterval);
  startSlider();
}

if (slides.length > 0) {
  startSlider();
}

// VIP Paketler
(function () {
  const phone = "16892674393";
  const state = { region: "tr" };

  const prices = {
    tr: { 1: 400, 3: 600, 6: 850, 12: 1500, cur: "₺" },
    eu: { 12: 60, cur: "€" }
  };

  const topLabels = {
    1: "HIZLI",
    3: "POPÜLER",
    6: "AVANTAJLI",
    12: "EN POPÜLER"
  };

  const grid = document.getElementById("g-grid");
  if (!grid) return;

  function monthlyApprox(total, months) {
    return Math.round(total / months);
  }

  function card({ m, region, price, cur, limited = false }) {
    const featured = m === 12 && !limited ? "featured" : "";
    const extra = limited ? "limited" : "";
    const titlePill = "ADJOY VIP";
    const locText = region === "tr" ? "Türkiye" : "Avrupa";
    const approx = !limited && m ? monthlyApprox(price, m) : null;

    const giftHTML =
      m === 12 && !limited
        ? `<div class="g-gift"><b>IBOPlayer Lisansı</b> 🎁 Hediye</div>`
        : `<div class="g-gift empty">&nbsp;</div>`;

    const msg = limited
      ? `Merhaba! ADJOY VIP için Avrupa bölgesinde şu an sadece 12 aylık paket aktiftir. 12 ay fiyatı: ${prices.eu.cur}${prices.eu[12]}. Bilgi alabilir miyim?`
      : `Merhaba! ADJOY VIP ${m} Ay paketini almak istiyorum. Bölge: ${locText} | Fiyat: ${cur}${price}${m === 12 ? " | Hediye: IBOPlayer Lisans" : ""}`;

    const href = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    const ctaLabel = limited ? "Sadece 12 Ay Aktif" : "Hemen Satın Al";

    return `
      <article class="g-card ${featured} ${extra}">
        <div class="g-topbar">
          ${topLabels[m] || "VIP"}
          <div class="g-logo-badge">
            <img src="img/logo.png" alt="ADJOY">
          </div>
        </div>

        <div class="g-body">
          <div class="g-pill">${titlePill}</div>
          <div class="g-month">${m} AY</div>
          <div class="g-price">${limited ? "-" : cur + price}</div>

          <div class="g-meta">
            <span class="line">${locText} • VIP Panel</span>
            <span class="line">${limited ? "Avrupa bölgesinde paket seçenekleri: sadece 12 ay" : "Aylık yaklaşık " + cur + approx}</span>
          </div>

          <ul class="g-list">
            <li><span class="g-check">✓</span> Güvenli sunucu</li>
            <li><span class="g-check">✓</span> 4K çözünürlük</li>
            <li><span class="g-check">✓</span> Alternatif kanallar</li>
            <li><span class="g-check">✓</span> Hızlı aktivasyon</li>
            <li><span class="g-check">✓</span> 7/24 Destek</li>
          </ul>

          <a class="g-cta" href="${href}" target="_blank" rel="noopener">${ctaLabel}</a>
          ${giftHTML}
          <div class="g-watermark">ADJOY</div>
        </div>
      </article>
    `;
  }

  function render() {
    grid.innerHTML = "";

    if (state.region === "tr") {
      const p = prices.tr;
      [1, 3, 6, 12].forEach((m) => {
        grid.insertAdjacentHTML(
          "beforeend",
          card({
            m,
            region: "tr",
            price: p[m],
            cur: p.cur,
            limited: false
          })
        );
      });
    } else {
      const p = prices.eu;
      [1, 3, 6, 12].forEach((m) => {
        const limited = m !== 12;
        grid.insertAdjacentHTML(
          "beforeend",
          card({
            m,
            region: "eu",
            price: limited ? null : p[12],
            cur: p.cur,
            limited
          })
        );
      });
    }
  }

  document.querySelectorAll("#g-vip .g-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll("#g-vip .g-tab")
        .forEach((b) => b.setAttribute("aria-checked", "false"));

      btn.setAttribute("aria-checked", "true");
      state.region = btn.dataset.region;
      render();
    });
  });

  render();
})();

// FAQ
function toggleFaq(button) {
  const item = button.parentElement;
  const answer = item.querySelector(".faq-answer");

  if (item.classList.contains("active")) {
    item.classList.remove("active");
    answer.style.maxHeight = null;
  } else {
    document.querySelectorAll(".faq-item").forEach((otherItem) => {
      otherItem.classList.remove("active");
      const otherAnswer = otherItem.querySelector(".faq-answer");
      if (otherAnswer) otherAnswer.style.maxHeight = null;
    });

    item.classList.add("active");
    answer.style.maxHeight = answer.scrollHeight + "px";
  }
}

// Slogan mouse glow
const sloganSection = document.querySelector(".super-slogan-section");
if (sloganSection) {
  sloganSection.addEventListener("mousemove", (e) => {
    const rect = sloganSection.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    sloganSection.style.setProperty("--mouse-x", `${x}px`);
    sloganSection.style.setProperty("--mouse-y", `${y}px`);
  });
}

// Sekme değişince başlık değişsin
const originalTitle = document.title;
const messages = [
  "İzlemeden Gitme 😎",
  "Adjoy Seni Bekliyor 📺",
  "Kapatma! Yayın Bitmedi ⚡",
  "Yerli – Yabancı Binlerce Kanal",
  "Adjoy IPTV – Her Yerde, Her Zaman!"
];

let titleIndex = 0;
let titleInterval;

document.addEventListener("visibilitychange", function () {
  if (document.hidden) {
    titleInterval = setInterval(() => {
      document.title = messages[titleIndex % messages.length];
      titleIndex++;
    }, 2500);
  } else {
    clearInterval(titleInterval);
    document.title = originalTitle;
  }
});

// scroll-fade animasyonu varsa çalıştır
const faders = document.querySelectorAll('.scroll-fade');

if (faders.length) {
  const appearOnScroll = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.2
  });

  faders.forEach(el => appearOnScroll.observe(el));
}