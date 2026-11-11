/* Edit the actual GrapesJS canvas inside the final-preview stage. */
(() => {
  const review=document.querySelector('.panel[data-panel="3"]');
  const stage=review?.querySelector('.ws-stage');
  const stageTop=review?.querySelector('.ws-stage-top');
  const canvas=document.querySelector('#gjs');
  if(!review||!stage||!stageTop||!canvas)return;
  const home=canvas.parentElement;
  const nextSibling=canvas.nextSibling;
  const frame=stage.querySelector('iframe');
  const editorRef=()=>typeof editor!=='undefined'?editor:null;
  let editing=false;
  const toggle=document.createElement('button');
  toggle.className='ws-editmode-toggle';toggle.type='button';toggle.textContent='✎ Edit directly on page';
  stageTop.append(toggle);
  const panel=document.createElement('div');panel.className='ws-inline-design';panel.hidden=true;
  panel.innerHTML=`<div class="ws-inline-design-head"><div><strong>Design the page your way</strong><p>Select an element on the canvas, drag it to rearrange, or change its appearance below.</p></div><button type="button" id="ws-finish-edit">✓ Done editing</button></div><div class="ws-inline-design-controls"><label>Selected text<input id="ws-inline-text" placeholder="Select a button or text element first"></label><label>Button shape<select id="ws-inline-shape"><option value="pill">Pill / fully rounded</option><option value="rounded">Soft rounded</option><option value="square">Straight corners</option></select></label><label>Button size<select id="ws-inline-size"><option value="small">Small</option><option value="medium" selected>Medium</option><option value="large">Large</option></select></label><label>Button colour<input id="ws-inline-colour" type="color" value="#397f65"></label><button type="button" id="ws-apply-design">Apply to selected element</button></div><p id="ws-inline-status" role="status" aria-live="polite">Click an element in the page to select it. Drag to move; use the built-in style panel for precise spacing.</p>`;
  stage.parentNode.insertBefore(panel,stage);
  const inspector=document.createElement('aside');inspector.className='ws-simple-inspector';inspector.hidden=true;
  inspector.innerHTML=`<div class="ws-simple-head"><span>✦ SIMPLE DESIGN</span><h3>Make it yours.</h3><p>Click anything on the website to change it here.</p></div><div class="ws-simple-empty" id="ws-simple-empty">← Select any heading, button, image or section.</div><div id="ws-simple-fields" hidden><label>Text on element<input id="ws-simple-text" placeholder="Type the new text"></label><label>Button destination / link<input id="ws-simple-link" placeholder="#/contact or https://..."></label><label id="ws-simple-image-label" hidden>Replace selected image<input type="file" id="ws-simple-image" accept="image/png,image/jpeg,image/webp,image/gif"></label><div class="ws-simple-split"><label>Text colour<input type="color" id="ws-simple-ink" value="#183329"></label><label>Background<input type="color" id="ws-simple-bg" value="#ffffff"></label></div><label>Text size<select id="ws-simple-font"><option value="">Keep current</option><option value="14px">Small</option><option value="18px">Medium</option><option value="26px">Large</option><option value="40px">Extra large</option></select></label><label>Text alignment<select id="ws-simple-align"><option value="">Keep current</option><option value="left">Left</option><option value="center">Centre</option><option value="right">Right</option></select></label><label>Corner style<select id="ws-simple-radius"><option value="">Keep current</option><option value="0px">Square</option><option value="12px">Rounded</option><option value="999px">Pill</option></select></label><div class="ws-simple-split"><label>Inside space<input type="number" id="ws-simple-padding" min="0" max="200" placeholder="Keep"></label><label>Outside space<input type="number" id="ws-simple-margin" min="0" max="200" placeholder="Keep"></label></div><label>Width<select id="ws-simple-width"><option value="">Keep current</option><option value="auto">Fit content</option><option value="50%">Half</option><option value="75%">Wide</option><option value="100%">Full width</option></select></label><button id="ws-simple-apply" type="button">✓ Apply to website</button><div class="ws-simple-row"><button type="button" id="ws-simple-copy">Duplicate</button><button type="button" id="ws-simple-delete">Delete</button></div><p id="ws-simple-status" role="status" aria-live="polite"></p></div><button type="button" id="ws-advanced-toggle">⚙ Advanced tools</button>`;
  stage.append(inspector);
  const $=s=>panel.querySelector(s);
  const inspect=s=>inspector.querySelector(s);
  const position=document.createElement('div');position.className='ws-simple-placement';
  position.innerHTML='<strong>Place element</strong><p>Move the selected item horizontally.</p><div class="ws-simple-placement-grid"><button type="button" data-place="left">⇤ Left</button><button type="button" data-place="center">↔ Centre</button><button type="button" data-place="right">Right ⇥</button></div>';
  inspect('#ws-simple-width').closest('label').after(position);
  position.querySelectorAll('[data-place]').forEach(button=>button.onclick=()=>{
    const c=selected(),e=editorRef();if(!c){inspect('#ws-simple-status').textContent='Select an element first.';return;}
    const place=button.dataset.place;
    const margins=place==='left'?{'margin-left':'0','margin-right':'auto'}:place==='right'?{'margin-left':'auto','margin-right':'0'}:{'margin-left':'auto','margin-right':'auto'};
    c.addStyle({...margins,'align-self':place==='center'?'center':place==='right'?'flex-end':'flex-start','justify-self':place==='center'?'center':place==='right'?'end':'start'});
    const tag=String(c.get('tagName')||'').toLowerCase();
    if(['details','button','a','span','small'].includes(tag))c.addStyle({'width':c.getStyle()?.width||'max-content','max-width':'100%'});
    e?.refresh?.();inspect('#ws-simple-status').textContent='✓ Moved '+place+'.';
  });
  const precision=document.createElement('section');precision.className='ws-precision-move';
  precision.innerHTML='<div class="ws-precision-title"><strong>Move it anywhere</strong><small>Works even if it is the only item on the row.</small></div><button type="button" id="ws-grab-move">✥ Grab & move on canvas</button><div class="ws-nudge-pad"><span></span><button type="button" data-nudge="0,-8" aria-label="Move up 8 pixels">↑</button><span></span><button type="button" data-nudge="-8,0" aria-label="Move left 8 pixels">←</button><button type="button" id="ws-move-reset" aria-label="Reset position">⌖</button><button type="button" data-nudge="8,0" aria-label="Move right 8 pixels">→</button><span></span><button type="button" data-nudge="0,8" aria-label="Move down 8 pixels">↓</button><span></span></div><div class="ws-precision-coordinates"><label>Left / right<input type="range" id="ws-move-x" min="-500" max="500" step="1" value="0"></label><label>Up / down<input type="range" id="ws-move-y" min="-500" max="500" step="1" value="0"></label></div><p id="ws-move-position">X: 0 · Y: 0</p>';
  position.after(precision);
  let moving=false,dragging=null,moveDoc=null;
  const numberStyle=(c,key)=>{const n=parseFloat(c?.getStyle?.()[key]);return Number.isFinite(n)?n:0;};
  const showCoordinates=()=>{
    const c=selected(),x=numberStyle(c,'left'),y=numberStyle(c,'top');
    inspect('#ws-move-x').value=String(Math.max(-500,Math.min(500,x)));
    inspect('#ws-move-y').value=String(Math.max(-500,Math.min(500,y)));
    inspect('#ws-move-position').textContent=`X: ${Math.round(x)}px · Y: ${Math.round(y)}px`;
  };
  const moveTo=(x,y)=>{
    const c=selected();if(!c)return;
    const nx=Math.max(-1000,Math.min(1000,Math.round(x))),ny=Math.max(-1000,Math.min(1000,Math.round(y)));
    c.addStyle({position:'relative',left:nx+'px',top:ny+'px'});
    showCoordinates();
    const saved=document.querySelector('#designSaved');if(saved)saved.textContent='Unsaved changes';
  };
  precision.querySelectorAll('[data-nudge]').forEach(b=>b.onclick=()=>{
    const c=selected();if(!c)return inspect('#ws-simple-status').textContent='Select an element first.';
    const [dx,dy]=b.dataset.nudge.split(',').map(Number);
    moveTo(numberStyle(c,'left')+dx,numberStyle(c,'top')+dy);
  });
  inspect('#ws-move-reset').onclick=()=>moveTo(0,0);
  ['x','y'].forEach(axis=>inspect('#ws-move-'+axis).oninput=()=>{
    const c=selected();if(!c)return;
    moveTo(axis==='x'?Number(inspect('#ws-move-x').value):numberStyle(c,'left'),axis==='y'?Number(inspect('#ws-move-y').value):numberStyle(c,'top'));
  });
  const stopGrab=()=>{moving=false;dragging=null;stage.classList.remove('ws-grab-active');inspect('#ws-grab-move').textContent='✥ Grab & move on canvas';};
  inspect('#ws-grab-move').onclick=()=>{
    if(moving){stopGrab();return;}
    if(!selected())return inspect('#ws-simple-status').textContent='Select an element first.';
    moving=true;stage.classList.add('ws-grab-active');inspect('#ws-grab-move').textContent='✓ Finish moving';
    inspect('#ws-simple-status').textContent='Drag the selected element directly. Use arrows for fine adjustments.';
  };
  const down=event=>{
    if(!editing||!moving||event.button!==0)return;
    const c=selected(),el=c?.getEl?.();if(!el||!(el===event.target||el.contains(event.target)))return;
    dragging={id:event.pointerId,x:event.clientX,y:event.clientY,startX:numberStyle(c,'left'),startY:numberStyle(c,'top')};
    event.preventDefault();event.stopImmediatePropagation();
  };
  const drag=event=>{
    if(!dragging||event.pointerId!==dragging.id)return;
    event.preventDefault();event.stopImmediatePropagation();
    moveTo(dragging.startX+event.clientX-dragging.x,dragging.startY+event.clientY-dragging.y);
  };
  const up=event=>{if(dragging&&event.pointerId===dragging.id){dragging=null;event.stopImmediatePropagation();}};
  const keyNudge=event=>{
    if(!editing||!selected()||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;
    const target=event.target;
    if(target?.closest?.('input,textarea,select,[contenteditable="true"]'))return;
    const step=event.shiftKey?10:1;
    const dx=event.key==='ArrowLeft'?-step:event.key==='ArrowRight'?step:0;
    const dy=event.key==='ArrowUp'?-step:event.key==='ArrowDown'?step:0;
    const c=selected();moveTo(numberStyle(c,'left')+dx,numberStyle(c,'top')+dy);
    event.preventDefault();
  };
  document.addEventListener('keydown',keyNudge);
  const attachCanvas=()=>{
    const doc=editorRef()?.Canvas?.getDocument?.();if(!doc||doc===moveDoc)return;
    if(moveDoc){moveDoc.removeEventListener('pointerdown',down,true);moveDoc.removeEventListener('pointermove',drag,true);moveDoc.removeEventListener('pointerup',up,true);moveDoc.removeEventListener('keydown',keyNudge,true);}
    moveDoc=doc;doc.addEventListener('pointerdown',down,true);doc.addEventListener('pointermove',drag,true);doc.addEventListener('pointerup',up,true);doc.addEventListener('keydown',keyNudge,true);
  };
  const status=message=>{$('#ws-inline-status').textContent=message;};
  const selected=()=>editorRef()?.getSelected();
  const syncSelection=()=>{
    if(!editing)return;
    const c=selected();
    const value=c?.get('content');
    $('#ws-inline-text').value=typeof value==='string'?value.replace(/<[^>]*>/g,'').trim():'';
    $('#ws-inline-text').placeholder=c?'Change the selected element’s text':'Select an element on the page';
    if(c){const radius=String(c.getStyle?.()['border-radius']||'');$('#ws-inline-shape').value=radius==='0px'?'square':radius==='999px'?'pill':'rounded';}
    const tag=String(c?.get('tagName')||'').toLowerCase();
    inspect('#ws-simple-empty').hidden=Boolean(c);
    inspect('#ws-simple-fields').hidden=!c;
    if(c){
      const content=c.get('content');
      inspect('#ws-simple-text').value=typeof content==='string'?content.replace(/<[^>]*>/g,'').trim():'';
      inspect('#ws-simple-text').disabled=!['p','h1','h2','h3','h4','span','small','a','button','summary','label'].includes(tag);
      inspect('#ws-simple-link').value=c.getAttributes()?.href||'';
      inspect('#ws-simple-link').disabled=!['a','button'].includes(tag);
      inspect('#ws-simple-image-label').hidden=tag!=='img';
      ['font','align','radius','width'].forEach(key=>inspect('#ws-simple-'+key).value='');
      ['padding','margin'].forEach(key=>inspect('#ws-simple-'+key).value='');
      inspect('#ws-simple-status').textContent='';
    }
    showCoordinates();
  };
  let advanced=false;
  const refreshInspector=()=>{stage.classList.toggle('ws-advanced-tools',advanced);inspect('#ws-advanced-toggle').textContent=advanced?'✓ Use simple editor':'⚙ Advanced tools';};
  inspect('#ws-advanced-toggle').onclick=()=>{advanced=!advanced;refreshInspector();requestAnimationFrame(()=>{editorRef()?.refresh?.();editorRef()?.Canvas?.refresh?.();});};
  inspect('#ws-simple-apply').onclick=()=>{
    const e=editorRef(),c=selected();if(!c)return;
    const tag=String(c.get('tagName')||'').toLowerCase();
    const newText=inspect('#ws-simple-text').value.trim();
    if(newText&&!inspect('#ws-simple-text').disabled)c.set('content',newText);
    const url=inspect('#ws-simple-link').value.trim();
    if(url&&!inspect('#ws-simple-link').disabled){if(/^(https?:\/\/|mailto:|tel:|#\/|#(?!\/)|\/(?!\/))/i.test(url))c.addAttributes({href:url});else inspect('#ws-simple-status').textContent='Invalid link. Use #/page or https://…';}
    const st={};
    const color=inspect('#ws-simple-ink').value,bg=inspect('#ws-simple-bg').value;
    if(inspect('#ws-simple-ink').dataset.changed==='true')st.color=color;
    if(inspect('#ws-simple-bg').dataset.changed==='true')st['background-color']=bg;
    [['font','font-size'],['align','text-align'],['radius','border-radius'],['width','width']].forEach(([id,key])=>{const value=inspect('#ws-simple-'+id).value;if(value)st[key]=value;});
    ['padding','margin'].forEach(id=>{const value=inspect('#ws-simple-'+id).value;if(value!=='')st[id]=Math.min(200,Math.max(0,Number(value)))+'px';});
    if(Object.keys(st).length)c.addStyle(st);
    inspect('#ws-simple-ink').dataset.changed='';inspect('#ws-simple-bg').dataset.changed='';
    e.refresh?.();inspect('#ws-simple-status').textContent='✓ Updated on the website.';
  };
  ['ink','bg'].forEach(key=>inspect('#ws-simple-'+key).addEventListener('input',event=>{event.target.dataset.changed='true';}));
  inspect('#ws-simple-image').onchange=event=>{
    const file=event.target.files?.[0],c=selected();if(!file||!c||c.get('tagName')?.toLowerCase()!=='img')return;
    if(!['image/jpeg','image/png','image/webp','image/gif'].includes(file.type)||file.size>3*1024*1024){inspect('#ws-simple-status').textContent='Choose a JPG, PNG, GIF or WebP under 3 MB.';return;}
    const reader=new FileReader();reader.onload=()=>{if(selected()!==c)return;c.addAttributes({src:reader.result,alt:file.name});inspect('#ws-simple-status').textContent='✓ Image updated.';};reader.readAsDataURL(file);
  };
  inspect('#ws-simple-copy').onclick=()=>{const e=editorRef(),c=selected(),p=c?.parent();if(!p)return;p.append(c.clone(),{at:p.components().indexOf(c)+1});inspect('#ws-simple-status').textContent='✓ Copied beside the original.';};
  inspect('#ws-simple-delete').onclick=()=>{const e=editorRef(),c=selected();if(!c?.parent())return;c.remove();e.select(null);syncSelection();};
  const enter=()=>{
    if(editing)return;
    const e=editorRef();if(!e){toggle.textContent='Editor unavailable — reload';return;}
    editing=true;frame.hidden=true;stage.classList.add('ws-is-designing');stage.insertBefore(canvas,inspector);panel.hidden=false;inspector.hidden=false;advanced=false;refreshInspector();
    document.dispatchEvent(new CustomEvent('websprint:editmode',{detail:{editing:true}}));
    toggle.textContent='✓ Finish editing';toggle.classList.add('active');
    // GrapesJS caches canvas offsets. Moving the editor to a new parent requires
    // a refresh after layout, otherwise drag handles target the old coordinates.
    const refreshCanvas=()=>{e.refresh?.();e.Canvas?.refresh?.();};
    requestAnimationFrame(()=>requestAnimationFrame(refreshCanvas));
    requestAnimationFrame(()=>requestAnimationFrame(attachCanvas));
    syncSelection();status('Edit mode is on. Drag elements by their selection handle, or use the Move controls beside the page.');
  };
  const exit=()=>{
    if(!editing)return;
    editing=false;stopGrab();stage.classList.remove('ws-is-designing');panel.hidden=true;inspector.hidden=true;
    document.dispatchEvent(new CustomEvent('websprint:editmode',{detail:{editing:false}}));
    if(nextSibling&&nextSibling.parentNode===home)home.insertBefore(canvas,nextSibling);else home.append(canvas);
    frame.hidden=false;frame.srcdoc=getPreview();
    toggle.textContent='✎ Edit directly on page';toggle.classList.remove('active');
    requestAnimationFrame(()=>{editorRef()?.refresh?.();editorRef()?.Canvas?.refresh?.();});
    document.querySelector('#designSaved').textContent='Unsaved changes';
  };
  toggle.onclick=()=>editing?exit():enter();
  $('#ws-finish-edit').onclick=exit;
  $('#ws-apply-design').onclick=()=>{
    const e=editorRef(),c=selected();
    if(!editing||!e||!c){status('First select a button or text element inside the page.');return;}
    const tag=String(c.get('tagName')||'').toLowerCase();
    const text=$('#ws-inline-text').value.trim();
    const shape=$('#ws-inline-shape').value,size=$('#ws-inline-size').value;
    const radius=shape==='pill'?'999px':shape==='square'?'0px':'12px';
    const dimensions={small:['9px 15px','12px'],medium:['13px 22px','15px'],large:['18px 30px','18px']}[size];
    if(text&&['a','button','p','h1','h2','h3','span','small','summary'].includes(tag))c.set('content',text);
    if(['a','button','summary'].includes(tag)){
      c.addStyle({'border-radius':radius,'padding':dimensions[0],'font-size':dimensions[1],'background-color':$('#ws-inline-colour').value});
      c.set('resizable',true);
    }else c.addStyle({'font-size':dimensions[1]});
    e.refresh?.();syncSelection();status('Changes applied. You can drag the element or select another one.');
  };
  const e=editorRef();if(e)e.on('component:selected',syncSelection);
  review.addEventListener('click',event=>{
    if(editing&&event.target.closest('.panel-actions .next,.panel-actions .back'))exit();
  },true);
  review.querySelectorAll('[data-stage-width]').forEach(button=>button.addEventListener('click',()=>{
    if(!editing)return;
    const device=button.dataset.stageWidth==='390px'?'Mobile':button.dataset.stageWidth==='768px'?'Tablet':'Desktop';
    editorRef()?.setDevice(device);editorRef()?.refresh?.();
  }));
  window.WebSprintPreviewEdit={enter,exit,isEditing:()=>editing};
})();
