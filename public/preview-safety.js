/* Prevent the project intake application from leaking into customer previews. */
(() => {
  const previous=getPreview;
  const invalidMarkup=html=>{
    if(!html||!html.includes('<body'))return true;
    const doc=new DOMParser().parseFromString(html,'text/html');
    return Boolean(doc.querySelector('body .topbar,body #builder,body .studio-wrap,body #designStudio,body .builder-section'));
  };
  let recovering=false;
  const errorPreview=()=>`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Preview unavailable</title><style>body{font:16px system-ui,sans-serif;background:#f6f8f4;color:#1c2a1d;margin:0;display:grid;min-height:100vh;place-items:center}.notice{max-width:520px;padding:36px;border:1px solid #dbe5d8;border-radius:20px;background:white;box-shadow:0 20px 65px #0000000b}h1{font-size:28px;letter-spacing:-1px}p{line-height:1.7;color:#536254}</style></head><body><main class="notice"><h1>Let's refresh your design.</h1><p>The website preview couldn't be generated from the current draft. Return to the Website Type step, select a template and reopen Preview. Your project details have not been submitted.</p></main></body></html>`;
  getPreview=function(){
    let html=previous();
    if(!invalidMarkup(html))return html;
    const engine=window.WebSprintTemplateEngine;
    if(engine?.rebuild&&!recovering){
      recovering=true;
      try{
        engine.rebuild();
        html=previous();
        if(!invalidMarkup(html)){
          const label=document.querySelector('#aiStatus');
          if(label)label.textContent='Recovered the customer website preview from an invalid draft.';
          return html;
        }
      }finally{recovering=false;}
    }
    return errorPreview();
  };
  const send=document.querySelector('#send');
  if(send)send.addEventListener('click',ev=>{
    if(getPreview().includes('<title>Preview unavailable</title>')){
      ev.preventDefault();ev.stopImmediatePropagation();
      alert('Your website preview needs to be restored before submitting. Please reselect the website template, then preview again.');
    }
  },true);
})();
