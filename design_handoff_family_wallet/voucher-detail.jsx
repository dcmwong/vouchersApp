/* voucher-detail.jsx — full-screen Redeem (with loyalty toggle), Add-a-voucher, Hidden view. */

function useReveal() {
  const [on, setOn] = React.useState(false);
  React.useEffect(() => {
    let a = requestAnimationFrame(() => { a = requestAnimationFrame(() => setOn(true)); });
    return () => cancelAnimationFrame(a);
  }, []);
  return on;
}

const fullStyle = (reveal) => ({
  position: 'absolute', inset: 0, zIndex: 40, background: 'var(--va-bg)',
  display: 'flex', flexDirection: 'column', overflowY: 'auto',
  transform: `translateY(${reveal ? 0 : 14}px)`, opacity: reveal ? 1 : 0.999,
  transition: 'transform .34s cubic-bezier(.2,.85,.25,1)',
});

function BackBtn({ onClick, label = 'Wallet' }) {
  return (
    <button onClick={onClick} style={{ appearance: 'none', border: 'none', background: 'rgba(255,255,255,0.18)',
      color: '#fff', borderRadius: 999, height: 38, padding: '0 16px 0 11px', cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--va-head)', fontWeight: 700, fontSize: 14,
      backdropFilter: 'blur(6px)' }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 6l-6 6 6 6" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
      {label}
    </button>
  );
}

function actBtn(kind) {
  const base = { flex: 1, appearance: 'none', cursor: 'pointer', borderRadius: 14, padding: '15px 0',
    fontFamily: 'var(--va-head)', fontWeight: 700, fontSize: 15.5, WebkitTapHighlightColor: 'transparent' };
  if (kind === 'primary') return { ...base, border: 'none', background: 'var(--va-accent)', color: '#fff' };
  if (kind === 'danger') return { ...base, border: '1.5px solid rgba(180,69,47,0.35)', background: 'transparent', color: '#b4452f' };
  return { ...base, border: '1.5px solid var(--va-line)', background: 'var(--va-surface)', color: 'var(--va-ink)' };
}

