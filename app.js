'use strict';
(() => {
  const products=window.ADJOY_PRODUCTS, packages=window.ADJOY_PACKAGES, articles=window.ADJOY_ARTICLES, config=window.ADJOY_CONFIG;
  const $=selector=>document.querySelector(selector);
  const money=(value,currency='TRY')=>new Intl.NumberFormat('tr-TR',{style:'currency',currency,maximumFractionDigits:2}).format(value);
  const escape=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const icon=name=>`<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;
  const normalize=value=>String(value).toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ı/g,'i');
  const storage={read(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}},write(key,value){try{localStorage.setItem(key,JSON.stringify(value));}catch{/* Storage is optional for file:// and private browsing. */}}};
  function resolveLine(line){
    if(!line||typeof line!=='object')return null;
    if(line.type==='package'){const p=packages.find(x=>x.id===line.id);return p?{...p,variantId:'package',variantName:`${p.months} aylık yayın paketi${p.months===12?' · 1 cihaz için hediye uygulama lisansı (seçim destekle yapılır)':''}`,image:'assets__logo.jpg',type:'package'}:null;}
    if(line.type && line.type!=='app')return null;
    const p=products.find(x=>x.id===line.id),v=p?.variants.find(x=>x.id===line.variant);
    return p&&v&&Number.isFinite(v.price)?{...p,price:v.price,variantId:v.id,variantName:v.name,type:'app'}:null;
  }
  const lineKey=line=>`${line.type||'app'}:${line.id}:${line.variant||'package'}`;
  function sanitizeCart(value){
    if(!Array.isArray(value))return [];
    const clean=[];
    value.slice(0,200).forEach(line=>{const p=resolveLine(line);if(!p)return;const qty=Math.max(1,Math.min(10,Math.floor(Number(line.qty)||1)));const existing=clean.find(x=>lineKey(x)===lineKey(line));if(existing)existing.qty=Math.min(10,existing.qty+qty);else clean.push({type:p.type,id:p.id,variant:p.type==='package'?'package':p.variantId,qty});});
    return clean;
  }
  const cartTotals=lines=>sanitizeCart(lines).reduce((totals,line)=>{const p=resolveLine(line),currency=p.currency||'TRY';totals[currency]=(totals[currency]||0)+p.price*line.qty;return totals;},{});
  const cartTotal=(lines,currency='TRY')=>cartTotals(lines)[currency]||0;
  const totalText=lines=>{const totals=cartTotals(lines);return Object.keys(totals).length?Object.entries(totals).map(([currency,value])=>money(value,currency)).join(' + '):money(0);};
  function filteredProducts({query='',filter='all',favoritesOnly=false,favorites=[],sort='featured'}={}){
    const result=products.filter(p=>(!query||normalize(`${p.name} ${p.description} ${p.category}`).includes(normalize(query)))&&(filter==='all'||(filter==='ibosol'?p.collection==='ibosol':p.variants.some(v=>v.id===filter)))&&(!favoritesOnly||favorites.includes(p.id)));
    const price=p=>{const vals=p.variants.filter(v=>filter==='all'||filter==='ibosol'||v.id===filter).map(v=>v.price).filter(Number.isFinite);return vals.length?Math.min(...vals):Infinity;};
    if(sort==='price-up')result.sort((a,b)=>price(a)-price(b));
    if(sort==='price-down')result.sort((a,b)=>{const av=price(a),bv=price(b);if(!Number.isFinite(av))return Number.isFinite(bv)?1:0;if(!Number.isFinite(bv))return -1;return bv-av;});
    if(sort==='name')result.sort((a,b)=>a.name.localeCompare(b.name,'tr'));
    return result;
  }
  function buildOrder(lines,note=''){
    const valid=sanitizeCart(lines);if(!valid.length)return '';
    return ['Merhaba ADJOY, şu ürünleri sipariş vermek istiyorum:','',...valid.map((line,i)=>{const p=resolveLine(line);return `${i+1}. ${p.name} — ${p.variantName} × ${line.qty} = ${money(p.price*line.qty,p.currency)}`;}),'',`Toplam: ${totalText(valid)}`,note.trim()?`Not: ${note.trim().slice(0,300)}`:'','Ödeme ve aktivasyon bilgilerini paylaşır mısınız?'].filter((x,i,list)=>x!==''||list[i-1]!=='').join('\n');
  }
  // Pure store functions are separately testable; no payment is processed here.
  window.ADJOY_CORE=Object.freeze({resolveLine,sanitizeCart,cartTotal,cartTotals,filteredProducts,buildOrder,normalize});
  let cart=sanitizeCart(storage.read('adjoy-cart-v2',[]));
  let favorites=storage.read('adjoy-favorites-v2',[]);favorites=Array.isArray(favorites)?[...new Set(favorites.filter(id=>products.some(p=>p.id===id)))]:[];
  let state={query:'',filter:'all',favoritesOnly:false,sort:'featured',limit:8};
  const selection={};
  let activeProduct=null,toastTimer;
  function toast(message){$('#toast').textContent=message;$('#toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),2700);}
  function support(message){window.open(`https://wa.me/${config.whatsapp}?text=${encodeURIComponent(message)}`,'_blank','noopener,noreferrer');}
  function openDialog(id){const d=$(`#${id}`);if(!d.open)d.showModal();}
  function chosenVariant(p){const matching=p.variants.filter(v=>state.filter==='all'||state.filter==='ibosol'||v.id===state.filter);return p.variants.find(v=>v.id===selection[p.id]&&(state.filter==='all'||state.filter==='ibosol'||v.id===state.filter))||matching[0]||p.variants[0];}
  function renderProducts(){
    const result=filteredProducts({...state,favorites});
    $('#catalogSummary').textContent=`${products.length} ürün seçeneği`;
    const visible=result.slice(0,state.limit);
    $('#productGrid').innerHTML=visible.map(p=>{
      const v=chosenVariant(p),isFavorite=favorites.includes(p.id);selection[p.id]=v.id;
      const variantOptions=p.variants.filter(option=>state.filter==='all'||state.filter==='ibosol'||option.id===state.filter);
      return `<article class="product-card" data-product="${p.id}"><div class="product-art ${p.clean?'clean':''} ${p.dark?'has-dark-logo':''}"><button class="art-button" data-detail="${p.id}" aria-label="${escape(p.name)} ürününü incele"><img src="${p.image}" alt="${escape(p.name)} logosu" width="184" height="104" loading="lazy"></button><span class="product-badge ${p.tone==='gold'?'gold-badge':''}">${escape(p.badge)}</span><button class="favorite-button ${isFavorite?'selected':''}" data-favorite="${p.id}" aria-label="${escape(p.name)} ${isFavorite?'favorilerden çıkar':'favorilere ekle'}" aria-pressed="${isFavorite}">${icon('heart')}</button></div><div class="product-body"><span class="product-category">${p.category}</span><h3><button class="product-title" data-detail="${p.id}">${escape(p.name)}</button></h3><p class="product-description">${p.description}</p><label class="sr-only" for="variant-${p.id}">${escape(p.name)} lisans süresi</label><select id="variant-${p.id}" class="variant-select" data-variant="${p.id}">${variantOptions.map(option=>`<option value="${option.id}" ${option.id===v.id?'selected':''}>${option.name}</option>`).join('')}</select><div class="product-buy-row"><div class="product-price" data-price="${p.id}">${v.price===null?'Bilgi al':money(v.price)}<small>${v.price===null?'Güncel durum için iletişim':'Tek uygulama lisansı'}</small></div><button class="add-cart" data-add="${p.id}" aria-label="${escape(p.name)} ${v.name} ${v.price===null?'hakkında bilgi al':'sepete ekle'}">${icon(v.price===null?'chat':'bag')} ${v.price===null?'Bize sor':'Sepete ekle'}</button></div><div class="product-bottom">${icon('bolt')} Dijital ürün <span>·</span> ${p.requiresApp?'Uygulamanı belirt':'Aktivasyon desteği'}</div></div></article>`;
    }).join('');
    $('#emptyProducts').hidden=result.length>0;
    $('#resultCount').textContent=`${result.length} üründen ${visible.length} ürün gösteriliyor`;
    $('#showMore').hidden=visible.length>=result.length;
    const active=Boolean(state.query||state.favoritesOnly||state.filter!=='all');
    $('#searchFeedback').hidden=!active;
    $('#searchFeedbackText').textContent=[state.favoritesOnly?'Favorilerin':'',state.query?`“${state.query}” araması`:'',state.filter!=='all'?({'ibosol':'IBOSOL seçkisi','year':'Yıllık lisanslar','lifetime':'Süresiz lisanslar','multi':'Çok yıllık lisanslar'}[state.filter]):''].filter(Boolean).join(' · ');
    $('#favoritesBtn').classList.toggle('favorites-active',state.favoritesOnly);
    $('#favoritesBtn').setAttribute('aria-pressed',String(state.favoritesOnly));
  }
  function renderPackages(){
    $('#packageGrid').innerHTML=packages.map(p=>`<article class="package-card ${p.featured?'featured':''} ${p.international?'international':''}"><div class="package-label">${p.label}</div><h3>${p.months} <span>Ay</span></h3><div class="package-price">${money(p.price,p.currency)} <small>/ paket</small></div><div class="package-monthly">Ayda yaklaşık ${money(p.price/p.months,p.currency)}</div><ul><li>${p.months} aylık yayın paketi</li><li>Cihaza göre kurulum</li><li>Aktivasyon desteği</li><li>WhatsApp iletişim</li></ul><div class="package-gift">${p.months===12?'Seçtiğiniz 1 uygulama lisansı hediye*':p.description}</div><button class="button ${p.featured?'gold':'outline'}" data-package="${p.id}" aria-label="${p.name} sepete ekle">Paketi seç <span>→</span></button></article>`).join('');
  }
  function saveCart(){cart=sanitizeCart(cart);storage.write('adjoy-cart-v2',cart);renderCart();}
  function addProduct(id,variantId){
    const p=products.find(x=>x.id===id);if(!p)return;
    const v=p.variants.find(x=>x.id===variantId)||p.variants[0];
    if(v.price===null){support(`Merhaba, ${p.name} ${v.name} için fiyat ve aktivasyon durumu hakkında bilgi almak istiyorum.`);return;}
    addLine({type:'app',id:p.id,variant:v.id,qty:1},p.name);
  }
  function addLine(line,name){const existing=cart.find(x=>lineKey(x)===lineKey(line));if(existing){if(existing.qty>=10){toast('Aynı üründen en fazla 10 adet ekleyebilirsin. Toplu alım için bize yaz.');return;}existing.qty++;}else cart.push(line);saveCart();toast(`${name} sepetine eklendi.`);}
  function renderCart(){
    const count=cart.reduce((sum,line)=>sum+line.qty,0),total=totalText(cart);
    $('#cartCount').textContent=count;$('#headerTotal').textContent=total;$('#drawerCount').textContent=`(${count})`;$('#cartTotal').textContent=total;$('#cartCheckout').hidden=!cart.length;
    $('#cartItems').innerHTML=cart.length?cart.map((line,index)=>{const p=resolveLine(line);return `<div class="cart-item"><div class="cart-item-art ${p.dark?'dark-logo':''}"><img src="${p.image}" alt="${escape(p.name)}" width="53" height="50"></div><div><h3>${escape(p.name)}</h3><p>${escape(p.variantName)}${p.type==='app'?' · Tek uygulama':''}</p><div class="cart-item-row"><strong>${money(p.price*line.qty,p.currency)}</strong><div class="cart-item-tools"><div class="qty-controls"><button data-qty="${index}" data-delta="-1" aria-label="${escape(p.name)} adedini azalt" ${line.qty<=1?'disabled':''}>−</button><span aria-label="Adet">${line.qty}</span><button data-qty="${index}" data-delta="1" aria-label="${escape(p.name)} adedini artır" ${line.qty>=10?'disabled':''}>+</button></div><button class="remove-item" data-remove="${index}" aria-label="${escape(p.name)} sepetten çıkar">Sil</button></div></div></div></div>`;}).join(''):`<div class="cart-empty">${icon('bag')}<h3>Sepetin keşfetmeni bekliyor.</h3><p>Bir uygulama veya paket seçerek başlayabilirsin.</p><button class="button dark" data-continue>Mağazayı keşfet →</button></div>`;
  }
  function productDetail(id){
    const p=products.find(x=>x.id===id);if(!p)return;activeProduct=p;
    const v=chosenVariant(p);
    $('#productContent').innerHTML=`<div class="product-detail"><div class="detail-art ${p.dark?'dark-logo':''}"><img src="${p.image}" width="220" height="180" alt="${escape(p.name)} logosu"></div><div class="detail-main"><div class="eyebrow">${p.category}</div><h2 id="productTitle">${escape(p.name)}</h2><p>${p.detail}</p><label for="detailVariant">Lisans süresi</label><select id="detailVariant" class="variant-select">${p.variants.map(o=>`<option value="${o.id}" ${o.id===v.id?'selected':''}>${o.name}</option>`).join('')}</select><div class="product-price" id="detailPrice">${v.price===null?'Bilgi al':money(v.price)}</div><button class="button gold" id="detailAdd">${icon(v.price===null?'chat':'bag')} ${v.price===null?'Aktivasyon durumunu sor':'Sepete ekle'}</button></div><div class="detail-note"><strong>Satın almadan önce</strong><br>Tek uygulama lisansıdır; yayın veya kanal içermez. Uygulamayı kendi cihazında test et. Süresiz seçenek, üreticinin lisans ve cihaz koşullarına tabidir.${p.requiresApp?'<br><strong>İstediğin uygulama adını sipariş notunda belirt; uygunluk ödeme öncesinde teyit edilir.</strong>':''}</div>${p.source?`<a class="detail-source" href="${p.source}" target="_blank" rel="noopener noreferrer">Üretici / uygulama mağazası bilgilerini incele ↗</a>`:''}</div>`;
    $('#detailVariant').addEventListener('change',event=>{const selected=p.variants.find(o=>o.id===event.target.value);$('#detailPrice').textContent=selected.price===null?'Bilgi al':money(selected.price);$('#detailAdd').innerHTML=`${icon(selected.price===null?'chat':'bag')} ${selected.price===null?'Aktivasyon durumunu sor':'Sepete ekle'}`;});
    $('#detailAdd').addEventListener('click',()=>addProduct(p.id,$('#detailVariant').value));
    openDialog('productDialog');
  }
  function article(id){
    const a=articles[id];if(!a)return;
    $('#articleContent').innerHTML=`<div class="eyebrow">${escape(a.category)}</div><h2 id="articleTitle">${escape(a.title)}</h2><div class="article-meta">${a.date?`${a.date} · `:''}${escape(a.reading)}${a.own?' · ADJOY Rehber':''}</div><div class="article-body">${a.body}</div>${a.source?`<div class="article-license"><strong>${a.own?'İlgili üretici bilgisi':'Kaynak ve atıf'}</strong><br><a href="${a.source}" target="_blank" rel="noopener noreferrer">${escape(a.sourceLabel)} ↗</a>${a.author?`<br>${escape(a.author)}`:''}${a.license?` · <a href="${a.licenseUrl}" target="_blank" rel="noopener noreferrer">${escape(a.license)}</a><br>${escape(a.adaptation)}`:''}</div>`:''}${a.own?'<button class="button dark article-cta" data-shop-from-article>Uygulamaları keşfet →</button>':''}`;
    openDialog('articleDialog');$('#articleDialog').scrollTop=0;
  }
  function renderArticles(){
    $('#guideGrid').innerHTML=['lisans','kurulum','baglanti'].map(id=>{const a=articles[id];return `<button class="guide-card" data-article="${id}"><span class="guide-icon">${icon(a.icon)}</span><span><small>${a.category}</small><h3>${a.title}</h3><p>${a.reading}<span>↗</span></p></span></button>`;}).join('');
    if($('#newsGrid'))$('#newsGrid').innerHTML=['firefox','guvenlik','ccapi'].map(id=>{const a=articles[id];return `<article class="news-card"><button class="news-art ${a.cover}" data-article="${id}" aria-label="${a.title}"><span>ADJOY JOURNAL / 2026</span><strong>${a.coverTitle}</strong><span class="art-meta">${a.coverMeta}</span></button><div class="news-body"><div class="news-meta"><span>${a.category}</span><time>${a.date}</time></div><h3><button class="news-title" data-article="${id}">${a.title}</button></h3><p>${a.teaser}</p><button class="text-button" data-article="${id}">Haberi oku <span>↗</span></button></div></article>`;}).join('');
  }
  function resetFilters(){state={query:'',filter:'all',favoritesOnly:false,sort:'featured',limit:8};$('#globalSearch').value='';$('#sort').value='featured';updateTabs();renderProducts();}
  function updateTabs(){$$('#categoryTabs button').forEach(button=>{const active=button.dataset.filter===state.filter;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});}
  const $$=selector=>Array.from(document.querySelectorAll(selector));
  document.addEventListener('click',event=>{
    const button=event.target.closest('button');if(!button)return;
    const d=button.dataset;
    if(d.close){$(`#${d.close}`).close();return;}
    if(d.support!==undefined){support(d.support);return;}
    if(d.detail){productDetail(d.detail);return;}
    if(d.favorite){const had=favorites.includes(d.favorite);favorites=had?favorites.filter(x=>x!==d.favorite):[...favorites,d.favorite];storage.write('adjoy-favorites-v2',favorites);renderProducts();toast(had?'Uygulama favorilerden çıkarıldı.':'Uygulama favorilerine eklendi.');return;}
    if(d.add){addProduct(d.add,selection[d.add]);return;}
    if(d.package){const p=packages.find(x=>x.id===d.package);if(p)addLine({type:'package',id:p.id,variant:'package',qty:1},p.name);return;}
    if(d.filter){state.filter=d.filter;state.limit=8;updateTabs();renderProducts();return;}
    if(d.article){article(d.article);return;}
    if(d.qty!==undefined){const i=Number(d.qty),delta=Number(d.delta);if(cart[i])cart[i].qty=Math.min(10,Math.max(1,cart[i].qty+delta));saveCart();return;}
    if(d.remove!==undefined){cart.splice(Number(d.remove),1);saveCart();return;}
    if(d.continue!==undefined){$('#cartDialog').close();location.hash='uygulamalar';return;}
    if(d.shopFromArticle!==undefined){$('#articleDialog').close();location.hash='uygulamalar';return;}
  });
  document.addEventListener('change',event=>{const id=event.target.dataset.variant;if(id){selection[id]=event.target.value;const p=products.find(x=>x.id===id),v=p.variants.find(x=>x.id===selection[id]);const price=$(`[data-price="${id}"]`);price.innerHTML=`${v.price===null?'Bilgi al':money(v.price)}<small>${v.price===null?'Güncel durum için iletişim':'Tek uygulama lisansı'}</small>`;$(`[data-add="${id}"]`).setAttribute('aria-label',`${p.name} ${v.name} ${v.price===null?'hakkında bilgi al':'sepete ekle'}`);}});
  function searchSite(query){
    const q=normalize(query.trim());if(!q){$('#siteSearchResults').hidden=true;return;}
    const matches=(name,text='')=>normalize(name+' '+text).includes(q);
    const found=[...packages.filter(p=>matches(p.name,p.description)).map(p=>({type:'Abonelik',title:p.name,detail:money(p.price,p.currency),id:p.id,kind:'package'})),...products.filter(p=>matches(p.name,p.description)).map(p=>({type:'Oynatıcı',title:p.name,detail:p.category,id:p.id,kind:'detail'})),...['iptv','lisans','kurulum','baglanti','secim'].filter(id=>matches(articles[id].title,articles[id].body.replace(/<[^>]*>/g,' '))).map(id=>({type:'Rehber',title:articles[id].title,detail:articles[id].reading,id,kind:'article'}))];
    $('#siteSearchResults').hidden=false;$('#siteSearchSummary').textContent='“'+query+'” için '+found.length+' sonuç';
    $('#siteSearchGrid').innerHTML=found.length?found.map(r=>'<button class="search-result-card" data-'+r.kind+'="'+escape(r.id)+'"><small>'+r.type+'</small><strong>'+escape(r.title)+'</strong><span>'+escape(r.detail)+' ↗</span></button>').join(''):'<p class="no-search-results">Sonuç bulunamadı. “12 ay”, “IBO” veya “kurulum” gibi bir ifade deneyin.</p>';
    location.hash='siteSearchResults';
  }
  $('#headerSearch').addEventListener('submit',event=>{event.preventDefault();searchSite($('#globalSearch').value.trim().slice(0,100));});
  $('#closeSearch').addEventListener('click',()=>{$('#siteSearchResults').hidden=true;$('#globalSearch').focus();});
  $('#globalSearch').addEventListener('input',event=>{if(!event.target.value&&state.query){state.query='';renderProducts();}});
  $('#sort').addEventListener('change',event=>{state.sort=event.target.value;renderProducts();});
  $('#resetFilters').addEventListener('click',resetFilters);$('#emptyReset').addEventListener('click',resetFilters);
  $('#showMore').addEventListener('click',()=>{state.limit=products.length;renderProducts();});
  $('#favoritesBtn').addEventListener('click',()=>{state.favoritesOnly=!state.favoritesOnly;state.query='';state.filter='all';$('#globalSearch').value='';state.limit=products.length;updateTabs();renderProducts();location.hash='uygulamalar';});
  ['openCart','footerCart'].forEach(id=>$(`#${id}`).addEventListener('click',()=>{renderCart();openDialog('cartDialog');}));
  $('#checkout').addEventListener('click',()=>{const message=buildOrder(cart,$('#orderNote').value);if(message)support(message);});
  $('#downloadOrder').addEventListener('click',()=>{const text=buildOrder(cart,$('#orderNote').value);if(!text)return;const blob=new Blob(['\uFEFF'+text],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='ADJOY-siparis-ozeti.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Sipariş özeti indirildi. Henüz ödeme alınmadı.');});
  const nav=$('#mainNav'),menu=$('#mobileMenu');menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Menüyü kapat':'Menüyü aç');});
  nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Menüyü aç');}));
  $$('dialog').forEach(d=>d.addEventListener('click',event=>{if(event.target===d){const r=d.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)d.close();}}));
  const slides=[{title:'Kumanda sende.<br><em>Keyif ADJOY’da.</em>',text:'Ekranın başına geç. Sana uygun paketi seç.<br>Bir aylık başlangıçtan bir yıllık keyfe.',action:'Abonelikleri keşfet',link:'#paketler'},{title:'Bir yıl senin.<br><em>Oynatıcı bizden.</em>',text:'12 aylık IPTV alana seçtiği 1 uygulama lisansı hediye.<br>Tek cihaz için. Doğru uygulamayı birlikte seçelim.',action:'Hediyeni keşfet',link:'#hediye'},{title:'Ekranına yakışan<br><em>oynatıcıyı bul.</em>',text:'SmartOne, IBO Player ve daha fazlası.<br>Cihazında dene, sana uygun lisansla devam et.',action:'Oynatıcıları keşfet',link:'#uygulamalar'}];
  $$('[data-slide]').forEach(button=>button.addEventListener('click',()=>{const s=slides[Number(button.dataset.slide)];$('#heroTitle').innerHTML=s.title;$('#heroText').innerHTML=s.text;$('#heroAction').innerHTML=`${s.action} ${icon('arrow')}`;$('#heroAction').href=s.link;$$('[data-slide]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button));});}));
  const intro=$('#intro');const dismissIntro=()=>{intro.hidden=true;};$('#skipIntro').addEventListener('click',dismissIntro);
  try{if(!sessionStorage.getItem('adjoy-intro-v2')&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){intro.hidden=false;sessionStorage.setItem('adjoy-intro-v2','1');setTimeout(dismissIntro,1350);}}catch{dismissIntro();}
  renderProducts();renderPackages();renderArticles();renderCart();
})();
