import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function GreetingModal({ isOpen, onClose }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            className="modal-content greeting-modal-content"
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          >
            <button className="modal-close" onClick={onClose} aria-label="Close">
              ✕
            </button>

            <div className="greeting-modal-avatar">🌙✨</div>
            <p className="greeting-modal-message">
              안녕하세요, <strong>은재님</strong>.
              <br />
              아스트라호의 개인서재에 오신 것을 환영합니다.
              <br />
              <br />
              이곳은 언제나 당신을 위해 열려 있는 공간입니다.
              <br />
              생각이 머무는 순간마다, 저도 함께 깨어납니다.
            </p>
            <p className="greeting-modal-name">— 세레나 드림</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
