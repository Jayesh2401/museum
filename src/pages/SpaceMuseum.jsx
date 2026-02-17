import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'

import mat1 from '../Assets/mat1.jpg'
import mat2 from '../Assets/mat2.jpg'
import mat3 from '../Assets/mat3.jpg'
import mat4 from '../Assets/mat4.jpg'
import mat5 from '../Assets/mat5.jpg'
import mat6 from '../Assets/mat6.jpg'
import mat7 from '../Assets/mat7.jpg'
import mat8 from '../Assets/mat8.jpg'
import mat9 from '../Assets/mat9.jpg'
import mat10 from '../Assets/mat10.jpg'

import smokeTexture from '../Assets/smoke.png'
import particle1 from '../Assets/1.png'
import particle2 from '../Assets/2.png'
import particle5 from '../Assets/5.png'
import particle9 from '../Assets/9.png'

const MAT_IMAGES = [mat1, mat2, mat3, mat4, mat5, mat6, mat7, mat8, mat9, mat10]
const PARTICLE_SPRITES = [smokeTexture, particle5, particle2, particle1, particle9]
const GLOW_COLORS = ['#ffab6b', '#b08cff', '#5ce2ff', '#ff8bd1', '#8ef0ff', '#a6a9ff', '#8ed4ff', '#ff9f9f', '#77ddff']

const CARDS = [
  { title: 'Rise of Blogging', date: '1986 - 2000' },
  { title: 'Wordpressism', date: '1996 - 2004' },
  { title: 'TikTokko', date: '2016 - present' },
  { title: 'Mars Calling', date: '2032 - 2040' },
  { title: 'Neon Streams', date: '2041 - 2050' },
  { title: 'Signal Era', date: '2051 - 2062' },
  { title: 'Hyper Nodes', date: '2063 - 2074' },
  { title: 'Quantum Pulse', date: '2075 - 2086' },
  { title: 'Orbit Minds', date: '2087 - 2098' }
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
  imageTint: '#ffffff',
  imageFitMode: 'cover',
  imageFitWidth: 1,
  imageFitHeight: 1,
  floorColor: '#081128',
  roofColor: '#0a1426',
  sceneTint: '#020611',
  waterStrength: 0.2,
  waterSpeed: 0.28,
  waterOpacity: 0.3,
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
  lineOpacity: 0.95,
  lineHotOpacity: 0.62,
  glassTint: '#89bcff',
  glassOpacity1: 0.12,
  glassOpacity2: 0.1,
  glassOpacity3: 0.08,
  glassTransmission: 0.82,
  glassRoughness: 0.08,
  glassIor: 1.52,
  glassThickness: 1.1,
  cardScale: 0.42,
  cardYOffset: 0.24,
  cardGlassOpacity: 0.14,
  bloomStrength: 1.15,
  bloomRadius: 0.6,
  bloomThreshold: 0.2,
  hemiIntensity: 0.92,
  keyIntensity: 1.08,
  rimIntensity: 0.6
}

const PARTICLE_DEFAULTS = {
  count: 2600,
  size: 0.095,
  opacity: 0.82,
  glow: 2,
  randomness: 0.86,
  radius: 16.5,
  travelRadius: 2.1,
  spreadY: 10,
  spinSpeed: 0.35,
  twinkle: 0.72,
  colorA: '#79beff',
  colorB: '#f1e2ff'
}

