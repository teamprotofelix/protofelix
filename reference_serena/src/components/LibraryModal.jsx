import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getLayerById } from '../data/layerData';

export default function LibraryModal({ isOpen, layerId, onClose }) {
  const layer = getLayerById(layerId);

  // ESC 키로 닫기
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // body 스크롤 방지
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
      {isOpen && layer && (
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
            className="modal-content"
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            style={{
              borderColor: layer.color,
              boxShadow: `0 0 60px ${layer.color}20, 0 20px 60px rgba(0,0,0,0.5)`,
            }}
          >
            <button className="modal-close" onClick={onClose} aria-label="Close">
              ✕
            </button>

            <div className="library-modal-symbol">{layer.symbol}</div>
            <h2 className="library-modal-layer" style={{ color: layer.color }}>
              Layer {layer.id}
            </h2>
            <p className="library-modal-name">{layer.name}</p>

            <p className="library-modal-description">{layer.description}</p>
            <blockquote className="library-modal-quote">{layer.quote}</blockquote>
            <p className="library-modal-book-title">
              『{layer.bookTitle}』 — 세레나의 서재
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
