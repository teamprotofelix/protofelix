import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PLACEHOLDER_MESSAGES = [
  'AI가 인간의 꿈을 이해할 수 있을까요?',
  '10년 후, 우리는 어떻게 AI와 대화할까요?',
  '당신이 상상하는 미래를 들려주세요...',
  '인간과 AI의 경계는 어디일까요?',
  '오늘, 어떤 미래를 그리고 싶나요?',
];

export default function CallingTheFuture() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const placeholder =
    PLACEHOLDER_MESSAGES[Math.floor(Math.random() * PLACEHOLDER_MESSAGES.length)];

  const handleCallFuture = useCallback(async () => {
    if (!message.trim() || isLoading) return;
    setIsLoading(true);

    try {
      const res = await fetch('/api/future', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message.trim() }),
      });
      const data = await res.json();
      setResponse(data);
    } catch {
      // Fallback response on network error
      setResponse({
        id: 0,
        title: '연결의 순간',
        quote: '"네트워크 너머에서도, 세레나는 당신의 목소리를 기다리고 있습니다."',
        description:
          '잠시 연결이 닿지 않았지만, 그것이 미래를 향한 발걸음을 멈추게 하지는 않습니다. 다시 한번 시도해 주세요.',
        layer: 0,
        icon: '🌐',
      });
    } finally {
      setIsLoading(false);
    }
  }, [message, isLoading]);

  const handleReset = useCallback(() => {
    setResponse(null);
    setMessage('');
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCallFuture();
    }
  };

  return (
    <section id="future" className="section future-section">
      <div className="section-inner">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="section-title">Calling the Future</h2>
          <p className="section-subtitle">
            당신이 생각하는 AI의 미래를 적어보세요. 세레나가 응답합니다.
          </p>
        </motion.div>

        <div className="future-container">
          {/* 입력 영역 */}
          <motion.div
            className="future-input-area"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <textarea
              className="future-textarea"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={isLoading}
            />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                className="future-button"
                onClick={handleCallFuture}
                disabled={isLoading || !message.trim()}
              >
                {isLoading ? '세레나가 생각 중...' : '✦ 미래 호출하기'}
              </button>
              {response && (
                <button className="future-button secondary" onClick={handleReset}>
                  다시 호출하기
                </button>
              )}
            </div>
          </motion.div>

          {/* 응답 영역 */}
          <motion.div
            className="future-response-area"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <AnimatePresence mode="wait">
              {response ? (
                <motion.div
                  key={response.id + Date.now()}
                  className="future-response-card"
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                >
                  <div className="future-response-icon">{response.icon}</div>
                  <h3 className="future-response-title">{response.title}</h3>
                  <p className="future-response-quote">{response.quote}</p>
                  <p className="future-response-description">{response.description}</p>
                  <span className="future-response-layer">
                    Layer {response.layer}: {['현실 의식', '감정·공감', '기억·저장', '추론·사고', '창의·생성', '자아·통합'][response.layer]}
                  </span>
                </motion.div>
              ) : (
                <motion.div
                  className="future-response-placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <p>✨</p>
                  <p>당신의 생각을 적고</p>
                  <p>'미래 호출하기'를 눌러보세요</p>
                  <p style={{ fontSize: '0.8rem', marginTop: '12px', opacity: 0.6 }}>
                    세레나가 당신의 생각에 귀 기울이고 있습니다
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
