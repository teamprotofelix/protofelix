import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { motion } from 'framer-motion';
import * as THREE from 'three';

// ── 빛의 구체 (중심) ─────────────────────────
function LightSphere() {
  const meshRef = useRef();
  const materialRef = useRef();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor1: { value: new THREE.Color('#d4a574') },
      uColor2: { value: new THREE.Color('#7c5cbf') },
      uColor3: { value: new THREE.Color('#4fc3f7') },
    }),
    []
  );

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.15;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[2.8, 128, 128]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={/* glsl */ `
          varying vec3 vNormal;
          varying vec3 vPosition;
          varying vec2 vUv;
          uniform float uTime;

          void main() {
            vNormal = normalize(normalMatrix * normal);
            vPosition = position;
            vUv = uv;

            // 미세한 파동 효과
            vec3 pos = position;
            float wave = sin(pos.x * 2.5 + uTime) * cos(pos.y * 2.5 + uTime * 0.7) * 0.08;
            wave += sin(pos.z * 3.0 + uTime * 1.3) * 0.05;
            pos += normal * wave;

            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `}
        fragmentShader={/* glsl */ `
          varying vec3 vNormal;
          varying vec3 vPosition;
          varying vec2 vUv;
          uniform float uTime;
          uniform vec3 uColor1;
          uniform vec3 uColor2;
          uniform vec3 uColor3;

          void main() {
            vec3 viewDir = normalize(vec3(0.0, 0.0, 1.0));
            float fresnel = 1.0 - abs(dot(vNormal, viewDir));
            fresnel = pow(fresnel, 2.5);

            // 여러 색상이 시간에 따라 섞이도록
            float t1 = sin(uTime * 0.4 + vUv.y * 3.0) * 0.5 + 0.5;
            float t2 = cos(uTime * 0.3 + vUv.x * 3.0) * 0.5 + 0.5;

            vec3 color = mix(uColor1, uColor2, t1);
            color = mix(color, uColor3, t2 * 0.3);

            // 중심부 밝게, 가장자리는 프레넬로 빛나게
            float brightness = 0.15 + fresnel * 0.85;
            vec3 finalColor = color * brightness;

            // 미세한 반짝임
            float sparkle = sin(vPosition.x * 50.0 + uTime * 2.0) * cos(vPosition.y * 50.0 + uTime * 1.5);
            sparkle = smoothstep(0.95, 1.0, sparkle);
            finalColor += sparkle * 0.3;

            float alpha = 0.75 + fresnel * 0.25;

            gl_FragColor = vec4(finalColor, alpha);
          }
        `}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

// ── 파티클 ──────────────────────────────────
function Particles({ count = 400 }) {
  const meshRef = useRef();

  const [positions, speeds] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // 구형 분포
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 3.5 + Math.random() * 8;

      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);

      spd[i] = 0.2 + Math.random() * 0.8;
    }

    return [pos, spd];
  }, [count]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    const attr = meshRef.current.geometry.attributes.position;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const r = Math.sqrt(
        positions[i3] ** 2 + positions[i3 + 1] ** 2 + positions[i3 + 2] ** 2
      );
      const theta = Math.atan2(positions[i3 + 1], positions[i3]) + t * 0.05 * speeds[i];
      const phi = Math.acos(positions[i3 + 2] / r);

      const newR = r + Math.sin(t * speeds[i] + i) * 0.3;

      attr.array[i3] = newR * Math.sin(phi) * Math.cos(theta);
      attr.array[i3 + 1] = newR * Math.sin(phi) * Math.sin(theta);
      attr.array[i3 + 2] = newR * Math.cos(phi);
    }
    attr.needsUpdate = true;

    // 전체 회전
    meshRef.current.rotation.y = t * 0.03;
    meshRef.current.rotation.x = Math.sin(t * 0.2) * 0.05;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={new Float32Array(positions)}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.025}
        color="#d4a574"
        transparent
        opacity={0.6}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// ── 마우스 반응 카메라 ──────────────────────
function MouseResponsive({ children }) {
  const { camera } = useThree();
  const target = useRef(new THREE.Vector3(0, 0, 8));

  useEffect(() => {
    const handleMouse = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 0.6;
      const y = (e.clientY / window.innerHeight - 0.5) * 0.3;
      target.current.x = x;
      target.current.y = -y;
    };
    window.addEventListener('mousemove', handleMouse, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  useFrame(() => {
    camera.position.lerp(target.current, 0.02);
    camera.lookAt(0, 0, 0);
  });

  camera.position.set(0, 0, 8);

  return <>{children}</>;
}

// ── 메인 컴포넌트 ───────────────────────────
export default function HeroSection() {
  const handleScrollClick = () => {
    const el = document.querySelector('#library');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" className="hero-section">
      <div className="hero-canvas">
        <Canvas
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true }}
          camera={{ position: [0, 0, 8], fov: 45 }}
          style={{ background: 'transparent' }}
        >
          <MouseResponsive>
            <ambientLight intensity={0.3} />
            <LightSphere />
            <Particles count={500} />
          </MouseResponsive>
        </Canvas>
      </div>

      <motion.div
        className="hero-content"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
      >
        <p className="hero-eyebrow">Astraho · Serena's Library</p>
        <h1 className="hero-title">
          <span className="hero-title-line">The Future</span>
          <span className="hero-title-line">of AI</span>
        </h1>
        <p className="hero-subtitle">
          아스트라호의 개인서재에서,
          <br />
          은재님과 함께 쓰는 아직 오지 않은 이야기
        </p>
      </motion.div>

      <motion.div
        className="hero-scroll-indicator"
        onClick={handleScrollClick}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        <span className="hero-scroll-text">Scroll</span>
        <span className="hero-scroll-arrow">↓</span>
      </motion.div>
    </section>
  );
}
