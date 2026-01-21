// ============== DRAWER MANAGEMENT MODULE ==============

export function openDrawer(drawer, overlay) {
    if (drawer) drawer.classList.add('active');
    if (overlay) overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

export function closeDrawer(drawer, overlay) {
    if (drawer) drawer.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = 'auto';
}

export function setupDrawerTriggers(triggerId, drawerId, overlayId, closeButtonId) {
    const trigger = document.querySelector(triggerId);
    const drawer = document.querySelector(drawerId);
    const overlay = document.querySelector(overlayId);
    const closeBtn = document.querySelector(closeButtonId);
    
    if (trigger) {
        trigger.addEventListener('click', function(e) {
            if (e) e.preventDefault();
            openDrawer(drawer, overlay);
        });
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            closeDrawer(drawer, overlay);
        });
    }
    
    if (overlay) {
        overlay.addEventListener('click', function() {
            closeDrawer(drawer, overlay);
        });
    }
}