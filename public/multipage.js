/* Converts the editable one-canvas composition to navigable, self-contained preview pages.
   The exported HTML retains this client-side router and has no server dependency. */
(() => {
  const originalPreview = getPreview;
  const routeScript = `<script>(function(){const pages=[...document.querySelectorAll('[data-route]')];if(!pages.length)return;const available=new Set(pages.map(p=>p.dataset.route));function navigate(){let route=decodeURIComponent(location.hash.replace('#/',''))||'home';if(!available.has(route))route='home';pages.forEach(p=>{p.hidden=p.dataset.route!==route});document.querySelectorAll('[data-route-link]').forEach(a=>{const selected=a.dataset.routeLink===route;a.classList.toggle('ws-route-active',selected);if(selected)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});window.scrollTo(0,0)}window.addEventListener('hashchange',navigate);navigate();document.addEventListener('click',function(ev){const a=ev.target.closest('a[href^="#/"]');if(a&&a.getAttribute('href')===location.hash){ev.preventDefault();navigate()}})})();</script>`;
  const routeCss = `<style>
    .ws-site [data-route][hidden]{display:none!important}
    .ws-site .ws-route-active{color:var(--ws-accent);opacity:1!important}
    .ws-site .ws-page-head{padding:48px 7% 26px;background:var(--ws-soft);border-bottom:1px solid #80808025}
    .ws-site .ws-page-head h1{font-size:clamp(38px,4.5vw,66px);margin:10px 0}
    .ws-site .ws-page-head p{max-width:620px;opacity:.73}
    .ws-site .ws-route-crumb{font-size:12px;font-weight:800;letter-spacing:.04em;opacity:.75}
    .ws-site .ws-route-crumb:hover{text-decoration:underline}
    .ws-site .ws-flow-grid{display:grid;grid-template-columns:1.3fr .75fr;gap:24px;align-items:start}
    .ws-site .ws-flow-grid .ws-cart-panel{position:static}
    .ws-site .ws-flow-progress{display:flex;gap:8px;margin-top:22px;color:var(--ws-accent);font-size:11px;font-weight:800;letter-spacing:.05em;flex-wrap:wrap}
    .ws-site .ws-flow-progress>span{padding:8px 13px;background:var(--ws-bg);border-radius:30px}
    .ws-site .ws-route-empty{font-size:13px;line-height:1.7;opacity:.72}
    .ws-site .ws-mini-cart-link{display:inline-flex;align-items:center;gap:8px}
    .ws-site .ws-checkout-form{max-width:650px;margin:0}
    @media(max-width:800px){.ws-site .ws-flow-grid{grid-template-columns:1fr}.ws-site .ws-page-head{padding:35px 6% 22px}}
  </style>`;
  const newSection = (doc,route,html) => {
    const el=doc.createElement('section');el.dataset.route=route;el.innerHTML=html;return el;
  };
  getPreview=function(){
    const html=originalPreview();
    if(!html.includes('data-ws-site'))return html;
    const doc=new DOMParser().parseFromString(html,'text/html');
    const site=doc.querySelector('[data-ws-site]');
    if(!site)return html;
    const nav=site.querySelector('.ws-nav');
    const footer=site.querySelector('.ws-footer');
    if(!nav||!footer)return html;
    const experience=site.querySelector('[data-ws-feature-block="experience"]');
    const isStore=Boolean(experience?.querySelector('.ws-commerce-layout'));
    const featureRoute=isStore?'shop':({EdTech:'courses',SaaS:'workspace','Social Network':'community',Portfolio:'work','Business Website':'services'}[type]||'features');
    const featureLabel={shop:'Shop',courses:'Courses',workspace:'Workspace',community:'Community',work:'Work',services:'Services'}[featureRoute]||'Explore';
    const navLinks=nav.querySelector('.ws-navlinks');
    const hasExperience=Boolean(experience);
    navLinks.innerHTML=`<a href="#/home" data-route-link="home">Home</a>${hasExperience?`<a href="#/${featureRoute}" data-route-link="${featureRoute}">${featureLabel}</a>`:''}${isStore?'<a class="ws-mini-cart-link" href="#/cart" data-route-link="cart">Bag <span class="ws-cart-badge" data-cart-count>0</span></a>':''}<a href="#/contact" data-route-link="contact">Contact</a>`;
    const customPages=[...site.querySelectorAll(':scope > [data-ws-user-page]')];
    customPages.forEach(page=>{
      const route=page.getAttribute('data-ws-user-page');
      if(!/^[a-z0-9-]+$/.test(route)||['home','contact','about','cart','checkout',featureRoute].includes(route))return;
      const label=page.getAttribute('data-ws-page-title')||route;
      const link=doc.createElement('a');link.href='#/'+route;link.dataset.routeLink=route;link.textContent=label;
      navLinks.append(link);
    });
    const brand=nav.querySelector('.ws-brand');if(brand)brand.href='#/home';
    const navCta=nav.querySelector('.ws-pill');if(navCta)navCta.href=hasExperience?'#/'+featureRoute:'#/contact';
    site.querySelectorAll('a[href="#discover"],a[href="#features-showcase"]').forEach(a=>a.href=hasExperience?'#/'+featureRoute:'#/contact');
    site.querySelectorAll('a[href="#contact"]').forEach(a=>a.href='#/contact');
    const children=[...site.children];
    for(const child of children){
      if(child===nav||child===footer)continue;
      if(child.hasAttribute('data-ws-user-page')){child.dataset.route=child.getAttribute('data-ws-user-page');continue;}
      if(child.id==='contact'){child.dataset.route='contact';continue;}
      if(child.hasAttribute('data-ws-feature-block')){child.dataset.route=child===experience?featureRoute:'features';continue;}
      child.dataset.route='home';
    }
    if(isStore){
      // The catalogue is a full page, and the bag and checkout are distinct pages.
      const cartPanel=experience.querySelector('.ws-cart-panel');
      const checkoutForm=cartPanel?.querySelector('.ws-checkout-form');
      const cartPage=newSection(doc,'cart','<div class="ws-page-head"><a class="ws-route-crumb" href="#/shop">← Continue shopping</a><h1>Your shopping bag.</h1><p>Review your selections before moving to checkout.</p><div class="ws-flow-progress"><span>01 · Browse</span><span>02 · Bag</span><span>03 · Checkout</span></div></div><div class="ws-section ws-flow-grid"><div class="ws-card"><span class="ws-kicker">YOUR SELECTIONS</span><h2>Almost yours.</h2><p class="ws-route-empty">Your cart updates whenever you add a product in the collection. You can return to shop at any time.</p><a class="ws-pill ws-outline" href="#/shop">← Back to products</a></div></div>');
      const grid=cartPage.querySelector('.ws-flow-grid');
      if(cartPanel){
        if(checkoutForm)checkoutForm.remove();
        const oldButton=cartPanel.querySelector('[data-demo="viewcart"]');if(oldButton)oldButton.remove();
        const checkoutLink=doc.createElement('a');checkoutLink.href=checkoutForm?'#/checkout':'#/shop';checkoutLink.className='ws-pill';checkoutLink.style.width='100%';checkoutLink.textContent=checkoutForm?'Continue to secure checkout ↗':'Continue shopping →';cartPanel.append(checkoutLink);
        grid.append(cartPanel);
      }
      // The product view keeps its own route and has a prominent path to cart.
      const heading=experience.querySelector('.ws-collection-head');
      if(heading){const link=doc.createElement('a');link.href='#/cart';link.className='ws-pill';link.textContent='View bag →';heading.append(link);}
      site.insertBefore(cartPage,footer);
      if(checkoutForm){
        const checkoutPage=newSection(doc,'checkout','<div class="ws-page-head"><a class="ws-route-crumb" href="#/cart">← Back to your bag</a><h1>Secure checkout.</h1><p>A clean, reassuring checkout experience—without distractions.</p><div class="ws-flow-progress"><span>✓ Browse</span><span>✓ Bag</span><span>03 · Checkout</span></div></div><div class="ws-section ws-flow-grid"><div class="ws-card"><span class="ws-kicker">DELIVERY DETAILS</span><h2>Where should it go?</h2><p class="ws-demo-note">Frontend demonstration only. No actual payment or order will be created.</p></div><aside class="ws-cart-panel"><span class="ws-kicker">ORDER SUMMARY</span><h3>One last look.</h3><div class="ws-cart-line"><span>Items in bag</span><b class="ws-cart-badge" data-cart-count>0</b></div><div class="ws-cart-total"><span>Amount due</span><span data-cart-total>₹0</span></div><span class="ws-tag">🔒 Demo mode — no payment charged</span></aside></div>');
        checkoutPage.querySelector('.ws-card').append(checkoutForm);
        site.insertBefore(checkoutPage,footer);
      }
    }
    // Add a genuine About page, while contact and selected-feature pages remain distinct.
    const about=newSection(doc,'about',`<div class="ws-page-head"><a class="ws-route-crumb" href="#/home">← Home</a><h1>More than a website.</h1><p>Thoughtfully designed experiences, meaningful details, and a story worth sharing.</p></div><div class="ws-section"><span class="ws-kicker">OUR STORY</span><h2>Built with intention.</h2><p class="ws-intro">This page is ready for your brand story, team and values. Select it in the editor to personalise your content.</p></div>`);
    site.insertBefore(about,footer);
    const homeNav=navLinks.querySelector('[data-route-link="home"]');
    if(homeNav)homeNav.insertAdjacentHTML('afterend','<a href="#/about" data-route-link="about">About</a>');
    if(site.querySelector('[data-route="features"]'))navLinks.insertAdjacentHTML('beforeend','<a href="#/features" data-route-link="features">More features</a>');
    const noFeatureBlocks=site.querySelectorAll('[data-ws-feature-block]').length===0;
    if(noFeatureBlocks){site.querySelectorAll('[data-route="home"] a[href^="#/"]').forEach(a=>{if(a.getAttribute('href')==='#/features')a.href='#/contact'});}
    // The router always starts on Home, and works with browser Back / Forward.
    site.querySelectorAll('[data-route]').forEach(el=>{el.hidden=el.dataset.route!=='home'});
    doc.head.insertAdjacentHTML('beforeend',routeCss);
    doc.body.insertAdjacentHTML('beforeend',routeScript);
    return '<!doctype html>\n'+doc.documentElement.outerHTML;
  };
})();
