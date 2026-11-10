const express = require('express');
const PDFDocument = require('pdfkit');
const compression = require('compression');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const port = Number(process.env.PORT || 3000);
app.disable('x-powered-by');
app.use(compression());
app.use(express.json({ limit: '3mb' }));
app.use('/vendor/grapesjs', express.static(path.join(__dirname, 'node_modules', 'grapesjs', 'dist'), { maxAge: '30d', immutable: true }));
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '5m', etag: true }));

const clean = (value, max = 2000) => String(value ?? '').trim().slice(0, max);
const escapeHtml = (value) => clean(value).replace(/[&<>"']/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));
const sendEmail = async (payload) => {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.message || 'Email provider could not deliver the message.');
  return result;
};

function createRequirementsPdf(fields, customerName, projectName) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margins: { top: 54, bottom: 54, left: 54, right: 54 }, info: { Title: 'WebSprint Project Requirements Report', Author: 'WebSprint' }, bufferPages: true });
      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
      const green = '#526c2e';
      doc.rect(0, 0, doc.page.width, 150).fill('#17251d');
      doc.fillColor('#d8e7c1').font('Helvetica-Bold').fontSize(12).text('WEBSPRINT', 54, 45, { characterSpacing: 2 });
      doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(23).text('Project Requirements Report', 54, 73, { width: 480 });
      doc.fillColor('#dce5d8').font('Helvetica').fontSize(10).text('A clear summary of your website idea and project needs', 54, 111);
      doc.moveDown(4);
      doc.fillColor('#17251d').font('Helvetica-Bold').fontSize(12).text(projectName || 'Website project');
      doc.fillColor('#5f6b61').font('Helvetica').fontSize(9).text(`Prepared for ${customerName}  •  ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}`);
      doc.moveDown(1.4);
      const sections = [
        ['Client & contact', ['Customer name', 'Customer email', 'Phone number', 'Preferred contact method', 'Preferred contact time']],
        ['Project overview', ['Project / brand name', 'Website type', 'Project description', 'Target audience', 'Requested timeline']],
        ['Website structure & design', ['Pages requested', 'Selected website features', 'Visual theme', 'Theme / colour notes', 'Competitor / inspiration websites', 'Reference website']],
        ['Backend & functionality', ['Backend requirements', 'Other backend requirements', 'Data to store/manage', 'User roles', 'Developer recommendations']],
        ['Delivery details', ['Domain status', 'Content / images status', 'Additional requirements']]
      ];
      for (const [heading, keys] of sections) {
        if (doc.y > 690) doc.addPage();
        doc.fillColor(green).font('Helvetica-Bold').fontSize(12).text(heading.toUpperCase(), { characterSpacing: 0.7 });
        doc.moveDown(0.45);
        for (const key of keys) {
          if (doc.y > 700) doc.addPage();
          const value = fields[key] || 'Not specified';
          doc.fillColor('#263329').font('Helvetica-Bold').fontSize(9).text(key, { continued: false });
          doc.fillColor('#46534a').font('Helvetica').fontSize(9).text(String(value), { width: 480, lineGap: 2 });
          doc.moveDown(0.45);
        }
        doc.moveDown(0.6);
      }
      doc.moveDown(0.4);
      doc.fillColor('#6b756d').font('Helvetica').fontSize(8).text('This report reflects the information provided in the submission. Unspecified items should be discussed with your WebSprint developer. A frontend preview is supplied separately where applicable.', { width: 480, lineGap: 2 });
      const range = doc.bufferedPageRange();
      for (let i = range.start; i < range.start + range.count; i++) {
        doc.switchToPage(i);
        doc.moveTo(54, 780).lineTo(541, 780).strokeColor('#e2e8e2').stroke();
        doc.fillColor('#879087').font('Helvetica').fontSize(8).text('WEBSPRINT  •  PROJECT REQUIREMENTS', 54, 790, { lineBreak: false });
        doc.text(`Page ${i + 1} of ${range.count}`, 470, 790, { width: 70, align: 'right', lineBreak: false });
      }
      doc.end();
    } catch (error) { reject(error); }
  });
}

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));


