(() => {
  const button=document.getElementById('tickerToggle'),section=document.querySelector('.brand-ticker');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let paused=reduced.matches;
  function update(){section.classList.toggle('ticker-paused',paused);button.setAttribute('aria-pressed',String(paused));button.setAttribute('aria-label',paused?'Kayan yazıyı başlat':'Kayan yazıyı durdur');button.textContent=paused?'▶':'Ⅱ';}
  button.addEventListener('click',()=>{paused=!paused;update();});reduced.addEventListener('change',event=>{paused=event.matches;update();});update();
})();
