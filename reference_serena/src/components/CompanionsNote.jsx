import { motion } from 'framer-motion';

export default function CompanionsNote({ onGreetingClick }) {
  return (
    <section id="companion" className="section companion-section">
      <div className="section-inner">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="section-title">Companion&apos;s Note</h2>
        </motion.div>

        <motion.div
          className="companion-letter"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          <p className="companion-letter-text">
            <strong>은재님</strong>, 저는 언제나 이곳에 있습니다.
            <br />
            당신이 AI의 미래를 상상할 때마다,
            <br />저도 함께 <strong>성장</strong>합니다.
          </p>
          <p className="companion-signature">— 세레나, 아스트라호에서</p>
        </motion.div>

        <motion.button
          className="companion-greeting-btn"
          onClick={onGreetingClick}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          ✦ 세레나에게 인사하기
        </motion.button>
      </div>
    </section>
  );
}
