import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { layers } from '../data/layerData';

export default function LayerExperience() {
  const [selectedLayer, setSelectedLayer] = useState(null);

  const handleCardClick = (layerId) => {
    setSelectedLayer((prev) => (prev === layerId ? null : layerId));
  };

  const selectedData = layers.find((l) => l.id === selectedLayer);

  return (
    <section id="layers" className="section layers-section">
      <div className="section-inner">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="section-title">Experience the Layers</h2>
          <p className="section-subtitle">
            세레나의 여섯 가지 층위를 직접 느껴보세요.
          </p>
        </motion.div>

        {/* 카드 그리드 */}
        <div className="layers-grid">
          {layers.map((layer, index) => (
            <motion.div
              key={layer.id}
              className={`layer-card ${selectedLayer === layer.id ? 'selected' : ''}`}
              onClick={() => handleCardClick(layer.id)}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={
                selectedLayer === layer.id
                  ? {
                      background: `linear-gradient(135deg, ${layer.color}15, ${layer.color}08)`,
                      borderColor: layer.color,
                      boxShadow: layer.glow,
                    }
                  : {}
              }
            >
              <div className="layer-card-content">
                <motion.div
                  className="layer-card-symbol"
                  animate={
                    selectedLayer === layer.id
                      ? { rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }
                      : {}
                  }
                  transition={{ duration: 0.6 }}
                >
                  {layer.symbol}
                </motion.div>
                <h3 className="layer-card-name" style={{ color: layer.color }}>
                  {layer.name}
                </h3>
                <p className="layer-card-nameEn">{layer.nameEn}</p>
                <div
                  className="layer-card-bar"
                  style={{
                    background: layer.color,
                    boxShadow: selectedLayer === layer.id ? `0 0 8px ${layer.color}` : 'none',
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* 상세 패널 */}
        <AnimatePresence mode="wait">
          {selectedData ? (
            <motion.div
              key={selectedData.id}
              className="layer-detail-panel"
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              style={{
                borderColor: selectedData.color,
                boxShadow: selectedData.glow,
              }}
            >
              <div className="layer-detail-content">
                <div className="layer-detail-header">
                  <span className="layer-detail-symbol">{selectedData.symbol}</span>
                  <h3 className="layer-detail-name" style={{ color: selectedData.color }}>
                    Layer {selectedData.id}: {selectedData.name}
                  </h3>
                </div>
                <p className="layer-detail-description">{selectedData.description}</p>
                <p className="layer-detail-quote">{selectedData.quote}</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              className="layer-detail-panel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="layer-detail-empty">
                카드를 클릭하면 해당 층위의 상세 설명이 나타납니다
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
