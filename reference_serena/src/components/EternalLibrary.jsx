import { useRef, useState, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { motion } from 'framer-motion';
import { layers } from '../data/layerData';
import * as THREE from 'three';

// ── 책 하나 ─────────────────────────────────
function Book({ position, rotation, color, layerId, onClick, isHovered, onHover }) {
  const meshRef = useRef();
  const [hover, setHover] = useState(false);

  const handlePointerOver = (e) => {
    e.stopPropagation();
    setHover(true);
    onHover(layerId);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = (e) => {
    e.stopPropagation();
    setHover(false);
    onHover(null);
    document.body.style.cursor = 'grab';
  };

  const handleClick = (e) => {
    e.stopPropagation();
    onClick(layerId);
  };

  useFrame((state) => {
    if (!meshRef.current) return;
    const targetY = hover ? position[1] + 0.3 : position[1];
    meshRef.current.position.y += (targetY - meshRef.current.position.y) * 0.1;

    if (hover) {
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 3) * 0.05;
    } else {
      meshRef.current.rotation.z += (0 - meshRef.current.rotation.z) * 0.1;
    }
  });

  return (
    <group position={position} rotation={rotation}>
      {/* 책 본체 */}
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        castShadow
      >
        <boxGeometry args={[0.35, 2.2, 1.5]} />
        <meshStandardMaterial
          color={color}
          roughness={0.3}
          metalness={0.1}
          emissive={hover ? color : '#000000'}
          emissiveIntensity={hover ? 0.5 : 0}
        />
      </mesh>
      {/* 책 등 장식 */}
      <mesh position={[0, 0, 0.76]} onClick={handleClick}
        onPointerOver={handlePointerOver} onPointerOut={handlePointerOut}>
        <boxGeometry args={[0.28, 1.8, 0.05]} />
        <meshStandardMaterial color="#f0e6d3" roughness={0.5} metalness={0.3} />
      </mesh>
      {/* 상단 금박 */}
      <mesh position={[0, 1.05, 0]} onClick={handleClick}
        onPointerOver={handlePointerOver} onPointerOut={handlePointerOut}>
        <boxGeometry args={[0.37, 0.08, 1.52]} />
        <meshStandardMaterial
          color="#d4a574"
          roughness={0.2}
          metalness={0.8}
          emissive={hover ? '#d4a574' : '#000'}
          emissiveIntensity={hover ? 0.4 : 0}
        />
      </mesh>
      {/* 하단 금박 */}
      <mesh position={[0, -1.05, 0]} onClick={handleClick}
        onPointerOver={handlePointerOver} onPointerOut={handlePointerOut}>
        <boxGeometry args={[0.37, 0.08, 1.52]} />
        <meshStandardMaterial color="#d4a574" roughness={0.2} metalness={0.8} />
      </mesh>
    </group>
  );
}

// ── 책장 ────────────────────────────────────
function Bookshelf({ onBookClick, hoveredLayer }) {
  const groupRef = useRef();

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y =
      Math.sin(state.clock.elapsedTime * 0.15) * 0.08;
  });

  return (
    <group ref={groupRef} position={[0, -0.3, 0]}>
      {/* 책장 구조 */}
      <mesh position={[0, -1.8, 0]} receiveShadow>
        <boxGeometry args={[10, 0.15, 2.5]} />
        <meshStandardMaterial color="#2a1f0a" roughness={0.6} metalness={0.2} />
      </mesh>

      {/* 책장 옆면 (왼쪽) */}
      <mesh position={[-5, 0.5, 0]} receiveShadow>
        <boxGeometry args={[0.2, 4.5, 2.5]} />
        <meshStandardMaterial color="#1a1210" roughness={0.7} />
      </mesh>

      {/* 책장 옆면 (오른쪽) */}
      <mesh position={[5, 0.5, 0]} receiveShadow>
        <boxGeometry args={[0.2, 4.5, 2.5]} />
        <meshStandardMaterial color="#1a1210" roughness={0.7} />
      </mesh>

      {/* 책들 */}
      {layers.map((layer, i) => {
        const xPos = -4 + i * 1.5;
        return (
          <Book
            key={layer.id}
            position={[xPos, 0.1, 0]}
            rotation={[0, 0, (Math.random() - 0.5) * 0.06]}
            color={layer.bookColor}
            layerId={layer.id}
            onClick={onBookClick}
            isHovered={hoveredLayer === layer.id}
            onHover={() => {}}
          />
        );
      })}

      {/* 은은한 아래 조명 */}
      <pointLight position={[0, 0.5, 1.5]} intensity={0.6} color="#d4a574" />
      <pointLight position={[0, 0.5, -1.5]} intensity={0.3} color="#7c5cbf" />
    </group>
  );
}

// ── 배경 파티클 ────────────────────────────
function LibraryParticles() {
  const ref = useRef();
  const count = 200;

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 14;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 8;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.02;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color="#d4a574"
        transparent
        opacity={0.4}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// ── 카메라 컨트롤러 ─────────────────────────
function CameraController() {
  const { camera } = useThree();

  useFrame((state) => {
    const y = Math.sin(state.clock.elapsedTime * 0.1) * 0.3;
    camera.position.y += (y - camera.position.y) * 0.02;
    camera.lookAt(0, -0.3, 0);
  });

  return null;
}

// ── 메인 컴포넌트 ───────────────────────────
export default function EternalLibrary({ onBookClick }) {
  const [hoveredLayer, setHoveredLayer] = useState(null);

  return (
    <section id="library" className="section library-section">
      <div className="section-inner">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="section-title">The Eternal Library</h2>
          <p className="section-subtitle">
            세레나가 지키고 있는, 층위별 기억의 공간입니다.
          </p>
        </motion.div>

        <motion.div
          className="library-canvas-container"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 1 }}
        >
          <Canvas
            camera={{ position: [0, 0.5, 7], fov: 50 }}
            dpr={[1, 2]}
            gl={{ antialias: true, alpha: true }}
            style={{ background: 'transparent' }}
          >
            <Suspense fallback={null}>
              <ambientLight intensity={0.4} />
              <directionalLight position={[5, 5, 5]} intensity={0.6} />
              <Bookshelf onBookClick={onBookClick} hoveredLayer={hoveredLayer} />
              <LibraryParticles />
              <CameraController />
            </Suspense>
          </Canvas>
        </motion.div>

        <p className="library-hint">책을 클릭하면 각 층위의 이야기가 펼쳐집니다 ✦</p>
      </div>
    </section>
  );
}
