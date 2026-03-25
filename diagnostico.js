(function(){

  /* ── HERO TYPEWRITER ── */
  var heroType = document.getElementById('heroType');
  var heroIcon = document.getElementById('heroIcon');
  if(heroIcon) heroIcon.style.display = 'none';
  if(heroType){
    var full = heroType.getAttribute('data-text') || heroType.textContent;
    var i = 0;
    var speed = 45;
    heroType.textContent = '';
    function tick(){
      if(i >= full.length){
        if(heroIcon) heroIcon.style.display = 'inline-block';
        var cursor = document.getElementById('typeCursor');
        if(cursor) cursor.remove();
        return;
      }
      heroType.appendChild(document.createTextNode(full[i]));
      i += 1;
      setTimeout(tick, speed);
    }
    tick();
  }

  /* ── HAMBURGER ── */
  var ham=document.getElementById('ham');
  var drawer=document.getElementById('drawer');
  var overlay=document.getElementById('overlay');
  var dClose=document.getElementById('drawerClose');
  var navLogo=document.getElementById('navLogo');
  var navLogoState = '';
  function updateNavLogo(){
    if(!navLogo) return;
    var isMobile = window.innerWidth <= 559;
    var useFavicon = isMobile || window.scrollY > 8;
    var next = useFavicon ? 'src/favicon.png' : 'src/logo.png';
    if(next === navLogoState) return;
    navLogoState = next;
    navLogo.classList.add('swap');
    setTimeout(function(){
      navLogo.src = next;
      navLogo.classList.remove('swap');
    }, 120);
  }
  updateNavLogo();
  window.addEventListener('scroll', updateNavLogo, { passive: true });
  window.addEventListener('resize', updateNavLogo);
  function openDrawer(){drawer.classList.add('open');overlay.classList.add('open');ham.classList.add('open')}
  function closeDrawer(){drawer.classList.remove('open');overlay.classList.remove('open');ham.classList.remove('open')}
  ham.addEventListener('click',openDrawer);
  dClose.addEventListener('click',closeDrawer);
  overlay.addEventListener('click',closeDrawer);
  ['navCases','navContact','navDiag'].forEach(function(id){
    var el=document.getElementById(id);
    if(el)el.addEventListener('click',closeDrawer);
  });

  /* ── SLIDER ── */
  var trk   = document.getElementById('sliderTrk');
  if(!trk) return;
  var cards = trk.querySelectorAll('.card');
  var dots  = document.querySelectorAll('.dot');
  var n     = cards.length;
  var cur   = 1; /* start on Peregrino (index 1) */

  var offsetPx = 0;
  var targetPx = 0;
  var rafId    = null;

  function cw(){ return cards[0].offsetWidth + 12; }
  function clamp(v,lo,hi){ return v<lo?lo:v>hi?hi:v; }

  /*
    Center a given card index in the viewport.
    The left padding needed = half viewport - half card width.
    We store this as the "origin" and offset from it.
  */
  function originLeft(){
    return (window.innerWidth - cards[0].offsetWidth) / 2;
  }

  function applyPadding(){
    trk.style.paddingLeft = originLeft() + 'px';
  }

  function setDots(i){
    dots.forEach(function(d,j){ d.classList.toggle('on', j===i); });
    cur = i;
  }

  function animate(){
    var diff = targetPx - offsetPx;
    if(Math.abs(diff) < 0.4){
      offsetPx = targetPx;
      trk.style.transform = 'translateX(-'+offsetPx+'px)';
      rafId = null;
      return;
    }
    offsetPx += diff * 0.12;
    trk.style.transform = 'translateX(-'+offsetPx+'px)';
    rafId = requestAnimationFrame(animate);
  }

  function moveTo(px){
    targetPx = clamp(px, 0, (n-1)*cw());
    setDots(clamp(Math.round(targetPx/cw()), 0, n-1));
    if(!rafId) rafId = requestAnimationFrame(animate);
  }

  function shiftTo(i){ moveTo(i * cw()); }

  /* init: center on card 1 (Peregrino) */
  function init(){
    applyPadding();
    /* jump instantly to card 1 without animation */
    offsetPx = cw();
    targetPx = cw();
    trk.style.transform = 'translateX(-'+offsetPx+'px)';
    setDots(1);
  }

  dots.forEach(function(d){
    d.addEventListener('click', function(){ shiftTo(parseInt(d.dataset.i,10)); });
  });

  /* ── TOUCH drag — only when touch starts inside #cases ── */
  var casesEl     = document.getElementById('cases');
  var touchY0     = 0;
  var touchX0     = 0;
  var touchPx0    = 0;
  var touchCap    = false;
  var touchMoved  = false;
  var touchAxis   = null; /* 'h' | 'v' | null */

  casesEl.addEventListener('touchstart', function(e){
    touchX0    = e.touches[0].clientX;
    touchY0    = e.touches[0].clientY;
    touchPx0   = targetPx;
    touchCap   = true;
    touchMoved = false;
    touchAxis  = null;
  }, { passive: true });

  window.addEventListener('touchmove', function(e){
    if(!touchCap) return;
    var dx = touchX0 - e.touches[0].clientX;
    var dy = touchY0 - e.touches[0].clientY;

    /* determine axis on first significant move */
    if(!touchAxis && (Math.abs(dx) > 3 || Math.abs(dy) > 3)){
      touchAxis = Math.abs(dx) >= Math.abs(dy) ? 'h' : 'v';
    }
    if(touchAxis !== 'h') return; /* let vertical scroll be normal */

    touchMoved = true;
    e.preventDefault();
    moveTo(touchPx0 + dx * 1.25);
  }, { passive: false });

  window.addEventListener('touchend', function(){
    if(!touchCap) return;
    touchCap = false;
    if(touchAxis === 'h'){
      shiftTo(clamp(Math.round(targetPx/cw()), 0, n-1));
    }
    touchAxis = null;
  });

  /* ── MOUSE DRAG ── */
  var dragX0   = 0;
  var dragPx0  = 0;
  var dragging = false;
  var dragged  = false;

  trk.addEventListener('mousedown', function(e){
    dragX0=e.clientX; dragPx0=targetPx; dragging=true; dragged=false; e.preventDefault();
  });
  window.addEventListener('mousemove', function(e){
    if(!dragging) return;
    var dx = dragX0 - e.clientX;
    if(Math.abs(dx)>6) dragged=true;
    moveTo(dragPx0 + dx);
  });
  window.addEventListener('mouseup', function(){
    if(!dragging) return;
    dragging = false;
    shiftTo(clamp(Math.round(targetPx/cw()), 0, n-1));
  });

  trk.querySelectorAll('.card-link').forEach(function(a){
    a.addEventListener('click', function(e){ if(dragged) e.preventDefault(); });
  });

  window.addEventListener('resize', function(){
    applyPadding();
    /* recalculate offset for current card after resize */
    offsetPx = cur * cw();
    targetPx = offsetPx;
    trk.style.transform = 'translateX(-'+offsetPx+'px)';
  });

  /* run after fonts/layout settle */
  if(document.readyState === 'complete'){
    init();
  } else {
    window.addEventListener('load', init);
  }

})();