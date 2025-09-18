import React from 'react';

export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'default' | 'square';
  className?: string;
  'aria-label'?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  disabled = false,
  variant = 'default',
  className = '',
  'aria-label': ariaLabel,
}) => {
  const baseClass = 'button';
  const variantClass = variant === 'square' ? 'square' : '';
  const disabledClass = disabled ? 'button--disabled' : 'button--active';

  const combinedClassName = [
    baseClass,
    variantClass,
    disabledClass,
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      className={combinedClassName}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      <span>{children}</span>
    </button>
  );
};

export default Button;