// ── Full-screen redeem ─────────────────────────────────────────
function RedeemFull({ v, showLoyalty, setShowLoyalty, editing, draft, setDraft, bump,
  beginEdit, saveEdit, cancelEdit, onClose, onHide }) {
  const reveal = useReveal();
  const fam = window.VA.FAMILY.find((f) => f.id === v.owner);
  const onLoyalty = showLoyalty && v.loyalty;
  const code = onLoyalty ? v.loyalty.code : v.code;

  return (
    <div style={fullStyle(reveal)}>
      {editing && <AmountEditor v={v} draft={draft} setDraft={setDraft} bump={bump} onSave={saveEdit} onCancel={cancelEdit} />}

      {/* hero */}
      <div style={{ background: v.color, color: '#fff', padding: '56px 22px 26px', borderRadius: '0 0 30px 30px',
        position: 'relative', flexShrink: 0 }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: '0 0 30px 30px',
          background: 'linear-gradient(160deg, rgba(255,255,255,0.16), rgba(255,255,255,0) 45%)' }} />
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <BackBtn onClick={onClose} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, opacity: 0.9 }}>{fam && fam.id !== 'all' ? fam.name + "’s" : 'Shared'}</span>
            {fam && <Avatar member={fam} size={28} />}
          </div>
        </div>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 13, marginTop: 22 }}>
          <Monogram v={v} size={48} radius={14} />
          <div>
            <div style={{ fontFamily: 'var(--va-head)', fontWeight: 800, fontSize: 24, lineHeight: 1.05 }}>{v.brand}</div>
            <div style={{ fontSize: 11, letterSpacing: '0.14em', opacity: 0.85, marginTop: 3 }}>
              {onLoyalty ? (v.loyaltyScheme || '').toUpperCase() : 'GIFT CARD'}
            </div>
          </div>
        </div>
        <div style={{ position: 'relative', marginTop: 18 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', opacity: 0.8 }}>
            {onLoyalty ? 'Points' : 'Balance'}
          </div>
          <div style={{ fontFamily: 'var(--va-head)', fontWeight: 800, fontSize: 46, lineHeight: 1, marginTop: 3,
            fontVariantNumeric: 'tabular-nums' }}>
            {onLoyalty ? v.loyalty.points.toLocaleString() + ' pts' : window.VA.money(v.balance)}
          </div>
        </div>
      </div>

      {/* loyalty toggle — the show/hide switch between gift card & loyalty card */}
      {v.loyalty && (
        <div style={{ padding: '18px 22px 0' }}>
          <div style={{ display: 'flex', padding: 4, borderRadius: 13, background: 'var(--va-chip)', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 4, bottom: 4, left: showLoyalty ? '50%' : 4,
              width: 'calc(50% - 4px)', borderRadius: 10, background: 'var(--va-surface)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.12)', transition: 'left .22s cubic-bezier(.3,.8,.3,1)' }} />
            {[{ k: false, label: 'Gift card' }, { k: true, label: v.loyaltyScheme }].map((o) => (
              <button key={String(o.k)} onClick={() => setShowLoyalty(o.k)} style={{ position: 'relative', zIndex: 1,
                flex: 1, appearance: 'none', border: 'none', background: 'transparent', cursor: 'pointer',
                padding: '10px 0', fontFamily: 'var(--va-head)', fontWeight: 700, fontSize: 14,
                color: (showLoyalty === o.k) ? 'var(--va-ink)' : 'var(--va-soft)' }}>{o.label}</button>
            ))}
          </div>
        </div>
      )}

      {/* code panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: '24px 22px 14px', gap: 0 }}>
        <QRCode value={code} size={184} />
        <div style={{ fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--va-soft)',
          fontWeight: 700, margin: '20px 0 14px' }}>Scan at checkout</div>
        <Barcode value={code} height={64} />
      </div>

      {/* actions */}
      <div style={{ padding: '6px 22px calc(30px + env(safe-area-inset-bottom))', display: 'flex', gap: 10, flexShrink: 0 }}>
        {!onLoyalty && <button onClick={beginEdit} style={actBtn('ghost')}>Update balance</button>}
        <button onClick={onHide} style={actBtn(onLoyalty ? 'ghost' : 'danger')}>Hide card</button>
      </div>
    </div>
  );
}

