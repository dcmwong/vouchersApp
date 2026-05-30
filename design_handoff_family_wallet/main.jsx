/* main.jsx — single full-screen Family Wallet (Direction B), tweakable theme. */

const FONTS = {
  nunito:    { head: "'Nunito', sans-serif",            body: "'Nunito', sans-serif" },
  jakarta:   { head: "'Plus Jakarta Sans', sans-serif", body: "'Plus Jakarta Sans', sans-serif" },
  hanken:    { head: "'Hanken Grotesk', sans-serif",    body: "'Hanken Grotesk', sans-serif" },
  quicksand: { head: "'Quicksand', sans-serif",         body: "'Nunito', sans-serif" },
};

const PALETTES = [
  ['#2C6FE0', '#17A06A', '#F6F1E7'], // Coast — blue + green
  ['#C2683F', '#2F8A82', '#F8F2E8'], // Harvest — terracotta + teal
  ['#8A4FB0', '#D9568A', '#F8F1F4'], // Berry — plum + rose
  ['#2E7D54', '#CC8A2B', '#F2F2E7'], // Forest — green + amber
];

function themeVars(pal, fonts) {
  const [a, b, bg] = pal;
  return {
    '--va-accent': a, '--va-accent2': b,
    '--va-bg': bg, '--va-surface': '#ffffff',
    '--va-ink': '#2a211b', '--va-soft': 'rgba(42,33,27,0.55)',
    '--va-line': 'rgba(42,33,27,0.13)', '--va-chip': 'rgba(42,33,27,0.065)',
    '--va-head': fonts.head, '--va-body': fonts.body,
  };
}

// Scale the fixed 402×874 device to fit the viewport.
function useFit(w, h) {
  const [scale, setScale] = React.useState(1);
  React.useEffect(() => {
    const fit = () => setScale(Math.min(1, (window.innerHeight - 36) / h, (window.innerWidth - 36) / w));
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [w, h]);
  return scale;
}

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": ["#2C6FE0", "#17A06A", "#F6F1E7"],
  "font": "nunito"
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const fonts = FONTS[t.font] || FONTS.nunito;
  const pal = t.palette || PALETTES[0];
  const W = 402, H = 874;
  const scale = useFit(W, H);

  return (
    <React.Fragment>
      <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#ece8e1', overflow: 'hidden' }}>
        <div style={{ ...themeVars(pal, fonts), width: W, height: H, transform: `scale(${scale})`, flexShrink: 0 }}>
          <IOSDevice width={W} height={H}>
            <VoucherApp />
          </IOSDevice>
        </div>
      </div>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Theme" />
        <TweakColor label="Palette" value={pal} options={PALETTES} onChange={(v) => setTweak('palette', v)} />
        <TweakSection label="Type" />
        <TweakRadio label="Font" value={t.font}
          options={[
            { value: 'nunito', label: 'Nunito' },
            { value: 'jakarta', label: 'Jakarta' },
            { value: 'hanken', label: 'Hanken' },
            { value: 'quicksand', label: 'Quicksand' },
          ]}
          onChange={(v) => setTweak('font', v)} />
        <div style={{ fontSize: 10.5, color: 'rgba(41,38,27,0.5)', lineHeight: 1.5, paddingTop: 4 }}>
          Brand cards keep their own colours — the palette drives buttons, the logo, and accents.
        </div>
      </TweaksPanel>
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
