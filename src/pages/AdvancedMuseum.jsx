import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

const IMMERSIVE_IMAGES = [
  'https://images.unsplash.com/photo-1504198266285-165a74cfde2c?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1523726491678-bf852e717f6a?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1400&q=80'
]

const DEFAULT_CONFIG = {
  "frameCount": 9,
  "frameWidth": 4.94,
  "frameHeight": 8,
  "frameDepth": 0.2,
  "frameInset": 0.2,
  "depthOffset": -0.285,
  "spacing": 1.5,
  "yOffset": 0,
  "rotationOffsetDeg": -7,
  "roundTop": 4,
  "roundBottom": 0,
  "roundLeft": 4,
  "roundRight": 2,
  "wallRadius": 11.12,
  "wallHeight": 15,
  "wallColor": "#ffffff",
  "frameColor": "#ff66de",
  "imageTint": "#ffffff",
  "imageFitMode": "cover",
  "imageFitWidth": 0,
  "imageFitHeight": 0,
  "floorColor": "#fdfdff",
  "roofColor": "#fafaff",
  "sceneTint": "#f0f1f7",
  "frameMetalness": 0.1,
  "frameRoughness": 0.5,
  "waterStrength": 0.19,
  "waterSpeed": 0.24,
  "waterOpacity": 0.27,
  "frameGap": 1.28,
  "scrollRotateStrength": 0.0018,
  "cameraX": 1.06,
  "cameraY": 0.34,
  "cameraZ": 5,
  "cameraLookY": -0.11,
  "cameraFov": 59
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v))
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

function addControl(section, label, type, key, min, max, step) {
  return { section, label, type, key, min, max, step }
}

const CONTROLS = [
  addControl('Frame', 'Frame Count', 'range', 'frameCount', 3, 20, 1),
  addControl('Frame', 'Frame Width', 'range', 'frameWidth', 0.6, 10, 0.01),
  addControl('Frame', 'Frame Height', 'range', 'frameHeight', 0.8, 12, 0.01),
  addControl('Frame', 'Frame Depth', 'range', 'frameDepth', 0.05, 0.6, 0.01),
  addControl('Frame', 'Frame Gap', 'range', 'frameGap', 0.4, 2.5, 0.01),
  addControl('Frame', 'Inner Inset', 'range', 'frameInset', 0.02, 0.4, 0.01),
  addControl('Frame', 'Depth Offset', 'range', 'depthOffset', -0.8, 0.8, 0.005),
  addControl('Frame', 'Y Position', 'range', 'yOffset', -2, 2, 0.01),
  addControl('Frame', 'Round Top', 'range', 'roundTop', 0, 4, 0.01),
  addControl('Frame', 'Round Bottom', 'range', 'roundBottom', 0, 4, 0.01),
  addControl('Frame', 'Round Left', 'range', 'roundLeft', 0, 4, 0.01),
  addControl('Frame', 'Round Right', 'range', 'roundRight', 0, 4, 0.01),
  addControl('Frame', 'Frame Roughness', 'range', 'frameRoughness', 0, 1, 0.01),
  addControl('Frame', 'Frame Metalness', 'range', 'frameMetalness', 0, 1, 0.01),
  addControl('Frame', 'Water Strength', 'range', 'waterStrength', 0, 2, 0.01),
  addControl('Frame', 'Water Speed', 'range', 'waterSpeed', 0, 2, 0.01),
  addControl('Frame', 'Water Opacity', 'range', 'waterOpacity', 0, 1, 0.01),
  addControl('Frame', 'Image Fit Width', 'range', 'imageFitWidth', 0.4, 1, 0.01),
  addControl('Frame', 'Image Fit Height', 'range', 'imageFitHeight', 0.4, 1, 0.01),
  addControl('Scene', 'Wall Radius', 'range', 'wallRadius', 3, 20, 0.01),
  addControl('Scene', 'Wall Height', 'range', 'wallHeight', 2.2, 15, 0.01),
  addControl('Scene', 'Scene Rotation', 'range', 'rotationOffsetDeg', -180, 180, 1),
  addControl('Scene', 'Scroll Rotate', 'range', 'scrollRotateStrength', 0.0005, 0.01, 0.0001),
  addControl('Camera', 'Cam X', 'range', 'cameraX', -5, 5, 0.01),
  addControl('Camera', 'Cam Y', 'range', 'cameraY', -2, 2, 0.01),
  addControl('Camera', 'Cam Z', 'range', 'cameraZ', -5, 5, 0.01),
  addControl('Camera', 'Look Y', 'range', 'cameraLookY', -2, 2, 0.01),
  addControl('Camera', 'FOV', 'range', 'cameraFov', 35, 100, 1),
  addControl('Color', 'Frame Color', 'color', 'frameColor'),
  addControl('Color', 'Image Tint', 'color', 'imageTint'),
  addControl('Color', 'Wall Color', 'color', 'wallColor'),
  addControl('Color', 'Floor Color', 'color', 'floorColor'),
  addControl('Color', 'Roof Color', 'color', 'roofColor'),
  addControl('Color', 'Scene Tint', 'color', 'sceneTint')
]

