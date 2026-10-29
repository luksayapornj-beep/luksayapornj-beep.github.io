// Thai/English switch. The text in the HTML is the source, in the language set
// by window.I18N_SOURCE ('th' unless the page says otherwise); window.I18N
// (i18n/<slug>.js) maps it to the other language. Redrawn product screens
// ([data-fit-w]) keep their own text. English is the default.
(() => {
  const dict = window.I18N || {};
  const source = window.I18N_SOURCE || 'th';
  const norm = t => t.replace(/\s+/g, ' ').trim();
  const orig = new Map(); // text node -> source text
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode: n => n.parentElement.closest('[data-fit-w],script,style,[data-i18n-skip]')
      ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT,
  });
  for (let n; (n = walker.nextNode());) {
    const k = norm(n.nodeValue);
    if (k && dict[k] !== undefined) orig.set(n, n.nodeValue);
  }
  const srcTitle = document.title;

  const read = () => {
    const q = new URLSearchParams(location.search).get('lang');
    if (q === 'th' || q === 'en') return q;
    try { return localStorage.getItem('lang') || 'en'; } catch (e) { return 'en'; }
  };

  const apply = lang => {
    const same = lang === source;
    orig.forEach((text, n) => { n.nodeValue = same ? text : dict[norm(text)]; });
    document.title = same ? srcTitle : (dict[srcTitle] || srcTitle);
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
