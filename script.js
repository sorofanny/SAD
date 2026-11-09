// ============================================================
//  SAD DE LAURE — Script Principal
// ============================================================

let cart = [];

// ── Ajout au panier ──────────────────────────────────────────
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.add-to-cart');
  if (!btn) return;

  const id    = btn.dataset.id;
  const name  = btn.dataset.name;
  const price = parseInt(btn.dataset.price, 10);
  const qtyInput = document.getElementById(`qty-${id}`);
  const qty = Math.max(1, parseInt(qtyInput?.value, 10) || 1);

  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ id, name, price, qty });
  }

  // Feedback visuel
  const original = btn.textContent;
  btn.textContent = '✓ Ajouté';
  btn.style.background = '#2ecc71';
  setTimeout(() => {
    btn.textContent = original;
    btn.style.background = '';
  }, 1400);

  // Badge animé
  const badge = document.getElementById('cart-count');
  if (badge) {
    badge.style.transform = 'scale(1.4)';
    setTimeout(() => badge.style.transform = '', 280);
  }

  showToast(`${name} ajouté au panier`);
  updateUI();
});

// ── Suppression ──────────────────────────────────────────────
function removeItem(idx) {
  const name = cart[idx]?.name;
  cart.splice(idx, 1);
  updateUI();
  if (name) showToast(`${name} retiré du panier`);
}

// ── Mise à jour UI ───────────────────────────────────────────
function updateUI() {
  const list      = document.getElementById('cart-list');
  const area      = document.getElementById('order-form-area');
  const totalSpan = document.getElementById('total-price');
  const count     = document.getElementById('cart-count');

  const totalQty = cart.reduce((s, i) => s + i.qty, 0);
  if (count) count.textContent = totalQty;

  if (cart.length === 0) {
    list.innerHTML = `
      <div class="empty-cart">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
        <p>Votre panier est vide</p>
        <a href="#boutique" class="btn-ghost-sm">Parcourir la boutique</a>
      </div>`;
    if (area) area.style.display = 'none';
    return;
  }

  if (area) area.style.display = 'block';

  let total = 0;
  list.innerHTML = cart.map((item, idx) => {
    total += item.price * item.qty;
    return `
      <div class="cart-item">
        <div>
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-qty">Quantité : ${item.qty}</div>
        </div>
        <div class="cart-item-right">
          <span class="cart-item-price">${(item.price * item.qty).toLocaleString('fr-FR')} FCFA</span>
          <button class="remove-btn" onclick="removeItem(${idx})" aria-label="Supprimer">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
          </button>
        </div>
      </div>`;
  }).join('');

  if (totalSpan) totalSpan.textContent = total.toLocaleString('fr-FR');
}

// ── Filtres ──────────────────────────────────────────────────
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const cat = btn.dataset.filter;
    document.querySelectorAll('.product-card').forEach(card => {
      const show = cat === 'tous' || card.dataset.category === cat;
      card.style.display = show ? '' : 'none';
    });
  });
});

// ── Commande WhatsApp ────────────────────────────────────────
document.getElementById('whatsapp-btn')?.addEventListener('click', () => {
  const name = document.getElementById('cust-name')?.value.trim();
  const tel  = document.getElementById('cust-tel')?.value.trim();
  const tel2 = document.getElementById('cust-tel-confirm')?.value.trim();
  const loc  = document.getElementById('cust-loc')?.value.trim();

  if (!name || !tel || !tel2 || !loc) {
    showToast('Veuillez remplir toutes les informations de livraison.');
    return;
  }

  if (!/^\d{10}$/.test(tel)) {
    showToast('Le numéro joignable doit contenir exactement 10 chiffres.');
    return;
  }

  if (tel !== tel2) {
    showToast('Les deux numéros ne correspondent pas. Vérifiez votre saisie.');
    return;
  }

  const itemsText = cart.map(i =>
    `• ${i.name} × ${i.qty} = ${(i.price * i.qty).toLocaleString('fr-FR')} FCFA`
  ).join('\n');

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  const msg = `*COMMANDE SAD DE LAURE*

👤 *Client :* ${name}
📞 *N° joignable :* ${tel}
📍 *Lieu :* ${loc}

🛒 *Produits commandés :*
${itemsText}

💰 *TOTAL : ${total.toLocaleString('fr-FR')} FCFA*

_(Commande passée via le site SAD DE LAURE)_`;

  // Numéro WhatsApp officiel SODEFORCE
  window.open(`https://wa.me/2250103121221?text=${encodeURIComponent(msg)}`, '_blank');
});

// ── Toast ────────────────────────────────────────────────────
function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 2800);
}

// ── Header scroll ────────────────────────────────────────────
function initHeader() {
  const header = document.getElementById('site-header');
  if (!header) return;
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
}

// ── Burger menu ──────────────────────────────────────────────
function initBurger() {
  const btn = document.getElementById('burger-btn');
  const nav = document.getElementById('nav-links');
  if (!btn || !nav) return;

  btn.addEventListener('click', () => {
    nav.classList.toggle('mobile-open');
  });

  document.addEventListener('click', (e) => {
    if (!btn.contains(e.target) && !nav.contains(e.target)) {
      nav.classList.remove('mobile-open');
    }
  });

  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => nav.classList.remove('mobile-open'));
  });
}

// ── Init ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initBurger();
});
