/* Editor experience: reliable previews, meaningful styling and draft recovery. */
(() => {
  const status = document.querySelector('#aiStatus');
  const saved = document.querySelector('#designSaved');
  const setStatus = message => { status.textContent = message; };
  const getEditor = () => window.editor || (typeof editor !== 'undefined' ? editor : null);
  const ready = () => {
    const e = getEditor();
    if (!e) { setStatus('Editor could not load. Check your connection and reload this page.'); return null; }
    return e;
  };

  const preview = document.createElement('dialog');
  preview.className = 'ws-preview-dialog';
  preview.setAttribute('aria-label', 'Website preview');
  preview.innerHTML = `<div class="ws-preview-toolbar"><div><strong>Live website preview</strong><span>Exactly what will be sent with your brief</span></div><div class="ws-preview-controls"><button type="button" data-width="100%">Desktop</button><button type="button" data-width="768px">Tablet</button><button type="button" data-width="390px">Mobile</button><button type="button" id="ws-download">Download HTML ↓</button><button type="button" id="ws-close" aria-label="Close preview">✕</button></div></div><div class="ws-preview-stage"><iframe title="Your website preview" sandbox="allow-forms allow-scripts allow-modals"></iframe></div>`;
  document.body.append(preview);
  preview.querySelector('#ws-close').onclick = () => preview.close();
  preview.addEventListener('click', ev => { if (ev.target === preview) preview.close(); });
  preview.querySelectorAll('[data-width]').forEach(b => b.addEventListener('click', () => {
    preview.querySelector('iframe').style.width = b.dataset.width;
    preview.querySelectorAll('[data-width]').forEach(x => x.classList.toggle('is-active', x === b));
  }));
  document.querySelector('#previewBtn').onclick = () => {
    if (!ready()) return;
    preview.querySelector('iframe').srcdoc = getPreview();
    preview.querySelector('iframe').style.width = '100%';
    preview.querySelectorAll('[data-width]').forEach(x => x.classList.toggle('is-active', x.dataset.width === '100%'));
    if (!preview.open) preview.showModal();
  };
  preview.querySelector('#ws-download').onclick = () => {
    if (!ready()) return;
    const blob = new Blob([getPreview()], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = (document.querySelector('#projectName').value.trim().replace(/[^\w-]+/g, '-').slice(0, 60) || 'websprint-preview') + '.html';
    a.click(); setTimeout(() => URL.revokeObjectURL(url), 1500);
  };

  const save = () => {
    const e = ready(); if (!e) return;
    try {
      localStorage.setItem('websprint-design-v3', JSON.stringify({ project: e.getProjectData(), savedAt: Date.now() }));
      saved.textContent = 'Design saved on this device ✓';
    } catch { saved.textContent = 'Storage full. Download your HTML preview instead.'; }
  };
  document.querySelector('#saveDesignBtn').onclick = save;

  const palette = {
    Midnight: ['#101827','#f3f6fc','#8dd8c8','#19263b'], 'Clean Light':['#fff','#192c30','#237e75','#eff5f3'],
    Editorial:['#f7f2e9','#302b2a','#a05d48','#ede2d5'], Playful:['#fff9f5','#32223e','#e67979','#fce5df'],
    Nature:['#f5f7f0','#24392b','#57835c','#e6ede0'], Corporate:['#f8fafc','#182f4b','#2468a0','#e8f0f8'],
    Luxury:['#171818','#f7f0dd','#cfac71','#282929'], 'Tech Gradient':['#101329','#f6f7ff','#8a8bff','#232b50']
  };
  function beautify(direction = theme) {
    const e = ready(); if (!e) return false;
    const [bg, fg, accent, surface] = palette[direction] || palette['Clean Light'];
    const wrapper = e.getWrapper();
    wrapper.addStyle({ 'background-color':bg, color:fg, 'font-family':'Manrope, Arial, sans-serif' });
    const find = tag => wrapper.find(tag);
    find('section').forEach((c,i) => c.addStyle({ padding:'clamp(48px, 7vw, 104px) 7%', 'background-color':i%2 ? surface : bg, color:fg }));
    find('h1').forEach(c => c.addStyle({ 'font-family':'Manrope, Arial, sans-serif', 'font-size':'clamp(42px, 6.2vw, 84px)', 'font-weight':'800', 'letter-spacing':'-0.055em', 'line-height':'1.04', 'max-width':'950px' }));
    find('h2').forEach(c => c.addStyle({ 'font-family':'Manrope, Arial, sans-serif', 'font-size':'clamp(30px, 3.6vw, 52px)', 'font-weight':'800', 'letter-spacing':'-0.045em', 'line-height':'1.13' }));
    find('h3').forEach(c => c.addStyle({ 'font-size':'clamp(19px, 2vw, 25px)', 'letter-spacing':'-0.025em', 'line-height':'1.3' }));
    find('p').forEach(c => c.addStyle({ 'line-height':'1.75', 'font-size':'16px' }));
    find('nav').forEach(c => c.addStyle({ 'display':'flex', 'align-items':'center', 'justify-content':'space-between', 'gap':'20px', 'flex-wrap':'wrap' }));
    find('article').forEach(c => c.addStyle({ 'border-radius':'18px', 'padding':'28px', 'box-shadow':'0 12px 38px rgba(0,0,0,.07)' }));
    find('button').concat(find('a')).forEach(c => {
      const style = { 'border-radius':'11px', 'font-weight':'700', 'transition':'all .2s ease' };
      const text = (c.get('content') || '').toString();
      if (c.get('tagName').toLowerCase() === 'button' || /get started|explore|learn more|contact|shop now|choose plan/i.test(text)) Object.assign(style, { 'background-color':accent, color:direction==='Luxury'?'#171818':'#fff', padding:'13px 22px', border:'none', 'text-decoration':'none', 'display':'inline-block' });
      c.addStyle(style);
    });
    find('img').forEach(c => c.addStyle({ 'max-width':'100%', height:'auto', 'border-radius':'16px' }));
    find('input').concat(find('textarea'), find('select')).forEach(c => c.addStyle({ padding:'13px 16px', 'border-radius':'10px', border:'1px solid #b6bcb8', 'max-width':'100%' }));
    e.addStyle(`@media(max-width:640px){section{padding:42px 6%!important}nav{gap:12px!important}nav>div{display:flex;flex-wrap:wrap;gap:8px}button,a{max-width:100%}img{max-width:100%;height:auto}}`);
    saved.textContent = 'Unsaved changes';
    return true;
  }
  async function aiCss(instruction) {
    const e = ready(); if (!e) return;
    if (!instruction) return;
    setStatus('Applying design direction…');
    try {
      const response = await fetch('/api/ai-assist', { method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify({ task:'style', prompt:instruction, websiteType:type, theme, projectName:document.querySelector('#projectName').value, description:document.querySelector('#description').value, features:[...chosen], designHtml:e.getHtml().slice(0,12000) }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'AI unavailable');
      let css = String(data.text || '').replace(/^```(?:css)?\s*|\s*```$/g,'').trim();
      if (!css || css.length > 16000 || /@import|url\s*\(|expression\s*\(|javascript:|<\/?style|<script/i.test(css)) throw new Error('AI returned unsupported styling.');
      e.addStyle(css);
      setStatus('AI styling applied to the canvas. Preview and save when ready.');
      saved.textContent = 'Unsaved changes';
    } catch (err) { setStatus('Local design improvements applied. AI custom styling needs a valid OPENAI_API_KEY (' + err.message + ').'); }
  }
  document.querySelector('#aiBeautify').onclick = async () => {
    if (!beautify()) return;
    setStatus('Premium layout and spacing applied. Adding AI refinements if configured…');
    await aiCss('Refine the existing design with a polished premium visual system, harmonious colors, professional rhythm, consistent buttons and mobile responsiveness.');
  };
  const priorPromptHandler = document.querySelector('#applyPrompt').onclick;
  document.querySelector('#applyPrompt').onclick = async () => {
    const input = document.querySelector('#aiPrompt');
    const instruction = input.value.trim();
    if (!instruction) { setStatus('Describe the design change you want first.'); input.focus(); return; }
    // The built-in controls apply useful local transformations even without AI credentials.
    priorPromptHandler();
    const lower = instruction.toLowerCase();
    const match = Object.keys(palette).find(name => lower.includes(name.toLowerCase())) ||
      (/premium|luxury|gold/.test(lower) ? 'Luxury' : /nature|green/.test(lower) ? 'Nature' : /clean|white|minimal/.test(lower) ? 'Clean Light' : /dark|navy|midnight/.test(lower) ? 'Midnight' : /tech|blue/.test(lower) ? 'Tech Gradient' : null);
    if (match) beautify(match);
    await aiCss(instruction);
  };
  document.querySelectorAll('.device-btn').forEach(button => button.onclick = () => {
    const e = ready(); if (!e) return;
    e.setDevice(button.dataset.device);
    document.querySelectorAll('.device-btn').forEach(b => b.classList.toggle('is-active', b === button));
    setStatus(button.dataset.device + ' canvas selected.');
  });
  document.querySelector('#addSection').onclick = () => {
    const e = ready(); if (!e) return;
    e.addComponents('<section style="padding:70px 7%;background:#f5f7f4;color:#23332e"><p style="font-size:12px;letter-spacing:2px">WHY CHOOSE US</p><h2 style="font-size:clamp(30px,4vw,54px);margin:14px 0">Thoughtfully made for you.</h2><p style="max-width:650px;line-height:1.7">Tell your story here. Select any text to edit it directly.</p><a href="#contact" style="display:inline-block;padding:14px 24px;background:#234d41;color:white;border-radius:10px;text-decoration:none">Let’s talk ↗</a></section>');
    saved.textContent = 'Unsaved changes'; setStatus('New premium section added to the bottom of your canvas.');
  };

  if (ready()) {
    try {
      const draft = JSON.parse(localStorage.getItem('websprint-design-v3') || 'null');
      if (draft?.project) { getEditor().loadProjectData(draft.project); saved.textContent = 'Recovered your saved draft ✓'; }
      else {
        const old = JSON.parse(localStorage.getItem('websprint-design') || 'null');
        if (old?.html) { getEditor().setComponents(old.html); if (old.css) getEditor().setStyle(old.css); saved.textContent = 'Recovered your previous draft ✓'; }
      }
    } catch { saved.textContent = 'Starter design ready'; }
    getEditor().on('update', () => { if (!saved.textContent.includes('Unsaved')) saved.textContent = 'Unsaved changes'; });
  }
})();
