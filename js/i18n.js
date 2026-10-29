// Thai/English switch for the short case pages. The Thai text in the HTML is
// the source; window.I18N (i18n/<slug>.js) maps it to English. Redrawn product
// screens ([data-fit-w]) stay in Thai. English is the default.
(() => {
  const dict = window.I18N || {};
  const norm = t => t.replace(/\s+/g, ' ').trim();
  const thai = new Map(); // text node -> original Thai
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode: n => n.parentElement.closest('[data-fit-w],script,style,[data-i18n-skip]')
      ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT,
  });
  for (let n; (n = walker.nextNode());) {
    const k = norm(n.nodeValue);
    if (k && dict[k] !== undefined) thai.set(n, n.nodeValue);
  }
  const thTitle = document.title;

  const read = () => {
    const q = new URLSearchParams(location.search).get('lang');
    if (q === 'th' || q === 'en') return q;
    try { return localStorage.getItem('lang') || 'en'; } catch (e) { return 'en'; }
  };

  const apply = lang => {
    thai.forEach((orig, n) => { n.nodeValue = lang === 'en' ? dict[norm(orig)] : orig; });
    document.title = lang === 'en' ? (dict[thTitle] || thTitle) : thTitle;
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-lang]').forEach(b => {
      const on = b.dataset.lang === lang;
      b.setAttribute('aria-pressed', on);
      b.style.fontWeight = on ? '600' : '400';
      b.style.opacity = on ? '1' : '.55';
    });
  };

  document.querySelectorAll('[data-lang]').forEach(b => b.addEventListener('click', () => {
    try { localStorage.setItem('lang', b.dataset.lang); } catch (e) {}
    apply(b.dataset.lang);
  }));
  apply(read());
})();
