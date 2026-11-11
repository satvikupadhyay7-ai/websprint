/* WebSprint: selected templates and features are actual editable prototypes. */
(() => {
  const $ = s => document.querySelector(s);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const slug = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  const getEditor = () => typeof editor !== 'undefined' ? editor : null;
  const names = {
    'E-commerce':['ATELIER','Curated essentials for everyday living.','Find your next favorite.','A carefully edited collection of pieces that elevate the everyday.','Shop the collection','✦','Amber','Berry','Sage'],
    'EdTech':['NOVA ACADEMY','A brighter way to learn.','A little progress, every day.','Expert-led courses, inspiring teachers and a learning experience designed around you.','Explore courses','◈','Mathematics','Design','Technology'],
    'SaaS':['NEXUS','Work beautifully, together.','Your ideas. One powerful workspace.','Keep projects, people and progress perfectly in sync with a platform that feels effortless.','Start for free','▧','Projects','Automation','Insights'],
    'Social Network':['CIRCLE','The good kind of connection.','Find your people.','Discover communities, share what matters and create connections that feel real.','Explore community','◎','Design Club','Weekend Runs','Creators'],
    'Portfolio':['MONO STUDIO','Independent creative practice.','Ideas made tangible.','Digital experiences and thoughtful visual identities built to leave an impression.','View selected work','✳','Brand Identity','Digital Product','Editorial'],
    'Business Website':['FORM & CO.','Thoughtful solutions. Lasting impact.','Good business, beautifully done.','Strategy, creative thinking and a little magic to help ambitious brands grow.','Our services','↗','Strategy','Creative','Growth']
  };
  const tones = {
    'Midnight':['#101b2b','#ecf7fb','#7adccf','#1b3041'], 'Clean Light':['#fafbf8','#1c3430','#377d6b','#e9f0e9'],
    'Editorial':['#f4ede4','#3e302b','#ad7055','#e9d9ca'], 'Playful':['#fff4ef','#39253f','#e77d78','#ffe3d8'],
    'Nature':['#f2f5ed','#264331','#568a63','#e3eadb'], 'Corporate':['#f1f5fa','#203c58','#3178ae','#e3edf7'],
    'Luxury':['#191a18','#f4eedf','#c6a36e','#292b26'], 'Tech Gradient':['#121634','#f6f5ff','#9a9aff','#252b57']
  };
  const siteCss = `
    .ws-site{--ws-bg:#fafbf8;--ws-ink:#1c3430;--ws-accent:#377d6b;--ws-soft:#e9f0e9;background:var(--ws-bg);color:var(--ws-ink);font:400 16px/1.65 Manrope,Arial,sans-serif;min-height:100vh}
    .ws-site *{box-sizing:border-box}.ws-site a{color:inherit;text-decoration:none}.ws-site button,.ws-site input,.ws-site textarea{font:inherit}.ws-site button{cursor:pointer}
    .ws-site .ws-nav{padding:26px max(6%,calc((100% - 1160px)/2));display:flex;justify-content:space-between;align-items:center;gap:24px;flex-wrap:wrap;border-bottom:1px solid currentColor}
    .ws-site .ws-brand{font-size:19px;font-weight:800;letter-spacing:-.055em}.ws-site .ws-brand span{color:var(--ws-accent)}
    .ws-site .ws-navlinks{display:flex;gap:26px;align-items:center;flex-wrap:wrap;font-size:12px;font-weight:700;opacity:.8}
    .ws-site .ws-pill{display:inline-flex;align-items:center;justify-content:center;gap:9px;background:var(--ws-accent);border:1px solid var(--ws-accent);color:#fff;padding:13px 22px;border-radius:100px;font-size:12px;font-weight:800;transition:transform .2s,opacity .2s}
    .ws-site .ws-pill:hover{transform:translateY(-2px);opacity:.9}.ws-site .ws-pill.ws-outline{background:transparent;color:var(--ws-ink);border-color:currentColor}
    .ws-site .ws-hero{padding:95px max(6%,calc((100% - 1160px)/2)) 100px;display:grid;grid-template-columns:1.1fr .9fr;align-items:center;gap:60px;min-height:580px}
    .ws-site .ws-kicker{font-size:11px;letter-spacing:.19em;text-transform:uppercase;font-weight:800;color:var(--ws-accent)}
    .ws-site h1{font-size:clamp(46px,6vw,86px);line-height:1.06;letter-spacing:-.065em;margin:18px 0 22px;font-weight:800}
    .ws-site h2{font-size:clamp(30px,3.5vw,52px);letter-spacing:-.055em;line-height:1.14;margin:10px 0 18px}
    .ws-site h3{font-size:20px;letter-spacing:-.035em;line-height:1.3;margin:10px 0}
    .ws-site .ws-intro{font-size:17px;line-height:1.8;max-width:560px;opacity:.8}.ws-site .ws-cta-row{display:flex;gap:12px;flex-wrap:wrap;margin-top:32px}
    .ws-site .ws-art{min-height:400px;border-radius:30px;background:linear-gradient(135deg,var(--ws-soft),var(--ws-accent));position:relative;display:grid;place-items:center;overflow:hidden}
    .ws-site .ws-art-symbol{font-size:180px;line-height:1;color:var(--ws-bg);text-shadow:0 12px 40px #0002;transform:rotate(-12deg)}
    .ws-site .ws-art-stamp{position:absolute;bottom:25px;left:25px;right:25px;padding:16px 20px;border-radius:16px;background:var(--ws-bg);color:var(--ws-ink);display:flex;justify-content:space-between;font-size:12px;font-weight:800}
    .ws-site .ws-strip{display:flex;justify-content:center;flex-wrap:wrap;gap:25px;padding:18px 6%;background:var(--ws-accent);color:white;font-size:11px;font-weight:800;letter-spacing:.07em}
    .ws-site .ws-section{padding:80px max(6%,calc((100% - 1160px)/2))}.ws-site .ws-section.ws-alt{background:var(--ws-soft)}
    .ws-site .ws-section-head{display:flex;justify-content:space-between;align-items:end;gap:24px;margin-bottom:30px}.ws-site .ws-section-head p{max-width:440px;opacity:.72}
    .ws-site .ws-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}.ws-site .ws-card{min-width:0;padding:24px;border-radius:22px;background:var(--ws-bg);border:1px solid #8080802b;box-shadow:0 18px 50px #0000000c}
    .ws-site .ws-card p{font-size:13px;opacity:.74;line-height:1.7}.ws-site .ws-card .ws-pill{margin-top:10px}
    .ws-site .ws-thumb{aspect-ratio:1.3;display:grid;place-items:center;border-radius:16px;background:linear-gradient(145deg,var(--ws-soft),var(--ws-accent));font-size:75px;margin-bottom:18px;overflow:hidden}
    .ws-site .ws-tag{display:inline-block;background:var(--ws-soft);border-radius:100px;padding:6px 12px;font-size:11px;font-weight:800}
    .ws-site .ws-input{width:100%;padding:13px 17px;border-radius:12px;border:1px solid #80808066;background:var(--ws-bg);color:var(--ws-ink);min-width:0}
    .ws-site .ws-row{display:flex;gap:12px;flex-wrap:wrap;align-items:center}.ws-site .ws-row>*{max-width:100%}
    .ws-site .ws-demo-note{font-size:11px;opacity:.65;margin-top:12px}.ws-site .ws-feature-icon{font-size:28px}
    .ws-site .ws-footer{padding:50px 7%;display:flex;justify-content:space-between;gap:25px;flex-wrap:wrap;background:var(--ws-ink);color:var(--ws-bg)}
    .ws-site .ws-footer small{font-size:12px;opacity:.7}.ws-site .ws-cart-badge{display:inline-grid;place-items:center;width:22px;height:22px;background:var(--ws-accent);color:white;border-radius:50%;font-size:11px}
    .ws-site details{border:1px solid #80808050;border-radius:14px;padding:17px 20px;margin-bottom:10px;background:var(--ws-bg)}.ws-site summary{cursor:pointer;font-weight:800}
    .ws-site .ws-custom-dropdown{display:inline-block!important;width:max-content;min-width:0;max-width:100%;height:auto;vertical-align:top;align-self:flex-start;justify-self:start;background:var(--ws-soft)!important;color:var(--ws-ink)!important;margin:5px 0 10px}
    .ws-site .ws-custom-dropdown summary{white-space:nowrap;display:list-item;line-height:1.4}
    .ws-site .ws-custom-dropdown .ws-custom-dropdown-menu{min-width:190px;width:max-content;max-width:min(300px,85vw);background:var(--ws-bg)!important;color:var(--ws-ink);border-color:#80808045!important}
    .ws-site .ws-custom-dropdown .ws-custom-dropdown-menu a{color:var(--ws-ink)!important;white-space:nowrap}
    .ws-site .ws-custom-dropdown .ws-custom-dropdown-menu a:hover{background:var(--ws-soft)}
    .ws-site .ws-demo-toast{position:fixed;z-index:1000;bottom:22px;right:22px;background:#172c25;color:white;padding:15px 20px;border-radius:12px;box-shadow:0 10px 35px #0003;font-size:13px}
    .ws-site .ws-commerce-layout{display:grid;grid-template-columns:minmax(0,1fr) 340px;gap:24px;align-items:start}
    .ws-site .ws-products{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}
    .ws-site .ws-product{padding:13px;border-radius:22px;background:var(--ws-bg);border:1px solid #80808030;box-shadow:0 15px 40px #0000000d}
    .ws-site .ws-product-art{height:210px;border-radius:16px;display:grid;place-items:center;font-size:78px;position:relative;background:linear-gradient(145deg,#dce9dc,#b8c6ac);overflow:hidden}
    .ws-site .ws-product:nth-child(2) .ws-product-art{background:linear-gradient(145deg,#f5e3d4,#d9bca9)}.ws-site .ws-product:nth-child(3) .ws-product-art{background:linear-gradient(145deg,#dbe1f3,#acbbd4)}.ws-site .ws-product:nth-child(4) .ws-product-art{background:linear-gradient(145deg,#f3e3e6,#ceb6c0)}
    .ws-site .ws-product-info{padding:13px 6px 6px}.ws-site .ws-product-info h3{font-size:17px;margin:5px 0}.ws-site .ws-product-info p{margin:0 0 14px;font-size:12px;opacity:.7}
    .ws-site .ws-product-actions{display:flex;justify-content:space-between;gap:10px;align-items:center}.ws-site .ws-product-actions .ws-pill{padding:10px 16px;font-size:11px}
    .ws-site .ws-cart-panel{padding:26px;background:var(--ws-bg);border:1px solid #80808035;border-radius:24px;box-shadow:0 20px 60px #00000013;position:sticky;top:18px}
    .ws-site .ws-cart-line{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 0;border-bottom:1px solid #80808033;font-size:13px}
    .ws-site .ws-cart-line b{font-size:16px}.ws-site .ws-cart-total{display:flex;justify-content:space-between;align-items:center;font-size:19px;font-weight:800;margin:20px 0}
    .ws-site .ws-checkout-form{display:grid;gap:12px;margin-top:20px}.ws-site .ws-checkout-form label{font-size:11px;font-weight:800;display:grid;gap:6px}
    .ws-site .ws-checkout-form .ws-pill{width:100%;border-radius:12px}.ws-site .ws-mini-benefits{display:flex;flex-wrap:wrap;gap:8px;margin:14px 0}.ws-site .ws-mini-benefits span{padding:7px 11px;border-radius:20px;background:var(--ws-soft);font-size:11px;font-weight:700}
    .ws-site .ws-collection-head{display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap;margin:20px 0 26px}
    .ws-site .ws-collection-head .ws-input{max-width:300px}.ws-site .ws-cart-empty{font-size:12px;opacity:.7}
    .ws-site .ws-experience-split{display:grid;grid-template-columns:1.4fr .8fr;gap:22px}.ws-site .ws-experience-split>.ws-card{padding:30px}
    .ws-site .ws-progress-track{height:9px;background:var(--ws-soft);border-radius:20px;overflow:hidden}.ws-site .ws-progress-track>i{display:block;background:var(--ws-accent);height:100%;border-radius:20px}
    @media(max-width:800px){.ws-site .ws-hero{grid-template-columns:1fr;padding:60px 6%;gap:35px}.ws-site .ws-art{min-height:300px}.ws-site .ws-art-symbol{font-size:130px}.ws-site .ws-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.ws-site .ws-section{padding:60px 6%}.ws-site .ws-section-head{display:block}}
    @media(max-width:980px){.ws-site .ws-commerce-layout{grid-template-columns:1fr}.ws-site .ws-cart-panel{position:static}.ws-site .ws-experience-split{grid-template-columns:1fr}}
    @media(max-width:520px){.ws-site .ws-nav{padding:18px 6%}.ws-site .ws-navlinks{gap:14px}.ws-site .ws-hero{padding:44px 6%}.ws-site h1{font-size:46px}.ws-site .ws-grid,.ws-site .ws-products{grid-template-columns:1fr}.ws-site .ws-art{min-height:250px}.ws-site .ws-section{padding:46px 6%}.ws-site .ws-card{padding:20px}.ws-site .ws-product-art{height:190px}}
  `;
  const colorStyle = choice => {
    const [bg,ink,accent,soft] = tones[choice] || tones['Clean Light'];
    return `--ws-bg:${bg};--ws-ink:${ink};--ws-accent:${accent};--ws-soft:${soft}`;
  };
  const baseTemplate = (choice,look) => {
    const [brand,eyebrow,title,description,cta,symbol,a,b,c] = names[choice] || names['Business Website'];
    const category = choice === 'E-commerce' ? 'Featured collection' : choice === 'EdTech' ? 'Explore your path' : choice === 'SaaS' ? 'Everything in one place' : choice === 'Social Network' ? 'Communities you will love' : choice === 'Portfolio' ? 'Selected work' : 'What we do best';
    const tiles = [[a,'01','Discover what is possible.'],[b,'02','Thoughtfully designed around you.'],[c,'03','Made to make a difference.']];
    return `<div class="ws-site" style="${colorStyle(look)}" data-ws-site="true"><nav class="ws-nav"><a class="ws-brand" href="#home">${esc(brand)}<span>✳</span></a><div class="ws-navlinks"><a href="#discover">Discover</a><a href="#features-showcase">Explore</a><a href="#contact">Contact</a></div><a href="#discover" class="ws-pill">${esc(cta)} ↗</a></nav><section class="ws-hero" id="home"><div><span class="ws-kicker">${esc(eyebrow)}</span><h1>${esc(title)}</h1><p class="ws-intro">${esc(description)}</p><div class="ws-cta-row"><a href="#discover" class="ws-pill">${esc(cta)} ↗</a><a href="#contact" class="ws-pill ws-outline">Get in touch</a></div></div><div class="ws-art"><span class="ws-art-symbol">${esc(symbol)}</span><div class="ws-art-stamp"><span>CRAFTED WITH PURPOSE</span><span>EST. 2026 ✳</span></div></div></section><div class="ws-strip"><span>✳ MADE FOR YOU</span><span>✦ BEAUTIFULLY SIMPLE</span><span>↗ BUILT FOR WHAT'S NEXT</span></div><section class="ws-section ws-alt" id="discover" data-ws-default-showcase="true"><div class="ws-section-head"><div><span class="ws-kicker">HANDPICKED HIGHLIGHTS</span><h2>${esc(category)}.</h2></div><p>Explore the things that make this experience special. Every detail is designed with intention.</p></div><div class="ws-grid">${tiles.map(([name,n,desc])=>`<article class="ws-card"><div class="ws-thumb">${choice==='E-commerce'?'◈':choice==='EdTech'?'📖':choice==='SaaS'?'▤':choice==='Social Network'?'◉':choice==='Portfolio'?'✳':'↗'}</div><span class="ws-kicker">${n} / COLLECTION</span><h3>${esc(name)}</h3><p>${esc(desc)}</p><a href="#contact" class="ws-pill ws-outline">Learn more →</a></article>`).join('')}</div></section><section class="ws-section" id="features-showcase" data-ws-feature-anchor="true"><span class="ws-kicker">YOUR EXPERIENCE</span><h2>Built around what matters.</h2><p class="ws-intro">Choose features in the project builder to see them come alive here.</p></section><section class="ws-section ws-alt" id="contact"><span class="ws-kicker">THE NEXT CHAPTER</span><h2>Let's create something great.</h2><p class="ws-intro">Everything starts with a conversation. Tell us what you have in mind.</p><a class="ws-pill" href="mailto:hello@example.com">Say hello ↗</a></section><footer class="ws-footer"><strong>${esc(brand)} ✳</strong><small>Beautiful ideas deserve a beautiful home.</small><small>© 2026 · All rights reserved</small></footer></div>`;
  };
  const featureKind = label => {
    const s = label.toLowerCase();
    if (/cart|checkout|buy now|product catalogue|product detail|wishlist|inventory|coupon|order tracking|shipping|multiple currencies/.test(s)) return 'commerce';
    if (/search|filter|categories|user search/.test(s)) return 'search';
    if (/payment|billing|invoice|subscription|plan|price|free trial/.test(s)) return 'pricing';
    if (/course|lesson|quiz|exam|assignment|certificate|learning|class|enrolment|mentor/.test(s)) return 'learning';
    if (/chat|messag|comment|post|feed|group|communit|follow|friend|stories|reaction|like|repost/.test(s)) return 'social';
    if (/form|contact|newsletter|quote|booking|appointment|calendar|schedule|ticket|notification|signup|login|authentication|account/.test(s)) return 'form';
    if (/analytics|dashboard|report|progress|audit|usage/.test(s)) return 'dashboard';
    if (/image|video|upload|gallery|portfolio|showcase|case stud|blog|article|team|testimonial|review|resume|skills/.test(s)) return 'media';
    if (/faq|privacy|policy|cookie|terms/.test(s)) return 'faq';
    return 'general';
  };
  const featureIcon = kind => ({commerce:'🛍️',search:'⌕',pricing:'◇',learning:'📚',social:'◎',form:'✉',dashboard:'▥',media:'✳',faq:'?',general:'✦'}[kind]);
  const featureCard = (label,i) => {
    const kind = featureKind(label), key=slug(label),icon=featureIcon(kind);
    const top = `<article class="ws-card" data-ws-feature="${esc(key)}" data-ws-feature-kind="${kind}"><span class="ws-tag">${icon} &nbsp; ${esc(label)}</span>`;
    const lower=label.toLowerCase();
    if (/shopping cart|add to cart|buy now|product catalogue|product detail/.test(lower)) return `${top}<div class="ws-thumb">🎧</div><h3>Studio Wireless Headphones</h3><p>Immersive sound. Timeless design.</p><div class="ws-row"><b>₹2,499</b><button class="ws-pill" data-demo="cart">Add to cart <span class="ws-cart-badge" data-cart-count>0</span></button></div></article>`;
    if (/wishlist/.test(lower)) return `${top}<div class="ws-thumb">⌚</div><h3>Objects worth keeping</h3><button class="ws-pill" data-demo="wishlist">♡ Save to wishlist</button></article>`;
    if (kind==='commerce') return `${top}<div class="ws-thumb">📦</div><h3>${esc(label)}</h3><p>See how this shopping experience could look for your customers.</p><button class="ws-pill" data-demo="cart">Explore item ↗</button></article>`;
    if (kind==='search') return `${top}<h3>Find just what you need.</h3><input class="ws-input" data-demo-search placeholder="Search items, courses, articles..."><div data-search-results><p>Try searching for “design” or “technology”.</p><p>Design Essentials · Technology Today · Creative Thinking</p></div></article>`;
    if (kind==='pricing') return `${top}<p class="ws-kicker">MOST POPULAR</p><h3>Pro membership</h3><h2>₹499<span style="font-size:14px"> / month</span></h2><p>Everything you need to get more done.</p><button class="ws-pill" data-demo="pricing">Choose plan ↗</button><p class="ws-demo-note">Demo only · No payment charged</p></article>`;
    if (kind==='learning') return `${top}<div class="ws-thumb">🎓</div><h3>${esc(label)}</h3><p>Modern lessons, progress tracking and a journey built for growth.</p><button class="ws-pill" data-demo="lesson">Preview lesson →</button></article>`;
    if (kind==='social') return `${top}<div class="ws-row"><span style="font-size:35px">🧑🏽‍💻</span><div><b>Alex Morgan</b><p>Community member</p></div></div><h3>${esc(label)}</h3><p>Excited to share what we've been building this week ✨</p><button class="ws-pill ws-outline" data-demo="like">♡ Like <span data-like-count>24</span></button></article>`;
    if (kind==='form') return `${top}<h3>${esc(label)}</h3><form data-demo-form><input class="ws-input" aria-label="Your email" type="email" required placeholder="your@email.com"><button class="ws-pill" type="submit" style="margin-top:12px">${/booking|appointment|calendar/.test(lower)?'Request a slot':/login|auth/.test(lower)?'Continue':'Submit'} ↗</button></form><p class="ws-demo-note">Interactive frontend demo · No information is stored</p></article>`;
    if (kind==='dashboard') return `${top}<h3>${esc(label)}</h3><p>Performance overview</p><div class="ws-row" style="justify-content:space-between"><b style="font-size:28px">12.8k</b><span class="ws-tag">↗ +18.6%</span></div><div style="height:84px;display:flex;align-items:end;gap:9px">${[35,55,42,72,61,88,74].map(v=>`<div style="flex:1;background:var(--ws-accent);height:${v}%;border-radius:5px 5px 0 0"></div>`).join('')}</div></article>`;
    if (kind==='media') return `${top}<div class="ws-thumb">${icon}</div><h3>${esc(label)}</h3><p>Show your story with beautifully presented content.</p><button class="ws-pill ws-outline" data-demo="details">View details →</button></article>`;
    if (kind==='faq') return `${top}<h3>${esc(label)}</h3><details><summary>How does this work?</summary><p>This is a design prototype. Your development team will connect the real functionality.</p></details><details><summary>Can I customise this?</summary><p>Absolutely. Click the content in the studio editor to make it your own.</p></details></article>`;
    return `${top}<div class="ws-feature-icon">${icon}</div><h3>${esc(label)}</h3><p>A thoughtful, purpose-built section for this part of your website.</p><button class="ws-pill ws-outline" data-demo="details">Explore feature ↗</button></article>`;
  };
  const experienceFeatures = (website,items) => {
    const matches = website==='E-commerce' ? /product|cart|checkout|buy now|wishlist|review|rating|payment|coupon|discount|inventory|shipping|order tracking|categor|filter|search|currenc/ : website==='EdTech' ? /course|class|lesson|quiz|exam|assignment|student|mentor|learning|certificate|enrolment|payment|subscription/ : website==='SaaS' ? /dashboard|workspace|team|authentication|role|record|search|filter|upload|api|ai assistant|trial|subscription|billing|limit|analytics/ : website==='Social Network' ? /profile|follow|friend|post|feed|like|reaction|comment|message|group|communit|stor|user search|notification|repost/ : website==='Portfolio' ? /hero|about|project|case stud|skill|resume|testimonial|service|contact|blog|appointment/ : /home page|about|service|product|team|price|faq|testimonial|case stud|contact|quote|appointment|booking|phone/;
    return items.filter(x=>matches.test(x.toLowerCase()));
  };
  const experience = (website,labels) => {
    if(!labels.length)return '';
    const selected=labels.map(x=>x.toLowerCase()), has=r=>selected.some(x=>r.test(x));
    const chips=`<div class="ws-mini-benefits">${labels.map(x=>`<span>✓ ${esc(x)}</span>`).join('')}</div>`;
    if(website==='E-commerce'){
      const catalog=[['🎧','Studio Headphones','Audio that moves you',2499],['⌚','Everyday Watch','A timeless essential',3899],['👜','City Carryall','Made for wherever you go',1799],['🕶️','Modern Frames','Style in every detail',1299]];
      const cards=catalog.map(([emoji,name,desc,price],i)=>`<article class="ws-product" data-product="${slug(name)}"><div class="ws-product-art">${emoji}${has(/wishlist/)?`<button class="ws-wish" data-demo="wishlist" aria-label="Save ${esc(name)} to wishlist">♡</button>`:''}</div><div class="ws-product-info"><span class="ws-kicker">NEW ARRIVAL · 0${i+1}</span><h3>${name}</h3><p>${desc}</p><div class="ws-product-actions"><b>₹${price.toLocaleString('en-IN')}</b><button class="ws-pill" data-demo="cart" data-product-name="${name}" data-price="${price}">Add +</button></div></div></article>`).join('');
      const checkout=has(/checkout|payment|buy now/);
      return `<section data-ws-feature-block="experience" class="ws-section ws-alt" id="shop"><span class="ws-kicker">THE COLLECTION / DISCOVER WHAT YOU LOVE</span><h2>Your new favourites are here.</h2><p class="ws-intro">Beautiful things, thoughtful details and an effortless shopping experience.</p>${chips}<div class="ws-collection-head"><div class="ws-row"><span class="ws-tag">All products</span>${has(/categor|filter/)?'<span class="ws-tag">Accessories</span><span class="ws-tag">Essentials</span>':''}</div>${has(/search/)?'<input class="ws-input" data-shop-search placeholder="⌕  Search products..." aria-label="Search products">':''}</div><div class="ws-commerce-layout"><div class="ws-products">${cards}</div><aside class="ws-cart-panel" id="cart"><div class="ws-row" style="justify-content:space-between"><div><span class="ws-kicker">YOUR BAG</span><h3>Shopping cart</h3></div><span class="ws-cart-badge" data-cart-count>0</span></div><div data-cart-items><p class="ws-cart-empty">Your bag is waiting for something lovely. Add a product to get started.</p></div><div class="ws-cart-total"><span>Subtotal</span><span data-cart-total>₹0</span></div>${has(/coupon|discount/)?'<label style="display:flex;gap:8px"><input class="ws-input" aria-label="Promo code" data-promo placeholder="Promo code"><button class="ws-pill" data-demo="promo">Apply</button></label>':''}${checkout?'<div class="ws-checkout-form"><span class="ws-kicker">SECURE CHECKOUT</span><label>Full name<input class="ws-input" data-checkout-name placeholder="Your name"></label><label>Email address<input class="ws-input" type="email" data-checkout-email placeholder="you@example.com"></label><label>Delivery address<input class="ws-input" data-checkout-address placeholder="Address & city"></label><button type="button" class="ws-pill" data-demo="checkout">Place demo order ↗</button><p class="ws-demo-note">Demo checkout · No payment or personal data is processed.</p></div>':'<button class="ws-pill" data-demo="viewcart">View your bag →</button>'}${has(/shipping|order tracking/)?'<p class="ws-demo-note">🚚 Free delivery above ₹2,000 · Order tracking available</p>':''}</aside></div></section>`;
    }
    if(website==='EdTech')return `<section data-ws-feature-block="experience" class="ws-section ws-alt"><span class="ws-kicker">YOUR LEARNING SPACE</span><h2>Learn at your own pace.</h2>${chips}<div class="ws-experience-split"><div class="ws-card"><div class="ws-thumb">📚</div><span class="ws-tag">POPULAR COURSE · 12 LESSONS</span><h3>Creative Problem Solving</h3><p>Short lessons, hands-on activities and a learning path that meets you where you are.</p><div class="ws-progress-track"><i style="width:38%"></i></div><p>38% of your learning journey completed</p><button class="ws-pill" data-demo="lesson">${has(/quiz|exam/)?'Try a sample quiz':'Continue learning'} ↗</button></div><aside class="ws-card"><span class="ws-kicker">UP NEXT</span><h3>Your learning journey</h3><p>01 · Introduction to the course</p><p>02 · Think like a creator</p><p>03 · Put ideas into action</p><p>04 · Check your progress</p><button class="ws-pill ws-outline" data-demo="lesson">View curriculum →</button></aside></div></section>`;
    if(website==='SaaS')return `<section data-ws-feature-block="experience" class="ws-section ws-alt"><span class="ws-kicker">YOUR WORKSPACE / OVERVIEW</span><h2>Everything under control.</h2>${chips}<div class="ws-experience-split"><div class="ws-card"><span class="ws-tag">↗ LIVE OVERVIEW</span><h3>Workspace performance</h3><div class="ws-row" style="justify-content:space-between"><div><small>Active projects</small><h2>24</h2></div><div><small>Tasks completed</small><h2>86%</h2></div><div><small>Team members</small><h2>12</h2></div></div><div style="display:flex;align-items:end;gap:10px;height:130px">${[40,64,52,72,58,87,96].map(v=>`<div style="flex:1;height:${v}%;border-radius:8px 8px 0 0;background:var(--ws-accent)"></div>`).join('')}</div></div><aside class="ws-card"><span class="ws-kicker">QUICK ACTIONS</span><h3>Make a move.</h3><p>Create a project, invite someone or check what needs attention.</p><button class="ws-pill" data-demo="details">＋ New project</button><p><button class="ws-pill ws-outline" data-demo="details">Invite teammate →</button></p></aside></div></section>`;
    if(website==='Social Network')return `<section data-ws-feature-block="experience" class="ws-section ws-alt"><span class="ws-kicker">YOUR COMMUNITY FEED</span><h2>Good things happen together.</h2>${chips}<div class="ws-experience-split"><div class="ws-card"><div class="ws-row"><span style="font-size:40px">🧑🏽‍🎨</span><div><b>Samira Patel</b><p>Creative community · 2 hours ago</p></div></div><h3>A little progress is still progress ✨</h3><p>Sharing a behind-the-scenes look at our newest creative project. What's everyone working on today?</p><div class="ws-thumb">✳</div><button class="ws-pill ws-outline" data-demo="like">♡ Like <span data-like-count>128</span></button> <button class="ws-pill ws-outline" data-demo="details">Comment ↗</button></div><aside class="ws-card"><span class="ws-kicker">YOUR CIRCLES</span><h3>Find your people</h3><p>🎨 Design Collective · 2.4k members</p><p>🏃 Weekend Runners · 1.8k members</p><p>💡 Indie Makers · 5.2k members</p><button class="ws-pill" data-demo="details">Explore groups →</button></aside></div></section>`;
    if(website==='Portfolio')return `<section data-ws-feature-block="experience" class="ws-section ws-alt"><span class="ws-kicker">FEATURED PROJECT / 2026</span><h2>Selected work, lasting impact.</h2>${chips}<div class="ws-grid"><article class="ws-card"><div class="ws-thumb">◈</div><h3>Form follows feeling.</h3><p>Brand strategy · Identity</p></article><article class="ws-card"><div class="ws-thumb">✳</div><h3>A different perspective.</h3><p>Product design · Digital</p></article><article class="ws-card"><div class="ws-thumb">↗</div><h3>Made to be remembered.</h3><p>Editorial · Creative direction</p></article></div></section>`;
    return `<section data-ws-feature-block="experience" class="ws-section ws-alt"><span class="ws-kicker">EXPERTISE / BUILT AROUND YOU</span><h2>Here's how we help.</h2>${chips}<div class="ws-grid"><article class="ws-card"><div class="ws-thumb">✳</div><h3>Strategy first.</h3><p>We listen, understand and shape a plan that moves you forward.</p></article><article class="ws-card"><div class="ws-thumb">◈</div><h3>Thoughtful execution.</h3><p>Detail-oriented solutions with clarity and care.</p></article><article class="ws-card"><div class="ws-thumb">↗</div><h3>Built for growth.</h3><p>Work that delivers value long after launch.</p></article></div></section>`;
  };
  const demoScript = `<script>(function(){let cart=0;function toast(msg){let t=document.querySelector('.ws-demo-toast');if(!t){t=document.createElement('div');t.className='ws-demo-toast';document.body.append(t)}t.textContent=msg;clearTimeout(window.__wsToast);window.__wsToast=setTimeout(()=>t.remove(),2600)}document.addEventListener('click',function(ev){const b=ev.target.closest('[data-demo]');if(!b)return;ev.preventDefault();const action=b.dataset.demo;if(action==='cart'){cart++;document.querySelectorAll('[data-cart-count]').forEach(n=>n.textContent=cart);toast('Added to cart · '+cart+' item'+(cart===1?'':'s'))}else if(action==='wishlist'){b.textContent=b.textContent.includes('Saved')?'♡ Save to wishlist':'♥ Saved to wishlist';toast('Wishlist updated')}else if(action==='like'){const n=b.querySelector('[data-like-count]');if(n)n.textContent=Number(n.textContent)+1;toast('You liked this post')}else toast(action==='pricing'?'Plan selected · Checkout is a demo':action==='lesson'?'Lesson preview · Connect content during development':'Feature preview · Backend connection comes later')});document.addEventListener('submit',function(e){if(e.target.matches('[data-demo-form]')){e.preventDefault();toast('Demo submitted · No data was sent')}});document.addEventListener('input',function(e){if(e.target.matches('[data-demo-search]')){const el=e.target.closest('.ws-card').querySelector('[data-search-results]');const q=e.target.value.toLowerCase();el.textContent=q?('Results for “'+e.target.value+'”: '+(['design','technology','creative'].filter(v=>v.includes(q)).join(' · ')||'No demo matches')):'Try searching for “design” or “technology”.'}})})();</script>`;
  const commerceScript = `<script>(function(){const items={};let discount=0;const money=n=>'₹'+n.toLocaleString('en-IN');function notify(s){let node=document.querySelector('.ws-demo-toast');if(!node){node=document.createElement('div');node.className='ws-demo-toast';document.body.append(node)}node.textContent=s;clearTimeout(window.__cartToast);window.__cartToast=setTimeout(()=>node.remove(),2600)}function render(){const count=Object.values(items).reduce((a,x)=>a+x.qty,0);const total=Object.values(items).reduce((a,x)=>a+x.qty*x.price,0);document.querySelectorAll('[data-cart-count]').forEach(n=>n.textContent=count);document.querySelectorAll('[data-cart-total]').forEach(n=>n.textContent=money(Math.round(total*(1-discount))));const target=document.querySelector('[data-cart-items]');if(!target)return;target.replaceChildren();if(!count){target.innerHTML='<p class="ws-cart-empty">Your bag is waiting for something lovely. Add a product to get started.</p>';return}Object.entries(items).forEach(([name,x])=>{const row=document.createElement('div');row.className='ws-cart-line';const title=document.createElement('span');title.textContent=name+' × '+x.qty;const amount=document.createElement('b');amount.textContent=money(x.qty*x.price);row.append(title,amount);target.append(row)})}document.addEventListener('click',function(e){const b=e.target.closest('[data-demo]');if(!b)return;const act=b.dataset.demo;if(act==='cart'&&b.dataset.productName){e.preventDefault();e.stopImmediatePropagation();const name=b.dataset.productName;const price=Number(b.dataset.price)||0;if(!items[name])items[name]={qty:0,price};items[name].qty++;render();notify(name+' added to your bag');return}if(act==='checkout'){e.preventDefault();e.stopImmediatePropagation();const count=Object.values(items).reduce((a,x)=>a+x.qty,0);if(!count){notify('Add a product before checking out');return}const fields=['name','email','address'].map(k=>document.querySelector('[data-checkout-'+k+']'));if(fields.some(f=>f&&!f.value.trim())){notify('Complete your delivery details first');return}if(fields[1]&&!fields[1].checkValidity()){notify('Enter a valid email address');return}notify('Demo order placed! No payment taken or data sent.');return}if(act==='promo'){e.preventDefault();e.stopImmediatePropagation();const code=(document.querySelector('[data-promo]')?.value||'').trim().toUpperCase();discount=code==='WELCOME10'?.1:0;render();notify(discount?'WELCOME10 applied · 10% off':'Try promo code WELCOME10');return}if(act==='viewcart'){e.preventDefault();e.stopImmediatePropagation();notify('Your cart is displayed here, next to the products.')}} ,true);document.addEventListener('input',function(e){if(e.target.matches('[data-shop-search]')){const query=e.target.value.toLowerCase().trim();document.querySelectorAll('[data-product]').forEach(card=>{card.style.display=card.textContent.toLowerCase().includes(query)?'':'none'})}});render()})();</script>`;

  let currentType = type;
  const syncFeatures = () => {
    const e=getEditor(); if(!e)return;
    const root=e.getWrapper();
    root.find('[data-ws-feature-block]').forEach(c=>c.remove());
    const manual=new Set(root.find('[data-ws-manual-feature]').map(c=>c.getAttributes?.()['data-ws-manual-feature']).filter(Boolean));
    const defaultShowcase=root.find('[data-ws-default-showcase]')[0];
    const placeholder=root.find('[data-ws-feature-anchor]')[0];
    if(defaultShowcase){defaultShowcase.addStyle({display:chosen.size?'none':'block'});defaultShowcase.addAttributes({id:chosen.size?'showcase-placeholder':'discover'});}
    if(placeholder)placeholder.addStyle({display:chosen.size?'none':'block'});
    if(!chosen.size) return;
    const selected=[...chosen].filter(label=>!manual.has(label));
    const contextual=experienceFeatures(type,selected);
    const groups={};selected.filter(label=>!contextual.includes(label)).forEach(label=>{const k=featureKind(label);(groups[k] ||= []).push(label)});
    const contextualHtml=experience(type,contextual);
    const content=contextualHtml+Object.entries(groups).map(([kind,labels],idx)=>`<section data-ws-feature-block="${kind}" class="ws-section ${idx%2?'':'ws-alt'}"><span class="ws-kicker">${featureIcon(kind)} &nbsp; SELECTED FOR YOUR WEBSITE</span><h2>${({commerce:'Shop the experience',search:'Discover with ease',pricing:'Simple plans, clear value',learning:'Learn something wonderful',social:'Made for connection',form:'Stay in touch',dashboard:'The bigger picture',media:'Stories worth sharing',faq:'Helpful by design',general:'The little extras'})[kind]}</h2><div class="ws-grid">${labels.map(featureCard).join('')}</div></section>`).join('');
    const anchor=root.find('[data-ws-feature-anchor]')[0];
    if(anchor){const parent=anchor.parent();const at=parent.components().indexOf(anchor);const inserted=parent.append(content,{at});if(inserted?.[0])inserted[0].addAttributes({id:'discover'});}
    else e.addComponents(content);
    $('#designSaved').textContent='Preview updated · Unsaved changes';
    $('#aiStatus').textContent=`${selected.length} selected feature${selected.length===1?'':'s'} added to your website design.`;
    refreshStagePreview();
  };
  const makeTemplate = () => {
    const e=getEditor();if(!e)return;
    e.setComponents(baseTemplate(type,theme));
    e.setStyle(siteCss);
    if(window.WebSprintPreviewStyles)e.addStyle(window.WebSprintPreviewStyles);
    currentType=type;
    syncFeatures();
    $('#designSaved').textContent='Template ready · Unsaved changes';
    $('#aiStatus').textContent=`${type} template loaded. Select features to personalise it.`;
    refreshStagePreview();
  };
  const addManualFeature=label=>{
    const e=getEditor();if(!e||!label)return false;
    const root=e.getWrapper(),site=root.find('.ws-site')[0]||root;
    const safeLabel=esc(label);
    const lower=label.toLowerCase();
    const card=/checkout|payment/.test(lower)?`<article class="ws-card"><span class="ws-tag">🔒 ${safeLabel}</span><h3>Secure checkout</h3><p>Give your customers a simple, reassuring way to complete an order.</p><form data-demo-form style="display:grid;gap:10px"><input class="ws-input" type="email" placeholder="Email address" required><input class="ws-input" placeholder="Delivery address" required><button class="ws-pill" type="submit">Continue securely →</button></form><p class="ws-demo-note">Frontend demonstration — no payment is processed.</p></article>`:featureCard(label);
    const markup=`<section class="ws-section ws-alt" data-ws-manual-feature="${safeLabel}"><span class="ws-kicker">ADDED BY YOU</span><h2>${safeLabel}</h2><div class="ws-grid">${card}</div></section>`;
    const c=e.getSelected();let section=c;
    while(section&&String(section.get('tagName')||'').toLowerCase()!=='section')section=section.parent();
    const footer=site.find('.ws-footer')[0]||root.find('.ws-footer')[0];
    let inserted;
    if(section?.parent()===site)inserted=site.append(markup,{at:site.components().indexOf(section)+1});
    else inserted=site.append(markup,{at:footer&&footer.parent()===site?site.components().indexOf(footer):site.components().length});
    chosen.add(label);renderFeatures();
    const created=Array.isArray(inserted)?inserted[0]:inserted;if(created)e.select(created);
    $('#designSaved').textContent='Unsaved changes';
    return true;
  };
  const selectTemplate=name=>{
    if(!data[name])return false;
    type=name;chosen.clear();renderTypes();renderFeatures();makeTemplate();return true;
  };
  window.WebSprintTemplateEngine={rebuild:makeTemplate,syncFeatures,addManualFeature,selectTemplate,getType:()=>type,getTypes:()=>types.map(x=>x[0]),getFeatures:()=>data[type]||[]};
  const applyTheme = () => {
    const e=getEditor();if(!e)return;
    const c=e.getWrapper().find('[data-ws-site]')[0];
    if(c){const [bg,ink,accent,soft]=tones[theme]||tones['Clean Light'];c.addStyle({'--ws-bg':bg,'--ws-ink':ink,'--ws-accent':accent,'--ws-soft':soft});}
    $('#designSaved').textContent='Theme updated · Unsaved changes';
    refreshStagePreview();
  };

  // Keep the original design-export path. The exported HTML includes the same frontend demo interactions.
  const rawPreview=getPreview;
  getPreview=function(){return rawPreview().replace('</body>',demoScript+commerceScript+'</body>')};

  const stepNav=$('.stepnav');
  const reviewButton=document.createElement('button');reviewButton.dataset.step='3';reviewButton.textContent='04   Live preview';
  const contactNav=stepNav.querySelector('[data-step="3"]');contactNav.dataset.step='4';contactNav.textContent='05   Your contact';
  stepNav.insertBefore(reviewButton,contactNav);
  const contactPanel=$('.panel[data-panel="3"]');contactPanel.dataset.panel='4';
  const review=document.createElement('div');review.className='panel';review.dataset.panel='3';
  review.innerHTML=`<div class="eyebrow">STEP 04 — THE BIG REVEAL</div><h3>Your website,<br>coming to life.</h3><p class="desc">This is what your developer will receive. Explore the interactive demo, switch devices, and make any final edits before sending.</p><div class="ws-stage-top"><div><strong>YOUR LIVE PROTOTYPE</strong><p>Click buttons, browse sections and imagine the finished site.</p></div><div class="ws-stage-devices"><button type="button" data-stage-width="100%" class="is-active">Desktop</button><button type="button" data-stage-width="768px">Tablet</button><button type="button" data-stage-width="390px">Mobile</button></div></div><div class="ws-stage"><iframe title="Final website prototype" sandbox="allow-forms allow-scripts allow-modals"></iframe></div><p class="ws-stage-note">✳ This is a functional frontend demonstration. Authentication, payments, databases and live messaging are represented visually until a developer connects the backend.</p><div class="ws-stage-actions"><button class="btn secondary" id="ws-edit-design" type="button">✎ Edit in studio</button><button class="btn secondary" id="ws-open-large" type="button">↗ Fullscreen preview</button></div><div class="panel-actions"><button class="btn secondary back" type="button">← Back to details</button><button class="btn next" type="button">Continue to contact →</button></div>`;
  contactPanel.parentNode.insertBefore(review,contactPanel);
  const refreshStagePreview=()=>{if(step===3){const frame=review.querySelector('iframe');frame.srcdoc=getPreview();}};
  const showStage=n=>{
    step=Math.max(0,Math.min(4,n));
    document.querySelector('.builder')?.classList.toggle('preview-mode',step===3);
    document.querySelectorAll('.panel').forEach(p=>p.classList.toggle('active',+p.dataset.panel===step));
    stepNav.querySelectorAll('button').forEach((b,i)=>{b.classList.toggle('active',i===step);b.classList.toggle('done',i<step)});
    $('#progress').style.width=(20*(step+1))+'%';
    if(step===3)refreshStagePreview();
    if(step===4)summary();
  };
  show=showStage;
  document.querySelectorAll('.next').forEach(b=>b.onclick=()=>showStage(step+1));
  document.querySelectorAll('.back').forEach(b=>b.onclick=()=>showStage(step-1));
  stepNav.querySelectorAll('button').forEach(b=>b.onclick=()=>showStage(+b.dataset.step));
  $('#edit').onclick=()=>showStage(0);
  review.querySelectorAll('[data-stage-width]').forEach(b=>b.onclick=()=>{const frame=review.querySelector('iframe');frame.style.width=b.dataset.stageWidth==='100%'?'100%':`min(100%, ${b.dataset.stageWidth})`;review.querySelectorAll('[data-stage-width]').forEach(x=>x.classList.toggle('is-active',x===b))});
  // Phones start with the phone preview; users can still switch devices.
  if(window.matchMedia('(max-width: 700px)').matches)review.querySelector('[data-stage-width="390px"]')?.click();
  $('#ws-open-large').onclick=()=>$('#previewBtn').click();
  $('#ws-edit-design').onclick=()=>{$('#designStudio').scrollIntoView({behavior:'smooth',block:'start'});$('#aiStatus').textContent='Make your edits, then return to Step 04 to review them.'};

  document.addEventListener('click',ev=>{
    if(ev.target.closest('.template'))queueMicrotask(()=>{if(type!==currentType)makeTemplate()});
    if(ev.target.closest('.theme'))queueMicrotask(applyTheme);
  });
  document.addEventListener('change',ev=>{if(ev.target.matches('#features input'))queueMicrotask(syncFeatures)});
  // Initial load intentionally uses the selected template. Previous saved drafts remain in browser storage.
  // A recovered draft is preserved until the visitor explicitly changes their website type.
  const hasDraft=Boolean(localStorage.getItem('websprint-design-v3')||localStorage.getItem('websprint-design'));
  const currentMarkup=getEditor()?.getHtml()||'';
  const accidentalHostMarkup=/(?:class=["'][^"']*\btopbar\b|id=["']builder["']|class=["'][^"']*\bstudio-wrap\b)/i.test(currentMarkup);
  if(!hasDraft||accidentalHostMarkup){
    makeTemplate();
    if(accidentalHostMarkup)$('#aiStatus').textContent='An invalid saved draft was detected. Your selected website template has been restored.';
  }else $('#aiStatus').textContent='Your previous design was recovered. Change website type to load a new starter template.';
})();