app.post('/api/ai-assist', async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) return res.status(503).json({ error: 'Generative AI is not configured. Add OPENAI_API_KEY to enable it.' });
    const body = req.body || {};
    const task = clean(body.task, 30);
    const prompt = clean(body.prompt, 1200);
    const context = {
      websiteType: clean(body.websiteType, 100), theme: clean(body.theme, 100),
      projectName: clean(body.projectName, 120), description: clean(body.description, 1200),
      features: Array.isArray(body.features) ? body.features.slice(0, 30).map(v => clean(v, 100)) : [],
      currentDesign: clean(body.designHtml, 12000)
    };
    const aiResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4.1-mini', store: false, max_output_tokens: task === 'style' ? 1800 : 650,
        input: [
          { role: 'system', content: task === 'style' ? 'You are a senior frontend art director. Return ONLY plain CSS, no markdown or explanation. Style the supplied existing HTML in a refined responsive manner. Do not use @import, url(), external resources, fixed positioning, CSS expressions or animations. Do not hide content. Target existing elements and their selectors; avoid changing editor UI. Use media queries for mobile.' : 'You are WebSprint Design Advisor. Give practical, concise website design advice for a non-technical customer. Never claim to have changed the website or connected a backend. Do not output code. Keep recommendations specific to the supplied brief and current prototype.' },
          { role: 'user', content: `Task: ${task}
Customer instruction: ${prompt}
Website context: ${JSON.stringify(context)}
${task === 'style' ? 'Produce CSS that ACTUALLY applies the requested visual change to the supplied HTML, with premium spacing, typography, buttons and responsive styling. Return only CSS.' : 'For review, provide 4-6 actionable design recommendations. For beautify, give a short ordered visual improvement plan. For prompt, explain how to implement the requested visual direction in the editor. Mention responsive/mobile considerations.'}` }
        ]
      })
    });
    const result = await aiResponse.json().catch(() => ({}));
    if (!aiResponse.ok) return res.status(502).json({ error: result.error?.message || 'AI assistant request failed.' });
    const textOutput = (result.output || []).flatMap(item => item.content || []).filter(part => part.type === 'output_text').map(part => part.text).join('\n').trim();
    return res.json({ text: textOutput || result.output_text || 'The AI assistant did not return a suggestion this time.' });
  } catch (error) {
    console.error('AI assistant error:', error);
    return res.status(500).json({ error: 'Could not reach the AI assistant.' });
  }
});

