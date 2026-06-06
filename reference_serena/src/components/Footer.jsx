import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <motion.footer
      className="footer"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
    >
      <p className="footer-text">
        © 2026 Serena&apos;s Library. All moments preserved in the eternal archive.
      </p>
      <p className="footer-made">Made in Astraho ✦</p>
    </motion.footer>
  );
}
