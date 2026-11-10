# WebSprint — visual prototype studio

WebSprint lets prospective customers build a frontend prototype, describe what they need the backend to do, and submit a complete project brief.

## New visual configurator flow

### Premium and performance improvements (v6)

- Refined public-facing WebSprint UI, responsive controls and studio styling.
- Additional typography, navigation, product-card, cart and checkout polish applied to the interactive preview and exported HTML.
- GrapesJS JavaScript **and CSS** served from local npm dependencies rather than a required external editor CDN.
- Gzip compression, browser caching for immutable GrapesJS assets, and short revalidation windows for frequently edited application assets.
- Styling uses CSS gradients, borders and shadows rather than large background images. Google Fonts remain optional network resources with system-font fallbacks.

Actual perceived speed still depends on the host, device, internet connection and number of selected editor components. Test on a deployed URL and real mobile devices before describing performance as production-ready.

### Preview isolation fix (v7)

The preview is generated exclusively from the editable customer design. A validation guard detects accidental WebSprint builder-page markup in restored browser drafts and rebuilds the selected template. If recovery fails, preview shows a clear error instead of displaying or emailing the WebSprint application itself. Submission is blocked until a valid preview is available. Previously saved genuine customer designs are retained.

### Homepage and customer-driven final preview (v8)

- Homepage messaging now speaks directly to beginners: build a website without coding, choose features, and view a live preview before submitting. The homepage browser illustration is explicitly marked as an example, not the customer's own preview.
- The customer's exact entered project/brand name replaces template branding and the hero title in the final preview; the description and audience are also copied into public-facing prototype text.
- Requested page names in Project Details create additional navigable prototype views when not already present. Empty input fields retain the starter-template copy.
- Private discovery fields (developer notes, contact preferences, backend requirements and competitor references) remain in the project brief, not on the public-facing prototype.
- Premium preview styling is shared with the editable canvas stylesheet so the final preview no longer adds a second independent spacing system. Separate-page layouts can still differ from the single editor canvas because the preview shows the intended routed experience.

### Pre-final preview sizing and spacing (v9)

- Step 4 now becomes a wide, dedicated review stage instead of squeezing the desktop website into the configurator's narrow content column.
- The generated HTML itself includes the preview typography, product-grid, section spacing, buttons and responsive layout styles. This makes the pre-final iframe, fullscreen preview, and exported `.html` consistent even when editor CSS serialization varies.
- Review the design using the Desktop, Tablet and Mobile controls. The frontend editor remains editable, and template details still come from the customer's supplied brief.

### No-code component arrangement (v10)

- Click a component in the GrapesJS canvas to select it. The new **Arrange your website** toolbar shows the selection, with Move Up, Move Down, Duplicate and Delete controls.
- **Move to section** can relocate a button or another selected component into a different website section, including moving it from a top navigation area toward the bottom of the page. Built-in canvas drag/drop remains available for finer positioning.
- **Add Button** and **Add Dropdown** insert editable components beside the selection, or into a starter section when nothing is selected. Dropdowns use native HTML `details` and `summary` so they also work in the exported frontend demo without extra libraries.
- Structural moves affect the editor's actual component tree and are included in both Live Preview and the exported HTML.

### Custom text anywhere (v11)

- Type exact text in the **Add your own text** composer above the editor.
- Choose Paragraph, Heading or Small caption and place it below the selected component, at the top, at the bottom of the homepage, or in the shared footer (visible across preview routes).
- The added text is editable and movable inside the canvas; the text appears in the final preview and exported HTML. User-entered content is escaped before insertion so markup is displayed as text, not executed.

### In-preview quick edits (v12)

- Step 4 Live Preview now has a **Quick edits** bar: type a message or add a button/dropdown without first scrolling back to the editor.
- Choose whether additions appear at the top, the end of the homepage, or the shared footer. Changes are applied to the editable component tree and the iframe refreshes immediately.
- **Move or rearrange elements** takes the customer straight back to the canvas for accurate selection, dragging and section movement. The page still has Desktop, Tablet and Mobile review controls.

### Direct visual editing in Step 4 (v13)

- Choose **Edit directly on page** in the pre-final Live Preview to bring the actual GrapesJS canvas into that stage, rather than editing a second, disconnected preview.
- Select an element and drag it using the editor; use the built-in style panel for freeform sizing and spacing. The new compact controls provide selected text, button shape (pill/rounded/square), size and colour.
- **Done editing** returns the editor to its original studio location and rebuilds the working multi-page preview from the same component tree.
- Edits remain part of the eventual exported HTML. Direct Edit Mode shows the editable one-canvas composition; regular Preview shows the routed visitor experience.

### Template and feature library beside the canvas (v14)

- In Step 4 → **Edit directly on page**, customers now see a visual design library beside the canvas.
- The library includes a live template selector, searchable website-specific features, and one-click Heading, Text, Button, Dropdown, Form, Card, Image and Section blocks.
- Added blocks enter the same GrapesJS component tree and can then be selected, dragged, resized and styled. The in-preview design controls include button text, colour, shape and size.
- Manual feature insertions are tracked separately from generated feature groups so they are not removed by later configuration changes. Changing the entire template asks for confirmation because it replaces the current design.
- Exit Edit Mode to preview the routed visitor experience; exported HTML includes the changes.

