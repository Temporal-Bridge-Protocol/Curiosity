(function() {
  function hex(h) {
    const n = parseInt(h.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  function generateFavicon() {
    const size = 64;
    const dpr = 1;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    
    const ctx = canvas.getContext('2d');
    
    // Paramètres du logo
    const PARAMS = {
      nb: 800, rayonK: 0.35, dispersion: 0.75, derive: 0, aplat: 1,
      taille: 1, scint: 0, noyau: 0.8, vitesse: 0, intensite: 1.3
    };
    
    const [r1, g1, b1] = hex('#7C8CFF');
    const [r2, g2, b2] = hex('#4FD8C8');
    
    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.translate(size / 2, size / 2);
    ctx.globalCompositeOperation = 'lighter';
    
    const f = size / 480;
    const rayon = size * PARAMS.rayonK;
    const t = 0;
    const a = 0.1;
    const rot = 0;
    const p = PARAMS;
    
    for (let i = 0; i < p.nb; i++) {
      const s1 = Math.sin(i * 12.9898) * 43758.5453, h1 = s1 - Math.floor(s1);
      const s2 = Math.sin(i * 78.233) * 12543.21, h2 = s2 - Math.floor(s2);
      const baseR = Math.pow(h2, p.dispersion * 0.5) * rayon;
      const R = baseR * (0.6 + a * 0.6);
      const ang = h1 * Math.PI * 2 + rot * 0.3 * (1 - h2 * 0.7);
      const frac = Math.min(1, baseR / rayon), near = 1 - frac;
      const cr = r1 + (r2 - r1) * frac, cg = g1 + (g2 - g1) * frac, cb = b1 + (b2 - b1) * frac;
      
      ctx.globalAlpha = Math.min(1, (0.06 + near * 0.5 + a * 0.2));
      ctx.fillStyle = 'rgb(' + (cr | 0) + ',' + (cg | 0) + ',' + (cb | 0) + ')';
      ctx.beginPath();
      ctx.arc(Math.cos(ang) * R, Math.sin(ang) * R * p.aplat, Math.max(0.3, (0.6 + near * 2.2 + a * 0.8) * p.taille * (0.6 + f)), 0, 7);
      ctx.fill();
    }
    
    ctx.globalAlpha = 1;
    const cr2 = rayon * 0.42 * p.noyau * (0.7 + a * 0.55);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, cr2);
    g.addColorStop(0, 'rgba(' + r1 + ',' + g1 + ',' + b1 + ',' + (0.35 + a * 0.3) + ')');
    g.addColorStop(1, 'rgba(' + r1 + ',' + g1 + ',' + b1 + ',0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(0, 0, cr2, 0, 7); ctx.fill();
    
    ctx.restore();
    
    // Crée le favicon
    const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.rel = 'icon';
    link.href = canvas.toDataURL('image/png');
    document.head.appendChild(link);
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', generateFavicon);
  } else {
    generateFavicon();
  }
})();
