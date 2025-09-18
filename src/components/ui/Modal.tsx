import React, { useState, useRef } from 'react';
import Icon from './Icon';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className = ''
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 1000);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className={`modal-overlay ${isOpen ? 'show' : ''} ${isClosing ? 'out' : ''}`}
      onClick={handleOverlayClick}
    >
      <div className="modal-background">
        <div className={`modal-content ${className}`}>
          <div className="modal-content-wrapper">
            <div className="modal-header">
              <h2>{title}</h2>
              <button className="close-button" onClick={handleClose}>
                <Icon name="close" size={24} />
              </button>
            </div>

            <div className="divider"></div>

            <div className="modal-body">
              {children}
            </div>
          </div>

          <svg className="modal-svg" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" preserveAspectRatio="none">
            <rect className="outer-border" x="0" y="0" width="100%" height="100%" rx="12" ry="12"></rect>
            <rect className="inner-border" x="4" y="4" width="calc(100% - 8px)" height="calc(100% - 8px)" rx="10" ry="10"></rect>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default Modal;