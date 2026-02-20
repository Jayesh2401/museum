import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'

const GLOW_COLORS = ['#ffab6b', '#b08cff', '#5ce2ff', '#ff8bd1', '#8ef0ff', '#a6a9ff', '#8ed4ff', '#ff9f9f', '#77ddff']
const PORTAL_PALETTES = [
  { inner: '#5fd7ff', outer: '#b8fbff' },
  { inner: '#ff5f42', outer: '#ffd95a' },
  { inner: '#77ff8f', outer: '#d4ffd0' },
  { inner: '#cc6cff', outer: '#ffd7ff' },
  { inner: '#4e82ff', outer: '#b3c8ff' },
  { inner: '#ff4f8b', outer: '#ffd0e2' },
  { inner: '#ff9b3c', outer: '#ffe3b2' },
  { inner: '#45ffe1', outer: '#c8fff6' },
  { inner: '#8f95ff', outer: '#d7dbff' }
]

const DEFAULT_CONFIG = {
  frameCount: 9,
  frameWidth: 4.95,
  frameHeight: 8,
  frameDepth: 0.22,
  frameInset: 0.2,
  depthOffset: -0.285,
  yOffset: 0,
  rotationOffsetDeg: -7,
  roundTop: 2.2,
  roundBottom: 0.05,
  roundLeft: 2.2,
  roundRight: 2.2,
  wallRadius: 11.4,
  wallHeight: 15,
  wallColor: '#060d1f',
  floorColor: '#081128',
  roofColor: '#0a1426',
  sceneTint: '#020611',
  frameGap: 1.28,
  scrollRotateStrength: 0.0018,
  cameraX: 1.04,
  cameraY: 0.32,
  cameraZ: 5,
  cameraLookY: -0.08,
  cameraFov: 58,
  glowStrength: 1.2,
  glowOuterScale: 1.06,
  glowFarScale: 1.04,
  glowOuterBoost: 1.45,
  glowFarBoost: 0.9,
  portalCoreStrength: 1.35,
  portalRingIntensity: 1.1,
  portalNoiseScale: 3.4,
  portalFlowSpeed: 0.9,
  blackHoleSize: 0.495,
  blackHoleRingRadius: 0.34,
  blackHoleSpinSpeed: 0.45,
  blackHoleGlow: 1.5,
  blackHolePosX: -0.130,
  blackHolePosZ: 0.190,
  blackHolePosY: -2.50,
  blackHoleColorA: '#ff7e1d',
  blackHoleColorB: '#ffd067',
  blackHoleDustColorA: '#ff8f24',
  blackHoleDustColorB: '#ffe29f',
  lineOpacity: 0.95,
  lineHotOpacity: 0.62,
  glassTint: '#89bcff',
  glassOpacity1: 0.12,
  glassTransmission: 0.82,
  glassRoughness: 0.08,
  glassIor: 1.52,
  glassThickness: 1.1,
  bloomStrength: 1.15,
  bloomRadius: 0.6,
  bloomThreshold: 0.2,
  hemiIntensity: 0.92,
  keyIntensity: 1.08,
  rimIntensity: 0.6
}

