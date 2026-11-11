/* Beginner-friendly component arrangement controls around the GrapesJS canvas. */
(() => {
  const editorRef=()=>typeof editor!=='undefined'?editor:null;
  const shell=document.querySelector('.studio-shell');
  if(!shell)return;
  const toolbar=document.createElement('div');
  toolbar.className='ws-arrange-toolbar';
  toolbar.innerHTML=`<div class="ws-arrange-heading"><span class="ws-arrange-dot">✦</span><div><strong>Arrange your website</strong><small id="ws-selected-label">Select an element in the canvas to move or customise it.</small></div></div><div class="ws-arrange-actions"><button type="button" id="ws-insert-button">＋ Button</button><button type="button" id="ws-insert-dropdown">＋ Dropdown</button><button type="button" id="ws-move-up" disabled>↑ Move up</button><button type="button" id="ws-move-down" disabled>↓ Move down</button><label class="ws-arrange-destination">Move to section<select id="ws-move-section" disabled><option value="">Select section…</option></select></label><button type="button" id="ws-duplicate" disabled>Duplicate</button><button type="button" id="ws-delete" disabled>Delete</button></div><div class="ws-text-composer"><label for="ws-custom-text"><strong>＋ Add your own text</strong><span>Write a note, description, heading or footer message. Place it anywhere.</span></label><textarea id="ws-custom-text" rows="2" placeholder="e.g. Made with love by Aryan · Welcome to our website..."></textarea><div class="ws-text-controls"><select id="ws-text-style" aria-label="Text style"><option value="paragraph">Paragraph</option><option value="heading">Heading</option><option value="small">Small caption</option></select><select id="ws-text-placement" aria-label="Text placement"><option value="after">Below selected element</option><option value="top">Top of website</option><option value="end">Bottom of home page</option><option value="footer">Footer (every page)</option></select><button type="button" id="ws-add-text">Add text to website ↗</button></div></div><p id="ws-arrange-status" role="status" aria-live="polite">Tip: you can also drag elements directly in the editor. Select a button to move it to another section.</p>`;
  shell.parentNode.insertBefore(toolbar,shell);
  const $=s=>toolbar.querySelector(s);
  const tagSelect=document.createElement('select');
  tagSelect.id='ws-insert-dynamic';
  tagSelect.setAttribute('aria-label','Add a dynamic tag from project details');
  tagSelect.title='Text-only fields from your Project Details form — not buttons or dropdown menus';
  tagSelect.innerHTML='<option value="">Tt  Dynamic Text ▾</option><option value="company">Tt  Company name</option><option value="audience">Tt  Target audience</option><option value="description">Tt  Company description</option><option value="pages">Tt  Website pages</option><option value="timeline">Tt  Launch timeline</option>';
  toolbar.querySelector('#ws-insert-dropdown').after(tagSelect);
  const horizontalButtons=document.createElement('span');horizontalButtons.className='ws-arrange-horizontal';
  horizontalButtons.innerHTML='<button type="button" id="ws-shift-left" title="Move selected element left by 24 pixels">← Left</button><button type="button" id="ws-shift-right" title="Move selected element right by 24 pixels">Right →</button>';
  tagSelect.after(horizontalButtons);
  tagSelect.addEventListener('change',()=>{
    const key=tagSelect.value;tagSelect.value='';if(!key)return;
    if(window.WebSprintDynamicTags?.insert(key))status('Dynamic tag added. It displays the value from Step 03 and can be moved or resized.');
    else status('The preview editor is still loading. Please try again.');
  });
  const status=message=>{$('#ws-arrange-status').textContent=message;};
  const escapeHtml=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const selected=()=>editorRef()?.getSelected()||null;
  const shiftSelected=direction=>{
    const c=selected();if(!c)return status('Click an element in the preview first.');
    const current=parseFloat(c.getStyle()?.left)||0;
    c.addStyle({position:'relative',left:Math.max(-1200,Math.min(1200,current+24*direction))+'px'});
    editorRef()?.refresh?.();
    status('Moved '+(direction>0?'right':'left')+' by 24px. Keep clicking for more, or use the drag handle for precise placement.');
  };
  $('#ws-shift-left').onclick=()=>shiftSelected(-1);
  $('#ws-shift-right').onclick=()=>shiftSelected(1);
  const label=c=>{
    const tag=(c?.get('tagName')||'Element').toLowerCase();
    const name=String(c?.get('content')||'').replace(/<[^>]*>/g,'').trim();
    return name?tag.toUpperCase()+' · '+name.slice(0,48):tag.toUpperCase();
  };
  const sections=()=>{
    const e=editorRef();if(!e)return [];
    return e.getWrapper().find('section').filter(c=>c.get('tagName')?.toLowerCase()==='section');
  };
  const update=()=>{
    const c=selected(),valid=Boolean(c&&c.parent());
    $('#ws-selected-label').textContent=valid?label(c):'Select an element in the canvas to move or customise it.';
    const parent=valid?c.parent():null;
    const index=parent?parent.components().indexOf(c):-1;
    $('#ws-move-up').disabled=!valid||index<=0;
    $('#ws-move-down').disabled=!valid||index>=parent.components().length-1;
    $('#ws-duplicate').disabled=!valid;
    $('#ws-delete').disabled=!valid;
    const choices=sections();
    const select=$('#ws-move-section');
    const current=select.value;
    select.innerHTML='<option value="">Choose destination…</option>';
    choices.forEach((section,i)=>{
      const heading=section.find('h1,h2,h3')[0];
      const text=String(heading?.get('content')||'').replace(/<[^>]+>/g,'').trim().slice(0,42);
      const opt=document.createElement('option');opt.value=String(i);opt.textContent=`Section ${i+1}${text?' · '+text:''}`;select.append(opt);
    });
    select.disabled=!valid||!choices.length;
    if([...select.options].some(x=>x.value===current))select.value=current;
  };
  const moveBy=delta=>{
    const e=editorRef(),c=selected();if(!e||!c||!c.parent())return;
    const parent=c.parent(),list=parent.components(),index=list.indexOf(c);
    const next=Math.max(0,Math.min(list.length-1,index+delta));
    if(next===index)return;
    c.move(parent,{at:next});e.select(c);update();
    status('Element moved. Open Live Preview to check its new position.');
  };
  $('#ws-move-up').onclick=()=>moveBy(-1);
  $('#ws-move-down').onclick=()=>moveBy(1);
  $('#ws-move-section').onchange=event=>{
    const e=editorRef(),c=selected(),destination=sections()[Number(event.target.value)];
    if(!e||!c||!destination||c===destination)return;
    // Avoid moving a section inside itself or into its own descendants.
    let ancestor=destination;
    while(ancestor){if(ancestor===c){status('Choose a different section to avoid nesting an element inside itself.');return;}ancestor=ancestor.parent();}
    c.move(destination,{at:destination.components().length});e.select(c);update();
    status('Moved into the selected section. You can drag it into a precise position there.');
  };
  const insert=(markup,placement='after')=>{
    const e=editorRef();if(!e)return;
    const c=selected();let added;
    const wrapper=e.getWrapper(),site=wrapper.find('.ws-site')[0]||wrapper;
    if(placement==='top'){
      const hero=wrapper.find('.ws-hero')[0]||wrapper.find('section')[0]||site;
      added=hero.append(markup,{at:0});
    }else if(placement==='footer'){
      const footer=wrapper.find('.ws-footer')[0]||wrapper.find('footer')[0]||site;
      added=footer.append(markup);
    }else if(placement==='end'){
      const footer=wrapper.find('.ws-footer')[0]||wrapper.find('footer')[0];
      added=site.append(markup,{at:footer&&footer.parent()===site?site.components().indexOf(footer):site.components().length});
    }else if(c?.getAttributes?.()['data-ws-user-page']){
      added=c.append(markup);
    }else if(c?.parent()){
      const parent=c.parent(),at=parent.components().indexOf(c)+1;
      added=parent.append(markup,{at});
    }else{
      const target=wrapper.find('.ws-hero')[0]||wrapper.find('section')[0]||wrapper;
      added=target.append(markup);
    }
    const created=Array.isArray(added)?added[0]:added;
    if(created)e.select(created);
    update();status('Component added. Double-click its text to edit, then move it anywhere you like.');
    return created;
  };
  const buttonMarkup='<a href="#/contact" style="display:inline-block;padding:13px 22px;background:#397f65;color:#ffffff;border-radius:12px;text-decoration:none;font-weight:700">Your new button ↗</a>';
  const dropdownMarkup='<details class="ws-custom-dropdown" style="display:inline-block;width:max-content;min-width:0;max-width:100%;border:1px solid #80808045;border-radius:12px;background:var(--ws-soft);color:var(--ws-ink);padding:12px 15px;box-shadow:0 8px 25px rgba(19,42,31,.08)"><summary style="cursor:pointer;font-weight:700">Explore options ▾</summary><div class="ws-custom-dropdown-menu" style="display:grid;gap:3px;margin-top:10px;padding:7px;border:1px solid #80808045;border-radius:10px;background:var(--ws-bg);box-shadow:0 16px 36px rgba(19,42,31,.12)"><a href="#/about" style="display:block;padding:11px 13px;border-radius:7px;color:var(--ws-ink);text-decoration:none;font-size:14px">About us</a><a href="#/contact" style="display:block;padding:11px 13px;border-radius:7px;color:var(--ws-ink);text-decoration:none;font-size:14px">Contact us</a><a href="#/home" style="display:block;padding:11px 13px;border-radius:7px;color:var(--ws-ink);text-decoration:none;font-size:14px">Home</a></div></details>';
  $('#ws-insert-button').onclick=()=>insert(buttonMarkup);
  $('#ws-insert-dropdown').onclick=()=>insert(dropdownMarkup);
  $('#ws-add-text').onclick=()=>{
    const e=editorRef(),input=$('#ws-custom-text'),raw=input.value.trim();
    if(!e){status('The editor has not loaded yet. Reload the page and try again.');return;}
    if(!raw){status('Type your text first, then choose where to place it.');input.focus();return;}
    const style=$('#ws-text-style').value,placement=$('#ws-text-placement').value;
    const safe=escapeHtml(raw).replace(/\n/g,'<br>');
    const markup=style==='heading'?`<h2 style="font-family:Manrope,Arial,sans-serif;font-size:clamp(27px,3.5vw,46px);line-height:1.2;letter-spacing:-.04em;margin:20px 0">${safe}</h2>`:style==='small'?`<small style="display:block;font-size:12px;line-height:1.6;opacity:.8;margin:12px 0">${safe}</small>`:`<p style="font-family:Manrope,Arial,sans-serif;font-size:16px;line-height:1.75;max-width:780px;margin:18px 0">${safe}</p>`;
    const wrapper=e.getWrapper(),site=wrapper.find('.ws-site')[0]||wrapper;
    let added;
    if(placement==='after'&&selected()?.parent()){
      const c=selected(),parent=c.parent();added=parent.append(markup,{at:parent.components().indexOf(c)+1});
    }else if(placement==='footer'){
      const footer=wrapper.find('.ws-footer')[0]||wrapper.find('footer')[0]||site;
      added=footer.append(markup);
    }else if(placement==='top'){
      const hero=wrapper.find('.ws-hero')[0]||wrapper.find('section')[0]||site;
      added=hero.append(markup,{at:0});
    }else{
      const footer=wrapper.find('.ws-footer')[0]||wrapper.find('footer')[0];
      added=site.append(markup,{at:footer&&footer.parent()===site?site.components().indexOf(footer):site.components().length});
    }
    const created=Array.isArray(added)?added[0]:added;
    if(created)e.select(created);
    input.value='';update();
    document.querySelector('#designSaved').textContent='Unsaved changes';
    status('Your text has been added. You can select it to edit, style or move it.');
  };
  window.WebSprintArrange={
    addText:(text,placement='end',style='paragraph')=>{
      $('#ws-custom-text').value=text;$('#ws-text-placement').value=placement;$('#ws-text-style').value=style;
      $('#ws-add-text').click();
    },
    addButton:placement=>insert(buttonMarkup,placement||'end'),
    addDropdown:placement=>insert(dropdownMarkup,placement||'end'),
    insertMarkup:(markup,placement='after')=>insert(markup,placement),
    openEditor:()=>document.querySelector('#designStudio')?.scrollIntoView({behavior:'smooth',block:'start'})
  };
  $('#ws-duplicate').onclick=()=>{const e=editorRef(),c=selected();if(!e||!c?.parent())return;const duplicate=c.clone(),parent=c.parent();parent.append(duplicate,{at:parent.components().indexOf(c)+1});e.select(duplicate);update();status('Duplicate added beside the original.');};
  $('#ws-delete').onclick=()=>{const e=editorRef(),c=selected();if(!e||!c?.parent())return;c.remove();e.select(null);update();status('Selected component removed. Use the editor’s Undo command to restore it if needed.');};
  const e=editorRef();
  if(e){e.on('component:selected',update);e.on('component:deselected',update);update();}
})();

