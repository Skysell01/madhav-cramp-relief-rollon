# Madhavbaug Ayurvedic Cramp Relief Roll-On Landing Page

A high-converting, mobile-responsive landing page designed for **Madhavbaug Ayurvedic Cramp Relief Roll-On** (Herbal Muscle Therapy).

---

## 🌟 Key Features

1. **Pack of 3 Special Launch Offer**:
   - Primary default offer: **Pack of 3 (3x 10ml Roll-On Bottles) @ ₹699** (MRP ₹1,299 | Save ₹600 - 46% OFF).
   - Upgradable bundles: Pack of 6 @ ₹1,199 and Pack of 9 @ ₹1,699.
2. **Dedicated Visual Asset Flow**:
   - **Hero Product Image**: Pack of 3 Ayurvedic Cramp Relief Roll-On bottles (`assets/images/cramp_hero.jpg`).
   - **Banner Below Hero (Benefits Banner)**: Visualizing fast 5-minute cooling relief, muscle spasm relaxation, and herbal actives (`assets/images/cramp_benefits_banner.jpg`).
   - **Ingredients Banner**: Infographic banner highlighting the 5 natural active herbs: Pudina Satva (Menthol), Nilgiri Tel (Eucalyptus Oil), Gandhapura (Wintergreen Oil), Sonth (Ginger Extract), and Kapoor (Camphor) (`assets/images/cramp_ingredients_banner.jpg`).
   - **WhatsApp Reviews Section Banner**: Authentic customer WhatsApp chat testimonials praising instant relief from leg cramps, gym calf cramps, period abdominal cramps, and travel stiffness (`assets/images/cramp_whatsapp_reviews.jpg`).
   - **Official Madhavbaug Logo**: Embedded across Navbar and Footer (`assets/images/madhavbaug_logo.png`).
3. **100% Cash On Delivery (COD) Focus**:
   - Zero advance payment messaging across top announcement bar, hero section, sticky floating bar, and order modals.
   - 24-hour duplicate phone number protection against spam or accidental multiple orders.
   - Google Sheets Webhook integration (`google_apps_script.js`).
   - Instant WhatsApp Order Confirmation direct link with pre-filled message upon checkout.
4. **Live Social Proof**:
   - Rotating real-time buyer toast notifications from major Indian cities.
5. **Interactive Elements**:
   - Dynamic bundle selector synced with floating bottom sticky bar and modal form.
   - Smooth accordion FAQs.
   - Comprehensive comparison between conventional chemical painkiller tablets/greasy balms vs. topical non-greasy Ayurvedic roll-on.

---

## 🚀 Running the Project

### Development Server:
```bash
npm run dev
```
Runs Vite dev server.

### Production Build:
```bash
npm run build
```
Creates an optimized production bundle in the `dist/` directory.

---

## 📊 Google Sheets Webhook Integration
To capture COD orders in your Google Sheet:
1. Open Google Sheets and create a sheet named `Madhavbaug Cramp Relief Roll-On Leads`.
2. Follow the setup instructions in `google_apps_script.js`.
