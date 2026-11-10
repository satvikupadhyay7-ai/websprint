/* Apply the customer's actual brief to the site they review and export. */
(() => {
  const previous=getPreview;
  const value=id=>(document.getElementById(id)?.value||'').trim();
  const slug=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,45);
  const pageContent=(doc,name,description,audience)=>{
    const key=name.toLowerCase();
    const section=doc.createElement('section');
    section.dataset.route=slug(name);
    const top=doc.createElement('div');top.className='ws-page-head';
    const back=doc.createElement('a');back.href='#/home';back.className='ws-route-crumb';back.textContent='← Home';
    const title=doc.createElement('h1');title.textContent=name;
    const intro=doc.createElement('p');intro.textContent=description||`Explore our ${name.toLowerCase()} page.`;
    top.append(back,title,intro);
    const content=doc.createElement('div');content.className='ws-section';
    const kicker=doc.createElement('span');kicker.className='ws-kicker';kicker.textContent=audience?`MADE FOR ${audience}`:'EXPLORE MORE';
    const heading=doc.createElement('h2');heading.textContent=/faq|questions/i.test(key)?'Questions, answered.':/pricing|plans/i.test(key)?'Find the right fit.':/blog|news/i.test(key)?'Ideas worth sharing.':/team|people/i.test(key)?'Meet the people behind it.':name;
    const paragraph=doc.createElement('p');paragraph.className='ws-intro';paragraph.textContent=description||'This page is part of your proposed website. Your developer can refine its content and functionality with you.';
    content.append(kicker,heading,paragraph);
    if(/faq|questions/i.test(key)){
      const detail=doc.createElement('details');detail.innerHTML='<summary>How can I learn more?</summary><p>Get in touch using the Contact page to discuss the details.</p>';content.append(detail);
    }else if(/pricing|plans/i.test(key)){
      const card=doc.createElement('article');card.className='ws-card';card.style.maxWidth='420px';card.innerHTML='<span class="ws-tag">YOUR OFFER</span><h3>Let’s find your ideal plan.</h3><p>Pricing and final packages will be confirmed with your team.</p><a href="#/contact" class="ws-pill">Get in touch ↗</a>';content.append(card);
    }else{
      const cta=doc.createElement('a');cta.href='#/contact';cta.className='ws-pill';cta.textContent='Contact us ↗';content.append(cta);
    }
    section.append(top,content);
    return section;
  };
  getPreview=function(){
    const html=previous();
    if(!html.includes('data-ws-site'))return html;
    const doc=new DOMParser().parseFromString(html,'text/html');
    const site=doc.querySelector('[data-ws-site]');
    if(!site)return html;
    const brand=value('projectName'),description=value('description'),audience=value('audience'),pages=value('pagesNeeded');
    if(brand){
      const navBrand=site.querySelector('.ws-brand');
      if(navBrand){navBrand.textContent=brand;const mark=doc.createElement('span');mark.textContent='✳';navBrand.append(mark);}
      const footerBrand=site.querySelector('.ws-footer strong');if(footerBrand)footerBrand.textContent=brand+' ✳';
      const heroTitle=site.querySelector('.ws-hero h1');if(heroTitle)heroTitle.textContent=brand;
      doc.title=brand;
    }
    if(description){
      const heroCopy=site.querySelector('.ws-hero .ws-intro');if(heroCopy)heroCopy.textContent=description;
      const contactCopy=site.querySelector('[data-route="contact"] .ws-intro');if(contactCopy)contactCopy.textContent=description;
    }
    if(audience){const kicker=site.querySelector('.ws-hero .ws-kicker');if(kicker)kicker.textContent='FOR '+audience;}
    if(pages){
      const existing=new Set([...site.querySelectorAll('[data-route]')].map(x=>x.dataset.route));
      const footer=site.querySelector('.ws-footer');const nav=site.querySelector('.ws-navlinks');
      for(const name of [...new Set(pages.split(/[,\n;]+/).map(p=>p.trim()).filter(Boolean))].slice(0,8)){
        const route=slug(name);
        if(!route||existing.has(route)||['home','about','contact','shop','cart','checkout','features'].includes(route))continue;
        const page=pageContent(doc,name,description,audience);page.hidden=true;
        site.insertBefore(page,footer);existing.add(route);
        if(nav&&nav.children.length<9){const link=doc.createElement('a');link.href='#/'+route;link.dataset.routeLink=route;link.textContent=name;nav.append(link);}
      }
    }
    return '<!doctype html>\n'+doc.documentElement.outerHTML;
  };
})();
