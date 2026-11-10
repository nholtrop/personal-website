// Line drawings for media covers (viewBox 0 0 120 120).
// Classes: h = highlight stroke, hf = highlight fill, th = thick, d = dashed.
'use strict';

const calendarGrid = () => {
  let s = '';
  for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) {
    const hot = r * 5 + c >= 4;
    s += `<rect class="${hot ? 'hf' : ''}" x="${24 + c * 15}" y="${52 + r * 15}" width="9" height="9" rx="1.5"/>`;
  }
  return s;
};

const M = {
  cart: '<path d="M12 28h14l12 50h52l12-36H32"/><circle cx="46" cy="92" r="6"/><circle cx="84" cy="92" r="6"/><path class="h" d="M50 42V30h16v12M72 42V22h14v20"/>',
  label: '<rect x="30" y="12" width="60" height="96" rx="4"/><path class="th" d="M38 26h44"/><path d="M38 40h44M38 52h30M38 64h38M38 76h24M38 88h34M38 98h26"/><path class="h" d="M72 52h10M80 64h2M66 76h16"/>',
  bars: '<path d="M10 102h100"/><rect x="18" y="60" width="12" height="42"/><rect x="36" y="40" width="12" height="62"/><rect class="h" x="54" y="22" width="12" height="80"/><rect x="72" y="50" width="12" height="52"/><rect x="90" y="68" width="12" height="34"/><path class="d" d="M12 56h96"/>',
  phone: '<rect x="34" y="8" width="44" height="104" rx="8"/><path d="M50 16h12"/><rect x="42" y="26" width="28" height="22" rx="2"/><rect class="h" x="42" y="54" width="28" height="22" rx="2"/><rect x="42" y="82" width="28" height="18" rx="2"/><path d="M96 38v42M89 72l7 8 7-8"/>',
  coin: '<ellipse cx="40" cy="96" rx="24" ry="8"/><path d="M16 96V84M64 96V84"/><ellipse cx="40" cy="84" rx="24" ry="8"/><circle cx="78" cy="46" r="28"/><path class="h" d="M88 34a14 14 0 1 0 0 24M66 42h16M66 50h16"/>',
  headset: '<path d="M26 70V60a34 34 0 0 1 68 0v10"/><rect x="18" y="64" width="16" height="26" rx="5"/><rect x="86" y="64" width="16" height="26" rx="5"/><path d="M94 90c0 12-10 18-22 18"/><rect class="hf" x="56" y="102" width="16" height="10" rx="4"/>',
  mic: '<rect x="44" y="10" width="32" height="58" rx="16"/><path class="h" d="M50 30h20M50 40h20M50 50h20"/><path d="M30 52a30 30 0 0 0 60 0M60 82v20M44 104h32"/>',
  megaphone: '<path d="M18 50h18l46-24v68L36 70H18z"/><path d="M26 70l8 26h12l-6-26"/><path class="h" d="M94 42l14-7M96 60h16M94 78l14 7"/>',
  pie: '<circle cx="60" cy="60" r="44"/><path class="hf" d="M60 60V16a44 44 0 1 1-44 44z"/>',
  tag: '<path d="M14 62l40-40h46v46l-40 40z"/><circle cx="82" cy="40" r="6"/><circle class="h" cx="48" cy="62" r="5"/><circle class="h" cx="66" cy="80" r="5"/><path class="h" d="M44 84l26-26"/>',
  calendar: '<rect x="14" y="24" width="92" height="82" rx="6"/><path d="M14 42h92M36 14v18M84 14v18"/>' + calendarGrid(),
  bag: '<path d="M26 44h68l-6 62H32z"/><path d="M44 44v-8a16 16 0 0 1 32 0v8"/><path class="h" d="M44 74h32M60 60v28"/>',
  gift: '<rect x="18" y="56" width="70" height="50"/><rect x="12" y="42" width="82" height="14"/><path d="M53 42v64"/><path class="h" d="M53 42c-6-14-24-18-24-6 0 8 12 8 24 6zM53 42c6-14 24-18 24-6 0 8-12 8-24 6z"/><path class="h" d="M106 34V8M98 16l8-8 8 8"/>',
  storefront: '<path d="M14 40l10-22h72l10 22"/><path d="M14 40a11.5 11.5 0 0 0 23 0a11.5 11.5 0 0 0 23 0a11.5 11.5 0 0 0 23 0a11.5 11.5 0 0 0 23 0"/><path d="M20 54v50h80V54"/><rect x="30" y="66" width="22" height="18"/><rect class="h" x="64" y="66" width="22" height="38"/><path d="M10 104h100"/>',
  quote: '<path d="M18 22h84a8 8 0 0 1 8 8v46a8 8 0 0 1-8 8H50l-22 18V84H18a8 8 0 0 1-8-8V30a8 8 0 0 1 8-8z"/><path class="h" d="M28 42h62M28 54h46M28 66h54"/>',
  seesaw: '<path d="M60 72l-16 30h32z"/><path d="M12 80l96-28"/><rect x="18" y="58" width="20" height="18" transform="rotate(-16 28 67)"/><circle class="h" cx="92" cy="44" r="9"/>',
  mail: '<rect x="8" y="30" width="72" height="52" rx="4"/><path d="M8 34l36 28 36-28"/><path class="h" d="M110 76a15 15 0 1 1-5-11M106 54l-1 11 11 1"/>',
  lock: '<rect x="32" y="56" width="56" height="48" rx="6"/><path d="M44 56V40a16 16 0 0 1 32 0v16"/><circle class="hf" cx="60" cy="76" r="6"/><path class="h" d="M60 82v10"/><path class="d" d="M8 28h16M8 44h10M96 22h16M102 38h10"/>',
  newspaper: '<rect x="16" y="20" width="88" height="80" rx="4"/><path class="th" d="M26 34h68"/><path d="M26 50h28M26 60h28M26 70h28M26 80h28M26 90h18"/><rect class="h" x="64" y="50" width="30" height="22"/><path d="M64 82h30M64 90h20"/>',
  screen: '<rect x="10" y="20" width="100" height="66" rx="6"/><path d="M42 106h36M60 86v20"/><path class="hf" d="M50 38l26 15-26 15z"/>',
};

const DEFAULTS = { press: 'newspaper', interview: 'quote', video: 'screen', podcast: 'mic', photo: 'screen' };

function motif(name, type) {
  const body = M[name] || M[DEFAULTS[type]] || M.newspaper;
  return `<svg class="cover-motif" viewBox="0 0 120 120" aria-hidden="true">${body}</svg>`;
}

module.exports = { motif, names: Object.keys(M) };
