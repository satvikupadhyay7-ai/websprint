(() => {
  const fullBuild = location.pathname.startsWith('/done-for-you');
  const mode = fullBuild ? 'done-for-you' : 'frontend';
  const text = (id, value) => document.getElementById(id).textContent = value;
  if (fullBuild) {
    text('modeLabel', 'START A PROJECT / PATH 02');
    document.getElementById('modeTitle').innerHTML = 'Your idea.<br><em>Our complete build.</em>';
    text('modeDescription', 'Just describe what you imagine. We’ll review the design direction, pages, features and backend needs, then plan the entire build with you.');
    document.getElementById('frontendUploadSection').hidden = true;
    text('needsKicker', '02 / FEATURES & SPECIFICATIONS');
    text('needsTitle', 'Tell us what your website needs.');
  }
  const form = document.getElementById('requestForm');
  const notice = document.getElementById('requestNotice');
  const button = document.getElementById('sendRequest');
  const show = (message, kind) => { notice.textContent = message; notice.className = `form-notice show ${kind}`; notice.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); };
  const fileToBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1]);
    reader.onerror = () => reject(new Error('Could not read the uploaded file.'));
    reader.readAsDataURL(file);
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const values = new FormData(form);
    const file = document.getElementById('frontendFile').files[0];
    if (!fullBuild && !file && !String(values.get('frontendLink') || '').trim()) return show('Please upload your frontend or share a link to it.', 'error');
    if (file && file.size > 3_500_000) return show('The file is too large. Upload up to 3.5 MB or share a link.', 'error');
    button.disabled = true;
    button.textContent = 'Sending your brief…';
    notice.className = 'form-notice';
    try {
      const payload = Object.fromEntries(values.entries());
      delete payload.frontendFile;
      payload.mode = mode;
      payload.consent = values.get('consent') === 'on';
      payload.features = [...form.querySelectorAll('#featureList input:checked')].map(input => input.value);
      if (file) payload.file = { name: file.name, content: await fileToBase64(file) };
      const response = await fetch('/api/request', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Could not submit your request. Please try again.');
      show(result.confirmationEmailSent ? '✓ Your project request was submitted! Check your inbox for the WebSprint confirmation and attached brief PDF.' : '✓ Your request reached the WebSprint team, but the confirmation email could not be delivered. Please contact us if you need a copy.', result.confirmationEmailSent ? 'ok' : 'warn');
      form.reset();
      button.textContent = 'Request sent ✓';
    } catch (error) {
      show(error.message, 'error');
      button.disabled = false;
      button.textContent = 'Send project request ↗';
    }
  });
})();
