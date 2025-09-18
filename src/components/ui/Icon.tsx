import React from 'react';

export interface IconProps {
  name: 'new-game' | 'restart' | 'info' | 'trophy' | 'close' | 'play';
  size?: number;
  className?: string;
}

const Icon: React.FC<IconProps> = ({ name, size = 24, className = '' }) => {
  const iconClass = `icon ${className}`.trim();

  const renderIcon = () => {
    switch (name) {
      case 'new-game':
        return (
          <svg className={iconClass} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
        );

      case 'restart':
        return (
          <svg className={iconClass} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
          </svg>
        );

      case 'info':
        return (
          <span className={iconClass} style={{ fontSize: size }}>ⓘ</span>
        );

      case 'trophy':
        return (
          <span className={iconClass} style={{ fontSize: size }}>🏆</span>
        );

      case 'close':
        return (
          <span className={iconClass} style={{ fontSize: size }}>×</span>
        );

      case 'play':
        return (
          <span className={iconClass} style={{ fontSize: size }}>▶</span>
        );

      default:
        return null;
    }
  };

  return renderIcon();
};

export default Icon;