/* Dropdowns can be opened in the preview and edited with simple form controls. */
(() => {
  const parent=document.querySelector('.ws-arrange-toolbar');
  if(!parent)return;
  const editorRef=()=>typeof editor!=='undefined'?editor:null;
  const escapeHtml=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const panel=document.createElement('section');panel.className='ws-dropdown-settings';panel.hidden=true;
  panel.innerHTML=`<div class="ws-dropdown-head"><div><strong>▤ Edit dropdown menu</strong><small>Add links or text that visitors see when they open it.</small></div><button type="button" id="ws-dd-close" aria-label="Close settings">×</button></div><label class="ws-dd-field">Dropdown title<input id="ws-dd-title" placeholder="Explore options"></label><div class="ws-dd-heading"><strong>Options inside the menu</strong><small>Give every option a label and where it should lead.</small></div><div id="ws-dd-rows"></div><button type="button" class="ws-dd-add" id="ws-dd-add">＋ Add option</button><div class="ws-dd-actions"><button type="button" id="ws-dd-save">Save dropdown</button><span id="ws-dd-status" role="status" aria-live="polite"></span></div>`;
  parent.append(panel);
  const $=s=>panel.querySelector(s);let active=null;
  const dropdownOf=c=>{while(c){if(c.get('tagName')?.toLowerCase()==='details'&&String(c.getAttributes()?.class||'').includes('ws-custom-dropdown'))return c;c=c.parent?.();}return null;};
  const addRow=(label='',url='')=>{
    const row=document.createElement('div');row.className='ws-dd-row';
    row.innerHTML=`<input aria-label="Option text" placeholder="Option name" value="${escapeHtml(label)}"><input aria-label="Link or page" placeholder="#/shop or https://..." value="${escapeHtml(url)}"><button type="button" aria-label="Remove option">×</button>`;
    row.querySelector('button').onclick=()=>row.remove();$('#ws-dd-rows').append(row);
  };
  const show=c=>{
    active=c;const html=c.toHTML?.()||'';
    const parsed=new DOMParser().parseFromString(html,'text/html');
    $('#ws-dd-title').value=(parsed.querySelector('summary')?.textContent||'Explore options').replace(/\s*[▾⌄]\s*$/,'').trim();
    $('#ws-dd-rows').replaceChildren();
    const links=[...parsed.querySelectorAll('a')];
    if(links.length)links.forEach(a=>addRow(a.textContent.trim(),a.getAttribute('href')||''));else addRow('First option','#/home');
    $('#ws-dd-status').textContent='';panel.hidden=false;
  };
  const sync=()=>{const c=dropdownOf(editorRef()?.getSelected?.());if(!c){active=null;panel.hidden=true;}else if(c!==active)show(c);};
  $('#ws-dd-close').onclick=()=>{active=null;panel.hidden=true;};
  $('#ws-dd-add').onclick=()=>{addRow('New option','#/home');$('#ws-dd-rows').lastElementChild.querySelector('input').focus();};
  $('#ws-dd-save').onclick=()=>{
    if(!active)return;
    const title=$('#ws-dd-title').value.trim()||'Explore options';
    const items=[...$('#ws-dd-rows').children].map(row=>{const [label,url]=row.querySelectorAll('input');return {label:label.value.trim(),url:url.value.trim()};}).filter(item=>item.label);
    if(!items.length){$('#ws-dd-status').textContent='Please add at least one option.';return;}
    const allowed=url=>/^(https?:\/\/|mailto:|tel:|#|\/(?!\/))/i.test(url)?url:'#/home';
    active.components(`<summary style="cursor:pointer;font-weight:700">${escapeHtml(title)} ▾</summary><div class="ws-custom-dropdown-menu" style="display:grid;gap:3px;margin-top:10px;padding:7px;border:1px solid #dce6df;border-radius:10px;background:#fff;box-shadow:0 16px 36px rgba(19,42,31,.12)">${items.map(item=>`<a href="${escapeHtml(allowed(item.url))}" style="display:block;padding:11px 13px;border-radius:7px;color:#183329;text-decoration:none;font-size:14px">${escapeHtml(item.label)}</a>`).join('')}</div>`);
    editorRef()?.select(active);$('#ws-dd-status').textContent='✓ Saved. Try opening it in Live Preview.';
    const saved=document.querySelector('#designSaved');if(saved)saved.textContent='Unsaved changes';
  };
  const e=editorRef();if(e){e.on('component:selected',sync);e.on('component:deselected',sync);sync();}
})();
