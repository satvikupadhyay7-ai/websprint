/* Quick additions directly from the review step, without leaving the preview. */
(() => {
  const review=document.querySelector('.panel[data-panel="3"]');
  if(!review)return;
  const stageTop=review.querySelector('.ws-stage-top');
  const bar=document.createElement('div');bar.className='ws-preview-quickedit';
  bar.innerHTML=`<div class="ws-quickedit-heading"><div><strong><span>✦</span> Quick edits</strong><p>Add something to your website while you're reviewing it.</p></div><button type="button" id="ws-layout-edit">↗ Move or rearrange elements</button></div><div class="ws-quickedit-controls"><input id="ws-preview-text" aria-label="Text to add" placeholder="Write a message, headline or footer note..."><select id="ws-preview-placement" aria-label="Where to place component"><option value="top">Top of page</option><option value="end" selected>Bottom of homepage</option><option value="footer">Footer (all pages)</option></select><button type="button" id="ws-preview-add-text">＋ Add text</button><button type="button" id="ws-preview-add-button">＋ Button</button><button type="button" id="ws-preview-add-dropdown">＋ Dropdown</button></div><p class="ws-quickedit-feedback" id="ws-quickedit-feedback" role="status" aria-live="polite">Changes appear in the preview instantly. For exact drag positioning, choose “Move or rearrange elements”.</p>`;
  review.insertBefore(bar,stageTop);
  const $=s=>bar.querySelector(s);
  const feedback=message=>{$('#ws-quickedit-feedback').textContent=message;};
  const refresh=()=>{const frame=review.querySelector('.ws-stage iframe');if(frame)frame.srcdoc=getPreview();};
  const run=(action,success)=>{
    const api=window.WebSprintArrange;
    if(!api){feedback('The editor is still loading. Try again in a moment.');return;}
    action(api);refresh();feedback(success+' The preview has been refreshed.');
  };
  $('#ws-preview-add-text').onclick=()=>{
    const input=$('#ws-preview-text'),text=input.value.trim();
    if(!text){feedback('Type your text first.');input.focus();return;}
    const placement=$('#ws-preview-placement').value;
    run(api=>api.addText(text,placement),'Text added');input.value='';
  };
  $('#ws-preview-add-button').onclick=()=>run(api=>api.addButton($('#ws-preview-placement').value),'Button added');
  $('#ws-preview-add-dropdown').onclick=()=>run(api=>api.addDropdown($('#ws-preview-placement').value),'Dropdown added');
  $('#ws-layout-edit').onclick=()=>{
    window.WebSprintArrange?.openEditor();
    feedback('Select a component in the canvas, then use Move Up, Move Down or Move to Section.');
  };
  $('#ws-preview-text').addEventListener('keydown',e=>{if(e.key==='Enter'){$('#ws-preview-add-text').click();}});
})();