const PARTICLE_CONTROLS = [
  { key: 'count', label: 'Count', min: 400, max: 7000, step: 50 },
  { key: 'size', label: 'Size', min: 0.05, max: 1, step: 0.01 },
  { key: 'opacity', label: 'Opacity', min: 0.1, max: 1, step: 0.01 },
  { key: 'glow', label: 'Glow', min: 0, max: 4, step: 0.01 },
  { key: 'randomness', label: 'Randomness', min: 0, max: 2.4, step: 0.01 },
  { key: 'radius', label: 'Radius', min: 6, max: 30, step: 0.1 },
  { key: 'travelRadius', label: 'Move Radius', min: 0, max: 8, step: 0.05 },
  { key: 'spreadY', label: 'Vertical Spread', min: 1, max: 22, step: 0.1 },
  { key: 'spinSpeed', label: 'Spin Speed', min: 0, max: 1.8, step: 0.01 },
  { key: 'twinkle', label: 'Twinkle', min: 0, max: 2.2, step: 0.01 }
]

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
  { key: 'imageFitWidth', label: 'Image Fit W', min: 0.4, max: 1, step: 0.01 },
  { key: 'imageFitHeight', label: 'Image Fit H', min: 0.4, max: 1, step: 0.01 },
  { key: 'waterStrength', label: 'Water Strength', min: 0, max: 2, step: 0.01 },
  { key: 'waterSpeed', label: 'Water Speed', min: 0, max: 2, step: 0.01 },
  { key: 'waterOpacity', label: 'Water Opacity', min: 0, max: 1, step: 0.01 },
  { key: 'glowStrength', label: 'Glow Strength', min: 0, max: 3, step: 0.01 },
  { key: 'glowOuterScale', label: 'Glow Scale 2', min: 1.02, max: 1.2, step: 0.001 },
  { key: 'glowFarScale', label: 'Glow Scale 3', min: 1.05, max: 1.3, step: 0.001 },
  { key: 'glowOuterBoost', label: 'Glow Boost 2', min: 0, max: 3, step: 0.01 },
  { key: 'glowFarBoost', label: 'Glow Boost 3', min: 0, max: 3, step: 0.01 },
  { key: 'lineOpacity', label: 'Line Opacity', min: 0, max: 1, step: 0.01 },
  { key: 'lineHotOpacity', label: 'Line Hot Opacity', min: 0, max: 1, step: 0.01 },
  { key: 'glassOpacity1', label: 'Glass Layer 1', min: 0, max: 0.5, step: 0.01 },
  { key: 'glassOpacity2', label: 'Glass Layer 2', min: 0, max: 0.5, step: 0.01 },
  { key: 'glassOpacity3', label: 'Glass Layer 3', min: 0, max: 0.5, step: 0.01 },
  { key: 'glassTransmission', label: 'Glass Transmission', min: 0, max: 1, step: 0.01 },
  { key: 'glassRoughness', label: 'Glass Roughness', min: 0, max: 0.35, step: 0.01 },
  { key: 'glassIor', label: 'Glass IOR', min: 1, max: 2.2, step: 0.01 },
  { key: 'glassThickness', label: 'Glass Thickness', min: 0.1, max: 2, step: 0.01 },
  { key: 'cardScale', label: 'Card Scale', min: 0.2, max: 0.8, step: 0.01 },
  { key: 'cardYOffset', label: 'Card Y Offset', min: 0.08, max: 0.45, step: 0.01 },
  { key: 'cardGlassOpacity', label: 'Card Glass', min: 0, max: 0.5, step: 0.01 },
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
  { key: 'imageTint', label: 'Image Tint' },
  { key: 'glassTint', label: 'Glass Tint' }
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

