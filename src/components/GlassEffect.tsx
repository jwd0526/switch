import React from 'react';

export interface GlassEffectProps {
  width?: number;
  height?: number;
  radius?: number;
  initialX?: string;
  initialY?: string;
  animate?: boolean;
  needTurnOff?: boolean;
  onCellClick?: () => void;
  gameReady?: boolean;
  showPlayButton?: boolean;
  hideGlow?: boolean;
  fastTransition?: boolean;
  fadeOut?: boolean;
  gamePhase?: string;
}

const GlassEffect: React.FC<GlassEffectProps> = React.memo(({
  width = 80,
  height = 80,
  radius = 16,
  initialX = '50%',
  initialY = '50%',
  animate = false,
  needTurnOff = false,
  onCellClick,
  gameReady = false,
  showPlayButton = false,
  hideGlow = false,
  fastTransition = false,
  fadeOut = false,
  gamePhase = ''
}) => {
  const position = { x: initialX, y: initialY };

  // Calculate active state
  // When puzzle is won, all cells should remain active (showing white glow)
  // During reverse animation, all cells should turn off
  const isActive = (gamePhase === 'reversing' || gamePhase === 'fadingOut') ? false :
                   gamePhase === 'won' ? true : !needTurnOff;

  const handleClick = () => {
    if ((gameReady || showPlayButton) && onCellClick) {
      onCellClick();
    }
  };

  const glassStyle: React.CSSProperties = {
    width: `${width}px`,
    height: `${height}px`,
    position: 'fixed',
    top: position.y,
    left: position.x,
    transform: `translate(-50%, -50%) rotate(${isActive ? '-90deg' : '0deg'})`,
    borderRadius: `${radius}px`,
    backdropFilter: `url(#glass-filter-${width}-${height})`,
    background: 'rgba(255, 255, 255, 0)',
    boxShadow: `
      0 0 2px 1px rgba(255, 255, 255, 0.1) inset,
      0 0 10px 4px rgba(255, 255, 255, 0.1) inset,
      0 4px 16px rgba(0, 0, 0, 0.16)
    `,
    cursor: (gameReady || showPlayButton) ? 'pointer' : 'default',
    userSelect: 'none',
    pointerEvents: (gameReady || showPlayButton) ? 'auto' : 'none',
    zIndex: 1,
    opacity: fadeOut && !showPlayButton ? 0 : 1,
    transition: gamePhase === 'fadingOut' ? 'all 0.8s ease-out' : animate ? 'all 0.2s ease-in-out' : fastTransition ? 'transform 0.25s ease-out' : 'transform 0.15s ease-out'
  };

  // Calculate border size proportionally
  const border = Math.min(width, height) * 0.035;

  // Displacement map SVG data URL
  const displacementMapUrl = encodeURIComponent(`
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${width} ${height}'>
      <defs>
        <linearGradient id='r-${width}-${height}' x1='100%' y1='0%' x2='0%' y2='0%'>
          <stop offset='0%' stop-color='#000'/>
          <stop offset='100%' stop-color='red'/>
        </linearGradient>
        <linearGradient id='b-${width}-${height}' x1='0%' y1='0%' x2='0%' y2='100%'>
          <stop offset='0%' stop-color='#000'/>
          <stop offset='100%' stop-color='blue'/>
        </linearGradient>
      </defs>
      <rect width='${width}' height='${height}' fill='black'/>
      <rect width='${width}' height='${height}' rx='${radius}' fill='url(#r-${width}-${height})'/>
      <rect width='${width}' height='${height}' rx='${radius}' fill='url(#b-${width}-${height})' style='mix-blend-mode:difference'/>
      <rect x='${border}' y='${border}' width='${width - border * 2}' height='${height - border * 2}' rx='${radius}' fill='hsl(0 0% 50% / 0.9)' style='filter:blur(11px)'/>
    </svg>
  `);

  // Calculate glow properties
  const glowSize = width * 0.4; // 80% of glass effect size for the glow area
  // White glow when active (false/off/solved), transparent when inactive (true/on/unsolved)

  const glowStyle: React.CSSProperties = {
    width: `${glowSize * 0.85}px`,
    height: `${glowSize}px`,
    position: 'fixed',
    top: position.y,
    left: position.x,
    transform: 'translate(-50%, -50%)',
    borderRadius: `${radius}px`,
    backgroundColor: isActive ? 'rgba(255, 255, 255, 0.8)' : 'transparent',
    boxShadow: isActive ? '0 0 20px 10px rgba(255, 255, 255, 0.6), 0 0 40px 10px rgba(255, 255, 255, 0.3)' : 'none',
    pointerEvents: 'none',
    zIndex: 0,
    opacity: gamePhase === 'won' ? 1 : (animate || showPlayButton || hideGlow || fadeOut) ? 0 : 1,
    transition: gamePhase === 'fadingOut' ? 'all 0.8s ease-out' : animate ? 'all 0.4s ease-in-out' : 'opacity 0.2s ease-in-out, background-color 0.15s ease-out, box-shadow 0.15s ease-out'
  };

  const playButtonStyle: React.CSSProperties = {
    position: 'fixed',
    top: position.y,
    left: position.x,
    transform: 'translate(-50%, -50%)',
    width: `${width * 0.4}px`,
    height: `${width * 0.4}px`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: `${width * 0.35}px`,
    color: '#ffffff',
    pointerEvents: 'none',
    zIndex: 2,
    opacity: animate ? 0 : 1,
    transition: gamePhase === 'fadingOut' ? 'all 0.8s ease-out' : animate ? 'all 0.4s ease-in-out' : 'opacity 0.5s ease-in-out'
  };

  return (
    <>
      {showPlayButton ? (
        <div style={playButtonStyle}>▶</div>
      ) : (
        <div style={glowStyle} />
      )}

      <div style={glassStyle} onClick={handleClick} />

      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <filter id={`glass-filter-${width}-${height}`} colorInterpolationFilters="sRGB">
            <feImage
              href={`data:image/svg+xml,${displacementMapUrl}`}
              result="displacementMap"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="displacementMap"
              scale="-170"
              xChannelSelector="R"
              yChannelSelector="B"
              result="red"
            />
            <feColorMatrix
              in="red"
              values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
              result="redChannel"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="displacementMap"
              scale="-170"
              xChannelSelector="R"
              yChannelSelector="B"
              result="green"
            />
            <feColorMatrix
              in="green"
              values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"
              result="greenChannel"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="displacementMap"
              scale="-170"
              xChannelSelector="R"
              yChannelSelector="B"
              result="blue"
            />
            <feColorMatrix
              in="blue"
              values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
              result="blueChannel"
            />
            <feBlend in="redChannel" in2="greenChannel" mode="screen" result="redGreen"/>
            <feBlend in="redGreen" in2="blueChannel" mode="screen" result="combined"/>
            <feGaussianBlur in="combined" stdDeviation="0"/>
          </filter>
        </defs>
      </svg>
    </>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for React.memo
  return (
    prevProps.width === nextProps.width &&
    prevProps.height === nextProps.height &&
    prevProps.radius === nextProps.radius &&
    prevProps.initialX === nextProps.initialX &&
    prevProps.initialY === nextProps.initialY &&
    prevProps.animate === nextProps.animate &&
    prevProps.needTurnOff === nextProps.needTurnOff &&
    prevProps.gameReady === nextProps.gameReady &&
    prevProps.showPlayButton === nextProps.showPlayButton &&
    prevProps.hideGlow === nextProps.hideGlow &&
    prevProps.fastTransition === nextProps.fastTransition &&
    prevProps.fadeOut === nextProps.fadeOut &&
    prevProps.gamePhase === nextProps.gamePhase
  );
});

export default GlassEffect;