function disposeHierarchy(group) {
  group.traverse((obj) => {
    if (obj.geometry) obj.geometry.dispose()
    if (obj.material) {
      if (Array.isArray(obj.material)) {
        obj.material.forEach((m) => m.dispose())
      } else {
        obj.material.dispose()
      }
    }
  })
}

function createFallbackTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 768
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
  grad.addColorStop(0, '#1f2741')
  grad.addColorStop(1, '#516899')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
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
      uOffset: { value: new THREE.Vector2(0, 0) },
      uHover: { value: 0 },
      uHoverUv: { value: new THREE.Vector2(0.5, 0.5) },
      uHoverColor: { value: new THREE.Color('#6aa9ff') }
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
      uniform float uHover;
      uniform vec2 uHoverUv;
      uniform vec3 uHoverColor;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
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
        vec2 uv = vUv * uRepeat + uOffset;
        float t = uTime * uSpeed;
        float waveA = sin((uv.y + t * 0.7) * 28.0);
        float waveB = cos((uv.x - t * 0.6) * 24.0);
        uv.x += waveA * 0.012 * uStrength;
        uv.y += waveB * 0.010 * uStrength;

        vec3 base = texture2D(uMap, uv).rgb;
        float shimmer = sin((uv.x + uv.y + t) * 36.0) * 0.08 * uStrength;
        float alphaMask = smoothstep(0.0, 0.2, uv.x) * smoothstep(1.0, 0.8, uv.x) * smoothstep(0.0, 0.2, uv.y) * smoothstep(1.0, 0.8, uv.y);
        vec3 water = base + vec3(0.10, 0.16, 0.22) + shimmer;

        float hoverRadius = 0.16 + uStrength * 0.07;
        float distToHover = length(uv - uHoverUv);
        float hoverMask = smoothstep(hoverRadius, 0.0, distToHover) * uHover;
        float smoke = noise(uv * 12.0 + vec2(t * 0.8, -t * 0.45));
        smoke += noise(uv * 22.0 - vec2(t * 0.55, t * 0.3)) * 0.45;
        smoke *= hoverMask;

        vec3 hoverMix = mix(water, uHoverColor, hoverMask * 0.55);
        vec3 smokeColor = vec3(0.22, 0.26, 0.34) + uHoverColor * 0.2;
        vec3 finalColor = mix(hoverMix, smokeColor, clamp(smoke * 0.55, 0.0, 0.6));
        gl_FragColor = vec4(finalColor, uOpacity * alphaMask);
      }
    `
  })
}

function fitTextureToDome(texture, domeWidth, domeHeight, cfg) {
  if (!texture || !texture.image?.width || !texture.image?.height) {
    if (texture) {
      texture.userData.pendingFit = {
        domeWidth,
        domeHeight,
        imageFitMode: cfg.imageFitMode,
        imageFitWidth: cfg.imageFitWidth,
        imageFitHeight: cfg.imageFitHeight
      }
    }
    return { repeatX: 1, repeatY: 1, offsetX: 0, offsetY: 0 }
  }

  const imageAspect = texture.image.width / texture.image.height
  const domeAspect = domeWidth / domeHeight

  let repeatX = 1
  let repeatY = 1

  if (cfg.imageFitMode === 'cover') {
    // cover-fit: fills shape and may crop one side
    if (imageAspect > domeAspect) {
      repeatX = domeAspect / imageAspect
    } else {
      repeatY = imageAspect / domeAspect
    }
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

export default function AdvancedMuseum() {
  const mountRef = useRef(null)
  const sceneDataRef = useRef(null)
  const [config, setConfig] = useState(DEFAULT_CONFIG)
  const [copyState, setCopyState] = useState('Copy Config')
  const [isHelperOpen, setIsHelperOpen] = useState(true)

  const serialized = useMemo(() => JSON.stringify(config, null, 2), [config])

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(config.sceneTint)

    const camera = new THREE.PerspectiveCamera(
      config.cameraFov,
      mount.clientWidth / mount.clientHeight,
      0.1,
      100
    )

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    mount.appendChild(renderer.domElement)

    const hemi = new THREE.HemisphereLight('#ffffff', '#d8dce5', 1.15)
    scene.add(hemi)

    const keyLight = new THREE.DirectionalLight('#ffffff', 1.35)
    keyLight.position.set(3.2, 3.2, 2.5)
    scene.add(keyLight)

    const rim = new THREE.PointLight('#fff9f0', 0.2, 24)
    rim.position.set(0, 1.4, -2.7)
    scene.add(rim)

    const wallGroup = new THREE.Group()
    scene.add(wallGroup)

    const frameGroup = new THREE.Group()
    scene.add(frameGroup)
    const waterMaterials = []
    const waterLayers = []
    const textureLoader = new THREE.TextureLoader()
    textureLoader.setCrossOrigin('anonymous')
    const textureCache = new Map()
    const fallbackTexture = createFallbackTexture()
    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2(2, 2)

    const spin = { targetRotation: THREE.MathUtils.degToRad(config.rotationOffsetDeg) }

    function syncTextureFit(texture, fit) {
      const bindings = texture?.userData?.fitBindings
      if (!bindings) return
      for (const mat of bindings) {
        mat.uniforms.uRepeat.value.set(fit.repeatX, fit.repeatY)
        mat.uniforms.uOffset.value.set(fit.offsetX, fit.offsetY)
      }
    }

    function getImageTexture(url) {
      if (!url) return fallbackTexture
      if (textureCache.has(url)) return textureCache.get(url)
      const texture = textureLoader.load(
        url,
        () => {
          texture.colorSpace = THREE.SRGBColorSpace
          texture.wrapS = THREE.ClampToEdgeWrapping
          texture.wrapT = THREE.ClampToEdgeWrapping
          texture.minFilter = THREE.LinearMipmapLinearFilter
          texture.magFilter = THREE.LinearFilter
          const pending = texture.userData.pendingFit
          if (pending) {
            const fit = fitTextureToDome(texture, pending.domeWidth, pending.domeHeight, pending)
            syncTextureFit(texture, fit)
            texture.userData.pendingFit = null
          }
          texture.needsUpdate = true
        },
        undefined,
        () => {
          if (fallbackTexture) textureCache.set(url, fallbackTexture)
        }
      )
      textureCache.set(url, texture)
      return texture
    }

    function rebuildScene(cfg) {
      waterMaterials.length = 0
      waterLayers.length = 0
      textureCache.forEach((texture) => {
        if (!texture.userData) texture.userData = {}
        texture.userData.fitBindings = []
      })
      disposeHierarchy(wallGroup)
      disposeHierarchy(frameGroup)
      wallGroup.clear()
      frameGroup.clear()

      scene.background = new THREE.Color(cfg.sceneTint)

      const wallMat = new THREE.MeshStandardMaterial({
        color: cfg.wallColor,
        roughness: 0.92,
        metalness: 0.06,
        side: THREE.BackSide
      })

      const wallGeo = new THREE.CylinderGeometry(
        cfg.wallRadius,
        cfg.wallRadius,
        cfg.wallHeight,
        128,
        1,
        true
      )
      wallGroup.add(new THREE.Mesh(wallGeo, wallMat))

      const glossyMatParams = {
        roughness: 0.06,
        metalness: 0.35,
        clearcoat: 1,
        clearcoatRoughness: 0.05,
        envMapIntensity: 1.1
      }

      const floorGeo = new THREE.CircleGeometry(cfg.wallRadius * 1.2, 96)
      const floorMat = new THREE.MeshPhysicalMaterial({
        ...glossyMatParams,
        color: cfg.floorColor,
        side: THREE.DoubleSide
      })
      const floor = new THREE.Mesh(floorGeo, floorMat)
      floor.rotation.x = Math.PI / 2
      floor.position.y = -cfg.wallHeight / 2
      wallGroup.add(floor)

      const roofGeo = new THREE.CircleGeometry(cfg.wallRadius * 1.2, 96)
      const roofMat = new THREE.MeshPhysicalMaterial({
        ...glossyMatParams,
        color: cfg.roofColor,
        side: THREE.DoubleSide
      })
      const roof = new THREE.Mesh(roofGeo, roofMat)
      roof.rotation.x = Math.PI / 2
      roof.position.y = cfg.wallHeight / 2
      wallGroup.add(roof)

      const angStep = ((Math.PI * 2) / cfg.frameCount) * cfg.frameGap
      const baseRadius = cfg.wallRadius - cfg.frameDepth / 2 - 0.02 + cfg.depthOffset

      for (let i = 0; i < cfg.frameCount; i += 1) {
        const angle = i * angStep

        const holder = new THREE.Group()
        holder.position.set(
          Math.sin(angle) * baseRadius,
          cfg.yOffset,
          Math.cos(angle) * baseRadius
        )
        holder.lookAt(0, cfg.yOffset, 0)

        const domeWidth = cfg.frameWidth - cfg.frameInset * 1.4
        const domeHeight = cfg.frameHeight - cfg.frameInset * 1.4
        const faceShape = createRoundedRectShape(
          domeWidth,
          domeHeight,
          cfg.roundTop,
          cfg.roundBottom,
          cfg.roundLeft,
          cfg.roundRight
        )
        const faceGeo = new THREE.ShapeGeometry(faceShape, 32)
        const positions = faceGeo.attributes.position
        const halfW = Math.max(domeWidth / 2, 0.001)
        const halfH = Math.max(domeHeight / 2, 0.001)
        for (let p = 0; p < positions.count; p += 1) {
          const x = positions.getX(p) / halfW
          const y = positions.getY(p) / halfH
          const dome = clamp(1 - (x * x + y * y), 0, 1)
          positions.setZ(p, dome * cfg.frameDepth * 0.45)
        }
        positions.needsUpdate = true
        faceGeo.computeVertexNormals()

        const imageTexture = getImageTexture(IMMERSIVE_IMAGES[i % IMMERSIVE_IMAGES.length])
        const fit = fitTextureToDome(imageTexture, domeWidth, domeHeight, cfg)
        const faceMat = new THREE.MeshBasicMaterial({
          map: imageTexture,
          color: cfg.imageTint,
          toneMapped: false
        })
        const face = new THREE.Mesh(faceGeo, faceMat)
        face.position.z = 0.001

        const waterMesh = new THREE.Mesh(
          faceGeo.clone(),
          createWaterOverlayMaterial(imageTexture, cfg)
        )
        if (!imageTexture.userData.fitBindings) imageTexture.userData.fitBindings = []
        imageTexture.userData.fitBindings.push(waterMesh.material)
        waterMesh.material.uniforms.uRepeat.value.set(fit.repeatX, fit.repeatY)
        waterMesh.material.uniforms.uOffset.value.set(fit.offsetX, fit.offsetY)
        waterMesh.position.z = 0.02
        waterMaterials.push(waterMesh.material)
        waterLayers.push({ mesh: waterMesh, mat: waterMesh.material, hoverTarget: 0, hoverValue: 0 })

        holder.add(face)
        holder.add(waterMesh)
        frameGroup.add(holder)
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

    rebuildScene(config)
    applyCamera(config)

    const onResize = () => {
      const w = mount.clientWidth
      const h = mount.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }

    const onWheel = (event) => {
      const strength = sceneDataRef.current?.settings?.scrollRotateStrength ?? DEFAULT_CONFIG.scrollRotateStrength
      spin.targetRotation += event.deltaY * strength
    }

    const onPointerMove = (event) => {
      const rect = mount.getBoundingClientRect()
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
    }

    const onPointerLeave = () => {
      pointer.set(2, 2)
      for (const layer of waterLayers) {
        layer.hoverTarget = 0
      }
    }

    window.addEventListener('resize', onResize)
    mount.addEventListener('wheel', onWheel, { passive: true })
    mount.addEventListener('pointermove', onPointerMove, { passive: true })
    mount.addEventListener('pointerleave', onPointerLeave)

    let rafId = 0
    const tick = (now) => {
      const t = now * 0.001
      raycaster.setFromCamera(pointer, camera)
      const hits = raycaster.intersectObjects(waterLayers.map((l) => l.mesh), false)
      const hovered = hits[0]

      for (const layer of waterLayers) {
        layer.hoverTarget = 0
      }
      if (hovered) {
        const layer = waterLayers.find((l) => l.mesh === hovered.object)
        if (layer) {
          layer.hoverTarget = 1
          if (hovered.uv) {
            layer.mat.uniforms.uHoverUv.value.set(hovered.uv.x, hovered.uv.y)
            const hoverColor = new THREE.Color().setHSL(
              0.52 + hovered.uv.x * 0.28,
              0.65,
              0.52
            )
            layer.mat.uniforms.uHoverColor.value.copy(hoverColor)
          }
        }
      }

      for (const mat of waterMaterials) {
        mat.uniforms.uTime.value = t
      }
      for (const layer of waterLayers) {
        layer.hoverValue += (layer.hoverTarget - layer.hoverValue) * 0.12
        layer.mat.uniforms.uHover.value = layer.hoverValue
      }
      frameGroup.rotation.y += (spin.targetRotation - frameGroup.rotation.y) * 0.1
      renderer.render(scene, camera)
      rafId = window.requestAnimationFrame(tick)
    }

    rafId = window.requestAnimationFrame(tick)

    sceneDataRef.current = {
      rebuildScene,
      applyCamera,
      spin,
      settings: {
        scrollRotateStrength: config.scrollRotateStrength
      },
      dispose() {
        window.cancelAnimationFrame(rafId)
        window.removeEventListener('resize', onResize)
        mount.removeEventListener('wheel', onWheel)
        mount.removeEventListener('pointermove', onPointerMove)
        mount.removeEventListener('pointerleave', onPointerLeave)
        disposeHierarchy(wallGroup)
        disposeHierarchy(frameGroup)
        wallGroup.clear()
        frameGroup.clear()
        renderer.dispose()
        textureCache.forEach((texture, key) => {
          if (fallbackTexture && texture === fallbackTexture && key !== '__fallback__') return
          texture.dispose?.()
        })
        fallbackTexture?.dispose?.()
        if (mount.contains(renderer.domElement)) {
          mount.removeChild(renderer.domElement)
        }
      }
    }

    return () => {
      sceneDataRef.current?.dispose()
      sceneDataRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!sceneDataRef.current) return
    sceneDataRef.current.rebuildScene(config)
    sceneDataRef.current.applyCamera(config)
    sceneDataRef.current.settings.scrollRotateStrength = config.scrollRotateStrength
  }, [config])

  const updateField = (key, value) => {
    setConfig((prev) => ({ ...prev, [key]: value }))
  }

  const copyConfig = async () => {
    try {
      await navigator.clipboard.writeText(serialized)
      setCopyState('Copied')
      window.setTimeout(() => setCopyState('Copy Config'), 1200)
    } catch {
      setCopyState('Copy Failed')
      window.setTimeout(() => setCopyState('Copy Config'), 1500)
    }
  }

  const groupedControls = CONTROLS.reduce((acc, control) => {
    if (!acc[control.section]) acc[control.section] = []
    acc[control.section].push(control)
    return acc
  }, {})

  return (
    <div className="app-shell">
      <div className={`toolbar ${isHelperOpen ? '' : 'toolbar-collapsed'}`}>
        <div className="toolbar-head">
          <strong>Scene Helper</strong>
          <button type="button" onClick={() => setConfig(DEFAULT_CONFIG)}>
            Reset
          </button>
          <button type="button" onClick={copyConfig}>
            {copyState}
          </button>
          <button type="button" onClick={() => setIsHelperOpen((prev) => !prev)}>
            {isHelperOpen ? 'Hide Helper' : 'Show Helper'}
          </button>
          <a href="#/" className="route-link-btn">Routes</a>
        </div>
        <p className="hint">Scroll over scene to rotate. Camera stays centered; scene moves around it.</p>

        <div className={`section-grid ${isHelperOpen ? '' : 'hidden'}`}>
          <section className="control-section">
            <h4>Image Fit</h4>
            <label className="control-item select-item">
              <span>Fit Mode</span>
              <select
                value={config.imageFitMode}
                onChange={(e) => updateField('imageFitMode', e.target.value)}
              >
                <option value="fill">Fill Whole Image</option>
                <option value="cover">Cover & Crop</option>
              </select>
            </label>
          </section>

          {Object.entries(groupedControls).map(([section, sectionControls]) => (
            <section className="control-section" key={section}>
              <h4>{section}</h4>
              <div className="controls-grid">
                {sectionControls.map((control) => {
                  const value = config[control.key]
                  if (control.type === 'color') {
                    return (
                      <label key={control.key} className="control-item color-item">
                        <span>{control.label}</span>
                        <input
                          type="color"
                          value={value}
                          onChange={(e) => updateField(control.key, e.target.value)}
                        />
                      </label>
                    )
                  }

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
          ))}
        </div>
      </div>

      <div className="scene-wrap" ref={mountRef} />
    </div>
  )
}
