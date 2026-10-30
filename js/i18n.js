// Thai/English switch. The text in the HTML is the source, in the language set
// by window.I18N_SOURCE ('th' unless the page says otherwise); window.I18N
// (i18n/<slug>.js) maps it to the other language. Redrawn product screens
// ([data-fit-w]) keep their own text, except labels marked [data-i18n] (diagram
// annotations). alt, aria-label and title are translated too. English is the default.
(() => {
  const dict = window.I18N || {};
  const source = window.I18N_SOURCE || 'th';
  const norm = t => t.replace(/\s+/g, ' ').trim();
  const orig = new Map(); // text node -> source text
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode: n => {
      const el = n.parentElement;
      if (el.closest('script,style,[data-i18n-skip]')) return NodeFilter.FILTER_REJECT;
      if (el.closest('[data-fit-w]') && !el.closest('[data-i18n]')) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  for (let n; (n = walker.nextNode());) {
    const k = norm(n.nodeValue);
    if (k && dict[k] !== undefined) orig.set(n, n.nodeValue);
  }
  const attrs = []; // [element, attribute, source text]
  document.querySelectorAll('[alt],[aria-label],[title]').forEach(el => {
    ['alt', 'aria-label', 'title'].forEach(a => {
      const v = el.getAttribute(a);
      if (v && dict[norm(v)] !== undefined) attrs.push([el, a, v]);
    });
  });
  const srcTitle = document.title;

  const style = document.createElement('style');
  style.textContent = '[data-lang]:focus-visible{outline:2px solid currentColor!important;outline-offset:3px!important;border-radius:4px!important}'
    // Thai tone marks need room on big two-line case titles
    + (source === 'th' ? 'html[lang=th] h1{line-height:1.25!important}' : '');
  document.head.appendChild(style);

  const read = () => {
    const q = new URLSearchParams(location.search).get('lang');
    if (q === 'th' || q === 'en') return q;
    try { return localStorage.getItem('lang') || 'en'; } catch (e) { return 'en'; }
  };

  const apply = lang => {
    const same = lang === source;
    orig.forEach((text, n) => {
      // keep the node's outer spaces so "<b>Title</b> text" stays two words
      const [, lead, , trail] = text.match(/^(\s*)([\s\S]*?)(\s*)$/);
      n.nodeValue = same ? text : lead + dict[norm(text)] + trail;
    });
    attrs.forEach(([el, a, v]) => el.setAttribute(a, same ? v : dict[norm(v)]));
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
