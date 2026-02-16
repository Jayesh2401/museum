import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

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
  "floorColor": "#fdfdff",
  "roofColor": "#fafaff",
  "sceneTint": "#f0f1f7",
  "frameMetalness": 0.1,
  "frameRoughness": 0.5,
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
  addControl('Scene', 'Wall Radius', 'range', 'wallRadius', 3, 20, 0.01),
  addControl('Scene', 'Wall Height', 'range', 'wallHeight', 2.2, 15, 0.01),
  addControl('Scene', 'Scene Rotation', 'range', 'rotationOffsetDeg', -180, 180, 1),
  addControl('Scene', 'Scroll Rotate', 'range', 'scrollRotateStrength', 0.0005, 0.01, 0.0001),
  addControl('Camera', 'Cam X', 'range', 'cameraX', -5, 5, 0.01),
  addControl('Camera', 'Cam Y', 'range', 'cameraY', -2, 2, 0.01),
  addControl('Camera', 'Cam Z', 'range', 'cameraZ', -5, 5, 0.01),
  addControl('Camera', 'Look Y', 'range', 'cameraLookY', -2, 2, 0.01),
  addControl('Camera', 'FOV', 'range', 'cameraFov', 35, 100, 1),
  addControl('Color', 'Dome Color', 'color', 'frameColor'),
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

export default function App() {
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

    const rim = new THREE.PointLight('#fff9f0', 0.6, 24)
    rim.position.set(0, 1.4, -2.7)
    scene.add(rim)

    const wallGroup = new THREE.Group()
    scene.add(wallGroup)

    const frameGroup = new THREE.Group()
    scene.add(frameGroup)

    const spin = { targetRotation: THREE.MathUtils.degToRad(config.rotationOffsetDeg) }

    function rebuildScene(cfg) {
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

        const faceMat = new THREE.MeshPhysicalMaterial({
          color: cfg.frameColor,
          roughness: clamp(cfg.frameRoughness * 0.6, 0.02, 1),
          metalness: clamp(cfg.frameMetalness + 0.15, 0, 1),
          clearcoat: 1,
          clearcoatRoughness: 0.08
        })
        const face = new THREE.Mesh(faceGeo, faceMat)
        face.position.z = 0.001

        holder.add(face)
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

    window.addEventListener('resize', onResize)
    mount.addEventListener('wheel', onWheel, { passive: true })

    let rafId = 0
    const tick = () => {
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
        disposeHierarchy(wallGroup)
        disposeHierarchy(frameGroup)
        wallGroup.clear()
        frameGroup.clear()
        renderer.dispose()
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
