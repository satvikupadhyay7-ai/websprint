/* Beginner-facing template and feature library beside the in-preview editor. */
(() => {
  const stage=document.querySelector('.panel[data-panel="3"] .ws-stage');
  if(!stage)return;
  const palette=document.createElement('aside');
  palette.className='ws-builder-palette';palette.hidden=true;
  palette.innerHTML=`<div class="ws-palette-head"><span class="ws-kicker">YOUR DESIGN TOOLBOX</span><h3>Make it yours.</h3><p>Pick anything below to add it to your website. Then click it on the canvas to move, resize or style it.</p></div><label class="ws-palette-field">Start with a template<select id="ws-palette-template"></select></label><div class="ws-palette-section"><strong>Quick components</strong><div class="ws-palette-tiles"><button type="button" data-basic="heading">Tt <span>Heading</span></button><button type="button" data-basic="text">¶ <span>Text</span></button><button type="button" data-basic="button">↗ <span>Button</span></button><button type="button" data-basic="dropdown">⌄ <span>Dropdown</span></button><button type="button" data-basic="form">✉ <span>Form</span></button><button type="button" data-basic="card">▧ <span>Card</span></button><button type="button" data-basic="image">▣ <span>Image</span></button><button type="button" data-basic="section">＋ <span>Section</span></button></div></div><div class="ws-palette-section"><strong>Purpose-built features</strong><input id="ws-palette-search" type="search" placeholder="Search features, e.g. cart"><div class="ws-palette-features" id="ws-palette-features"></div></div><p class="ws-palette-note" id="ws-palette-note" role="status" aria-live="polite">Choose a component to add it to your design.</p>`;
  const pagesPanel=document.createElement('div');pagesPanel.className='ws-palette-section ws-pages-manager';
  pagesPanel.innerHTML='<strong>Pages on your website</strong><p>Design Discover, Explore, Services or any other page separately.</p><label>Editing page<select id="ws-page-picker"><option value="home">Home</option></select></label><div class="ws-add-page"><input id="ws-page-name" placeholder="New page name, e.g. Explore" aria-label="New page name"><button type="button" id="ws-page-add">＋ Add page</button></div><button type="button" id="ws-page-home">↖ Back to homepage</button><p id="ws-page-tip" role="status" aria-live="polite">Each page gets its own link and editable content.</p>';
  const movePanel=document.createElement('div');movePanel.className='ws-palette-section ws-palette-move';
  movePanel.innerHTML='<strong>Move & resize selection</strong><p>Select something on the website, then move it with these controls or drag it in the canvas.</p><div class="ws-palette-move-buttons"><button type="button" id="ws-palette-up">↑ Move up</button><button type="button" id="ws-palette-down">↓ Move down</button></div><label>Width <select id="ws-palette-width"><option value="auto">Natural</option><option value="50%">Half width</option><option value="75%">Three-quarter</option><option value="100%">Full width</option></select></label><button type="button" id="ws-palette-to-page">Move into current page</button>';
  const stylingPanel=document.createElement('div');stylingPanel.className='ws-palette-section ws-visual-settings';
  stylingPanel.innerHTML='<strong>Appearance & spacing</strong><p>No CSS needed. Change the website theme or the selected element’s size and spacing.</p><label>Website appearance<select id="ws-visual-mode"><option value="light">☀ Light</option><option value="dark">☾ Dark</option></select></label><div class="ws-measure-grid"><label>Width (px)<input type="number" id="ws-size-width" min="20" max="2000" placeholder="Auto"></label><label>Height (px)<input type="number" id="ws-size-height" min="20" max="2000" placeholder="Auto"></label><label>Inside spacing (px)<input type="number" id="ws-size-padding" min="0" max="250" placeholder="Keep"></label><label>Outside spacing (px)<input type="number" id="ws-size-margin" min="0" max="250" placeholder="Keep"></label><label>Corner radius (px)<input type="number" id="ws-size-radius" min="0" max="150" placeholder="Keep"></label><label>Gap (px)<input type="number" id="ws-size-gap" min="0" max="150" placeholder="Keep"></label></div><button type="button" id="ws-visual-apply">Apply size & spacing</button><p id="ws-visual-status" role="status" aria-live="polite">Select an element to adjust its dimensions. Leave a field empty to keep its current value.</p>';
  palette.querySelector('.ws-palette-section').before(movePanel);
  palette.querySelector('.ws-palette-section').before(stylingPanel);
  palette.querySelector('.ws-palette-section').before(pagesPanel);
  stage.insertBefore(palette,stage.querySelector('#gjs')||stage.firstChild);
  const $=s=>palette.querySelector(s);
  const api=()=>window.WebSprintTemplateEngine;
  const arrange=()=>window.WebSprintArrange;
  const note=s=>{$('#ws-palette-note').textContent=s;};
  const currentEditor=()=>typeof editor!=='undefined'?editor:null;
  const getSite=()=>currentEditor()?.getWrapper()?.find('[data-ws-site]')?.[0];
  const setMode=mode=>{
    const site=getSite();if(!site)return note('Load a template first.');
    const dark=mode==='dark';
    site.addStyle({'--ws-bg':dark?'#111a1b':'#fafbf8','--ws-ink':dark?'#ecf5f0':'#1c3430','--ws-accent':dark?'#86d9b1':'#377d6b','--ws-soft':dark?'#21302d':'#e9f0e9'});
    site.addAttributes({'data-ws-theme-mode':mode});
    customPages().forEach(page=>page.addStyle({background:'var(--ws-bg)',color:'var(--ws-ink)'}));
    note((dark?'Dark':'Light')+' theme applied to your website and subpages.');
    const saved=document.querySelector('#designSaved');if(saved)saved.textContent='Unsaved changes';
  };
  $('#ws-visual-mode').onchange=event=>setMode(event.target.value);
  const readMeasurement=id=>{const value=$('#'+id).value.trim();return value===''?null:Math.max(0,Math.min(2000,Number(value)||0))+'px';};
  $('#ws-visual-apply').onclick=()=>{
    const e=currentEditor(),c=e?.getSelected();if(!c)return $('#ws-visual-status').textContent='Select an element in the preview first.';
    const style={};
    [['ws-size-width','width'],['ws-size-height','height'],['ws-size-padding','padding'],['ws-size-margin','margin'],['ws-size-radius','border-radius'],['ws-size-gap','gap']].forEach(([id,key])=>{const value=readMeasurement(id);if(value!==null)style[key]=value;});
    if(!Object.keys(style).length)return $('#ws-visual-status').textContent='Enter a size or spacing value.';
    c.addStyle(style);e.refresh?.();$('#ws-visual-status').textContent='✓ Dimensions updated on the selected element.';
    const saved=document.querySelector('#designSaved');if(saved)saved.textContent='Unsaved changes';
  };
  const moveSelected=delta=>{
    const e=currentEditor(),c=e?.getSelected(),parent=c?.parent();if(!parent)return note('Select an element first.');
    const list=parent.components(),at=list.indexOf(c),target=Math.max(0,Math.min(list.length-1,at+delta));
    if(target===at)return note('Already at the edge of this section.');
    c.move(parent,{at:target});e.select(c);e.refresh?.();note('Moved! The new position is saved in your design.');
  };
  $('#ws-palette-up').onclick=()=>moveSelected(-1);
  $('#ws-palette-down').onclick=()=>moveSelected(1);
  $('#ws-palette-width').onchange=event=>{const c=currentEditor()?.getSelected();if(!c)return note('Select an element first.');c.addStyle({width:event.target.value,'max-width':'100%'});note('Width updated.');};
  $('#ws-palette-to-page').onclick=()=>{
    const e=currentEditor(),c=e?.getSelected(),page=customPages().find(x=>x.getAttributes()['data-ws-user-page']===activePage);
    if(!c||!page||c===page)return note('Choose a subpage and select an element to move there.');
    let ancestor=page;while(ancestor){if(ancestor===c)return note('Select a smaller element, not the entire page.');ancestor=ancestor.parent?.();}
    c.move(page,{at:page.components().length});e.select(c);note('Element moved to '+activePage+'.');
  };
  const customPages=()=>currentEditor()?.getWrapper()?.find('[data-ws-user-page]')||[];
  let activePage='home';
  const pageSlug=name=>name.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  const refreshPagePicker=()=>{
    const picker=$('#ws-page-picker');picker.replaceChildren();
    [['home','Home'],...customPages().map(c=>[c.getAttributes()['data-ws-user-page'],c.getAttributes()['data-ws-page-title']])].forEach(([id,name])=>{
      const option=document.createElement('option');option.value=id;option.textContent=name||id;picker.append(option);
    });
    picker.value=activePage;
    if(!picker.value)picker.value='home';
  };
  const showPage=slug=>{
    const e=currentEditor();if(!e)return;
    activePage=slug;
    const root=e.getWrapper().find('.ws-site')[0];
    const target=slug==='home'?null:customPages().find(c=>c.getAttributes()['data-ws-user-page']===slug);
    if(slug!=='home'&&!target){activePage='home';}
    const doc=e.Canvas.getDocument?.();
    if(doc){let style=doc.getElementById('ws-editor-page-visibility');if(!style){style=doc.createElement('style');style.id='ws-editor-page-visibility';doc.head.append(style);}
      const selectedPage=activePage;
      style.textContent=selectedPage==='home'?'[data-ws-user-page]{display:none!important}':`.ws-site > :not(.ws-nav):not(.ws-footer):not([data-ws-user-page="${selectedPage}"]){display:none!important}.ws-site > [data-ws-user-page]:not([data-ws-user-page="${selectedPage}"]){display:none!important}`;
    }
    if(target)e.select(target);
    refreshPagePicker();$('#ws-page-tip').textContent=activePage==='home'?'Editing your homepage. Select a subpage above to customise it.':'Editing '+(target?.getAttributes()['data-ws-page-title']||activePage)+'. Add components to this page.';
  };
  $('#ws-page-picker').onchange=event=>showPage(event.target.value);
  $('#ws-page-home').onclick=()=>showPage('home');
  $('#ws-page-add').onclick=()=>{
    const e=currentEditor(),raw=$('#ws-page-name').value.trim(),slug=pageSlug(raw);
    if(!e||!slug){$('#ws-page-tip').textContent='Enter a page name first.';return;}
    if(['home','about','contact','cart','checkout','shop','courses','workspace','community','work','services','features'].includes(slug)||customPages().some(c=>c.getAttributes()['data-ws-user-page']===slug)){
      $('#ws-page-tip').textContent='That page name is already used. Try another.';return;
    }
    const safe=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
    const site=e.getWrapper().find('.ws-site')[0]||e.getWrapper();
    const footer=site.find('.ws-footer')[0];
    const markup=`<section data-ws-user-page="${slug}" data-ws-page-title="${safe(raw)}" class="ws-section ws-user-subpage" style="min-height:540px;padding:70px 7%;background:var(--ws-bg);color:var(--ws-ink)"><span class="ws-kicker">YOUR WEBSITE</span><h1 style="font-size:clamp(42px,5vw,70px);margin:20px 0">${safe(raw)}</h1><p style="font-size:18px;max-width:620px;line-height:1.7">Make this page your own. Add headings, text, buttons, images or features from the toolbox.</p><a class="ws-pill" href="#/home">← Back to home</a></section>`;
    site.append(markup,{at:footer&&footer.parent()===site?site.components().indexOf(footer):site.components().length});
    $('#ws-page-name').value='';showPage(slug);note('Added '+raw+' as a separate page. Use the components below to design it.');
  };
  const refreshTypes=()=>{
    const engine=api();if(!engine)return;
    $('#ws-palette-template').innerHTML='';
    engine.getTypes().forEach(name=>{const option=document.createElement('option');option.value=name;option.textContent=name;$('#ws-palette-template').append(option)});
    $('#ws-palette-template').value=engine.getType();
  };
  const refreshFeatures=()=>{
    const engine=api();if(!engine)return;
    const q=$('#ws-palette-search').value.toLowerCase().trim();
    const matches=engine.getFeatures().filter(name=>name.toLowerCase().includes(q));
    const list=$('#ws-palette-features');list.replaceChildren();
    matches.forEach(name=>{const button=document.createElement('button');button.type='button';button.textContent='＋  '+name;button.title='Add '+name+' to your website';button.onclick=()=>{
      const e=currentEditor(),page=activePage==='home'?null:customPages().find(c=>c.getAttributes()['data-ws-user-page']===activePage);
      const before=new Set(e?.getWrapper().find('[data-ws-manual-feature]')||[]);
      engine.addManualFeature(name);
      const added=e?.getWrapper().find('[data-ws-manual-feature]').find(c=>!before.has(c));
      if(page&&added){added.move(page,{at:page.components().length});e.select(added);}
      note(name+' added'+(page?' to '+activePage:'')+'. Click and drag its section to arrange it.');
    };list.append(button)});
    if(!matches.length){const empty=document.createElement('p');empty.textContent='No matching features. Try another word.';list.append(empty);}
  };
  $('#ws-palette-template').onchange=()=>{
    const engine=api();if(!engine)return;
    if(!confirm('Changing the template will replace this website design. Save your current design first if you want to keep it. Continue?')){$('#ws-palette-template').value=engine.getType();return;}
    engine.selectTemplate($('#ws-palette-template').value);refreshFeatures();note('Template changed. Add features from the list below.');
  };
  $('#ws-palette-search').addEventListener('input',refreshFeatures);
  const components={
    heading:'<h2 style="font-size:clamp(30px,4vw,54px);line-height:1.15;margin:18px 0;font-weight:800">Your new heading</h2>',
    text:'<p style="font-size:16px;line-height:1.75;max-width:720px">Write your story here. Click to edit.</p>',
    form:'<form data-demo-form style="display:grid;gap:12px;padding:24px;max-width:520px;border:1px solid #dae1d6;border-radius:16px"><h3>Get in touch</h3><input class="ws-input" type="text" placeholder="Your name" required><input class="ws-input" type="email" placeholder="Email address" required><textarea class="ws-input" placeholder="Your message"></textarea><button class="ws-pill" type="submit">Send message →</button></form>',
    card:'<article class="ws-card"><span class="ws-tag">FEATURE</span><h3>A beautiful feature</h3><p>Describe what makes your website special.</p><a class="ws-pill" href="#/contact">Learn more →</a></article>',
    image:'<div style="width:100%;max-width:560px;min-height:250px;border-radius:22px;background:linear-gradient(135deg,#d9e8d8,#a8c3b0);display:grid;place-items:center;font-size:70px">✳</div>',
    section:'<section class="ws-section"><span class="ws-kicker">YOUR STORY</span><h2>New section</h2><p>Add content, buttons, cards or images to build this section.</p></section>'
  };
  palette.querySelectorAll('[data-basic]').forEach(button=>button.onclick=()=>{
    const kind=button.dataset.basic,helper=arrange();if(!helper){note('The editor is still loading.');return;}
    if(kind==='button')helper.addButton('after');
    else if(kind==='dropdown')helper.addDropdown('after');
    else helper.insertMarkup(components[kind],'after');
    note(kind[0].toUpperCase()+kind.slice(1)+' added. Select it to edit its text, size and shape.');
  });
  document.addEventListener('websprint:editmode',event=>{
    palette.hidden=!event.detail.editing;
    if(event.detail.editing){refreshTypes();refreshFeatures();refreshPagePicker();showPage(activePage);$('#ws-visual-mode').value=getSite()?.getAttributes()['data-ws-theme-mode']||'light';}
    else showPage('home');
  });
  window.WebSprintPages={showPage,getCurrent:()=>activePage};
})();
