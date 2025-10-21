/* Header interactions (site-wide):
 - increment cart badge when elements with .add-to-cart or .cart-icon are clicked
 - toggle wishlists (.wishlist-btn) to active state
 - toggle profile button aria-expanded/open
 - keep unobtrusive: only attach where elements exist
*/
(function(){
  function safeQuery(sel){ return Array.from(document.querySelectorAll(sel)); }

  // Cart handling
  function initCart(){
    const badge = document.querySelector('.cart-badge');
    if(!badge) return;

    // ensure toast container exists
    let toastRoot = document.getElementById('solerion-toast-root');
    if(!toastRoot){
      toastRoot = document.createElement('div');
      toastRoot.id = 'solerion-toast-root';
      // base styles, can be overridden by your CSS
      toastRoot.style.position = 'fixed';
      toastRoot.style.top = '18px';
      toastRoot.style.right = '18px';
      toastRoot.style.zIndex = '9999';
      toastRoot.style.pointerEvents = 'none';
      // announce to screen readers
      toastRoot.setAttribute('aria-live', 'polite');
      toastRoot.setAttribute('aria-atomic', 'true');
      document.body.appendChild(toastRoot);
    }

    function pulse(){
      badge.classList.add('pulse');
      setTimeout(()=> badge.classList.remove('pulse'), 450);
    }

    // clickable cart icons (site uses .cart-icon or .add-to-cart)
    safeQuery('.add-to-cart, .cart-icon').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const current = parseInt(badge.textContent) || 0;
        const next = Math.min(999, current + 1);
        badge.textContent = next;
        pulse();

        // try to pick up a product name from data-name or nearby .product-name
        const name = el.dataset && el.dataset.name
          ? el.dataset.name
          : (el.closest && el.closest('.product-card') && el.closest('.product-card').querySelector('.product-name')
            ? el.closest('.product-card').querySelector('.product-name').textContent.trim()
            : null);

        if(name) showToast(`${name} added to cart`);
        else showToast('Item added to cart');
      });
    });

    // show toast helper
    function showToast(text){
      if(!toastRoot) return;
      const t = document.createElement('div');
      t.className = 'solerion-toast';
      t.style.pointerEvents = 'auto';
      t.style.background = 'rgba(0,0,0,0.85)';
      t.style.color = '#fff';
      t.style.padding = '10px 16px';
      t.style.borderRadius = '8px';
      t.style.marginTop = '8px';
      t.style.boxShadow = '0 6px 18px rgba(0,0,0,0.25)';
  t.style.opacity = '0';
  t.style.transform = 'translateY(-6px)';
  t.style.transition = 'opacity .18s ease, transform .22s cubic-bezier(.2,.8,.2,1)';
  // build content with a span for text so screen readers read it
  const textSpan = document.createElement('span');
  textSpan.textContent = text;
  t.appendChild(textSpan);

      const close = document.createElement('button');
      close.setAttribute('aria-label','Dismiss notification');
      close.textContent = '×';
      close.style.marginLeft = '12px';
      close.style.background = 'transparent';
      close.style.border = '0';
      close.style.color = 'inherit';
      close.style.cursor = 'pointer';
      close.style.fontSize = '16px';
      close.style.padding = '0 0 0 8px';
      close.addEventListener('click', ()=> removeToast(t));


      t.appendChild(close);
      toastRoot.appendChild(t);

      // force reflow then show
      requestAnimationFrame(()=>{
        t.style.opacity = '1';
        t.style.transform = 'translateY(0)';
      });

      // auto-dismiss
      const timeout = setTimeout(()=> removeToast(t), 2800);
      function removeToast(node){
        clearTimeout(timeout);
        node.style.opacity = '0';
        node.style.transform = 'translateY(-6px)';
        setTimeout(()=> node.remove(), 220);
      }
    }
  }

  // Wishlist / favorite handling
  function initWishlist(){
    safeQuery('.wishlist-btn, .fav-btn').forEach(btn => {
      btn.addEventListener('click', function(e){
        e.preventDefault();
        // swap visual state
        btn.classList.toggle('active');
        // for hearts that are plain text, toggle aria-pressed
        const pressed = btn.getAttribute('aria-pressed') === 'true';
        btn.setAttribute('aria-pressed', String(!pressed));
      });
    });
  }

  // Profile toggle
  function initProfile(){
    const profile = document.querySelector('.header-right .btn-secondary[href="profile.html"], .profile-btn');
    if(!profile) return;
    profile.setAttribute('role','button');
    profile.setAttribute('tabindex','0');
    profile.setAttribute('aria-expanded', profile.getAttribute('aria-expanded') || 'false');

    function toggle(){
      const isOpen = profile.getAttribute('aria-expanded') === 'true';
      profile.setAttribute('aria-expanded', String(!isOpen));
      profile.classList.toggle('open');
    }

    profile.addEventListener('click', (e)=>{
      // if the element is a real link (href), allow normal navigation with ctrl/meta; otherwise toggle
      if(profile.tagName.toLowerCase() === 'a' && (e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      toggle();
    });

    profile.addEventListener('keydown', (e)=>{
      if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ()=>{ initCart(); initWishlist(); initProfile(); });
  else { initCart(); initWishlist(); initProfile(); }
})();