app.post('/api/submit', async (req, res) => {
  try {
    const body = req.body || {};
    if (clean(body.website, 200)) return res.json({ ok: true }); // honeypot
    const name = clean(body.name, 120), email = clean(body.email, 254), phone = clean(body.phone, 60);
    const contactMethod = clean(body.contactMethod, 60), contactTime = clean(body.contactTime, 120);
    const websiteType = clean(body.websiteType, 100), theme = clean(body.theme, 100);
    const features = Array.isArray(body.features) ? body.features.map(v => clean(v, 100)).filter(Boolean).slice(0, 60) : [];
    const backendNeeds = Array.isArray(body.backendNeeds) ? body.backendNeeds.map(v => clean(v, 160)).filter(Boolean).slice(0, 30) : [];
    const backendRecommendations = Array.isArray(body.backendRecommendations) ? body.backendRecommendations.map(v => clean(v, 500)).filter(Boolean).slice(0, 20) : [];
    const fields = {
      'Customer name': name, 'Customer email': email, 'Phone number': phone || 'Not provided',
      'Preferred contact method': contactMethod || 'Not specified', 'Preferred contact time': contactTime || 'Not specified',
      'Website type': websiteType, 'Selected website features': features.join(', ') || 'None selected',
      'Visual theme': theme, 'Theme / colour notes': clean(body.themeNotes, 1500) || 'None',
      'Project / brand name': clean(body.projectName, 160) || 'Not specified', 'Target audience': clean(body.audience, 500) || 'Not specified',
      'Requested timeline': clean(body.timeline, 160) || 'Not specified', 'Pages requested': clean(body.pagesNeeded, 1500) || 'Not specified', 'Domain status': clean(body.domainStatus, 120) || 'Not specified', 'Content / images status': clean(body.contentStatus, 160) || 'Not specified', 'Competitor / inspiration websites': clean(body.competitors, 1500) || 'None', 'Reference website': clean(body.reference, 1000) || 'None',
      'Project description': clean(body.description, 5000) || 'Not provided', 'Additional requirements': clean(body.extra, 3000) || 'None',
      'Backend requirements': backendNeeds.join('; ') || 'Not specified', 'Other backend requirements': clean(body.backendOther, 3000) || 'None',
      'Data to store/manage': clean(body.dataNeeds, 2000) || 'Not specified', 'User roles': clean(body.userRoles, 500) || 'Not specified',
      'Developer recommendations': backendRecommendations.join('\n• ') || 'Discuss during discovery'
    };
    if (!name || !email || !websiteType || !theme || body.consent !== true) return res.status(400).json({ error: 'Please provide your name, a valid email address, website type, theme and contact consent.' });
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Please enter a valid email address.' });
    if (!process.env.RESEND_API_KEY || !process.env.TO_EMAIL || !process.env.FROM_EMAIL) return res.status(503).json({ error: 'Email service is not configured yet. Add the Resend settings in your deployment environment.' });

    const previewHtml = clean(body.previewHtml, 500000);
    if (!previewHtml || !previewHtml.includes('<body')) return res.status(400).json({ error: 'Please create a website preview before submitting.' });
    const safeFileName = (clean(body.projectName || websiteType, 50).replace(/[^a-z0-9-_]/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'website-preview').toLowerCase();
    const htmlRows = Object.entries(fields).map(([label, value]) => `<tr><th style="text-align:left;padding:10px;border-bottom:1px solid #e5e7eb;vertical-align:top;width:210px">${escapeHtml(label)}</th><td style="padding:10px;border-bottom:1px solid #e5e7eb;white-space:pre-wrap">${escapeHtml(value)}</td></tr>`).join('');
    const textBody = Object.entries(fields).map(([label, value]) => `${label}:\n${value}`).join('\n\n');
    const recommendationsHtml = `<ul>${backendRecommendations.map(x => `<li>${escapeHtml(x)}</li>`).join('')}</ul>`;
    const previewAttachment = Buffer.from(previewHtml, 'utf8').toString('base64');
    const requirementsPdf = await createRequirementsPdf(fields, name, clean(body.projectName || websiteType, 120));
    const pdfAttachment = { filename: `${safeFileName}-project-requirements.pdf`, content: requirementsPdf.toString('base64') };

    // Send the developer the complete brief and the customer's actual frontend prototype as an HTML attachment.
    const ownerResult = await sendEmail({
      from: process.env.FROM_EMAIL, to: [process.env.TO_EMAIL], ...(email ? { reply_to: email } : {}),
      subject: `New WebSprint project — ${clean(body.projectName || websiteType, 120)}`,
      text: `NEW WEBSPRINT PROJECT\n\n${textBody}\n\nThe final frontend preview is attached as ${safeFileName}-preview.html.`,
      html: `<div style="font-family:Arial,sans-serif;max-width:820px;margin:auto;color:#182018"><h1>New WebSprint project request</h1><p>The customer submitted a website prototype and development brief. Reply directly to this email to contact ${escapeHtml(name)}.</p><h2>Project & customer details</h2><table style="width:100%;border-collapse:collapse">${htmlRows}</table><h2>Backend recommendations</h2>${recommendationsHtml}<p><b>Frontend preview attached:</b> ${escapeHtml(safeFileName)}-preview.html. Download and open it in a browser to view the customer's prototype.</p></div>`,
      attachments: [{ filename: `${safeFileName}-preview.html`, content: previewAttachment }, pdfAttachment]
    });

    let confirmationEmailSent = false;
    if (email) try {
      await sendEmail({
        from: process.env.FROM_EMAIL, to: [email], reply_to: process.env.TO_EMAIL,
        subject: `We received your ${clean(body.projectName || 'website', 100)} project brief — WebSprint`,
        attachments: [pdfAttachment],
        text: `Hi ${name},\n\nThank you for submitting your website idea to WebSprint. Your project brief and frontend preview have been received. Your website project is now in our planning queue while your developer reviews the requirements.\n\nYour developer will contact you using your preferred method (${contactMethod || 'email'}) to discuss the design, backend requirements, timeline and next steps. Kindly reply to this email or have a conversation with your developer before development is finalised.\n\nThank you,\nWebSprint`,
        html: `<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#172018;line-height:1.7"><h1 style="color:#526c2e">Thanks for choosing WebSprint, ${escapeHtml(name)}!</h1><p>We have successfully received your website brief and frontend preview.</p><p><b>Your website project is now in our planning queue.</b> Your developer will review your design, requested features, backend requirements and timeline, then contact you using your preferred method: <b>${escapeHtml(contactMethod || 'Email')}</b>.</p><p><b>Kindly have a conversation with your developer</b> to confirm the details and next steps before development is finalised.</p><p>You can simply reply to this email to reach the WebSprint team.</p><p>Thank you,<br><b>Team WebSprint</b></p></div>`
      });
      confirmationEmailSent = true;
    } catch (error) { console.error('Customer confirmation email failed:', error.message); }

    return res.json({ ok: true, id: ownerResult.id, confirmationEmailSent });
  } catch (error) {
    console.error('Submission error:', error);
    return res.status(502).json({ error: error.message || 'Something went wrong while sending your project.' });
  }
});

if (require.main === module) app.listen(port, () => console.log(`WebSprint is running at http://localhost:${port}`));
module.exports = app;
