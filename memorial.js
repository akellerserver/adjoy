(() => {
  const template = document.getElementById('ataturk-memorial-template');
  const startsAt = Date.parse('2026-11-10T00:00:00+03:00');
  const endsAt = Date.parse('2026-11-11T00:00:00+03:00');
  let banner;
  let timer;

  function updateMemorial() {
    clearTimeout(timer);
    const now = Date.now();
    if (now >= endsAt) {
      banner?.remove();
      return;
    }
    if (now < startsAt) {
      timer = setTimeout(updateMemorial, Math.min(startsAt - now, 2_147_483_647));
      return;
    }
    if (!banner) {
      banner = template.content.firstElementChild.cloneNode(true);
      template.after(banner);
    }
    timer = setTimeout(updateMemorial, endsAt - now);
  }

  window.addEventListener('pageshow', updateMemorial);
  updateMemorial();
})();
