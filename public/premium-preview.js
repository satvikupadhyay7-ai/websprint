/* Shared visual refinement for the live preview and exported HTML. */
(() => {
  const original = getPreview;
  const css = `<style>
    .ws-site{font-family:Manrope,Inter,Arial,sans-serif;letter-spacing:-.008em;-webkit-font-smoothing:antialiased}
    .ws-site .ws-nav{padding-top:22px;padding-bottom:22px;border-bottom:1px solid #80808024;backdrop-filter:blur(12px);position:relative;z-index:5}
    .ws-site .ws-navlinks a{font-size:12px;letter-spacing:.012em;transition:color .18s}.ws-site .ws-navlinks a:hover{color:var(--ws-accent)}
    .ws-site .ws-brand{font-size:22px;letter-spacing:-.065em}.ws-site h1{font-size:clamp(50px,6.5vw,96px);letter-spacing:-.075em;line-height:1.015}
    .ws-site .ws-brand,.ws-site h1,.ws-site h2{overflow-wrap:anywhere}.ws-site .ws-brand{max-width:45%}
    .ws-site h2{letter-spacing:-.065em}.ws-site h3{letter-spacing:-.04em}
    .ws-site .ws-hero{min-height:650px;padding-top:100px;padding-bottom:110px;gap:75px;overflow:hidden;isolation:isolate}
    .ws-site .ws-hero .ws-kicker{display:inline-block;background:var(--ws-soft);color:var(--ws-ink);padding:9px 15px;border-radius:80px;letter-spacing:.13em}
    .ws-site .ws-art{min-height:465px;border-radius:38px;background:radial-gradient(circle at 28% 23%,#ffffffa8,transparent 40%),linear-gradient(145deg,var(--ws-soft),var(--ws-accent));box-shadow:0 25px 70px #00000020;transform:rotate(1.5deg);border:1px solid #ffffff40}
    .ws-site .ws-art:before{content:"";position:absolute;width:78%;aspect-ratio:1;border:1px solid #ffffff90;border-radius:50%;transform:rotate(-18deg) scaleX(1.3);opacity:.7}
    .ws-site .ws-art:after{content:"";position:absolute;width:55%;aspect-ratio:1;border:1px solid #ffffff99;border-radius:50%;transform:rotate(18deg) scaleX(.8);opacity:.6}
    .ws-site .ws-art-symbol{position:relative;z-index:1;font-size:175px;filter:drop-shadow(0 14px 25px #0002)}
    .ws-site .ws-art-stamp{z-index:2;border:1px solid #ffffff8c;box-shadow:0 13px 40px #0002;font-size:11px;letter-spacing:.05em}
    .ws-site .ws-pill{border-radius:12px;padding:14px 23px;font-size:12px;font-weight:800;box-shadow:0 8px 25px #00000010}
    .ws-site .ws-pill:hover{transform:translateY(-2px);box-shadow:0 11px 28px #00000020}
    .ws-site .ws-section{padding-top:90px;padding-bottom:90px}.ws-site .ws-page-head{padding-top:64px;padding-bottom:37px}
    .ws-site .ws-section-head{margin-bottom:40px}.ws-site .ws-card{border:1px solid #80808021;border-radius:25px;padding:27px;box-shadow:0 14px 45px #0000000a;transition:transform .2s,box-shadow .2s}
    .ws-site .ws-card:hover,.ws-site .ws-product:hover{transform:translateY(-3px);box-shadow:0 24px 55px #00000018}
    .ws-site .ws-thumb{min-height:185px;background:radial-gradient(circle at 30% 27%,#ffffff99,transparent 30%),linear-gradient(135deg,var(--ws-soft),var(--ws-accent));border:1px solid #ffffff30;font-size:76px}
    .ws-site .ws-product{border:1px solid #80808020;border-radius:25px;padding:12px;box-shadow:0 14px 48px #00000010;transition:transform .2s,box-shadow .2s}
    .ws-site .ws-product-art{height:235px;border-radius:20px;font-size:83px;isolation:isolate}
    .ws-site .ws-product-art:before{content:"";position:absolute;width:200px;height:200px;border-radius:50%;background:#ffffff45;left:calc(50% - 100px);top:calc(50% - 100px);box-shadow:0 0 0 28px #ffffff16;z-index:-1}
    .ws-site .ws-product-info{padding:17px 12px 10px}.ws-site .ws-product-info b{font-size:17px}
    .ws-site .ws-cart-panel{border-radius:27px;box-shadow:0 20px 65px #00000016;padding:30px}
    .ws-site .ws-cart-panel h3{font-size:23px}.ws-site .ws-cart-total{padding-top:10px}
    .ws-site .ws-checkout-form input:focus,.ws-site .ws-input:focus{outline:2px solid var(--ws-accent);outline-offset:2px}
    .ws-site .ws-flow-progress{gap:10px}.ws-site .ws-flow-progress>span{border:1px solid #80808026;font-size:11px;padding:9px 15px}
    .ws-site .ws-footer{padding-top:65px;padding-bottom:65px}.ws-site .ws-footer strong{font-size:21px;letter-spacing:-.05em}
    @media(max-width:950px){.ws-site .ws-hero{gap:35px;min-height:auto}.ws-site .ws-art{min-height:360px}.ws-site .ws-section{padding-top:65px;padding-bottom:65px}}
    @media(max-width:600px){.ws-site .ws-hero{padding-top:55px;padding-bottom:60px}.ws-site h1{font-size:clamp(44px,11vw,62px)}.ws-site .ws-art{min-height:270px;border-radius:25px;transform:none}.ws-site .ws-art-symbol{font-size:115px}.ws-site .ws-section{padding-top:48px;padding-bottom:48px}.ws-site .ws-card{padding:20px}.ws-site .ws-product-art{height:190px}.ws-site .ws-cart-panel{padding:22px}.ws-site .ws-navlinks{gap:13px}}
    @media(prefers-reduced-motion:reduce){.ws-site *{transition:none!important;transform:none!important}}
  </style>`;
  // Use the same style rules inside GrapesJS and in the final preview.
  // This prevents the review step from introducing a second, inconsistent spacing system.
  window.WebSprintPreviewStyles=css.replace(/^<style>/,'').replace(/<\/style>$/,'');
  if(typeof editor!=='undefined'&&editor)editor.addStyle(window.WebSprintPreviewStyles);
  getPreview=function(){
    const html=original();
    // The final preview is a separate document. Guarantee its own style layer,
    // regardless of how the editor serializes its CSS rules.
    return html.includes('data-ws-site')?html.replace('</head>',css+'</head>'):html;
  };
})();
