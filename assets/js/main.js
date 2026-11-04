/**
 * ==============================================================================
 * MADHAVBAUG AYURVEDIC CRAMP RELIEF ROLL-ON - MAIN JAVASCRIPT
 * Features:
 * 1. Bundle State & Dynamic Pricing Management (Pack of 3 @ ₹699 Default)
 * 2. Unified Cash on Delivery (COD) Lead Modal
 * 3. 24-Hour Duplicate Prevention by Contact Number
 * 4. Google Sheets Webhook Integration
 * 5. WhatsApp Order Confirmation Direct Linking
 * 6. Sticky Floating Bottom COD Bar
 * 7. FAQ Accordion Interactions
 * 8. Live Real-Time Buyer Proof Notifications
 * ==============================================================================
 */

// Google Sheets Webhook URL
const GOOGLE_SHEETS_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbxlwbY8ZiK-nis2CAFu_VI2UwMTui3Ige95fKxCUfIQASMi-NnCXMK1QxNENDCznnsrtw/exec';

// Local Storage Key & 24hr Cooldown
const STORAGE_KEY_CONTACTS = 'madhavbaug_cramp_contacts_24h';
const COOLDOWN_24H_MS = 24 * 60 * 60 * 1000;

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================================================
  // 1. BUNDLE DEFINITIONS & DYNAMIC SELECTION
  // ==========================================================================
  const bundleOptions = [
    {
      index: 0,
      title: 'Pack of 3 (3x 10ml Roll-On Bottles)',
      subtitle: 'Complete 3-Place Kit: 1 for Home + 1 for Gym/Travel + 1 for Pocket/Bag',
      price: '₹699',
      numericPrice: 699,
      regularPrice: '₹1,299',
      savingText: 'Save ₹600 (46% OFF)',
      badge: 'Most Popular',
      badgeClass: 'gold'
    },
    {
      index: 1,
      title: 'Pack of 6 (6x 10ml Roll-On Bottles)',
      subtitle: 'Family & Frequent Cramp Sufferer Kit (₹199 per bottle)',
      price: '₹1,199',
      numericPrice: 1199,
      regularPrice: '₹2,598',
      savingText: 'Save ₹1,399 (54% OFF)',
      badge: 'Best Value',
      badgeClass: ''
    },
    {
      index: 2,
      title: 'Pack of 9 (9x 10ml Roll-On Bottles)',
      subtitle: 'Complete Long-Term Muscle Wellness Stock (₹188 per bottle)',
      price: '₹1,699',
      numericPrice: 1699,
      regularPrice: '₹3,897',
      savingText: 'Save ₹2,198 (56% OFF)',
      badge: 'Max Savings',
      badgeClass: ''
    }
  ];

  let selectedBundleIndex = 0; // Default: Pack of 3 (₹699)

  const bundleElements = document.querySelectorAll('.bundle-option');
  const stickyPackLabelEl = document.getElementById('stickyPackName');
  const stickyPriceEl = document.getElementById('stickyPrice');
  const modalSummaryPackEl = document.getElementById('modalSummaryPack');
  const modalSummaryPriceEl = document.getElementById('modalSummaryPrice');
  const inputSelectedPack = document.getElementById('modalSelectedPack');
  const inputSelectedPrice = document.getElementById('modalSelectedPrice');

  function updateBundleSelection(index) {
    selectedBundleIndex = index;
    const item = bundleOptions[index];

    // Update active class on bundle options
    bundleElements.forEach((el, idx) => {
      if (idx === index) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });

    // Update sticky bar details
    if (stickyPackLabelEl) stickyPackLabelEl.textContent = item.title;
    if (stickyPriceEl) stickyPriceEl.textContent = item.price;

    // Update modal details
    if (modalSummaryPackEl) modalSummaryPackEl.textContent = item.title;
    if (modalSummaryPriceEl) modalSummaryPriceEl.textContent = item.price;
    if (inputSelectedPack) inputSelectedPack.value = item.title;
    if (inputSelectedPrice) inputSelectedPrice.value = item.price;
  }

  // Bind bundle click events
  bundleElements.forEach((el, idx) => {
    el.addEventListener('click', () => {
      updateBundleSelection(idx);
    });
  });

  // Initialize bundle selection
  updateBundleSelection(0);

  // ==========================================================================
  // 2. MODAL CONTROLS (OPEN & CLOSE)
  // ==========================================================================
  const codModal = document.getElementById('codModal');
  const thankYouModal = document.getElementById('thankYouModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const thankYouCloseBtn = document.getElementById('thankYouCloseBtn');
  const thankYouDoneBtn = document.getElementById('thankYouDoneBtn');
  const duplicateAlertEl = document.getElementById('duplicateAlert');
  const codOrderForm = document.getElementById('codOrderForm');
  const modalSubmitBtn = document.getElementById('modalSubmitBtn');

  function openCodModal(bundleIdx = null) {
    if (bundleIdx !== null && bundleOptions[bundleIdx]) {
      updateBundleSelection(bundleIdx);
    }

    const phoneInput = document.getElementById('modalPhone');
    if (phoneInput) {
      const clean = phoneInput.value.replace(/\D/g, '').slice(-10);
      if (clean.length === 10 && isDuplicateOrder(clean)) {
        showDuplicateWarning(clean);
      } else {
        hideDuplicateWarning();
      }
    } else {
      if (duplicateAlertEl) duplicateAlertEl.style.display = 'none';
    }

    codModal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Track Meta Pixel InitiateCheckout event
    if (typeof window.fbq === 'function') {
      const activeBundle = bundleOptions[selectedBundleIndex];
      window.fbq('track', 'InitiateCheckout', {
        content_name: activeBundle.title,
        content_category: 'Cramp Relief Roll-On',
        value: activeBundle.numericPrice,
        currency: 'INR'
      });
    }
  }

  function closeAllModals() {
    if (codModal) codModal.classList.remove('active');
    if (thankYouModal) thankYouModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Bind trigger buttons for COD modal
  document.querySelectorAll('.open-cod-modal').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const specificBundle = btn.getAttribute('data-bundle');
      if (specificBundle !== null) {
        openCodModal(parseInt(specificBundle, 10));
      } else {
        openCodModal(selectedBundleIndex);
      }
    });
  });

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeAllModals);
  if (thankYouCloseBtn) thankYouCloseBtn.addEventListener('click', closeAllModals);
  if (thankYouDoneBtn) thankYouDoneBtn.addEventListener('click', closeAllModals);

  // Close modal when clicking outside of modal card
  [codModal, thankYouModal].forEach(modal => {
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeAllModals();
      });
    }
  });

  // ESC key listener
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAllModals();
  });

  // ==========================================================================
  // 3. 24-HOUR DUPLICATE PHONE CHECK & WARNING CONTROLS
  // ==========================================================================
  function isDuplicateOrder(phone) {
    const clean = String(phone).replace(/\D/g, '').slice(-10);
    if (!clean || clean.length !== 10) return false;

    try {
      // 1. Check LocalStorage
      const stored = localStorage.getItem(STORAGE_KEY_CONTACTS);
      if (stored) {
        const contacts = JSON.parse(stored);
        const entryTime = contacts[clean];
        if (entryTime && (Date.now() - entryTime < COOLDOWN_24H_MS)) {
          return true;
        }
      }
      // 2. Check SessionStorage Backup
      const sessionStored = sessionStorage.getItem(STORAGE_KEY_CONTACTS);
      if (sessionStored) {
        const sessionContacts = JSON.parse(sessionStored);
        const sEntryTime = sessionContacts[clean];
        if (sEntryTime && (Date.now() - sEntryTime < COOLDOWN_24H_MS)) {
          return true;
        }
      }
    } catch (err) {
      console.warn('Storage access check error:', err);
    }
    return false;
  }

  function getDuplicateRemainingHours(phone) {
    const clean = String(phone).replace(/\D/g, '').slice(-10);
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CONTACTS);
      const contacts = stored ? JSON.parse(stored) : {};
      const timestamp = contacts[clean];
      if (timestamp) {
        const elapsed = Date.now() - timestamp;
        if (elapsed < COOLDOWN_24H_MS) {
          return Math.ceil((COOLDOWN_24H_MS - elapsed) / (1000 * 60 * 60));
        }
      }
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
    return 24;
  }

  function markPhoneAsOrdered(phone) {
    const clean = String(phone).replace(/\D/g, '').slice(-10);
    if (!clean || clean.length !== 10) return;
    const now = Date.now();

    try {
      const stored = localStorage.getItem(STORAGE_KEY_CONTACTS);
      const contacts = stored ? JSON.parse(stored) : {};
      contacts[clean] = now;
      localStorage.setItem(STORAGE_KEY_CONTACTS, JSON.stringify(contacts));
    } catch (err) {
      console.warn('LocalStorage save error:', err);
    }

    try {
      const sStored = sessionStorage.getItem(STORAGE_KEY_CONTACTS);
      const sContacts = sStored ? JSON.parse(sStored) : {};
      sContacts[clean] = now;
      sessionStorage.setItem(STORAGE_KEY_CONTACTS, JSON.stringify(sContacts));
    } catch (err) {
      console.warn('SessionStorage save error:', err);
    }
  }

  function showDuplicateWarning(cleanPhone) {
    if (!duplicateAlertEl) return;
    const hours = getDuplicateRemainingHours(cleanPhone);
    const hoursText = hours > 0 ? `${hours} hours` : '24 hours';

    duplicateAlertEl.innerHTML = `<strong>⚠️ Duplicate Order Notice:</strong> A Cash On Delivery order with mobile number <strong>${cleanPhone}</strong> has already been placed in the last 24 hours. Please wait <strong>${hoursText}</strong> to re-order. Our wellness care team will contact you shortly to confirm dispatch.`;
    duplicateAlertEl.style.display = 'block';

    const phoneInput = document.getElementById('modalPhone');
    if (phoneInput) {
      phoneInput.style.borderColor = '#DC2626';
      phoneInput.style.backgroundColor = '#FEF2F2';
    }

    if (modalSubmitBtn) {
      modalSubmitBtn.disabled = true;
      modalSubmitBtn.innerHTML = '<span>⚠️ Already Ordered with this Number (Wait 24h)</span>';
    }
  }

  function hideDuplicateWarning() {
    if (duplicateAlertEl) {
      duplicateAlertEl.style.display = 'none';
    }
    const phoneInput = document.getElementById('modalPhone');
    if (phoneInput) {
      phoneInput.style.borderColor = '';
      phoneInput.style.backgroundColor = '';
    }
    if (modalSubmitBtn && modalSubmitBtn.disabled) {
      modalSubmitBtn.disabled = false;
      modalSubmitBtn.innerHTML = '<span>👉 Confirm Cash On Delivery Order</span>';
    }
  }

  // Real-time live check on phone input
  const modalPhoneInput = document.getElementById('modalPhone');
  if (modalPhoneInput) {
    modalPhoneInput.addEventListener('input', (e) => {
      const clean = e.target.value.replace(/\D/g, '').slice(-10);
      if (clean.length === 10) {
        if (isDuplicateOrder(clean)) {
          showDuplicateWarning(clean);
        } else {
          hideDuplicateWarning();
        }
      } else {
        hideDuplicateWarning();
      }
    });

    modalPhoneInput.addEventListener('blur', (e) => {
      const clean = e.target.value.replace(/\D/g, '').slice(-10);
      if (clean.length === 10 && isDuplicateOrder(clean)) {
        showDuplicateWarning(clean);
      }
    });
  }

  // ==========================================================================
  // 4. ORDER FORM SUBMISSION
  // ==========================================================================
  if (codOrderForm) {
    codOrderForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('modalName');
      const phoneInput = document.getElementById('modalPhone');
      const addressInput = document.getElementById('modalAddress');
      const cityInput = document.getElementById('modalCity');
      const pincodeInput = document.getElementById('modalPincode');
      const stateInput = document.getElementById('modalState');

      const name = nameInput.value.trim();
      const phone = phoneInput.value.trim();
      const address = addressInput ? addressInput.value.trim() : '';
      const city = cityInput ? cityInput.value.trim() : '';
      const pincode = pincodeInput ? pincodeInput.value.trim() : '';
      const state = stateInput ? stateInput.value.trim() : '';

      // Basic validation
      if (!name) {
        alert('Please enter your full name');
        nameInput.focus();
        return;
      }

      const phoneRegex = /^[6-9]\d{9}$/;
      const cleanPhone = phone.replace(/\D/g, '').slice(-10);
      if (!phoneRegex.test(cleanPhone)) {
        alert('Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9');
        phoneInput.focus();
        return;
      }

      // Check 24-hour duplicate: BLOCK SUBMISSION
      if (isDuplicateOrder(cleanPhone)) {
        showDuplicateWarning(cleanPhone);
        if (duplicateAlertEl) {
          duplicateAlertEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        alert(
          `⚠️ Duplicate Order Notice:\n\n` +
          `A Cash On Delivery order with mobile number (${cleanPhone}) has already been placed in the last 24 hours.\n\n` +
          `Please wait 24 hours to re-order. Our wellness care team is already processing your order and will contact you shortly!`
        );
        phoneInput.focus();
        return false;
      }

      // Disable button & show spinner
      const originalBtnText = modalSubmitBtn.innerHTML;
      modalSubmitBtn.disabled = true;
      modalSubmitBtn.innerHTML = '<span>⏳ Placing Order on COD...</span>';

      const currentItem = bundleOptions[selectedBundleIndex];
      const orderId = 'CRM-' + Math.floor(100000 + Math.random() * 900000);

      const payload = {
        orderId: orderId,
        name: name,
        phone: cleanPhone,
        address: address || 'N/A',
        city: city || 'N/A',
        pincode: pincode || 'N/A',
        state: state || 'N/A',
        package: currentItem.title,
        price: currentItem.price,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      };

      try {
        // Send to webhook (no-cors mode to avoid cross-origin blocks)
        await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (networkErr) {
        console.warn('Webhook dispatch note:', networkErr);
      }

      // Mark phone in localStorage and sessionStorage
      markPhoneAsOrdered(cleanPhone);

      // Reset button
      modalSubmitBtn.disabled = false;
      modalSubmitBtn.innerHTML = originalBtnText;

      // Close COD modal & open Thank You modal
      codModal.classList.remove('active');

      const thankYouOrderIdEl = document.getElementById('thankYouOrderId');
      if (thankYouOrderIdEl) {
        thankYouOrderIdEl.textContent = `Order ID: #${orderId}`;
      }

      // WhatsApp direct link setup
      const whatsappBtn = document.getElementById('whatsappConfirmBtn');
      if (whatsappBtn) {
        const waMsg = encodeURIComponent(
          `Hi Madhavbaug Team, I just placed a Cash On Delivery order for Cramp Relief Roll-On!\n\n` +
          `*Order ID:* #${orderId}\n` +
          `*Name:* ${name}\n` +
          `*Contact:* ${cleanPhone}\n` +
          `*Package:* ${currentItem.title}\n` +
          `*Price:* ${currentItem.price} (COD)\n\n` +
          `Please confirm my shipment dispatch at the earliest. Thank you!`
        );
        whatsappBtn.href = `https://wa.me/919321456789?text=${waMsg}`;
      }

      // Track Meta Pixel Lead event
      if (typeof window.fbq === 'function') {
        window.fbq('track', 'Lead', {
          content_name: currentItem.title,
          content_category: 'Cramp Relief Roll-On',
          value: currentItem.numericPrice,
          currency: 'INR'
        });
      }

      // Reset form
      codOrderForm.reset();

      // Show Thank You modal
      thankYouModal.classList.add('active');
    });
  }

  // ==========================================================================
  // 5. FAQ ACCORDION TOGGLE
  // ==========================================================================
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const btn = item.querySelector('.faq-question-btn');
    if (btn) {
      btn.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        // Close all
        faqItems.forEach(i => i.classList.remove('active'));
        // If not active before, open it
        if (!isActive) {
          item.classList.add('active');
        }
      });
    }
  });

  // ==========================================================================
  // 6. REAL-TIME LIVE BUYER PROOF NOTIFICATIONS TOAST
  // ==========================================================================
  const liveBuyerToast = document.getElementById('liveBuyerToast');
  const toastContent = document.getElementById('toastContent');

  const buyerPool = [
    { name: 'Priya Sharma', city: 'Delhi', pack: 'Pack of 3 (3x 10ml)', time: '2 mins ago' },
    { name: 'Rahul Mehta', city: 'Mumbai', pack: 'Pack of 3 (3x 10ml)', time: '4 mins ago' },
    { name: 'Neha Verma', city: 'Bengaluru', pack: 'Pack of 3 (3x 10ml)', time: '1 min ago' },
    { name: 'Anjali Gupta', city: 'Pune', pack: 'Pack of 6 (Family Pack)', time: '6 mins ago' },
    { name: 'Karan Singh', city: 'Jaipur', pack: 'Pack of 3 (3x 10ml)', time: '8 mins ago' },
    { name: 'Simran Joshi', city: 'Chandigarh', pack: 'Pack of 3 (3x 10ml)', time: '3 mins ago' },
    { name: 'Amit Patel', city: 'Ahmedabad', pack: 'Pack of 6 (Family Pack)', time: '5 mins ago' }
  ];

  let buyerIndex = 0;

  function showNextBuyerToast() {
    if (!liveBuyerToast || !toastContent) return;

    const buyer = buyerPool[buyerIndex % buyerPool.length];
    buyerIndex++;

    toastContent.innerHTML = `<strong>${buyer.name}</strong> (${buyer.city}) just ordered <strong>${buyer.pack}</strong> on COD &bull; ${buyer.time}`;
    liveBuyerToast.classList.add('show');

    setTimeout(() => {
      liveBuyerToast.classList.remove('show');
    }, 4500);
  }

  // Trigger first popup after 5 seconds, then every 16 seconds
  setTimeout(() => {
    showNextBuyerToast();
    setInterval(showNextBuyerToast, 16000);
  }, 5000);

});