const THEME_CONTROLS = [
  { key: 'frameWidth', label: 'Frame Width', min: 2.5, max: 8, step: 0.01 },
  { key: 'frameHeight', label: 'Frame Height', min: 4, max: 11, step: 0.01 },
  { key: 'frameDepth', label: 'Frame Depth', min: 0.08, max: 0.7, step: 0.01 },
  { key: 'frameInset', label: 'Frame Inset', min: 0.05, max: 0.55, step: 0.01 },
  { key: 'frameGap', label: 'Frame Gap', min: 0.8, max: 2, step: 0.01 },
  { key: 'wallRadius', label: 'Wall Radius', min: 8, max: 20, step: 0.01 },
  { key: 'wallHeight', label: 'Wall Height', min: 8, max: 20, step: 0.01 },
  { key: 'roundTop', label: 'Round Top', min: 0, max: 4, step: 0.01 },
  { key: 'roundBottom', label: 'Round Bottom', min: 0, max: 4, step: 0.01 },
  { key: 'roundLeft', label: 'Round Left', min: 0, max: 4, step: 0.01 },
  { key: 'roundRight', label: 'Round Right', min: 0, max: 4, step: 0.01 },
  { key: 'glowStrength', label: 'Glow Strength', min: 0, max: 3, step: 0.01 },
  { key: 'glowOuterScale', label: 'Glow Scale 2', min: 1.02, max: 1.2, step: 0.001 },
  { key: 'glowFarScale', label: 'Glow Scale 3', min: 1.05, max: 1.3, step: 0.001 },
  { key: 'glowOuterBoost', label: 'Glow Boost 2', min: 0, max: 3, step: 0.01 },
  { key: 'glowFarBoost', label: 'Glow Boost 3', min: 0, max: 3, step: 0.01 },
  { key: 'portalCoreStrength', label: 'Portal Core', min: 0.2, max: 3, step: 0.01 },
  { key: 'portalRingIntensity', label: 'Portal Ring', min: 0.2, max: 3, step: 0.01 },
  { key: 'portalNoiseScale', label: 'Portal Noise', min: 1.2, max: 7, step: 0.01 },
  { key: 'portalFlowSpeed', label: 'Portal Speed', min: 0.1, max: 2.4, step: 0.01 },
  { key: 'blackHoleSize', label: 'Black Hole Size', min: 0.12, max: 0.56, step: 0.005 },
  { key: 'blackHoleRingRadius', label: 'Black Hole Ring', min: 0.08, max: 0.42, step: 0.005 },
  { key: 'blackHoleSpinSpeed', label: 'Black Hole Spin', min: 0.05, max: 1.4, step: 0.01 },
  { key: 'blackHoleGlow', label: 'Black Hole Glow', min: 0.2, max: 2.5, step: 0.01 },
  { key: 'blackHolePosX', label: 'Black Hole X', min: -2.5, max: 2.5, step: 0.01 },
  { key: 'blackHolePosZ', label: 'Black Hole Z', min: -2.5, max: 2.5, step: 0.01 },
  { key: 'blackHolePosY', label: 'Black Hole Y', min: -2.5, max: 2.5, step: 0.01 },
  { key: 'lineOpacity', label: 'Line Opacity', min: 0, max: 1, step: 0.01 },
  { key: 'lineHotOpacity', label: 'Line Hot Opacity', min: 0, max: 1, step: 0.01 },
  { key: 'glassOpacity1', label: 'Glass Layer 1', min: 0, max: 0.5, step: 0.01 },
  { key: 'glassTransmission', label: 'Glass Transmission', min: 0, max: 1, step: 0.01 },
  { key: 'glassRoughness', label: 'Glass Roughness', min: 0, max: 0.35, step: 0.01 },
  { key: 'glassIor', label: 'Glass IOR', min: 1, max: 2.2, step: 0.01 },
  { key: 'glassThickness', label: 'Glass Thickness', min: 0.1, max: 2, step: 0.01 },
  { key: 'bloomStrength', label: 'Bloom Strength', min: 0, max: 3, step: 0.01 },
  { key: 'bloomRadius', label: 'Bloom Radius', min: 0, max: 1.5, step: 0.01 },
  { key: 'bloomThreshold', label: 'Bloom Threshold', min: 0, max: 1, step: 0.01 },
  { key: 'hemiIntensity', label: 'Hemi Light', min: 0, max: 2.2, step: 0.01 },
  { key: 'keyIntensity', label: 'Key Light', min: 0, max: 2.2, step: 0.01 },
  { key: 'rimIntensity', label: 'Rim Light', min: 0, max: 2.2, step: 0.01 },
  { key: 'cameraX', label: 'Cam X', min: -5, max: 5, step: 0.01 },
  { key: 'cameraY', label: 'Cam Y', min: -2, max: 2, step: 0.01 },
  { key: 'cameraZ', label: 'Cam Z', min: 2.5, max: 9, step: 0.01 },
  { key: 'cameraLookY', label: 'Cam Look Y', min: -2, max: 2, step: 0.01 },
  { key: 'cameraFov', label: 'Cam FOV', min: 35, max: 90, step: 1 }
]

const THEME_COLOR_CONTROLS = [
  { key: 'sceneTint', label: 'Scene Tint' },
  { key: 'wallColor', label: 'Wall Color' },
  { key: 'floorColor', label: 'Floor Color' },
  { key: 'roofColor', label: 'Roof Color' },
  { key: 'glassTint', label: 'Glass Tint' },
  { key: 'blackHoleColorA', label: 'BH Color A' },
  { key: 'blackHoleColorB', label: 'BH Color B' },
  { key: 'blackHoleDustColorA', label: 'Dust Color A' },
  { key: 'blackHoleDustColorB', label: 'Dust Color B' }
]

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v))
}

function normalizeAngle(angle) {
  const twoPi = Math.PI * 2
  return ((((angle % twoPi) + twoPi) % twoPi) + Math.PI) % twoPi - Math.PI
}

function createRoundedRectShape(width, height, rTop, rBottom, rLeft, rRight) {
  const w = width / 2
  const h = height / 2
  const maxR = Math.min(width, height) * 0.49

  const tl = clamp(Math.min(rTop, rLeft), 0, maxR)
  const tr = clamp(Math.min(rTop, rRight), 0, maxR)
  const br = clamp(Math.min(rBottom, rRight), 0, maxR)
  const bl = clamp(Math.min(rBottom, rLeft), 0, maxR)

  const shape = new THREE.Shape()
  shape.moveTo(-w + tl, h)
  shape.lineTo(w - tr, h)
  if (tr > 0) shape.quadraticCurveTo(w, h, w, h - tr)
  shape.lineTo(w, -h + br)
  if (br > 0) shape.quadraticCurveTo(w, -h, w - br, -h)
  shape.lineTo(-w + bl, -h)
  if (bl > 0) shape.quadraticCurveTo(-w, -h, -w, -h + bl)
  shape.lineTo(-w, h - tl)
  if (tl > 0) shape.quadraticCurveTo(-w, h, -w + tl, h)

  return shape
}

