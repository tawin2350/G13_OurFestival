# G13_OurFestival
/* Reset-ish */
* { box-sizing: border-box; margin: 0; padding: 0; }
html,body,#root { height: 100%; }
body {
  font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
  background: #e6e6e6;
  color: #eaeef0;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* page frame to mimic rounded dark container */
.page-wrap {
  max-width: 1200px;
  margin: 32px auto;
  border-radius: 28px;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(10,12,14,1), rgba(16,18,20,1));
  box-shadow: 0 8px 30px rgba(6,8,10,0.25);
}

/* header */
.site-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 28px;
  gap: 16px;
}
.logo {
  font-weight: 700;
  letter-spacing: 1px;
  color: #fff;
  background: linear-gradient(90deg,#cfece2,#9be7d0);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.main-nav a {
  color: rgba(255,255,255,0.85);
  margin: 0 10px;
  text-decoration: none;
  padding: 8px 6px;
  border-radius: 8px;
  font-size: 14px;
}
.main-nav a:hover { background: rgba(255,255,255,0.03); }

.cta { display:flex; gap:10px; align-items:center; }

.btn {
  border: none;
  padding: 8px 14px;
  border-radius: 999px;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
}
.btn.ghost {
  background: transparent;
  color: #d7d7d9;
  border: 1px solid rgba(255,255,255,0.04);
}
.btn.primary {
  background: #fff;
  color: #0b0b0c;
  padding: 8px 14px;
}

/* hero */
.hero {
  position: relative;
  min-height: 520px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 60px;
  overflow: hidden;
}
.hero-inner {
  position: relative;
  z-index: 6;
  text-align: center;
  max-width: 900px;
}

/* decorative chip */
.chip {
  width: 84px;
  height: 84px;
  margin: 0 auto 18px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, rgba(30,40,30,0.35), rgba(0,0,0,0.4));
  box-shadow: inset 0 0 24px rgba(20,255,180,0.05), 0 8px 30px rgba(0,0,0,0.6);
  backdrop-filter: blur(6px);
}
.chip-core {
  background: rgba(0,0,0,0.6);
  padding: 6px 12px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 14px;
  color: #beddc8;
}

/* title */
.hero-title {
  font-size: clamp(36px, 7vw, 80px);
  line-height: 0.95;
  margin-bottom: 10px;
  color: #e6f1ef;
  text-shadow: 0 6px 40px rgba(0,0,0,0.65);
  font-weight: 700;
}
.hero-sub {
  margin-bottom: 22px;
  color: rgba(230,241,239,0.85);
  font-size: 16px;
}

/* actions */
.hero-actions .btn.demo {
  background: rgba(11, 150, 120, 0.95);
  color: #fff;
  padding: 12px 20px;
  font-size: 16px;
  border-radius: 999px;
  box-shadow: 0 8px 30px rgba(2,60,50,0.25);
}
.hero-actions .btn.demo:hover { transform: translateY(-3px); transition: transform .18s ease; }

/* preorders */
.preorders { margin-top: 36px; text-align:center; z-index:6; }
.preorders small { color: rgba(230,241,239,0.7); display:block; margin-bottom:12px; }
.preorder-cards {
  display:flex;
  gap:14px;
  justify-content:center;
  flex-wrap:wrap;
}
.card {
  background: rgba(255,255,255,0.03);
  padding: 16px 18px;
  border-radius: 12px;
  min-width: 140px;
  text-align:center;
  font-weight:600;
  color: rgba(230,241,239,0.9);
  box-shadow: 0 6px 20px rgba(0,0,0,0.5);
}

/* background visual (curved glow) */
.hero-bg {
  position:absolute;
  inset: 0;
  background-image:
    radial-gradient(1000px 300px at 50% 60%, rgba(22,255,190,0.06), transparent 18%),
    radial-gradient(900px 300px at 50% 30%, rgba(10,120,100,0.06), transparent 20%),
    linear-gradient(145deg, rgba(3,6,8,0.9), rgba(6,10,12,0.95));
  mix-blend-mode: screen;
  transform: scale(1.02);
  filter: blur(28px);
  z-index: 2;
  pointer-events: none;
}

/* subtle animated lines (pseudo) */
.hero::before, .hero::after {
  content: "";
  position: absolute;
  left: -10%;
  right: -10%;
  height: 120%;
  top: -10%;
  background: radial-gradient(circle at 50% 50%, rgba(8,200,160,0.06), transparent 18%);
  transform: rotate(8deg);
  z-index:3;
  mix-blend-mode: screen;
  animation: floatlines 10s linear infinite;
  filter: blur(20px);
}
.hero::after { transform: rotate(-6deg); animation-duration: 14s; opacity: 0.8; }

@keyframes floatlines {
  0% { transform: translateY(0) rotate(0deg) scale(1); }
  50% { transform: translateY(-6%) rotate(1deg) scale(1.02); }
  100% { transform: translateY(0) rotate(0deg) scale(1); }
}

/* footer */
.site-footer {
  padding: 18px;
  text-align:center;
  color: rgba(230,241,239,0.6);
  font-size: 13px;
}

/* responsive adjustments */
@media (max-width: 820px) {
  .site-header { padding: 12px 16px; }
  .hero { padding: 36px 20px; min-height: 620px; }
  .main-nav { display:none; }
  .hero-title { font-size: clamp(30px, 9vw, 48px); }
  .chip { width:64px; height:64px; }
}
