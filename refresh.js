(() => {
  'use strict';
  const packages=window.ADJOY_PACKAGES;
  const grid=document.getElementById('packageGrid');
  const comparison=document.getElementById('planComparison');
  const toggle=document.getElementById('compareToggle');
  const money=(n,c='TRY')=>new Intl.NumberFormat('tr-TR',{style:'currency',currency:c,maximumFractionDigits:2}).format(n);
  let region='local';
  function renderComparison(){
    const list=packages.filter(p=>Boolean(p.international)===(region==='international'));
    comparison.innerHTML=`<div class="comparison-scroll"><table><caption>Paketlerin toplam ve aylık tutarları</caption><thead><tr><th scope="col">Paket özellikleri</th>${list.map(p=>`<th scope="col">${p.months} ay</th>`).join('')}</tr></thead><tbody><tr><th scope="row">Toplam ödeme</th>${list.map(p=>`<td>${money(p.price,p.currency)}</td>`).join('')}</tr><tr><th scope="row">Aylık karşılığı</th>${list.map(p=>`<td>${money(p.price/p.months,p.currency)}</td>`).join('')}</tr><tr><th scope="row">Hediye uygulama*</th>${list.map(p=>`<td>${p.months===12?'1 lisans':'—'}</td>`).join('')}</tr><tr><th scope="row">Kurulum desteği</th>${list.map(()=>'<td>Dahil</td>').join('')}</tr></tbody></table></div><p>Aylık karşılık, toplam paket ücretinin süreye bölünmesidir; aylık ödeme planı değildir.</p>`;
  }
  function setRegion(value){
    region=value;
    document.querySelectorAll('[data-region]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.region===region)));
    grid.querySelectorAll('.package-card').forEach(card=>{card.hidden=card.classList.contains('international')!==(region==='international');});
    grid.classList.toggle('international-view',region==='international');
    renderComparison();
  }
  document.querySelectorAll('[data-region]').forEach(b=>b.addEventListener('click',()=>setRegion(b.dataset.region)));
  toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));comparison.hidden=!open;toggle.querySelector('span').textContent=open?'−':'＋';});
  setRegion('local');
})();

(() => {
  const tips={tv:'Smart TV: Samsung, LG ve Android TV mağazaları farklıdır. Uygulamanın televizyonunuzun modelinde bulunduğunu kontrol edin; lisans almadan önce deneme sürümünü açın.',android:'Android: Telefon, tablet ve Android TV sürümleri farklı olabilir. Cihazınızdaki resmi mağazada uygulamanın tam adını ve geliştiricisini kontrol edin; kumanda desteğini deneyin.',ios:'iOS / iPadOS: App Store’da cihazınıza uygun sürümü kontrol edin. Mobil lisansın televizyon lisansından ayrı olabileceğini ve cihazlar arasında aktarım koşullarını üreticiden öğrenin.',windows:'Windows: Oynatıcının resmi Windows sürümünü ve sistem gereksinimlerini kontrol edin. TV veya mobil lisansının bilgisayarda geçerli olduğunu varsaymayın.'};
  document.querySelectorAll('[data-device]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-device]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));document.getElementById('deviceAdvice').textContent=tips[button.dataset.device];}));
})();
