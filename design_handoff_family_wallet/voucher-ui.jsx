/* voucher-ui.jsx — presentational primitives. Exports to window. */

// ── App logo (uses the supplied V-ticket emblem) ───────────────
function LogoMark({ size = 30 }) {
  return (
    <img src="logo.png" alt="Family Wallet" style={{ height: size * 1.32, width: 'auto', display: 'block', flexShrink: 0 }} />
  );
}

function Logo({ size = 30, stacked = false }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <LogoMark size={size} />
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
        <span style={{ fontFamily: 'var(--va-head)', fontWeight: 800, fontSize: size * 0.62,
          letterSpacing: '-0.02em', color: 'var(--va-ink)' }}>Family Wallet</span>
      </div>
    </div>
  );
}

// ── Brand monogram tile ────────────────────────────────────────
function Monogram({ v, size = 40, radius }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: radius != null ? radius : size * 0.28,
      background: 'rgba(255,255,255,0.94)', color: v.color, flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--va-head)', fontWeight: 800, fontSize: size * 0.46,
    }}>{v.brand[0]}</div>
  );
}

// ── Pseudo-QR ──────────────────────────────────────────────────
function QRCode({ value, size = 168, color = '#16110d' }) {
  const m = React.useMemo(() => window.VA.makeQR(value, 25), [value]);
  const n = m.length;
  return (
    <div style={{
      width: size, height: size, padding: size * 0.055, background: '#fff',
      borderRadius: 16, boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
      display: 'grid', gridTemplateColumns: `repeat(${n}, 1fr)`, gridTemplateRows: `repeat(${n}, 1fr)`,
    }}>
      {m.flatMap((row, y) => row.map((on, x) => (
        <div key={x + '-' + y} style={{ background: on ? color : 'transparent' }} />
      )))}
    </div>
  );
}

// ── Pseudo-barcode ─────────────────────────────────────────────
function Barcode({ value, height = 62, color = '#16110d', barScale = 2.6 }) {
  const bars = React.useMemo(() => window.VA.makeBars(value), [value]);
  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'stretch', height, justifyContent: 'center' }}>
        {bars.map((b, i) => (
          <div key={i} style={{ width: b.w * barScale, background: b.on ? color : 'transparent' }} />
        ))}
      </div>
      <div style={{ marginTop: 8, textAlign: 'center', fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
        fontSize: 12.5, letterSpacing: '0.3em', color: 'rgba(0,0,0,0.55)', paddingLeft: '0.3em' }}>
        {value.replace(/\s/g, '')}
      </div>
    </div>
  );
}

// ── Family avatar ──────────────────────────────────────────────
function Avatar({ member, size = 34, ring = false, dim = false }) {
  const isAll = member.id === 'all';
  const initial = isAll ? '✦' : member.name[0];
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: isAll ? 'rgba(0,0,0,0.06)' : member.color,
      color: isAll ? 'var(--va-soft)' : '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 700, fontSize: size * 0.42, fontFamily: 'var(--va-head)',
      boxShadow: ring ? `0 0 0 3px var(--va-surface), 0 0 0 5px ${isAll ? '#b5bac2' : member.color}` : 'none',
      opacity: dim ? 0.4 : 1, flexShrink: 0, transition: 'opacity .2s, box-shadow .2s',
    }}>{initial}</div>
  );
}

// ── The voucher card face (portrait) ───────────────────────────
function VoucherCard({ v, dim = false, elevated = false }) {
  const fam = window.VA.FAMILY.find((f) => f.id === v.owner);
  return (
    <div style={{
      position: 'relative', width: '100%', height: '100%',
      borderRadius: 24, overflow: 'hidden', color: '#fff', background: v.color,
      boxShadow: elevated ? '0 24px 50px -14px rgba(40,25,15,0.5), 0 2px 6px rgba(0,0,0,0.12)'
                          : '0 8px 22px -8px rgba(40,25,15,0.4)',
      transition: 'box-shadow .3s', display: 'flex', flexDirection: 'column', padding: '22px 22px 20px',
    }}>
      <div style={{ position: 'absolute', inset: 0,
        background: 'linear-gradient(150deg, rgba(255,255,255,0.22), rgba(255,255,255,0) 42%), linear-gradient(330deg, rgba(0,0,0,0.3), rgba(0,0,0,0) 55%)' }} />
      {dim && <div style={{ position: 'absolute', inset: 0, background: 'rgba(20,12,8,0.30)' }} />}

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Monogram v={v} size={38} radius={11} />
        <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase',
          padding: '4px 9px', borderRadius: 999, background: 'rgba(255,255,255,0.2)' }}>Gift card</div>
      </div>

      <div style={{ position: 'relative', marginTop: 11 }}>
        <div style={{ fontFamily: 'var(--va-head)', fontWeight: 800, fontSize: 20, lineHeight: 1.08,
          letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>{v.brand}</div>
        <div style={{ fontSize: 9.5, letterSpacing: '0.16em', opacity: 0.82, marginTop: 4 }}>{v.tag}</div>
      </div>

      <div style={{ position: 'relative', marginTop: 'auto', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase', opacity: 0.8 }}>Balance</div>
          <div style={{ fontFamily: 'var(--va-head)', fontWeight: 800, fontSize: 38, lineHeight: 1, marginTop: 4,
            fontVariantNumeric: 'tabular-nums' }}>{window.VA.money(v.balance)}</div>
        </div>
        {fam && <Avatar member={fam} size={26} />}
      </div>

      <div style={{ position: 'relative', marginTop: 13, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 12, letterSpacing: '0.18em', opacity: 0.78 }}>
          •••• {v.code.replace(/\s/g, '').slice(-4)}
        </span>
        {v.loyalty && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700,
            padding: '4px 9px', borderRadius: 999, background: 'rgba(255,255,255,0.2)', fontFamily: 'var(--va-head)' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />{v.loyaltyScheme}
          </span>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { Logo, LogoMark, Monogram, QRCode, Barcode, Avatar, VoucherCard });
