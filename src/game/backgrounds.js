import { CAP, RULES } from './config.js';

const CYCLE = ['jungle', 'forest', 'desert'];

export function themeName(state) {
  if (RULES.boardBg !== 'auto') return RULES.boardBg;
  if (state.mode === 'endless') return 'jungle';
  if (state.mode === 'daily') return 'desert';
  return CYCLE[((state.level || 1) - 1) % CYCLE.length];
}

const hidden = { display: 'none' };
const fill = { position: 'absolute', inset: '0', pointerEvents: 'none' };

function danger(mode, live) {
  if (mode !== 'endless') return hidden;
  return {
    display: 'block',
    height: `${Math.min(100, live / CAP * 100)}%`
  };
}

export function boardLayers(theme, { mode, live }) {
  const wash = danger(mode, live);
  if (theme === 'none') return { name: '', labelColor: 'transparent', base: hidden, glow: hidden, floor: hidden, danger: wash };
  if (theme === 'jungle') {
    return {
      name: 'JUNGLE',
      labelColor: 'rgba(10,60,30,.45)',
      danger: wash,
      base: { ...fill, background: 'linear-gradient(180deg, #bff3c8 0%, #7fdc9a 45%, #3fae6a 100%)' },
      glow: { ...fill, background: [
        'radial-gradient(ellipse 140px 90px at 0% 0%, #1f8a4c 98%, transparent 100%)',
        'radial-gradient(ellipse 120px 70px at 18% -2%, #2fa35d 98%, transparent 100%)',
        'radial-gradient(ellipse 150px 90px at 100% 0%, #1f8a4c 98%, transparent 100%)',
        'radial-gradient(ellipse 110px 60px at 80% -2%, #2fa35d 98%, transparent 100%)',
        'linear-gradient(90deg, transparent 0 11.8%, #2a8f52 11.8% 12.4%, transparent 12.4%) 0 0 / 100% 46% no-repeat',
        'linear-gradient(90deg, transparent 0 31.7%, #2a8f52 31.7% 32.2%, transparent 32.2%) 0 0 / 100% 30% no-repeat',
        'linear-gradient(90deg, transparent 0 71.6%, #2a8f52 71.6% 72.1%, transparent 72.1%) 0 0 / 100% 38% no-repeat',
        'linear-gradient(90deg, transparent 0 88.6%, #2a8f52 88.6% 89.2%, transparent 89.2%) 0 0 / 100% 24% no-repeat'
      ].join(', ') },
      floor: { ...fill, background: [
        'radial-gradient(ellipse 160px 110px at 6% 100%, #157a3f 98%, transparent 100%)',
        'radial-gradient(ellipse 200px 120px at 34% 104%, #1c8a48 98%, transparent 100%)',
        'radial-gradient(ellipse 180px 110px at 64% 102%, #157a3f 98%, transparent 100%)',
        'radial-gradient(ellipse 170px 130px at 96% 100%, #1c8a48 98%, transparent 100%)',
        'radial-gradient(ellipse 260px 160px at 20% 112%, #2fa35d 98%, transparent 100%)',
        'radial-gradient(ellipse 280px 160px at 82% 114%, #2fa35d 98%, transparent 100%)'
      ].join(', ') }
    };
  }
  if (theme === 'forest') {
    return {
      name: 'FOREST',
      labelColor: 'rgba(20,50,40,.45)',
      danger: wash,
      base: { ...fill, background: 'linear-gradient(180deg, #cdeffc 0%, #e8f7e2 55%, #b9e2a8 100%)' },
      glow: { ...fill, background: [
        'radial-gradient(circle 46px at 82% 18%, #ffe27a 98%, transparent 100%)',
        'radial-gradient(circle 70px at 82% 18%, rgba(255,226,122,.35) 98%, transparent 100%)',
        'radial-gradient(ellipse 60px 22px at 22% 16%, #fff 98%, transparent 100%)',
        'radial-gradient(ellipse 42px 18px at 28% 13%, #fff 98%, transparent 100%)',
        'radial-gradient(ellipse 54px 20px at 56% 24%, #fff 98%, transparent 100%)'
      ].join(', ') },
      floor: {
        position: 'absolute', left: '0', right: '0', bottom: '0', height: '62%', pointerEvents: 'none',
        background: [
          'linear-gradient(#4f9a5a, #4f9a5a) 0 100% / 100% 26px no-repeat',
          'conic-gradient(from 168deg at 50% 0%, #2f7d4a 0 24deg, transparent 0) 0 calc(100% - 20px) / 68px 160px repeat-x',
          'conic-gradient(from 169deg at 50% 0%, #4c9a62 0 22deg, transparent 0) 34px calc(100% - 40px) / 90px 230px repeat-x',
          'conic-gradient(from 170deg at 50% 0%, #8cc995 0 20deg, transparent 0) 12px calc(100% - 70px) / 110px 300px repeat-x'
        ].join(', ')
      }
    };
  }
  if (theme === 'desert') {
    return {
      name: 'DESERT',
      labelColor: 'rgba(110,50,10,.5)',
      danger: wash,
      base: { ...fill, background: 'linear-gradient(180deg, #ffe0a8 0%, #ffc98a 45%, #f7b46c 100%)' },
      glow: { ...fill, background: [
        'radial-gradient(circle 54px at 24% 22%, #fff3c4 98%, transparent 100%)',
        'radial-gradient(circle 84px at 24% 22%, rgba(255,243,196,.45) 98%, transparent 100%)',
        'linear-gradient(to bottom right, transparent 50%, #e0955a 50%) calc(100% - 260px) calc(100% - 90px) / 70px 84px no-repeat',
        'linear-gradient(to bottom left, transparent 50%, #c97c44 50%) calc(100% - 190px) calc(100% - 90px) / 70px 84px no-repeat',
        'linear-gradient(to bottom right, transparent 50%, #eaa76c 50%) calc(100% - 140px) calc(100% - 100px) / 40px 48px no-repeat',
        'linear-gradient(to bottom left, transparent 50%, #d48a52 50%) calc(100% - 100px) calc(100% - 100px) / 40px 48px no-repeat'
      ].join(', ') },
      floor: { ...fill, background: [
        'linear-gradient(#4f9a5a, #4f9a5a) 80px calc(100% - 30px) / 16px 100px no-repeat',
        'linear-gradient(#4f9a5a, #4f9a5a) 62px calc(100% - 72px) / 20px 10px no-repeat',
        'linear-gradient(#4f9a5a, #4f9a5a) 58px calc(100% - 72px) / 10px 36px no-repeat',
        'linear-gradient(#4f9a5a, #4f9a5a) 94px calc(100% - 56px) / 20px 10px no-repeat',
        'linear-gradient(#4f9a5a, #4f9a5a) 106px calc(100% - 56px) / 10px 30px no-repeat',
        'linear-gradient(#4f9a5a, #4f9a5a) 200px calc(100% - 26px) / 12px 56px no-repeat',
        'linear-gradient(#4f9a5a, #4f9a5a) 190px calc(100% - 50px) / 12px 8px no-repeat',
        'linear-gradient(#4f9a5a, #4f9a5a) 186px calc(100% - 50px) / 8px 22px no-repeat',
        'radial-gradient(ellipse 340px 120px at 20% 100%, #e8a35e 98%, transparent 100%)',
        'radial-gradient(ellipse 380px 140px at 78% 104%, #f0b06a 98%, transparent 100%)',
        'radial-gradient(ellipse 520px 160px at 40% 118%, #d98f4f 98%, transparent 100%)'
      ].join(', ') }
    };
  }
  if (theme === 'starfield') {
    return {
      name: 'DEEP SPACE',
      labelColor: 'rgba(255,255,255,.22)',
      danger: wash,
      base: { ...fill, background: 'radial-gradient(ellipse at 20% 25%, rgba(25,227,255,.22), transparent 55%), radial-gradient(ellipse at 85% 80%, rgba(255,46,136,.25), transparent 55%), #08071a' },
      glow: { ...fill, backgroundImage: 'radial-gradient(1.5px 1.5px at 20px 30px, #fff, transparent), radial-gradient(1px 1px at 90px 120px, #cfe, transparent), radial-gradient(2px 2px at 160px 60px, #fff, transparent), radial-gradient(1px 1px at 230px 170px, #fce, transparent)', backgroundSize: '260px 200px', opacity: '0.85' },
      floor: { position: 'absolute', right: '-80px', bottom: '-90px', width: '300px', height: '300px', borderRadius: '50%', pointerEvents: 'none', background: 'radial-gradient(circle at 35% 30%, #7ff1ff, #2c6f86 45%, #0b2d3e 75%)', opacity: '0.6' }
    };
  }
  return {
    name: 'SUNSET GRID',
    labelColor: 'rgba(255,255,255,.22)',
    danger: wash,
    base: { ...fill, background: 'linear-gradient(180deg, #0d0a26 0%, #24104a 48%, #4a1350 72%, #12091f 100%)' },
    glow: { position: 'absolute', left: '50%', top: '30%', width: '300px', height: '300px', marginLeft: '-150px', borderRadius: '50%', pointerEvents: 'none', background: 'linear-gradient(180deg, #ffd166 0%, #ff7a59 45%, #ff2e88 100%)', opacity: '0.55' },
    floor: { position: 'absolute', left: '-50%', right: '-50%', bottom: '0', height: '52%', pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(255,46,136,.55) 2px, transparent 2px), linear-gradient(90deg, rgba(255,46,136,.45) 2px, transparent 2px)', backgroundSize: '56px 56px', transform: 'perspective(420px) rotateX(62deg)', transformOrigin: '50% 100%', WebkitMaskImage: 'linear-gradient(0deg, #000 30%, transparent 100%)', maskImage: 'linear-gradient(0deg, #000 30%, transparent 100%)' }
  };
}
