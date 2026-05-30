/* voucher-app.jsx — VoucherApp: header, coverflow carousel, navigation to full-screen views. */

const VA_CHEV = (d, c) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d={d} stroke={c} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function RoundBtn({ children, onClick, accent, badge }) {
  return (
    <button onClick={(e) => { e.stopPropagation(); onClick(); }} style={{
      position: 'relative', width: 42, height: 42, borderRadius: '50%', cursor: 'pointer',
      border: accent ? 'none' : '1.5px solid var(--va-line)',
      background: accent ? 'var(--va-accent)' : 'var(--va-surface)',
      color: accent ? '#fff' : 'var(--va-ink)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: accent ? '0 6px 16px -4px var(--va-accent)' : '0 1px 3px rgba(0,0,0,0.06)',
      WebkitTapHighlightColor: 'transparent',
    }}>
      {children}
      {badge > 0 && (
        <span style={{ position: 'absolute', top: -2, right: -2, minWidth: 18, height: 18, padding: '0 5px',
          borderRadius: 999, background: 'var(--va-ink)', color: 'var(--va-bg)', fontSize: 11, fontWeight: 800,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--va-head)',
          border: '2px solid var(--va-bg)' }}>{badge}</span>
      )}
    </button>
  );
}

function VoucherApp() {
  const VA = window.VA;
  const [vouchers, setVouchers] = React.useState(() => VA.VOUCHERS.map((v) => VA.hydrate(v)));
  const [index, setIndex] = React.useState(0);
  const [openId, setOpenId] = React.useState(null);
  const [addOpen, setAddOpen] = React.useState(false);
  const [accountOpen, setAccountOpen] = React.useState(false);
  const [hiddenOpen, setHiddenOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState('');
  const [showLoyalty, setShowLoyalty] = React.useState(false);
  const [toast, setToast] = React.useState(null);
  const toastTimer = React.useRef(null);

  const active = vouchers.filter((v) => v.active);
  const hidden = vouchers.filter((v) => !v.active);
  const CW = 214, CH = 314;

  React.useEffect(() => { if (index > active.length - 1) setIndex(Math.max(0, active.length - 1)); }, [active.length]); // eslint-disable-line

  const showToast = (msg, undo) => {
    clearTimeout(toastTimer.current);
    setToast({ msg, undo });
    toastTimer.current = setTimeout(() => setToast(null), 4200);
  };
  const go = (dir) => setIndex((i) => Math.max(0, Math.min(active.length - 1, i + dir)));

  const drag = React.useRef(null);
  const onDown = (e) => { e.stopPropagation(); drag.current = { x: e.clientX }; };
  const onUp = (e) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.x;
    if (dx > 42) go(-1); else if (dx < -42) go(1);
    drag.current = null;
  };

  const openCard = (v) => { setOpenId(v.id); setShowLoyalty(false); setEditing(false); };
  const closeRedeem = () => { setOpenId(null); setEditing(false); setShowLoyalty(false); };
  const current = vouchers.find((v) => v.id === openId);

  const beginEdit = () => { setDraft((current.balance / 100).toFixed(2)); setEditing(true); };
  const bump = (amt) => setDraft((d) => Math.max(0, (parseFloat(d || '0') || 0) + amt).toFixed(2));
  const saveEdit = () => {
    const n = parseFloat(draft || '0') || 0;
    setVouchers((vs) => vs.map((v) => v.id === openId ? { ...v, balance: Math.round(n * 100) } : v));
    setEditing(false); showToast('Balance updated');
  };

  const hideCard = (id) => {
    setVouchers((vs) => vs.map((v) => v.id === id ? { ...v, active: false } : v));
    closeRedeem();
    setIndex((i) => Math.max(0, Math.min(i, active.length - 2)));
    showToast('Hidden from your wallet', () => restore(id));
  };
  const restore = (id) => { setVouchers((vs) => vs.map((v) => v.id === id ? { ...v, active: true } : v)); setToast(null); };

  const addVoucher = (data) => {
    const brand = VA.brandOf(data.brandKey);
    const nv = VA.hydrate({
      id: 'n' + Date.now(), brandKey: data.brandKey,
      balance: Math.round((parseFloat(data.amount || '0') || 0) * 100),
      code: data.code || '0000 0000 0000 0000', owner: data.owner, active: true,
      loyalty: data.addLoyalty && brand.loyaltyScheme ? { code: data.loyaltyCode || '0000 0000 0000', points: 0 } : null,
    });
    setVouchers((vs) => [nv, ...vs]);
    setIndex(0); setAddOpen(false);
    showToast(brand.brand + ' added');
  };

  return (
    <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column',
      background: 'var(--va-bg)', color: 'var(--va-ink)', overflow: 'hidden', fontFamily: 'var(--va-body)',
      isolation: 'isolate' }}>

      {/* ── Header ── */}
      <div style={{ padding: '58px 20px 4px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Logo size={27} />
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <RoundBtn onClick={() => setHiddenOpen(true)} badge={hidden.length}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="8.4" stroke="currentColor" strokeWidth="2" />
              </svg>
            </RoundBtn>
            <ProfileBtn onClick={() => setAccountOpen(true)} />
          </div>
        </div>
        <div style={{ fontSize: 13.5, color: 'var(--va-soft)', marginTop: 12, fontWeight: 500 }}>
          {active.length} card{active.length !== 1 ? 's' : ''} · shared with the family
        </div>
      </div>

      {/* ── Carousel ── */}
      <div onPointerDown={onDown} onPointerUp={onUp}
        style={{ flex: 1, position: 'relative', perspective: 1100, minHeight: 0,
          display: 'flex', flexDirection: 'column', justifyContent: 'center', touchAction: 'pan-y' }}>
        {active.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--va-soft)', padding: 24 }}>
            <div style={{ fontFamily: 'var(--va-head)', fontWeight: 800, fontSize: 18, color: 'var(--va-ink)' }}>Wallet empty</div>
            <div style={{ fontSize: 14, marginTop: 6 }}>Tap + to add a voucher.</div>
          </div>
        ) : (
          <div style={{ position: 'relative', height: CH + 40, transformStyle: 'preserve-3d' }}>
            {active.map((v, i) => {
              const off = i - index, ab = Math.abs(off);
              if (ab > 2) return null;
              return (
                <div key={v.id} onClick={() => off === 0 ? openCard(v) : setIndex(i)}
                  style={{ position: 'absolute', left: '50%', top: 20, width: CW, height: CH, marginLeft: -CW / 2,
                    cursor: 'pointer', zIndex: 10 - ab, opacity: ab > 1 ? 0.5 : 1,
                    transform: `translateX(${off * 56}%) translateZ(${off === 0 ? 0 : -120}px) rotateY(${off * -20}deg) scale(${1 - ab * 0.08})`,
                    transition: 'transform .42s cubic-bezier(.2,.8,.25,1), opacity .42s' }}>
                  <VoucherCard v={v} dim={off !== 0} elevated={off === 0} />
                </div>
              );
            })}
            {active.length > 1 && (
              <React.Fragment>
                <NavArrow side="left" show={index > 0} onClick={() => go(-1)} cw={CW} />
                <NavArrow side="right" show={index < active.length - 1} onClick={() => go(1)} cw={CW} />
              </React.Fragment>
            )}
          </div>
        )}

        {active.length > 0 && (
          <div style={{ padding: '18px 22px 0', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--va-head)', fontWeight: 800, fontSize: 18 }}>{active[index]?.brand}</div>
            <div style={{ fontSize: 13, color: 'var(--va-soft)', marginTop: 2 }}>
              Tap to redeem · {VA.money(active[index]?.balance || 0)}
            </div>
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 14 }}>
              {active.map((v, i) => (
                <span key={v.id} onClick={() => setIndex(i)} style={{ width: i === index ? 22 : 7, height: 7,
                  borderRadius: 999, cursor: 'pointer', background: i === index ? 'var(--va-accent)' : 'var(--va-line)',
                  transition: 'all .3s' }} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Floating add button ── */}
      {!current && !addOpen && !hiddenOpen && (
        <button onClick={() => setAddOpen(true)} aria-label="Add a voucher" style={{
          position: 'absolute', right: 18, bottom: 'calc(30px + env(safe-area-inset-bottom))', zIndex: 30,
          width: 58, height: 58, borderRadius: '50%', border: 'none', cursor: 'pointer',
          background: 'var(--va-accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 12px 26px -6px var(--va-accent), 0 3px 8px rgba(0,0,0,0.22)', WebkitTapHighlightColor: 'transparent' }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" />
          </svg>
        </button>
      )}

      {/* ── Account menu ── */}
      {accountOpen && <AccountMenu hiddenCount={hidden.length}
        onHidden={() => { setAccountOpen(false); setHiddenOpen(true); }}
        onClose={() => setAccountOpen(false)} />}

      {/* ── Full-screen views ── */}
      {current && (
        <RedeemFull v={current} showLoyalty={showLoyalty} setShowLoyalty={setShowLoyalty}
          editing={editing} draft={draft} setDraft={setDraft} bump={bump}
          beginEdit={beginEdit} saveEdit={saveEdit} cancelEdit={() => setEditing(false)}
          onClose={closeRedeem} onHide={() => hideCard(current.id)} />
      )}
      {addOpen && <AddVoucher onClose={() => setAddOpen(false)} onAdd={addVoucher} />}
      {hiddenOpen && <HiddenView hidden={hidden} onClose={() => setHiddenOpen(false)} onRestore={restore} />}

      {/* ── Toast ── */}
      {toast && (
        <div style={{ position: 'absolute', left: 16, right: 16, bottom: 40, zIndex: 90,
          background: 'var(--va-ink)', color: 'var(--va-bg)', borderRadius: 14, padding: '13px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 12px 30px rgba(0,0,0,0.28)', fontSize: 14, fontWeight: 600 }}>
          <span>{toast.msg}</span>
          {toast.undo && <button onClick={toast.undo} style={{ border: 'none', background: 'transparent',
            cursor: 'pointer', color: 'var(--va-accent2)', fontFamily: 'var(--va-head)', fontWeight: 800, fontSize: 14 }}>Undo</button>}
        </div>
      )}
    </div>
  );
}

function NavArrow({ side, show, onClick, cw }) {
  return (
    <button onClick={(e) => { e.stopPropagation(); onClick(); }} style={{
      position: 'absolute', top: '50%', [side]: 6, transform: 'translateY(-50%)',
      width: 38, height: 38, borderRadius: '50%', cursor: 'pointer', zIndex: 20, border: 'none',
      background: 'var(--va-surface)', color: 'var(--va-ink)', boxShadow: '0 4px 14px rgba(0,0,0,0.14)',
      display: show ? 'flex' : 'none', alignItems: 'center', justifyContent: 'center', opacity: 0.96 }}>
      {VA_CHEV(side === 'left' ? 'M15 6l-6 6 6 6' : 'M9 6l6 6-6 6', 'var(--va-ink)')}
    </button>
  );
}

// ── Google-style profile avatar ────────────────────────────────
function ProfileBtn({ onClick }) {
  return (
    <button onClick={(e) => { e.stopPropagation(); onClick(); }} aria-label="Account" style={{
      position: 'relative', width: 42, height: 42, borderRadius: '50%', padding: 0, cursor: 'pointer',
      border: '2px solid var(--va-surface)', overflow: 'hidden', background: '#e7e4de',
      boxShadow: '0 1px 4px rgba(0,0,0,0.14), 0 0 0 1px var(--va-line)', WebkitTapHighlightColor: 'transparent' }}>
      <svg width="42" height="42" viewBox="0 0 42 42" style={{ display: 'block' }}>
        <defs>
          <linearGradient id="vaProfile" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#eceae4" /><stop offset="1" stopColor="#ddd9d1" />
          </linearGradient>
        </defs>
        <rect width="42" height="42" fill="url(#vaProfile)" />
        <circle cx="21" cy="16.5" r="7.4" fill="#a9aeb3" />
        <path d="M7.5 40c0.7-8.2 6.6-12.6 13.5-12.6S33.8 31.8 34.5 40z" fill="#a9aeb3" />
      </svg>
    </button>
  );
}

// ── Account menu (popover under the profile avatar) ─────────────
function AccountMenu({ hiddenCount, onHidden, onClose }) {
  const row = { display: 'flex', alignItems: 'center', gap: 12, width: '100%', appearance: 'none',
    border: 'none', background: 'transparent', cursor: 'pointer', padding: '11px 8px', borderRadius: 10,
    fontFamily: 'var(--va-body)', fontSize: 14.5, color: 'var(--va-ink)', textAlign: 'left' };
  const ico = (path) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, color: 'var(--va-soft)' }}>
      {path}
    </svg>
  );
  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 75 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', top: 104, right: 18, width: 248,
        background: 'var(--va-surface)', borderRadius: 18, padding: 8, transformOrigin: 'top right',
        boxShadow: '0 18px 50px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.05)', animation: 'va-menu .16s ease-out' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 8px 12px' }}>
          <svg width="44" height="44" viewBox="0 0 42 42" style={{ borderRadius: '50%', flexShrink: 0 }}>
            <rect width="42" height="42" fill="#eceae4" /><circle cx="21" cy="16.5" r="7.4" fill="#a9aeb3" />
            <path d="M7.5 40c0.7-8.2 6.6-12.6 13.5-12.6S33.8 31.8 34.5 40z" fill="#a9aeb3" />
          </svg>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--va-head)', fontWeight: 800, fontSize: 15 }}>The Family</div>
            <div style={{ fontSize: 12.5, color: 'var(--va-soft)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>family@wallet.app</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, padding: '0 8px 10px' }}>
          {window.VA.FAMILY.filter((f) => f.id !== 'all').map((f) => (
            <div key={f.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, flex: 1 }}>
              <Avatar member={f} size={32} />
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--va-soft)', fontFamily: 'var(--va-head)' }}>{f.name}</span>
            </div>
          ))}
        </div>
        <div style={{ height: 1, background: 'var(--va-line)', margin: '2px 6px 4px' }} />
        <button onClick={onHidden} style={row} onMouseOver={(e) => e.currentTarget.style.background = 'var(--va-chip)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
          {ico(<React.Fragment><path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="12" r="8.4" stroke="currentColor" strokeWidth="2" /></React.Fragment>)}
          <span style={{ flex: 1 }}>Hidden cards</span>
          {hiddenCount > 0 && <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--va-soft)' }}>{hiddenCount}</span>}
        </button>
        <button style={row} onMouseOver={(e) => e.currentTarget.style.background = 'var(--va-chip)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
          {ico(<React.Fragment><path d="M16 18v-1a4 4 0 00-4-4H7a4 4 0 00-4 4v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><circle cx="9.5" cy="7" r="3.2" stroke="currentColor" strokeWidth="2" /><path d="M19 8v6M22 11h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></React.Fragment>)}
          <span style={{ flex: 1 }}>Invite family</span>
        </button>
        <button style={{ ...row, color: 'var(--va-soft)' }} onMouseOver={(e) => e.currentTarget.style.background = 'var(--va-chip)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
          {ico(<React.Fragment><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></React.Fragment>)}
          <span style={{ flex: 1 }}>Sign out</span>
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { VoucherApp });