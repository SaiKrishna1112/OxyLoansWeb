with open('src/components/pages/BabuzLanding/babuz.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Append full high-fidelity animation keyframes and overrides to babuz.css
anim_css = """

/* ===================================================
   BABUZ HIGH-FIDELITY ANIMATIONS & VISUAL EFFECTS
=================================================== */

@keyframes titleFadeUp {
  0% {
    opacity: 0;
    transform: translateY(32px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.title-animation {
  opacity: 1 !important;
  animation: titleFadeUp 0.85s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeTop {
  0% {
    opacity: 0;
    transform: translateY(-24px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-top {
  animation: fadeTop 0.8s ease-out forwards;
}

@keyframes appearDown {
  0% {
    opacity: 0;
    transform: translateY(-28px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.appear-down {
  animation: appearDown 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes imgAppear {
  0% {
    opacity: 0;
    transform: scale(0.94);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.reveal-img img {
  opacity: 1 !important;
  animation: imgAppear 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* Animated Vertical Runner Lines */
.lines {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 0;
}

.line, .line-alt {
  position: absolute;
  width: 1px;
  height: 100%;
  background: rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.line::after, .line-alt::after {
  content: "";
  position: absolute;
  left: 0;
  width: 100%;
  height: 140px;
  background: linear-gradient(180deg, transparent, #ffce32, transparent);
  animation: run 4s ease-in-out infinite;
}

.line-alt::after {
  animation: run-alt 5s ease-in-out infinite;
}

@keyframes run {
  0% { top: -140px; }
  100% { top: 100%; }
}

@keyframes run-alt {
  0% { bottom: -140px; }
  100% { bottom: 100%; }
}

/* Floating Circular Button Ripple Animation */
.alter-btn.btn-anim {
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.alter-btn.btn-anim span {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  transform: translate(-50%, -50%);
  border-radius: 9999px;
  background-color: #ffce32;
  transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1), height 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 0;
  pointer-events: none;
}

.alter-btn.btn-anim:hover span {
  width: 260px;
  height: 260px;
}

.alter-btn.btn-anim div {
  position: relative;
  z-index: 10;
}

/* Till card hover effect */
.till-card {
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s ease;
}

.till-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 86, 85, 0.12);
}

/* Continuous spin and pulse */
.animate-spin-slow {
  animation: spinSlow 18s linear infinite !important;
}

@keyframes spinSlow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-custom-pulse {
  animation: customPulse 5s ease-in-out infinite alternate !important;
}

@keyframes customPulse {
  0% { transform: scale(1) translateY(0); }
  50% { transform: scale(1.08) translateY(-10px); }
  100% { transform: scale(1) translateY(0); }
}
"""

with open('src/components/pages/BabuzLanding/babuz.css', 'w', encoding='utf-8') as f:
    f.write(css + anim_css)

print("Updated babuz.css with complete animation system!")