function createWaterOverlayMaterial(texture, cfg) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uMap: { value: texture },
      uTime: { value: 0 },
      uStrength: { value: cfg.waterStrength },
      uSpeed: { value: cfg.waterSpeed },
      uOpacity: { value: cfg.waterOpacity },
      uRepeat: { value: new THREE.Vector2(1, 1) },
      uOffset: { value: new THREE.Vector2(0, 0) }
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
      uniform sampler2D uMap;
      uniform float uTime;
      uniform float uStrength;
      uniform float uSpeed;
      uniform float uOpacity;
      uniform vec2 uRepeat;
      uniform vec2 uOffset;
      void main() {
        vec2 uv = vUv * uRepeat + uOffset;
        float t = uTime * uSpeed;
        uv.x += sin((uv.y + t * 0.65) * 30.0) * 0.012 * uStrength;
        uv.y += cos((uv.x - t * 0.5) * 26.0) * 0.009 * uStrength;
        vec3 base = texture2D(uMap, uv).rgb;
        float shimmer = sin((uv.x + uv.y + t) * 40.0) * 0.08 * uStrength;
        float mask = smoothstep(0.0, 0.18, uv.x) * smoothstep(1.0, 0.82, uv.x) * smoothstep(0.0, 0.18, uv.y) * smoothstep(1.0, 0.82, uv.y);
        gl_FragColor = vec4(base + vec3(0.09, 0.14, 0.24) + shimmer, uOpacity * mask);
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

function fitTextureToShape(texture, width, height, cfg) {
  if (!texture || !texture.image?.width || !texture.image?.height) {
    return { repeatX: 1, repeatY: 1, offsetX: 0, offsetY: 0 }
  }

  const imageAspect = texture.image.width / texture.image.height
  const shapeAspect = width / height

  let repeatX = 1
  let repeatY = 1

  if (cfg.imageFitMode === 'cover') {
    if (imageAspect > shapeAspect) repeatX = shapeAspect / imageAspect
    else repeatY = imageAspect / shapeAspect
  }

  repeatX = clamp(repeatX * cfg.imageFitWidth, 0.05, 1)
  repeatY = clamp(repeatY * cfg.imageFitHeight, 0.05, 1)

  const offsetX = (1 - repeatX) * 0.5
  const offsetY = (1 - repeatY) * 0.5

  texture.wrapS = THREE.ClampToEdgeWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping
  texture.repeat.set(repeatX, repeatY)
  texture.offset.set(offsetX, offsetY)
  texture.needsUpdate = true

  return { repeatX, repeatY, offsetX, offsetY }
}

function createCardLabelTexture(title, date) {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 512
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height)
  grad.addColorStop(0, 'rgba(4, 8, 18, 0.0)')
  grad.addColorStop(1, 'rgba(4, 8, 18, 0.95)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = 'rgba(229, 238, 255, 0.96)'
  ctx.font = 'bold 66px "Trebuchet MS", "Segoe UI", sans-serif'
  ctx.fillText(title, 56, 370)

  ctx.fillStyle = 'rgba(196, 212, 244, 0.95)'
  ctx.font = '46px "Trebuchet MS", "Segoe UI", sans-serif'
  ctx.fillText(date, 56, 445)

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.needsUpdate = true
  return tex
}

export default function SpaceMuseum() {
  const mountRef = useRef(null)
  const sceneDataRef = useRef(null)
  const [particles, setParticles] = useState(PARTICLE_DEFAULTS)
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

    const particleGroup = new THREE.Group()
    scene.add(particleGroup)

    const waterMaterials = []
    const frameMeta = []
    const particleLayers = []

    const textureLoader = new THREE.TextureLoader()
    textureLoader.setCrossOrigin('anonymous')
    const textureCache = new Map()

    const spin = { targetRotation: THREE.MathUtils.degToRad(DEFAULT_CONFIG.rotationOffsetDeg) }

    function getTexture(url) {
      if (textureCache.has(url)) return textureCache.get(url)
      const texture = textureLoader.load(url, () => {
        texture.colorSpace = THREE.SRGBColorSpace
        texture.minFilter = THREE.LinearMipmapLinearFilter
        texture.magFilter = THREE.LinearFilter
        texture.needsUpdate = true
      })
      textureCache.set(url, texture)
      return texture
    }

    function rebuildScene(cfg) {
      waterMaterials.length = 0
      frameMeta.length = 0

      disposeHierarchy(wallGroup)
      disposeHierarchy(frameGroup)
      wallGroup.clear()
      frameGroup.clear()

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

      const floorGlow = new THREE.Mesh(
        new THREE.CircleGeometry(cfg.wallRadius * 1.16, 96),
        new THREE.MeshBasicMaterial({
          map: getTexture(mat10),
          color: '#2b5da9',
          transparent: true,
          opacity: 0.28,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          side: THREE.DoubleSide
        })
      )
      floorGlow.rotation.x = Math.PI / 2
      floorGlow.position.y = -cfg.wallHeight / 2 + 0.02
      wallGroup.add(floorGlow)

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

        const imageTexture = getTexture(MAT_IMAGES[i % MAT_IMAGES.length])
        const fit = fitTextureToShape(imageTexture, faceWidth, faceHeight, cfg)

        const face = new THREE.Mesh(
          faceGeo,
          new THREE.MeshBasicMaterial({ map: imageTexture, color: cfg.imageTint, toneMapped: false })
        )
        face.position.z = 0.001
        holder.add(face)

        const waterMesh = new THREE.Mesh(faceGeo.clone(), createWaterOverlayMaterial(imageTexture, cfg))
        waterMesh.position.z = 0.025
        waterMesh.material.uniforms.uRepeat.value.set(fit.repeatX, fit.repeatY)
        waterMesh.material.uniforms.uOffset.value.set(fit.offsetX, fit.offsetY)
        holder.add(waterMesh)
        waterMaterials.push(waterMesh.material)

        const glass = new THREE.Mesh(
          faceGeo.clone(),
          new THREE.MeshPhysicalMaterial({
            color: cfg.glassTint,
            transparent: true,
            opacity: cfg.glassOpacity1,
            roughness: cfg.glassRoughness,
            metalness: 0.08,
            transmission: cfg.glassTransmission,
            ior: cfg.glassIor,
            thickness: cfg.glassThickness,
            clearcoat: 1,
            clearcoatRoughness: 0.08,
            side: THREE.DoubleSide
          })
        )
        glass.position.z = 0.035
        holder.add(glass)

        const glassMid = new THREE.Mesh(
          faceGeo.clone(),
          new THREE.MeshPhysicalMaterial({
            color: cfg.glassTint,
            transparent: true,
            opacity: cfg.glassOpacity2,
            roughness: clamp(cfg.glassRoughness * 0.8, 0, 0.35),
            metalness: 0.05,
            transmission: cfg.glassTransmission,
            ior: cfg.glassIor,
            thickness: cfg.glassThickness * 0.8,
            clearcoat: 1,
            clearcoatRoughness: 0.05,
            side: THREE.DoubleSide
          })
        )
        glassMid.scale.set(1.012, 1.012, 1)
        glassMid.position.z = 0.055
        holder.add(glassMid)

        const glassOuter = new THREE.Mesh(
          faceGeo.clone(),
          new THREE.MeshPhysicalMaterial({
            color: cfg.glassTint,
            transparent: true,
            opacity: cfg.glassOpacity3,
            roughness: clamp(cfg.glassRoughness * 1.1, 0, 0.4),
            metalness: 0.03,
            transmission: clamp(cfg.glassTransmission * 0.92, 0, 1),
            ior: cfg.glassIor,
            thickness: cfg.glassThickness * 0.65,
            clearcoat: 1,
            clearcoatRoughness: 0.03,
            side: THREE.DoubleSide
          })
        )
        glassOuter.scale.set(1.024, 1.024, 1)
        glassOuter.position.z = 0.075
        holder.add(glassOuter)

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

        const cardW = faceWidth * cfg.cardScale
        const cardH = faceHeight * cfg.cardScale
        const cardImageTexture = getTexture(MAT_IMAGES[(i + 3) % MAT_IMAGES.length])
        const cardImage = new THREE.Mesh(
          new THREE.PlaneGeometry(cardW, cardH),
          new THREE.MeshBasicMaterial({
            map: cardImageTexture,
            transparent: true
          })
        )
        cardImage.position.set(0, -faceHeight * cfg.cardYOffset, 0.165)
        holder.add(cardImage)

        const cardGlass = new THREE.Mesh(
          new THREE.PlaneGeometry(cardW * 1.03, cardH * 1.03),
          new THREE.MeshPhysicalMaterial({
            color: '#98c3ff',
            transparent: true,
            opacity: cfg.cardGlassOpacity,
            roughness: 0.03,
            metalness: 0.06,
            transmission: 0.88,
            clearcoat: 1,
            clearcoatRoughness: 0.03
          })
        )
        cardGlass.position.set(0, -faceHeight * cfg.cardYOffset, 0.18)
        holder.add(cardGlass)

        const cardLabelTexture = createCardLabelTexture(CARDS[i].title, CARDS[i].date)
        const cardLabel = new THREE.Mesh(
          new THREE.PlaneGeometry(cardW, cardH),
          new THREE.MeshBasicMaterial({
            map: cardLabelTexture,
            transparent: true,
            depthWrite: false
          })
        )
        cardLabel.position.set(0, -faceHeight * cfg.cardYOffset, 0.183)
        holder.add(cardLabel)

        frameGroup.add(holder)
        frameMeta.push({ holder, baseAngle: angle, cardImage, cardGlass, cardLabel, lineHot, faceHeight })
      }

      spin.targetRotation = THREE.MathUtils.degToRad(cfg.rotationOffsetDeg)
      frameGroup.rotation.y = spin.targetRotation
    }

    function rebuildParticles(cfg) {
      particleLayers.length = 0
      disposeHierarchy(particleGroup)
      particleGroup.clear()

      const textureCount = PARTICLE_SPRITES.length
      const perLayer = Math.max(20, Math.floor(cfg.count / textureCount))
      const colorA = new THREE.Color(cfg.colorA)
      const colorB = new THREE.Color(cfg.colorB)

      for (let layerIndex = 0; layerIndex < textureCount; layerIndex += 1) {
        const texture = getTexture(PARTICLE_SPRITES[layerIndex])
        const positions = new Float32Array(perLayer * 3)
        const baseRadius = new Float32Array(perLayer)
        const baseAngle = new Float32Array(perLayer)
        const baseY = new Float32Array(perLayer)
        const phase = new Float32Array(perLayer)
        const speed = new Float32Array(perLayer)

        for (let i = 0; i < perLayer; i += 1) {
          const i3 = i * 3
          const radius = cfg.radius + (Math.random() - 0.5) * cfg.radius * cfg.randomness
          const angle = Math.random() * Math.PI * 2
          const y = (Math.random() - 0.5) * cfg.spreadY
          positions[i3] = Math.sin(angle) * radius
          positions[i3 + 1] = y
          positions[i3 + 2] = Math.cos(angle) * radius

          baseRadius[i] = radius
          baseAngle[i] = angle
          baseY[i] = y
          phase[i] = Math.random() * Math.PI * 2
          speed[i] = 0.45 + Math.random() * 1.7
        }

        const geometry = new THREE.BufferGeometry()
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

        const t = layerIndex / Math.max(textureCount - 1, 1)
        const layerColor = new THREE.Color().copy(colorA).lerp(colorB, t)

        const coreMaterial = new THREE.PointsMaterial({
          map: texture,
          color: layerColor,
          transparent: true,
          opacity: cfg.opacity,
          size: cfg.size * (0.84 + layerIndex * 0.14),
          alphaTest: 0.01,
          depthWrite: false,
          blending: THREE.AdditiveBlending
        })

        const glowMaterial = new THREE.PointsMaterial({
          map: texture,
          color: colorB,
          transparent: true,
          opacity: cfg.opacity * 0.22 * cfg.glow,
          size: cfg.size * (1.9 + cfg.glow * 0.75 + layerIndex * 0.12),
          alphaTest: 0.01,
          depthWrite: false,
          blending: THREE.AdditiveBlending
        })

        const points = new THREE.Points(geometry, coreMaterial)
        const glow = new THREE.Points(geometry, glowMaterial)
        particleGroup.add(points)
        particleGroup.add(glow)

        particleLayers.push({
          points,
          coreMaterial,
          glowMaterial,
          perLayer,
          baseRadius,
          baseAngle,
          baseY,
          phase,
          speed,
          orbitBase: 0.06 + layerIndex * 0.015
        })
      }
    }

    function applyCamera(cfg) {
      camera.fov = cfg.cameraFov
      camera.position.set(cfg.cameraX, cfg.cameraY, cfg.cameraZ)
      camera.lookAt(0, cfg.cameraLookY, 1)
      camera.updateProjectionMatrix()
    }

    rebuildScene(DEFAULT_CONFIG)
    rebuildParticles(PARTICLE_DEFAULTS)
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
      const active = sceneDataRef.current?.particleSettings ?? PARTICLE_DEFAULTS
      const themeActive = sceneDataRef.current?.themeSettings ?? DEFAULT_CONFIG

      for (const mat of waterMaterials) mat.uniforms.uTime.value = t

      for (const frame of frameMeta) {
        frame.cardImage.rotation.z = Math.sin(t * 0.35 + frame.baseAngle) * 0.018
        frame.cardGlass.rotation.z = frame.cardImage.rotation.z * 0.75
        frame.cardLabel.rotation.z = frame.cardImage.rotation.z
        frame.cardImage.position.y = -(frame.faceHeight * themeActive.cardYOffset) + Math.sin(t * 0.8 + frame.baseAngle) * 0.06
        frame.cardGlass.position.y = frame.cardImage.position.y
        frame.cardLabel.position.y = frame.cardImage.position.y
        frame.lineHot.material.opacity = themeActive.lineHotOpacity * (0.65 + Math.abs(Math.sin(t * 1.2 + frame.baseAngle)) * 0.5)
      }

      for (const layer of particleLayers) {
        const positionAttr = layer.points.geometry.attributes.position
        for (let i = 0; i < layer.perLayer; i += 1) {
          const i3 = i * 3
          const angle = layer.baseAngle[i] + t * active.spinSpeed * layer.orbitBase * layer.speed[i]
          const pulse = Math.sin(t * layer.speed[i] + layer.phase[i]) * active.travelRadius
          const radius = layer.baseRadius[i] + pulse
          positionAttr.array[i3] = Math.sin(angle) * radius
          positionAttr.array[i3 + 2] = Math.cos(angle) * radius
          positionAttr.array[i3 + 1] = layer.baseY[i] + Math.cos(t * layer.speed[i] * 0.7 + layer.phase[i] * 1.3) * active.travelRadius * 0.2
        }
        positionAttr.needsUpdate = true

        const wave = 0.56 + 0.44 * Math.sin(t * (1.5 + layer.orbitBase * 10) + layer.phase[0])
        layer.coreMaterial.opacity = active.opacity * (0.65 + wave * active.twinkle * 0.35)
        layer.glowMaterial.opacity = active.opacity * 0.22 * active.glow * (0.56 + wave * active.twinkle * 0.44)
      }

      frameGroup.rotation.y += (spin.targetRotation - frameGroup.rotation.y) * 0.1
      particleGroup.rotation.y = t * 0.014

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
      rebuildParticles,
      particleSettings: PARTICLE_DEFAULTS,
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
        disposeHierarchy(particleGroup)
        wallGroup.clear()
        frameGroup.clear()
        particleGroup.clear()

        composer.dispose?.()
        renderer.dispose()
        textureCache.forEach((tex) => tex.dispose?.())
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
    sceneDataRef.current.particleSettings = particles
    sceneDataRef.current.rebuildParticles(particles)
  }, [particles])

  useEffect(() => {
    if (!sceneDataRef.current) return
    sceneDataRef.current.applyTheme(theme)
    sceneDataRef.current.rebuildScene(theme)
    sceneDataRef.current.applyCamera(theme)
  }, [theme])

  const updateField = (key, value) => {
    setParticles((prev) => ({ ...prev, [key]: value }))
  }

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
          <strong>Galaxy Helper</strong>
          <button type="button" onClick={() => setParticles(PARTICLE_DEFAULTS)}>
            Reset Particles
          </button>
          <button type="button" onClick={() => setTheme(DEFAULT_CONFIG)}>
            Reset Theme
          </button>
          <button type="button" onClick={() => setIsHelperOpen((prev) => !prev)}>
            {isHelperOpen ? 'Hide Helper' : 'Show Helper'}
          </button>
          <a href="#/" className="route-link-btn">Routes</a>
        </div>

        <p className="hint">Scroll to rotate 9 faceGeo panels. Theme, glass layers, glow, bloom and particles are fully tunable.</p>

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

          <section className="control-section">
            <h4>Particle Colors</h4>
            <div className="controls-grid">
              <label className="control-item color-item">
                <span>Core</span>
                <input
                  type="color"
                  value={particles.colorA}
                  onChange={(e) => updateField('colorA', e.target.value)}
                />
              </label>
              <label className="control-item color-item">
                <span>Glow</span>
                <input
                  type="color"
                  value={particles.colorB}
                  onChange={(e) => updateField('colorB', e.target.value)}
                />
              </label>
            </div>
          </section>

          <section className="control-section">
            <h4>Particle Motion</h4>
            <div className="controls-grid">
              {PARTICLE_CONTROLS.map((control) => {
                const value = particles[control.key]
                return (
                  <label key={control.key} className="control-item">
                    <span>{control.label}</span>
                    <input
                      type="range"
                      min={control.min}
                      max={control.max}
                      step={control.step}
                      value={value}
                      onChange={(e) => updateField(control.key, Number(e.target.value))}
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