function disposeHierarchy(group) {
  group.traverse((obj) => {
    if (obj.geometry) obj.geometry.dispose()
    if (obj.material) {
      if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose())
      else obj.material.dispose()
    }
  })
}

function createPortalCoreMaterial(colors, cfg) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uColorInner: { value: new THREE.Color(colors.inner) },
      uColorOuter: { value: new THREE.Color(colors.outer) },
      uCoreStrength: { value: cfg.portalCoreStrength },
      uRingIntensity: { value: cfg.portalRingIntensity },
      uNoiseScale: { value: cfg.portalNoiseScale },
      uFlowSpeed: { value: cfg.portalFlowSpeed }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform float uTime;
      uniform vec3 uColorInner;
      uniform vec3 uColorOuter;
      uniform float uCoreStrength;
      uniform float uRingIntensity;
      uniform float uNoiseScale;
      uniform float uFlowSpeed;

      float hash(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
      }

      float fbm(vec2 p) {
        float value = 0.0;
        float amp = 0.55;
        for (int i = 0; i < 4; i++) {
          value += amp * noise(p);
          p *= 2.06;
          amp *= 0.5;
        }
        return value;
      }

      void main() {
        vec2 centered = (vUv - 0.5) * 2.0;
        float t = uTime * uFlowSpeed;
        float dist = length(centered);
        float angle = atan(centered.y, centered.x);
        vec2 flowUv = centered * uNoiseScale;
        flowUv += vec2(cos(angle * 2.0 + t * 0.9), sin(angle * 1.7 - t * 0.75)) * 0.85;

        float nA = fbm(flowUv + t * 0.75);
        float nB = fbm(flowUv * 1.35 - t * 0.92);
        float flow = nA * 0.7 + nB * 0.5;

        float core = smoothstep(0.98, 0.08, dist + flow * 0.12);
        float ring = smoothstep(0.94, 0.7, dist) * smoothstep(0.26, 0.64, dist + flow * 0.08);
        float arc = smoothstep(0.78, 1.0, sin((angle + flow * 3.5 + t * 1.8) * 6.0) * 0.5 + 0.5);
        float sparks = smoothstep(0.58, 0.96, flow) * smoothstep(0.45, 0.84, dist);
        float alpha = clamp(core * 0.9 + ring * 0.8 + sparks * 0.35, 0.0, 1.0);

        vec3 energy = mix(uColorInner, uColorOuter, clamp(dist * 1.25 + flow * 0.2, 0.0, 1.0));
        energy *= (core * uCoreStrength + ring * uRingIntensity + arc * 0.38 + sparks * 0.22);

        gl_FragColor = vec4(energy, alpha * (0.35 + core * 0.85));
      }
    `
  })
}

function createFrameGlowMaterial(hexColor, strength) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uColor: { value: new THREE.Color(hexColor) },
      uStrength: { value: strength }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform vec3 uColor;
      uniform float uStrength;
      void main() {
        vec2 d = abs(vUv - 0.5) * 2.0;
        float edge = max(d.x, d.y);
        float ring = smoothstep(0.55, 0.98, edge);
        float core = smoothstep(0.86, 1.0, edge);
        float alpha = (ring * 0.35 + core * 0.65) * uStrength;
        gl_FragColor = vec4(uColor, alpha);
      }
    `
  })
}

function createPortalSparkMaterial(hexColor) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(hexColor) }
    },
    vertexShader: `
      attribute float aScale;
      attribute float aSpeed;
      attribute float aPhase;
      uniform float uTime;
      varying float vLife;
      varying float vScale;
      void main() {
        vec3 p = position;
        float t = uTime * aSpeed + aPhase;
        p.z += sin(t) * 0.34;
        p.x += cos(t * 1.35) * 0.07;
        p.y += sin(t * 1.6) * 0.07;
        vLife = 0.5 + 0.5 * sin(t * 2.2);
        vScale = aScale;
        vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = (6.0 + aScale * 14.0) * (1.0 / max(0.1, -mvPosition.z));
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      varying float vLife;
      varying float vScale;
      void main() {
        vec2 c = gl_PointCoord - 0.5;
        float d = length(c);
        float core = smoothstep(0.38, 0.0, d);
        float halo = smoothstep(0.64, 0.08, d);
        float alpha = (core * 0.8 + halo * 0.5) * (0.42 + vLife * 0.72) * (0.4 + vScale * 0.6);
        gl_FragColor = vec4(uColor, alpha);
      }
    `
  })
}

