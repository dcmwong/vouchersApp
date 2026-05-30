/* voucher-data.js — data model + barcode/QR generators. Plain JS, attaches to window. */
(function () {
  // ── Family members ─────────────────────────────────────────────
  const FAMILY = [
    { id: 'mom',  name: 'Mum',  color: '#C2683F' },
    { id: 'dad',  name: 'Dad',  color: '#3F6B5E' },
    { id: 'kids', name: 'Kids', color: '#8E5B86' },
    { id: 'all',  name: 'Everyone', color: '#6b7280' },
  ];

  // ── Brand catalogue (names used as issuers; original monogram marks,
  //    approximate brand colours — not the trademarked logos) ──────
  const BRANDS = [
    { key: 'tesco',       brand: 'Tesco',        tag: 'SUPERMARKET',      color: '#00539F', loyaltyScheme: 'Clubcard' },
    { key: 'sainsburys',  brand: "Sainsbury's",  tag: 'SUPERMARKET',      color: '#EE7203', loyaltyScheme: 'Nectar' },
    { key: 'mands',       brand: 'M&S',          tag: 'FOOD & HOME',      color: '#00482B', loyaltyScheme: 'Sparks' },
    { key: 'greggs',      brand: 'Greggs',       tag: 'BAKERY',           color: '#00263A', loyaltyScheme: 'Greggs Rewards' },
    { key: 'boots',       brand: 'Boots',        tag: 'HEALTH & BEAUTY',  color: '#05054B', loyaltyScheme: 'Advantage Card' },
    { key: 'costa',       brand: 'Costa Coffee', tag: 'COFFEE',           color: '#6E1A33', loyaltyScheme: 'Costa Club' },
    { key: 'argos',       brand: 'Argos',        tag: 'HOME & TECH',      color: '#C9151B', loyaltyScheme: null },
    { key: 'waterstones', brand: 'Waterstones',  tag: 'BOOKS',            color: '#14352A', loyaltyScheme: null },
    { key: 'nandos',      brand: "Nando's",      tag: 'DINING',           color: '#C4122E', loyaltyScheme: null },
  ];
  const brandOf = (k) => BRANDS.find((b) => b.key === k);

  // ── Wallet contents (balance in pence) ──────────────────────────
  const VOUCHERS = [
    { id: 'v1', brandKey: 'tesco',      balance: 2500, code: '7041 8826 3390 1182', owner: 'mom',  active: true,
      loyalty: { code: '6340 1190 6624 0098', points: 412 } },
    { id: 'v2', brandKey: 'sainsburys', balance: 4000, code: '5523 9981 0042 7610', owner: 'dad',  active: true,
      loyalty: { code: '9826 5512 7740 0031', points: 1880 } },
    { id: 'v3', brandKey: 'mands',      balance: 3000, code: '6612 7740 1183 9925', owner: 'mom',  active: true,
      loyalty: { code: '4417 9930 2261 5508', points: 240 } },
    { id: 'v4', brandKey: 'greggs',     balance: 850,  code: '3380 1190 6624 0098', owner: 'kids', active: true,
      loyalty: { code: '1129 8840 5573 6610', points: 7 } },
    { id: 'v5', brandKey: 'boots',      balance: 2000, code: '8120 4471 5538 9077', owner: 'mom',  active: true,
      loyalty: { code: '7714 2298 6650 1123', points: 326 } },
    { id: 'v6', brandKey: 'costa',      balance: 1500, code: '2245 7781 9930 4471', owner: 'dad',  active: true,
      loyalty: { code: '5538 9077 1129 8840', points: 5 } },
    { id: 'v7', brandKey: 'argos',      balance: 5000, code: '9920 4471 5538 9077', owner: 'all',  active: true, loyalty: null },
    { id: 'v8', brandKey: 'nandos',     balance: 0,    code: '8830 2217 4490 1156', owner: 'all',  active: false, loyalty: null },
  ];

  // ── Seeded RNG (mulberry32 over a string hash) ──────────────────
  function hashStr(s) {
    let h = 1779033703 ^ s.length;
    for (let i = 0; i < s.length; i++) {
      h = Math.imul(h ^ s.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    return h >>> 0;
  }
  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // ── Pseudo-QR matrix (finder squares + data field) ──────────────
  function makeQR(value, n) {
    n = n || 25;
    const r = rng(hashStr('qr:' + value));
    const m = Array.from({ length: n }, () => Array(n).fill(false));
    for (let y = 0; y < n; y++)
      for (let x = 0; x < n; x++)
        m[y][x] = r() > 0.52;
    const finder = (ox, oy) => {
      for (let y = 0; y < 7; y++)
        for (let x = 0; x < 7; x++) {
          const edge = x === 0 || x === 6 || y === 0 || y === 6;
          const core = x >= 2 && x <= 4 && y >= 2 && y <= 4;
          m[oy + y][ox + x] = edge || core;
        }
      for (let i = -1; i <= 7; i++) {
        if (oy - 1 >= 0 && ox + i >= 0 && ox + i < n) m[oy - 1][ox + i] = false;
        if (oy + 7 < n && ox + i >= 0 && ox + i < n) m[oy + 7][ox + i] = false;
        if (ox - 1 >= 0 && oy + i >= 0 && oy + i < n) m[oy + i][ox - 1] = false;
        if (ox + 7 < n && oy + i >= 0 && oy + i < n) m[oy + i][ox + 7] = false;
      }
    };
    finder(0, 0); finder(n - 7, 0); finder(0, n - 7);
    m[n - 7][n - 7] = true;
    return m;
  }

  // ── Pseudo-barcode (Code-128-ish bar widths) ───────────────────
  function makeBars(value) {
    const r = rng(hashStr('bar:' + value));
    const bars = [];
    for (let i = 0; i < 46; i++) bars.push({ w: 1 + Math.floor(r() * 3), on: i % 2 === 0 });
    return bars;
  }

  function money(pence) { return '£' + (pence / 100).toFixed(2); }

  // ── Build a hydrated voucher (merge brand + instance) ──────────
  function hydrate(v) { return Object.assign({}, brandOf(v.brandKey), v); }

  window.VA = { FAMILY, BRANDS, VOUCHERS, brandOf, hydrate, makeQR, makeBars, money };
})();