// ── Amount editor (centered modal) ─────────────────────────────
function AmountEditor({ v, draft, setDraft, bump, onSave, onCancel }) {
  return (
    <div onClick={onCancel} style={{ position: 'absolute', inset: 0, zIndex: 80, display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: 22, background: 'rgba(20,12,8,0.5)' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 320, background: 'var(--va-surface)',
        borderRadius: 24, padding: 24, boxShadow: '0 24px 60px rgba(0,0,0,0.35)' }}>
        <div style={{ fontFamily: 'var(--va-head)', fontWeight: 800, fontSize: 19, textAlign: 'center' }}>Update balance</div>
        <div style={{ fontSize: 13, color: 'var(--va-soft)', textAlign: 'center', marginTop: 3 }}>{v.brand} gift card</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, margin: '20px 0 6px' }}>
          <span style={{ fontFamily: 'var(--va-head)', fontSize: 28, fontWeight: 700, color: 'var(--va-soft)' }}>£</span>
          <input value={draft} onChange={(e) => setDraft(e.target.value.replace(/[^0-9.]/g, ''))} inputMode="decimal"
            style={{ width: 150, border: 'none', outline: 'none', background: 'transparent', textAlign: 'center',
              fontFamily: 'var(--va-head)', fontWeight: 800, fontSize: 46, color: 'var(--va-ink)', fontVariantNumeric: 'tabular-nums' }} />
        </div>
        <div style={{ display: 'flex', gap: 7, justifyContent: 'center', marginTop: 8 }}>
          {[-5, -1, 1, 5, 10].map((s) => (
            <button key={s} onClick={() => bump(s)} style={{ appearance: 'none', cursor: 'pointer', border: 'none',
              borderRadius: 11, padding: '9px 0', flex: 1, background: 'var(--va-chip)', color: 'var(--va-ink)',
              fontFamily: 'var(--va-head)', fontWeight: 700, fontSize: 13.5 }}>{s > 0 ? '+' : ''}{s}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
          <button onClick={onCancel} style={actBtn('ghost')}>Cancel</button>
          <button onClick={onSave} style={actBtn('primary')}>Save</button>
        </div>
      </div>
    </div>
  );
}

// ── Add a voucher ──────────────────────────────────────────────
function AddVoucher({ onClose, onAdd }) {
  const reveal = useReveal();
  const VA = window.VA;
  const [brandKey, setBrandKey] = React.useState(null);
  const [amount, setAmount] = React.useState('');
  const [code, setCode] = React.useState('');
  const [owner, setOwner] = React.useState('all');
  const [addLoyalty, setAddLoyalty] = React.useState(false);
  const [loyaltyCode, setLoyaltyCode] = React.useState('');
  const brand = brandKey ? VA.brandOf(brandKey) : null;
  const valid = brandKey && parseFloat(amount) > 0;

  const field = { width: '100%', boxSizing: 'border-box', height: 50, borderRadius: 13, padding: '0 15px',
    border: '1.5px solid var(--va-line)', background: 'var(--va-surface)', color: 'var(--va-ink)',
    fontFamily: 'var(--va-body)', fontSize: 16, outline: 'none' };
  const lbl = { fontSize: 12.5, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
    color: 'var(--va-soft)', margin: '0 0 9px', fontFamily: 'var(--va-head)' };

  return (
    <div style={{ ...fullStyle(reveal), background: 'var(--va-bg)' }}>
      <div style={{ padding: '56px 22px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <button onClick={onClose} style={{ appearance: 'none', border: 'none', background: 'transparent', cursor: 'pointer',
          fontFamily: 'var(--va-head)', fontWeight: 700, fontSize: 15, color: 'var(--va-soft)' }}>Cancel</button>
        <div style={{ fontFamily: 'var(--va-head)', fontWeight: 800, fontSize: 18, whiteSpace: 'nowrap' }}>Add a voucher</div>
        <div style={{ width: 48 }} />
      </div>

      <div style={{ padding: '8px 22px 0', display: 'flex', flexDirection: 'column', gap: 22 }}>
        <div>
          <div style={lbl}>Choose a brand</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 9 }}>
            {VA.BRANDS.map((b) => {
              const on = b.key === brandKey;
              return (
                <button key={b.key} onClick={() => setBrandKey(b.key)} style={{ appearance: 'none', cursor: 'pointer',
                  borderRadius: 14, padding: '12px 6px', border: on ? '2px solid var(--va-ink)' : '1.5px solid var(--va-line)',
                  background: 'var(--va-surface)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: b.color, color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--va-head)', fontWeight: 800, fontSize: 17 }}>{b.brand[0]}</div>
                  <span style={{ fontSize: 11.5, fontWeight: 700, fontFamily: 'var(--va-head)', color: 'var(--va-ink)',
                    textAlign: 'center', lineHeight: 1.1 }}>{b.brand}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={lbl}>Amount (£)</div>
            <input value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
              inputMode="decimal" placeholder="0.00" style={field} />
          </div>
          <div style={{ flex: 1.4 }}>
            <div style={lbl}>Card number</div>
            <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="0000 0000 0000" style={field} />
          </div>
        </div>

        <div>
          <div style={lbl}>Shared with</div>
          <div style={{ display: 'flex', gap: 9 }}>
            {VA.FAMILY.map((f) => {
              const on = f.id === owner;
              return (
                <button key={f.id} onClick={() => setOwner(f.id)} style={{ appearance: 'none', cursor: 'pointer',
                  flex: 1, borderRadius: 13, padding: '11px 4px', border: on ? '2px solid var(--va-ink)' : '1.5px solid var(--va-line)',
                  background: 'var(--va-surface)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}>
                  <Avatar member={f} size={30} />
                  <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--va-head)', color: 'var(--va-ink)' }}>{f.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {brand && brand.loyaltyScheme && (
          <div>
            <div onClick={() => setAddLoyalty((x) => !x)} style={{ display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', cursor: 'pointer' }}>
              <div>
                <div style={{ fontFamily: 'var(--va-head)', fontWeight: 700, fontSize: 15 }}>Add {brand.loyaltyScheme}</div>
                <div style={{ fontSize: 12.5, color: 'var(--va-soft)', marginTop: 2 }}>Keep the loyalty card with this voucher</div>
              </div>
              <span style={{ width: 46, height: 28, borderRadius: 999, background: addLoyalty ? 'var(--va-accent)' : 'var(--va-line)',
                position: 'relative', transition: 'background .2s', flexShrink: 0 }}>
                <span style={{ position: 'absolute', top: 3, left: addLoyalty ? 21 : 3, width: 22, height: 22, borderRadius: '50%',
                  background: '#fff', transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,0.25)' }} />
              </span>
            </div>
            {addLoyalty && (
              <input value={loyaltyCode} onChange={(e) => setLoyaltyCode(e.target.value)}
                placeholder={brand.loyaltyScheme + ' number'} style={{ ...field, marginTop: 12 }} />
            )}
          </div>
        )}
      </div>

      <div style={{ padding: '22px 22px calc(30px + env(safe-area-inset-bottom))', marginTop: 'auto', flexShrink: 0 }}>
        <button disabled={!valid} onClick={() => onAdd({ brandKey, amount, code, owner, addLoyalty, loyaltyCode })}
          style={{ ...actBtn('primary'), width: '100%', opacity: valid ? 1 : 0.4, cursor: valid ? 'pointer' : 'default' }}>
          Add to wallet
        </button>
      </div>
    </div>
  );
}

// ── Hidden cards ───────────────────────────────────────────────
function HiddenView({ hidden, onClose, onRestore }) {
  const reveal = useReveal();
  return (
    <div style={fullStyle(reveal)}>
      <div style={{ padding: '56px 22px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <button onClick={onClose} style={{ appearance: 'none', border: 'none', background: 'transparent', cursor: 'pointer',
          fontFamily: 'var(--va-head)', fontWeight: 700, fontSize: 15, color: 'var(--va-soft)' }}>Done</button>
        <div style={{ fontFamily: 'var(--va-head)', fontWeight: 800, fontSize: 18, whiteSpace: 'nowrap' }}>Hidden cards</div>
        <div style={{ width: 48 }} />
      </div>
      <div style={{ padding: '6px 22px 16px', fontSize: 13.5, color: 'var(--va-soft)' }}>
        These don’t show in the carousel. Restore any to bring it back.
      </div>
      <div style={{ padding: '0 22px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {hidden.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--va-soft)', padding: '36px 0', fontSize: 14 }}>Nothing hidden.</div>
        )}
        {hidden.map((v) => (
          <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: 12, borderRadius: 16, background: 'var(--va-chip)' }}>
            <Monogram v={v} size={42} radius={11} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--va-head)', fontWeight: 700, fontSize: 15 }}>{v.brand}</div>
              <div style={{ fontSize: 12.5, color: 'var(--va-soft)' }}>{window.VA.money(v.balance)}</div>
            </div>
            <button onClick={() => onRestore(v.id)} style={{ appearance: 'none', cursor: 'pointer', border: 'none',
              borderRadius: 999, padding: '9px 16px', background: 'var(--va-accent)', color: '#fff',
              fontFamily: 'var(--va-head)', fontWeight: 700, fontSize: 13.5 }}>Restore</button>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { RedeemFull, AmountEditor, AddVoucher, HiddenView });