function createPortalSparks(faceShape, colors) {
  const edgePoints = faceShape.getPoints(160)
  const count = edgePoints.length * 2
  const positions = new Float32Array(count * 3)
  const scales = new Float32Array(count)
  const speeds = new Float32Array(count)
  const phases = new Float32Array(count)

  for (let i = 0; i < count; i += 1) {
    const sample = edgePoints[i % edgePoints.length]
    const jitter = (Math.random() - 0.5) * 0.18
    const jitterY = (Math.random() - 0.5) * 0.18
    const i3 = i * 3
    positions[i3] = sample.x + jitter
    positions[i3 + 1] = sample.y + jitterY
    positions[i3 + 2] = (Math.random() - 0.5) * 0.4
    scales[i] = 0.3 + Math.random()
    speeds[i] = 0.7 + Math.random() * 1.6
    phases[i] = Math.random() * Math.PI * 2
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geo.setAttribute('aScale', new THREE.BufferAttribute(scales, 1))
  geo.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1))
  geo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1))

  return new THREE.Points(geo, createPortalSparkMaterial(colors.outer))
}

function createBlackHoleDiskMaterial(cfg) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uHoleSize: { value: cfg.blackHoleSize },
      uRingRadius: { value: cfg.blackHoleRingRadius },
      uSpinSpeed: { value: cfg.blackHoleSpinSpeed },
      uGlow: { value: cfg.blackHoleGlow },
      uColorA: { value: new THREE.Color(cfg.blackHoleColorA) },
      uColorB: { value: new THREE.Color(cfg.blackHoleColorB) }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform float uTime;
      uniform float uHoleSize;
      uniform float uRingRadius;
      uniform float uSpinSpeed;
      uniform float uGlow;
      uniform vec3 uColorA;
      uniform vec3 uColorB;

      float hash(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
      }

      void main() {
        vec2 p = (vUv - 0.5) * 2.0;
        float dist = length(p);
        float angle = atan(p.y, p.x);
        float t = uTime * uSpinSpeed;

        float swirlNoise = noise(vec2(dist * 18.0 - t * 2.8, angle * 4.8 + t * 2.0));
        float streaks = sin(angle * 24.0 - dist * 38.0 - t * 12.0) * 0.5 + 0.5;
        float diskBand = exp(-pow((dist - uRingRadius) * 10.0, 2.0));
        float glowBand = exp(-pow((dist - (uRingRadius + 0.07)) * 8.0, 2.0));
        float coreMask = smoothstep(uHoleSize + 0.05, uHoleSize, dist);
        float horizonEdge = smoothstep(uHoleSize + 0.09, uHoleSize + 0.015, dist);

        vec3 ember = mix(uColorA, uColorB, clamp(swirlNoise * 0.9 + streaks * 0.45, 0.0, 1.0));

        float diskEnergy = diskBand * (0.42 + swirlNoise * 0.8 + streaks * 0.45);
        float haloEnergy = glowBand * (0.35 + streaks * 0.55);
        float total = (diskEnergy + haloEnergy * 0.8) * uGlow;

        vec3 color = ember * total;
        color = mix(color, vec3(0.0), coreMask);
        color *= horizonEdge;

        float alpha = clamp((diskBand * 0.95 + glowBand * 0.55) * uGlow * horizonEdge, 0.0, 1.0);
        gl_FragColor = vec4(color, alpha);
      }
    `
  })
}

function createBlackHoleDustMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uColorA: { value: new THREE.Color('#ff7e1d') },
      uColorB: { value: new THREE.Color('#ffd067') }
    },
    vertexShader: `
      attribute float aRadius;
      attribute float aAngle;
      attribute float aSpeed;
      attribute float aHeight;
      uniform float uTime;
      varying float vMix;
      void main() {
        float spin = aAngle + uTime * aSpeed;
        float warp = sin(uTime * aSpeed * 2.2 + aAngle * 4.0) * 0.055;
        vec3 p = vec3(
          sin(spin) * (aRadius + warp),
          aHeight + sin(uTime * (0.7 + aSpeed) + aAngle * 8.0) * 0.018,
          cos(spin) * (aRadius + warp)
        );
        vMix = clamp((aRadius - 0.7) * 2.1, 0.0, 1.0);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = (5.0 + (1.0 - vMix) * 7.0) * (1.0 / max(0.1, -mv.z));
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: `
      uniform vec3 uColorA;
      uniform vec3 uColorB;
      varying float vMix;
      void main() {
        vec2 c = gl_PointCoord - 0.5;
        float d = length(c);
        float alpha = smoothstep(0.52, 0.0, d);
        vec3 color = mix(uColorA, uColorB, vMix);
        gl_FragColor = vec4(color, alpha * 0.78);
      }
    `
  })
}

function createBlackHoleDustPoints(cfg) {
  const count = 1400
  const positions = new Float32Array(count * 3)
  const radii = new Float32Array(count)
  const angles = new Float32Array(count)
  const speeds = new Float32Array(count)
  const heights = new Float32Array(count)

  for (let i = 0; i < count; i += 1) {
    const i3 = i * 3
    positions[i3] = 0
    positions[i3 + 1] = 0
    positions[i3 + 2] = 0
    radii[i] = 0.7 + Math.random() * 1.8
    angles[i] = Math.random() * Math.PI * 2
    speeds[i] = 0.2 + (2.5 - radii[i]) * 0.22 + Math.random() * 0.08
    heights[i] = (Math.random() - 0.5) * 0.08
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geo.setAttribute('aRadius', new THREE.BufferAttribute(radii, 1))
  geo.setAttribute('aAngle', new THREE.BufferAttribute(angles, 1))
  geo.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1))
  geo.setAttribute('aHeight', new THREE.BufferAttribute(heights, 1))

  const points = new THREE.Points(geo, createBlackHoleDustMaterial())
  points.material.uniforms.uColorA.value.set(cfg.blackHoleDustColorA)
  points.material.uniforms.uColorB.value.set(cfg.blackHoleDustColorB)
  return points
}