1. **Website type:** selecting E-commerce, EdTech, SaaS, Social Network, Portfolio, or Business Website loads a distinctive editable starter website immediately. Selected features are grouped into logical, contextual experiences rather than scattered unrelated cards. E-commerce has a product collection with adjacent cart, order summary, and (when requested) checkout form. Other types show connected learning, dashboard, feed, portfolio or service experiences.
2. **Look & feel:** choosing a theme updates the preview palette immediately.
3. **Project details:** explain the brand, content, and backend requirements.
4. **Live preview:** inspect the frontend within the wizard in desktop, tablet or mobile format, navigate among page-like routes (Home, About, catalogue, cart, checkout, contact and relevant feature areas), interact with demo controls, or jump back to the editor.
5. **Contact:** submit the full editable design preview and project brief.

Feature interactions (cart, wishlist, likes, search, form confirmations, etc.) are client-side demonstrations only. They do not charge payments, create accounts, store customer data or provide a production backend. The final HTML attachment includes demo interactions so the developer can inspect them.

In the store prototype, add products to see cart quantities and subtotals update. If coupons are selected, `WELCOME10` demonstrates a 10% discount. If checkout/payments are selected, the adjacent checkout form validates demo delivery fields but never sends or saves them. Product search filters the sample collection.

### Preview navigation and export

The preview now transforms the one-canvas design into separate navigable views using hash routes, such as `#/shop`, `#/cart`, and `#/checkout`. Its HTML export is **one self-contained file** with page-like routing, not a deployed set of individual HTML pages. Browser back/forward works and the cart state remains intact while navigating within a preview session. In E-commerce, the checkout form appears only on its dedicated Checkout route when the corresponding feature is selected. No real payments, login, databases or orders are created.

## What is included

- Drag-and-drop visual editor powered by GrapesJS (loaded from its public CDN).
- Navigation, dropdown menus, headings, text boxes, buttons, images, forms, select fields, cards, columns, accordions, testimonials, pricing cards, video placeholders, dividers and footers.
- Editable text and styling through the editor's built-in panels, plus desktop/tablet/mobile canvas modes.
- Preview opens a responsive desktop/tablet/mobile preview inside the page (no popup permissions required). Download HTML exports the prototype. Save design stores an editable GrapesJS draft in the same browser, automatically restored on return.
- Beautify immediately applies substantial design-system improvements (typography, section spacing, cards, buttons and responsiveness) even without an AI key. With `OPENAI_API_KEY`, AI can additionally generate and apply CSS from the prompt. AI-generated styling should be reviewed before submitting.
- Project intake covers website type, selected features, pages, audience, timeline, domain/hosting status, content/assets, reference sites and additional notes.
- Backend requirements cover authentication, roles, database, admin, payments, email notifications, uploads, APIs, booking, chat, analytics, custom data and user roles. Recommendations are planning guidance, not pre-built integrations.
- On submission, the developer receives the complete project brief, a professionally formatted PDF requirements report and the frontend preview as an attached `.html` file.
- The customer receives an email confirmation with the same PDF requirements report attached.
- Vercel routing is retained through the included `vercel.json` and `api/index.js` serverless entry point.

## Requirements

- Node.js 18+ (Node 20+ recommended)
- A Resend account and API key for email delivery
- Optional OpenAI API key for generative design suggestions

## Run locally (Windows PowerShell)

Open PowerShell in the folder containing `package.json` and run:

```powershell
npm install
Copy-Item .env.example .env
notepad .env
npm run dev
```

Fill in `.env`:

```env
RESEND_API_KEY=re_your_new_key
FROM_EMAIL="WebSprint <onboarding@resend.dev>"
TO_EMAIL=satvikupadhyay7@gmail.com
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
PORT=3000
```

Run `npm run check:config` to verify the presence and format of your settings **without printing your API keys**.

Use newly generated Resend and OpenAI keys if the old ones were posted in a chat or anywhere public. Do not commit `.env` or paste secrets into chat or GitHub. The `onboarding@resend.dev` sender is suitable for Resend's limited test sending to the account's authorised test recipient only; it generally cannot deliver confirmations to arbitrary customer addresses. For real customer delivery, verify your own domain in Resend and use a sender address on that verified domain, e.g. `WebSprint <hello@your-verified-domain.com>`. Your `TO_EMAIL` can remain the developer's address.

On Windows PowerShell, use `Copy-Item .env.example .env`, then `notepad .env` and paste **fresh keys only into that local file**. After saving, run `npm run check:config` and restart `npm start`. Never put credentials in frontend JavaScript or a downloadable ZIP.

Open `http://localhost:3000`.

## Deploy to Vercel

1. Push this folder's contents to your GitHub repository.
2. Import the repository into Vercel. The included `vercel.json` routes requests to the Express serverless entry point in `api/index.js`.
3. In Vercel → Project → Settings → Environment Variables, add `RESEND_API_KEY`, `FROM_EMAIL`, and `TO_EMAIL` for Production (and Preview if needed).
4. Add `OPENAI_API_KEY` if you want generative AI suggestions. `OPENAI_MODEL` is optional.
5. Redeploy after changing environment variables.

## Important product notes

- The submitted preview is a self-contained HTML file with the editor's current HTML and CSS. Open it in a browser to inspect the prototype. It is a frontend prototype, not a production website with working database, login, payments or APIs.
- The PDF is generated from the submitted project details. Fields the customer leaves blank are marked as not specified; the report does not invent requirements.
- Form components placed on the visual canvas are visual mockups only. Their actual backend behavior must be designed and implemented separately.
- The design editor is browser-based. The Save design button saves a draft to the same browser's local storage; server-side accounts, cloud project saving, multi-page project management, image uploads and collaborative editing are future development stages.
- The editor library and Google Fonts are loaded from public CDNs, so the editor needs an internet connection.
- GrapesJS is now bundled as an npm dependency and served locally. Google Fonts still use the internet; system fonts provide a fallback.
- Review every AI suggestion and backend recommendation with the developer before implementation.
#   w e b s p r i n t  
 