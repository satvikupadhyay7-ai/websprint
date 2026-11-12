/* Collect a visual, page-by-page handoff without changing the submitted design. */
(() => {
  const originalFetch=window.fetch.bind(window);
  const loadCapture=()=>new Promise(resolve=>{
    if(window.html2canvas)return resolve(true);
    const script=document.createElement('script');
    script.src='https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
    script.onload=()=>resolve(Boolean(window.html2canvas));
    script.onerror=()=>resolve(false);
    document.head.append(script);
    setTimeout(()=>resolve(Boolean(window.html2canvas)),6000);
  });
  const short=(s,n=110)=>String(s||'').replace(/\s+/g,' ').trim().slice(0,n);
  const detailsFor=element=>{
    const result=[];
    for(const node of element.querySelectorAll('h1,h2,h3,article,form,button,details,summary,a[href]')){
      if(result.length>=55)break;
      const tag=node.tagName.toLowerCase();
      if(['a','button'].includes(tag)&&node.closest('nav'))continue;
      const depth=Math.min(4,[...function*(el){while(el&&el!==element){yield el;el=el.parentElement;}}(node)].length-1);
      const label=short(node.textContent,tag==='article'?65:95)||node.getAttribute('aria-label')||tag;
      result.push({level:Math.max(0,depth),type:tag,label});
    }
    return result;
  };
  const capturePages=async html=>{
    const previewDoc=new DOMParser().parseFromString(html,'text/html');
    const routeElements=[...previewDoc.querySelectorAll('[data-ws-site] [data-route]')];
    const routes=[...new Set(routeElements.map(el=>el.getAttribute('data-route')).filter(Boolean))];
    const pages=routes.slice(0,12).map(route=>{
      const elements=routeElements.filter(el=>el.getAttribute('data-route')===route);
      return {route,title:route==='home'?'Home':route.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase()),hierarchy:elements.flatMap(detailsFor).slice(0,65)};
    });
    if(!pages.length)return {pages:[],images:[]};
    const images=[];
    // Image rendering is optional. Never hold the customer's submission hostage
    // to a slow canvas library, remote image, or resource-constrained phone.
    const captureTask=(async()=>{
    if(!await loadCapture())return;
    const iframe=document.createElement('iframe');
    iframe.title='Temporary page capture';iframe.setAttribute('aria-hidden','true');
    iframe.setAttribute('sandbox','allow-same-origin');
    Object.assign(iframe.style,{position:'fixed',left:'-12000px',top:'0',width:'960px',height:'700px',border:'0',opacity:'0',pointerEvents:'none'});
    document.body.append(iframe);
    try{
      await new Promise(resolve=>{iframe.onload=()=>resolve();iframe.srcdoc=html;setTimeout(resolve,5000);});
      const doc=iframe.contentDocument;
      if(!doc)return;
      const all=[...doc.querySelectorAll('[data-ws-site] [data-route]')];
      // Capture the pages from the customer's final preview, with a bounded
      // attachment count to keep the email reliably deliverable.
      for(const page of pages.slice(0,6)){
        all.forEach(element=>{element.hidden=element.getAttribute('data-route')!==page.route;});
        const site=doc.querySelector('[data-ws-site]');if(!site)break;
        const canvas=await window.html2canvas(site,{backgroundColor:'#fff',useCORS:true,allowTaint:false,scale:.45,width:960,height:700,windowWidth:960,windowHeight:700,logging:false});
        const dataUrl=canvas.toDataURL('image/jpeg',.48);
        const base64=dataUrl.split(',')[1];
        if(base64&&base64.length<200000)images.push({route:page.route,content:base64});
      }
    }catch(error){console.warn('Optional page image capture unavailable:',error.message);}
    finally{iframe.remove();}
    })();
    let timer;
    await Promise.race([captureTask,new Promise(resolve=>{timer=setTimeout(resolve,9000);})]);
    clearTimeout(timer);
    return {pages,images:images.slice(0,6)};
  };
  window.fetch=async (input,options)=>{
    const url=typeof input==='string'?input:input?.url||'';
    if(!/\/api\/submit(?:\?|$)/.test(url)||!options?.body)return originalFetch(input,options);
    try{
      const payload=JSON.parse(options.body);
      if(payload?.previewHtml){
        const handoff=await capturePages(payload.previewHtml);
        payload.pageHierarchy=handoff.pages;
        payload.pageImages=handoff.images;
        return originalFetch(input,{...options,body:JSON.stringify(payload)});
      }
    }catch(error){console.warn('Page handoff summary unavailable:',error.message);}
    return originalFetch(input,options);
  };
})();
