/* <curiosity-logo> — logo animé nébuleuse pour le jeu Curiosity.
   Usage :
     <script src="curiosity-logo.js"></script>
     <curiosity-logo size="800"></curiosity-logo>
   Attributs optionnels : size (px), accent (#hex), couleur2 (#hex).
   Fond transparent. Repos en boucle, s'anime au survol, "parle" au clic. */
(function () {
  const PARAMS = {
    nb: 1000, rayonK: 0.28, dispersion: 0.75, derive: 1.55, aplat: 1,
    taille: 0.7, scint: 0.35, noyau: 0.8, vitesse: 0.75, intensite: 1.3
  };

  function hex(h) {
    const n = parseInt(h.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  class CuriosityLogo extends HTMLElement {
    connectedCallback() {
      if (this._init) return;
      this._init = true;
      const size = parseInt(this.getAttribute('size') || '220', 10);
      this._size = size;
      this.style.display = 'inline-block';
      this.style.width = size + 'px';
      this.style.height = size + 'px';
      this.style.cursor = 'pointer';
      const c = document.createElement('canvas');
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      c.width = size * dpr; c.height = size * dpr;
      c.style.cssText = 'display:block;width:' + size + 'px;height:' + size + 'px;';
      this.appendChild(c);
      this._ctx = c.getContext('2d');
      this._ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      this._mode = 'repos';
      this._amp = 0.1;
      this._rot = 0;
      this._last = performance.now();
      this._t = 0;

      this.addEventListener('mouseenter', () => { if (this._mode !== 'parle') this._mode = 'ecoute'; this._hover = true; });
      this.addEventListener('mouseleave', () => { if (this._mode !== 'parle') this._mode = 'repos'; this._hover = false; });
      this.addEventListener('click', () => {
        this._mode = 'parle';
        clearTimeout(this._to);
        this._to = setTimeout(() => { this._mode = this._hover ? 'ecoute' : 'repos'; }, 1600);
      });

      const loop = (now) => {
        if (!this.isConnected) return;
        const dt = Math.min(0.05, (now - this._last) / 1000);
        this._last = now;
        this._step(dt);
        this._raf = requestAnimationFrame(loop);
      };
      this._raf = requestAnimationFrame(loop);
    }

    disconnectedCallback() {
      cancelAnimationFrame(this._raf);
      clearTimeout(this._to);
      this._init = false;
    }

    _target(t) {
      const k = PARAMS.intensite;
      switch (this._mode) {
        case 'parle': {
          const e = Math.sin(t * 2.1) * 0.5 + Math.sin(t * 5.7 + 1) * 0.3 + Math.sin(t * 9.3) * 0.2;
          return Math.min(1, (0.35 + 0.65 * Math.abs(e)) * k);
        }
        case 'ecoute': return (0.22 + 0.1 * Math.sin(t * 1.6)) * k;
        default: return (0.09 + 0.05 * Math.sin(t * 0.7)) * k;
      }
    }
    _spinSpeed() {
      return { parle: 0.6, ecoute: 0.25, repos: 0.12 }[this._mode] * PARAMS.vitesse;
    }

    _step(dt) {
      this._t += dt * PARAMS.vitesse;
      const t = this._t;
      this._amp += (this._target(t) - this._amp) * 0.08;
      this._rot += this._spinSpeed() * dt;
      const a = this._amp, rot = this._rot;
      const S = this._size, ctx = this._ctx;
      const f = S / 480;
      const rayon = S * PARAMS.rayonK;
      const [r1, g1, b1] = hex(this.getAttribute('accent') || '#7C8CFF');
      const [r2, g2, b2] = hex(this.getAttribute('couleur2') || '#4FD8C8');
      const p = PARAMS;

      ctx.clearRect(0, 0, S, S);
      ctx.save();
      ctx.translate(S / 2, S / 2);
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < p.nb; i++) {
        const s1 = Math.sin(i * 12.9898) * 43758.5453, h1 = s1 - Math.floor(s1);
        const s2 = Math.sin(i * 78.233) * 12543.21, h2 = s2 - Math.floor(s2);
        const baseR = Math.pow(h2, p.dispersion * 0.5) * rayon;
        const drift = (Math.sin(t * 0.8 + i) * 6 + Math.sin(t * 1.7 + i * 2.3) * 3) * p.derive * f;
        const R = baseR * (0.6 + a * 0.6) + drift;
        const ang = h1 * Math.PI * 2 + rot * 0.3 * (1 - h2 * 0.7);
        const frac = Math.min(1, baseR / rayon), near = 1 - frac;
        const cr = r1 + (r2 - r1) * frac, cg = g1 + (g2 - g1) * frac, cb = b1 + (b2 - b1) * frac;
        const twinkle = 1 - p.scint + p.scint * Math.abs(Math.sin(i * 1.3 + t * 3));
        ctx.globalAlpha = Math.min(1, (0.06 + near * 0.5 + a * 0.2) * twinkle);
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
    }
  }

  if (!customElements.get('curiosity-logo')) customElements.define('curiosity-logo', CuriosityLogo);
})();