export default function BlackHolePortalMuseum() {
  const mountRef = useRef(null)
  const sceneDataRef = useRef(null)
  const [theme, setTheme] = useState(DEFAULT_CONFIG)
  const [isHelperOpen, setIsHelperOpen] = useState(true)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(DEFAULT_CONFIG.sceneTint)

    const camera = new THREE.PerspectiveCamera(
      DEFAULT_CONFIG.cameraFov,
      mount.clientWidth / mount.clientHeight,
      0.1,
      100
    )

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    mount.appendChild(renderer.domElement)

    const composer = new EffectComposer(renderer)
    composer.addPass(new RenderPass(scene, camera))
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(mount.clientWidth, mount.clientHeight),
      DEFAULT_CONFIG.bloomStrength,
      DEFAULT_CONFIG.bloomRadius,
      DEFAULT_CONFIG.bloomThreshold
    )
    composer.addPass(bloomPass)

    const hemi = new THREE.HemisphereLight('#acc7ff', '#050916', DEFAULT_CONFIG.hemiIntensity)
    scene.add(hemi)

    const keyLight = new THREE.DirectionalLight('#f4f8ff', DEFAULT_CONFIG.keyIntensity)
    keyLight.position.set(3.2, 3.2, 2.5)
    scene.add(keyLight)

    const rim = new THREE.PointLight('#77c5ff', DEFAULT_CONFIG.rimIntensity, 36)
    rim.position.set(0, 1.6, -2.8)
    scene.add(rim)

    const wallGroup = new THREE.Group()
    scene.add(wallGroup)

    const frameGroup = new THREE.Group()
    scene.add(frameGroup)

    const blackHoleGroup = new THREE.Group()
    scene.add(blackHoleGroup)

    const portalMaterials = []
    const portalSparkMaterials = []
    const blackHoleMaterials = []
    const blackHoleDustMaterials = []
    const frameMeta = []

    const spin = { targetRotation: THREE.MathUtils.degToRad(DEFAULT_CONFIG.rotationOffsetDeg) }

    function rebuildScene(cfg) {
      portalMaterials.length = 0
      portalSparkMaterials.length = 0
      blackHoleMaterials.length = 0
      blackHoleDustMaterials.length = 0
      frameMeta.length = 0

      disposeHierarchy(wallGroup)
      disposeHierarchy(frameGroup)
      disposeHierarchy(blackHoleGroup)
      wallGroup.clear()
      frameGroup.clear()
      blackHoleGroup.clear()

      scene.background = new THREE.Color(cfg.sceneTint)

      const wall = new THREE.Mesh(
        new THREE.CylinderGeometry(cfg.wallRadius, cfg.wallRadius, cfg.wallHeight, 128, 1, true),
        new THREE.MeshStandardMaterial({
          color: cfg.wallColor,
          roughness: 0.93,
          metalness: 0.05,
          side: THREE.BackSide
        })
      )
      wallGroup.add(wall)

      const floor = new THREE.Mesh(
        new THREE.CircleGeometry(cfg.wallRadius * 1.24, 96),
        new THREE.MeshPhysicalMaterial({
          color: cfg.floorColor,
          roughness: 0.1,
          metalness: 0.2,
          clearcoat: 1,
          transparent: true,
          opacity: 0.95,
          side: THREE.DoubleSide
        })
      )
      floor.rotation.x = Math.PI / 2
      floor.position.y = -cfg.wallHeight / 2
      wallGroup.add(floor)

      const roof = new THREE.Mesh(
        new THREE.CircleGeometry(cfg.wallRadius * 1.24, 96),
        new THREE.MeshPhysicalMaterial({
          color: cfg.roofColor,
          roughness: 0.16,
          metalness: 0.12,
          transparent: true,
          opacity: 0.7,
          side: THREE.DoubleSide
        })
      )
      roof.rotation.x = Math.PI / 2
      roof.position.y = cfg.wallHeight / 2
      wallGroup.add(roof)

      blackHoleGroup.position.set(cfg.blackHolePosX, cfg.blackHolePosY, cfg.blackHolePosZ)

      const diskMaterial = createBlackHoleDiskMaterial(cfg)
      const disk = new THREE.Mesh(new THREE.CircleGeometry(cfg.wallRadius * 0.46, 160), diskMaterial)
      disk.rotation.x = Math.PI / 2
      blackHoleGroup.add(disk)
      blackHoleMaterials.push(diskMaterial)

      const glowRing = new THREE.Mesh(
        new THREE.RingGeometry(
          cfg.wallRadius * Math.max(cfg.blackHoleRingRadius - 0.03, 0.02),
          cfg.wallRadius * (cfg.blackHoleRingRadius + 0.045),
          128
        ),
        new THREE.MeshBasicMaterial({
          color: cfg.blackHoleColorB,
          transparent: true,
          opacity: 0.4,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          side: THREE.DoubleSide
        })
      )
      glowRing.rotation.x = Math.PI / 2
      glowRing.position.y = 0.004
      blackHoleGroup.add(glowRing)

      const horizon = new THREE.Mesh(
        new THREE.CircleGeometry(cfg.wallRadius * cfg.blackHoleSize * 0.72, 96),
        new THREE.MeshBasicMaterial({
          color: '#000000',
          transparent: true,
          opacity: 0.98,
          depthWrite: false,
          side: THREE.DoubleSide
        })
      )
      horizon.rotation.x = Math.PI / 2
      horizon.position.y = 0.002
      blackHoleGroup.add(horizon)

      const dust = createBlackHoleDustPoints(cfg)
      dust.position.y = 0.01
      blackHoleGroup.add(dust)
      blackHoleDustMaterials.push(dust.material)

      const blackHoleLight = new THREE.PointLight(cfg.blackHoleColorA, cfg.blackHoleGlow * 0.9, cfg.wallRadius * 0.8, 2)
      blackHoleLight.position.set(0, 0.2, 0)
      blackHoleGroup.add(blackHoleLight)

      const angStep = ((Math.PI * 2) / cfg.frameCount) * cfg.frameGap
      const baseRadius = cfg.wallRadius - cfg.frameDepth / 2 - 0.05 + cfg.depthOffset

      for (let i = 0; i < cfg.frameCount; i += 1) {
        const angle = i * angStep
        const holder = new THREE.Group()
        holder.position.set(Math.sin(angle) * baseRadius, cfg.yOffset, Math.cos(angle) * baseRadius)
        holder.lookAt(0, cfg.yOffset, 0)

        const faceWidth = cfg.frameWidth - cfg.frameInset * 1.4
        const faceHeight = cfg.frameHeight - cfg.frameInset * 1.4
        const faceShape = createRoundedRectShape(faceWidth, faceHeight, cfg.roundTop, cfg.roundBottom, cfg.roundLeft, cfg.roundRight)
        const faceGeo = new THREE.ShapeGeometry(faceShape, 36)

        const positions = faceGeo.attributes.position
        const halfW = Math.max(faceWidth / 2, 0.001)
        const halfH = Math.max(faceHeight / 2, 0.001)
        for (let p = 0; p < positions.count; p += 1) {
          const x = positions.getX(p) / halfW
          const y = positions.getY(p) / halfH
          const dome = clamp(1 - (x * x + y * y), 0, 1)
          positions.setZ(p, dome * cfg.frameDepth * 0.44)
        }
        positions.needsUpdate = true
        faceGeo.computeVertexNormals()

        const portalColors = PORTAL_PALETTES[i % PORTAL_PALETTES.length]

        const faceBack = new THREE.Mesh(
          faceGeo.clone(),
          new THREE.MeshBasicMaterial({
            color: '#04070f',
            transparent: true,
            opacity: 0.92,
            side: THREE.DoubleSide
          })
        )
        faceBack.position.z = 0
        holder.add(faceBack)

        const portalCoreMat = createPortalCoreMaterial(portalColors, cfg)
        const portalCore = new THREE.Mesh(faceGeo.clone(), portalCoreMat)
        portalCore.position.z = 0.03
        holder.add(portalCore)
        portalMaterials.push(portalCoreMat)

        const portalOuterMat = createPortalCoreMaterial(
          { inner: portalColors.outer, outer: '#ffffff' },
          {
            ...cfg,
            portalCoreStrength: cfg.portalCoreStrength * 0.75,
            portalRingIntensity: cfg.portalRingIntensity * 1.15,
            portalNoiseScale: cfg.portalNoiseScale * 1.24,
            portalFlowSpeed: cfg.portalFlowSpeed * 1.1
          }
        )
        const portalOuter = new THREE.Mesh(faceGeo.clone(), portalOuterMat)
        portalOuter.scale.set(1.03, 1.03, 1)
        portalOuter.position.z = 0.04
        holder.add(portalOuter)
        portalMaterials.push(portalOuterMat)

        const portalVortex = new THREE.Mesh(
          faceGeo.clone(),
          new THREE.MeshPhysicalMaterial({
            color: cfg.glassTint,
            transparent: true,
            opacity: cfg.glassOpacity1 * 0.75,
            roughness: cfg.glassRoughness,
            metalness: 0.1,
            transmission: clamp(cfg.glassTransmission * 0.75, 0, 1),
            ior: cfg.glassIor,
            thickness: cfg.glassThickness * 0.8,
            clearcoat: 1,
            clearcoatRoughness: 0.09,
            side: THREE.DoubleSide
          })
        )
        portalVortex.scale.set(1.012, 1.012, 1)
        portalVortex.position.z = 0.055
        holder.add(portalVortex)

        const glowColor = GLOW_COLORS[i % GLOW_COLORS.length]
        const glowInner = new THREE.Mesh(faceGeo.clone(), createFrameGlowMaterial(glowColor, cfg.glowStrength * 0.95))
        glowInner.scale.set(1.015, 1.015, 1)
        glowInner.position.z = 0.01
        holder.add(glowInner)

        const glowOuter = new THREE.Mesh(faceGeo.clone(), createFrameGlowMaterial(glowColor, cfg.glowStrength * cfg.glowOuterBoost))
        glowOuter.scale.set(cfg.glowOuterScale, cfg.glowOuterScale, 1)
        glowOuter.position.z = -0.015
        holder.add(glowOuter)

        const glowFar = new THREE.Mesh(faceGeo.clone(), createFrameGlowMaterial(glowColor, cfg.glowStrength * cfg.glowFarBoost))
        glowFar.scale.set(cfg.glowFarScale, cfg.glowFarScale, 1)
        glowFar.position.z = -0.045
        holder.add(glowFar)

        const pathPoints = faceShape.getPoints(84).map((pt) => new THREE.Vector3(pt.x, pt.y, 0.055))
        pathPoints.push(pathPoints[0].clone())
        const lineGeo = new THREE.BufferGeometry().setFromPoints(pathPoints)
        const line = new THREE.Line(
          lineGeo,
          new THREE.LineBasicMaterial({
            color: glowColor,
            transparent: true,
            opacity: cfg.lineOpacity,
            blending: THREE.AdditiveBlending
          })
        )
        holder.add(line)
        const lineHot = new THREE.Line(
          lineGeo.clone(),
          new THREE.LineBasicMaterial({
            color: '#ffffff',
            transparent: true,
            opacity: cfg.lineHotOpacity,
            blending: THREE.AdditiveBlending
          })
        )
        lineHot.scale.set(1.008, 1.008, 1)
        holder.add(lineHot)
        const sparks = createPortalSparks(faceShape, portalColors)
        sparks.position.z = 0.07
        holder.add(sparks)
        portalSparkMaterials.push(sparks.material)

        frameGroup.add(holder)
        frameMeta.push({ holder, baseAngle: angle, lineHot, portalCore, portalOuter, portalVortex, sparks })
      }

      spin.targetRotation = THREE.MathUtils.degToRad(cfg.rotationOffsetDeg)
      frameGroup.rotation.y = spin.targetRotation
    }

    function applyCamera(cfg) {
      camera.fov = cfg.cameraFov
      camera.position.set(cfg.cameraX, cfg.cameraY, cfg.cameraZ)
      camera.lookAt(0, cfg.cameraLookY, 1)
      camera.updateProjectionMatrix()
    }

    rebuildScene(DEFAULT_CONFIG)
    applyCamera(DEFAULT_CONFIG)

    const onResize = () => {
      const w = mount.clientWidth
      const h = mount.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
      composer.setSize(w, h)
    }

    const onWheel = (event) => {
      const strength = sceneDataRef.current?.settings?.scrollRotateStrength ?? DEFAULT_CONFIG.scrollRotateStrength
      spin.targetRotation += event.deltaY * strength
    }

    window.addEventListener('resize', onResize)
    mount.addEventListener('wheel', onWheel, { passive: true })

    let rafId = 0
    const tick = (now) => {
      const t = now * 0.001
      const themeActive = sceneDataRef.current?.themeSettings ?? DEFAULT_CONFIG

      for (const mat of portalMaterials) mat.uniforms.uTime.value = t
      for (const mat of portalSparkMaterials) mat.uniforms.uTime.value = t
      for (const mat of blackHoleMaterials) {
        mat.uniforms.uTime.value = t
        mat.uniforms.uHoleSize.value = themeActive.blackHoleSize
        mat.uniforms.uRingRadius.value = themeActive.blackHoleRingRadius
        mat.uniforms.uSpinSpeed.value = themeActive.blackHoleSpinSpeed
        mat.uniforms.uGlow.value = themeActive.blackHoleGlow
        mat.uniforms.uColorA.value.set(themeActive.blackHoleColorA)
        mat.uniforms.uColorB.value.set(themeActive.blackHoleColorB)
      }
      for (const mat of blackHoleDustMaterials) {
        mat.uniforms.uTime.value = t
        mat.uniforms.uColorA.value.set(themeActive.blackHoleDustColorA)
        mat.uniforms.uColorB.value.set(themeActive.blackHoleDustColorB)
      }

      for (const frame of frameMeta) {
        const wave = Math.sin(t * 1.15 + frame.baseAngle)
        frame.portalCore.rotation.z = wave * 0.04
        frame.portalOuter.rotation.z = -wave * 0.06
        frame.portalVortex.rotation.z = wave * 0.03
        frame.sparks.rotation.z += 0.0022
        frame.sparks.position.z = 0.07 + Math.sin(t * 2.4 + frame.baseAngle) * 0.012
        frame.lineHot.material.opacity = themeActive.lineHotOpacity * (0.65 + Math.abs(Math.sin(t * 1.2 + frame.baseAngle)) * 0.5)
      }

      blackHoleGroup.rotation.y += themeActive.blackHoleSpinSpeed * 0.0024

      frameGroup.rotation.y += (spin.targetRotation - frameGroup.rotation.y) * 0.1

      let bestIndex = 0
      let bestScore = Infinity
      for (let i = 0; i < frameMeta.length; i += 1) {
        const score = Math.abs(normalizeAngle(frameMeta[i].baseAngle + frameGroup.rotation.y))
        if (score < bestScore) {
          bestScore = score
          bestIndex = i
        }
      }
      sceneDataRef.current?.setActive(bestIndex)

      composer.render()
      rafId = window.requestAnimationFrame(tick)
    }

    rafId = window.requestAnimationFrame(tick)

    sceneDataRef.current = {
      setActive(index) {
        setActiveIndex((prev) => (prev === index ? prev : index))
      },
      setTargetIndex(index) {
        const settings = sceneDataRef.current?.themeSettings ?? DEFAULT_CONFIG
        const step = ((Math.PI * 2) / settings.frameCount) * settings.frameGap
        spin.targetRotation = -index * step
      },
      rebuildScene,
      applyCamera,
      applyTheme(cfg) {
        hemi.intensity = cfg.hemiIntensity
        keyLight.intensity = cfg.keyIntensity
        rim.intensity = cfg.rimIntensity
        bloomPass.strength = cfg.bloomStrength
        bloomPass.radius = cfg.bloomRadius
        bloomPass.threshold = cfg.bloomThreshold
        this.settings.scrollRotateStrength = cfg.scrollRotateStrength
        this.themeSettings = cfg
      },
      themeSettings: DEFAULT_CONFIG,
      settings: {
        scrollRotateStrength: DEFAULT_CONFIG.scrollRotateStrength
      },
      dispose() {
        window.cancelAnimationFrame(rafId)
        window.removeEventListener('resize', onResize)
        mount.removeEventListener('wheel', onWheel)

        disposeHierarchy(wallGroup)
        disposeHierarchy(frameGroup)
        disposeHierarchy(blackHoleGroup)
        wallGroup.clear()
        frameGroup.clear()
        blackHoleGroup.clear()

        composer.dispose?.()
        renderer.dispose()
        if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
      }
    }

    return () => {
      sceneDataRef.current?.dispose()
      sceneDataRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!sceneDataRef.current) return
    sceneDataRef.current.applyTheme(theme)
    sceneDataRef.current.rebuildScene(theme)
    sceneDataRef.current.applyCamera(theme)
  }, [theme])

  const updateThemeField = (key, value) => {
    setTheme((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="app-shell space-shell">
      <div className="space-copy">
        <h1>Explore the Universe</h1>
        <p>OF DIGITAL INFLUENCE</p>
      </div>

      <div className="space-dots">
        {Array.from({ length: theme.frameCount }).map((_, idx) => (
          <button
            key={`dot-${idx}`}
            type="button"
            className={`space-dot ${activeIndex === idx ? 'active' : ''}`}
            onClick={() => sceneDataRef.current?.setTargetIndex(idx)}
            aria-label={`Go to frame ${idx + 1}`}
          />
        ))}
      </div>

      <div className={`toolbar space-toolbar ${isHelperOpen ? '' : 'toolbar-collapsed'}`}>
        <div className="toolbar-head">
          <strong>Black Hole Helper</strong>
          <button type="button" onClick={() => setTheme(DEFAULT_CONFIG)}>
            Reset Theme
          </button>
          <button type="button" onClick={() => setIsHelperOpen((prev) => !prev)}>
            {isHelperOpen ? 'Hide Helper' : 'Show Helper'}
          </button>
          <a href="#/" className="route-link-btn">Routes</a>
        </div>

        <p className="hint">Scroll to rotate 9 animated portals. Center floor is a black-hole core inspired accretion disk.</p>

        <div className={`section-grid ${isHelperOpen ? '' : 'hidden'}`}>
          <section className="control-section">
            <h4>Theme Colors</h4>
            <div className="controls-grid">
              {THEME_COLOR_CONTROLS.map((control) => (
                <label key={control.key} className="control-item color-item">
                  <span>{control.label}</span>
                  <input
                    type="color"
                    value={theme[control.key]}
                    onChange={(e) => updateThemeField(control.key, e.target.value)}
                  />
                </label>
              ))}
            </div>
          </section>

          <section className="control-section">
            <h4>Theme & Glass</h4>
            <div className="controls-grid">
              {THEME_CONTROLS.map((control) => {
                const value = theme[control.key]
                return (
                  <label key={control.key} className="control-item">
                    <span>{control.label}</span>
                    <input
                      type="range"
                      min={control.min}
                      max={control.max}
                      step={control.step}
                      value={value}
                      onChange={(e) => updateThemeField(control.key, Number(e.target.value))}
                    />
                    <small>{Number(value).toFixed(3).replace(/\.000$/, '')}</small>
                  </label>
                )
              })}
            </div>
          </section>

        </div>
      </div>

      <div className="scene-wrap" ref={mountRef} />
    </div>
  )
}
