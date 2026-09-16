/* Original ADJOY star field, drawn locally without external assets or libraries. */
(() => {
  'use strict';
  const canvas=document.getElementById('starfield'),button=document.getElementById('motionControl');
  if(!canvas||!button)return;
  const ctx=canvas.getContext('2d');if(!ctx){button.hidden=true;return;}
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let paused=reduced.matches,visible=true,frame=0,last=0,time=0,width=0,height=0,stars=[],pointer={x:0,y:0};
  let seed=843;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  function size(){const r=canvas.getBoundingClientRect();width=r.width;height=r.height;const dpr=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);seed=843;stars=Array.from({length:Math.min(950,Math.round(width*height/950))},()=>({x:random()*width,y:random()*height,r:.25+Math.pow(random(),4)*1.8,phase:random()*6.28,depth:.15+random()*.85,warm:random()>.78}));draw();}
  function draw(){ctx.clearRect(0,0,width,height);for(const s of stars){const x=((s.x+time*s.depth*1.6+pointer.x*s.depth+width)%width),y=s.y+Math.sin(time*.12+s.phase)*2+pointer.y*s.depth;const opacity=.3+s.depth*.45+Math.sin(time*.5+s.phase)*.12;ctx.fillStyle=s.warm?`rgba(163,126,58,${opacity})`:`rgba(110,138,86,${opacity})`;if(s.r>1.4){const glow=ctx.createRadialGradient(x,y,0,x,y,s.r*7);glow.addColorStop(0,s.warm?'rgba(182,151,79,.22)':'rgba(144,172,116,.22)');glow.addColorStop(1,'transparent');ctx.fillStyle=glow;ctx.fillRect(x-s.r*7,y-s.r*7,s.r*14,s.r*14);ctx.fillStyle='rgba(139,159,103,.9)';}ctx.beginPath();ctx.arc(x,y,s.r,0,Math.PI*2);ctx.fill();}}
  function tick(now){frame=0;if(paused||!visible||document.hidden)return;if(now-last>32){time+=Math.min((now-last)/1000,.08);last=now;draw();}frame=requestAnimationFrame(tick);}
  function sync(){document.documentElement.classList.toggle("motion-paused",paused);cancelAnimationFrame(frame);frame=0;button.setAttribute('aria-pressed',String(paused));button.textContent=paused?'Hareketi başlat ▷':'Hareketi durdur Ⅱ';if(!paused&&visible&&!document.hidden){last=performance.now();frame=requestAnimationFrame(tick);}else draw();}
  button.addEventListener('click',()=>{paused=!paused;sync();});
  canvas.parentElement.addEventListener('pointermove',e=>{if(paused||e.pointerType!=='mouse')return;const r=canvas.getBoundingClientRect();pointer={x:(e.clientX-r.left-width/2)*.015,y:(e.clientY-r.top-height/2)*.015};},{passive:true});
  document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',e=>{paused=e.matches;sync();});
  if('IntersectionObserver'in window)new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:.01}).observe(canvas);
  if('ResizeObserver'in window)new ResizeObserver(size).observe(canvas);else window.addEventListener('resize',size,{passive:true});
  size();sync();
})();
(() => {
  const tips={tv:'Smart TV: Samsung, LG ve Android TV mağazaları farklıdır. Uygulamanın televizyonunuzun modelinde bulunduğunu kontrol edin; lisans almadan önce deneme sürümünü açın.',android:'Android: Telefon, tablet ve Android TV sürümleri farklı olabilir. Cihazınızdaki resmi mağazada uygulamanın tam adını ve geliştiricisini kontrol edin; kumanda desteğini deneyin.',ios:'iOS / iPadOS: App Store’da cihazınıza uygun sürümü kontrol edin. Mobil lisansın televizyon lisansından ayrı olabileceğini ve cihazlar arasında aktarım koşullarını üreticiden öğrenin.',windows:'Windows: Oynatıcının resmi Windows sürümünü ve sistem gereksinimlerini kontrol edin. TV veya mobil lisansının bilgisayarda geçerli olduğunu varsaymayın.'};
  document.querySelectorAll('[data-device]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-device]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));document.getElementById('deviceAdvice').textContent=tips[button.dataset.device];}));
  const surface=document.getElementById('heroSurface');let start=null;
  if(surface){surface.addEventListener('touchstart',e=>{if(e.target.closest('button,a'))return;start={x:e.changedTouches[0].clientX,y:e.changedTouches[0].clientY};},{passive:true});surface.addEventListener('touchend',e=>{if(!start)return;const dx=e.changedTouches[0].clientX-start.x,dy=e.changedTouches[0].clientY-start.y;start=null;if(Math.abs(dx)<65||Math.abs(dx)<Math.abs(dy)*1.5)return;const buttons=[...document.querySelectorAll('[data-slide]')];const current=buttons.findIndex(b=>b.getAttribute('aria-pressed')==='true');buttons[(current+(dx<0?1:buttons.length-1))%buttons.length]?.click();},{passive:true});}
})();

(() => {
 const surface=document.getElementById('heroSurface'),buttons=[...document.querySelectorAll('[data-slide]')];if(!surface||!buttons.length)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');let timer=null,onscreen=true,hover=false,focused=false;
 const paused=()=>document.documentElement.classList.contains('motion-paused')||reduced.matches||document.hidden||!onscreen||hover||focused;
 const schedule=()=>{clearTimeout(timer);if(!paused())timer=setTimeout(()=>{const index=buttons.findIndex(b=>b.getAttribute('aria-pressed')==='true');buttons[(index+1)%buttons.length].click();},6500);};
 buttons.forEach(button=>button.addEventListener('click',()=>{surface.dataset.scene=button.dataset.slide;const copy=surface.querySelector('.hero-copy');if(!paused()&&copy.animate)copy.animate([{opacity:.35,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:440,easing:'ease-out'});schedule();}));
 surface.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'){hover=true;schedule();}});surface.addEventListener('pointerleave',()=>{hover=false;schedule();});surface.addEventListener('focusin',()=>{focused=true;schedule();});surface.addEventListener('focusout',e=>{focused=surface.contains(e.relatedTarget);schedule();});document.addEventListener('visibilitychange',schedule);reduced.addEventListener('change',schedule);new MutationObserver(schedule).observe(document.documentElement,{attributes:true,attributeFilter:['class']});if('IntersectionObserver'in window)new IntersectionObserver(entries=>{onscreen=entries[0].isIntersecting;schedule();}).observe(surface);schedule();
})();
