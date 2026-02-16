import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

const DEFAULT_CONFIG = {
  "holeShape": "arch",
  "wallWidth": 16,
  "wallHeight": 10,
  "wallDepth": 0.41,
  "holeWidth": 3.23,
  "holeHeight": 5.19,
  "holeRadius": 1.65,
  "wallColor": "#eaea99",
  "wallMetalness": 0,
  "wallRoughness": 0.05,
  "wallClearcoat": 0.93,
  "wallClearcoatRoughness": 0.42,
  "sceneRotationY": -1,
  "sceneRotationX": 0,
  "scenePosY": 0,
  "cameraX": 0.04,
  "cameraY": 0.4,
  "cameraZ": 7.59,
  "cameraLookY": 0,
  "cameraFov": 71,
  "lightX": -0.51,
  "lightY": 2.64,
  "lightZ": 2.48,
  "lightIntensity": 6,
  "fillX": 0.25,
  "fillY": 0.8,
  "fillZ": 1.8,
  "fillIntensity": 0.9
}

const CONTROLS = [
  { section: 'Hole', key: 'wallWidth', label: 'Wall Width', min: 4, max: 16, step: 0.01 },
  { section: 'Hole', key: 'wallHeight', label: 'Wall Height', min: 3, max: 10, step: 0.01 },
  { section: 'Hole', key: 'wallDepth', label: 'Wall Depth', min: 0.05, max: 1, step: 0.01 },
  { section: 'Hole', key: 'holeWidth', label: 'Hole Width', min: 0.6, max: 7.5, step: 0.01 },
  { section: 'Hole', key: 'holeHeight', label: 'Hole Height', min: 0.8, max: 8.5, step: 0.01 },
  { section: 'Hole', key: 'holeRadius', label: 'Hole Radius', min: 0, max: 2.8, step: 0.01 },
  { section: 'Material', key: 'wallMetalness', label: 'Metalness', min: 0, max: 1, step: 0.01 },
  { section: 'Material', key: 'wallRoughness', label: 'Roughness', min: 0, max: 1, step: 0.01 },
  { section: 'Material', key: 'wallClearcoat', label: 'Clearcoat', min: 0, max: 1, step: 0.01 },
  { section: 'Material', key: 'wallClearcoatRoughness', label: 'CC Roughness', min: 0, max: 1, step: 0.01 },
  { section: 'Scene', key: 'sceneRotationY', label: 'Rotate Y', min: -180, max: 180, step: 1 },
  { section: 'Scene', key: 'sceneRotationX', label: 'Rotate X', min: -40, max: 40, step: 1 },
  { section: 'Scene', key: 'scenePosY', label: 'Move Y', min: -2, max: 2, step: 0.01 },
  { section: 'Camera', key: 'cameraX', label: 'Cam X', min: -6, max: 6, step: 0.01 },
  { section: 'Camera', key: 'cameraY', label: 'Cam Y', min: -4, max: 4, step: 0.01 },
  { section: 'Camera', key: 'cameraZ', label: 'Cam Z', min: 2, max: 14, step: 0.01 },
  { section: 'Camera', key: 'cameraLookY', label: 'Look Y', min: -3, max: 3, step: 0.01 },
  { section: 'Camera', key: 'cameraFov', label: 'FOV', min: 30, max: 100, step: 1 },
  { section: 'Light', key: 'lightX', label: 'Key X', min: -8, max: 8, step: 0.01 },
  { section: 'Light', key: 'lightY', label: 'Key Y', min: -3, max: 8, step: 0.01 },
  { section: 'Light', key: 'lightZ', label: 'Key Z', min: -8, max: 8, step: 0.01 },
  { section: 'Light', key: 'lightIntensity', label: 'Key Intensity', min: 0, max: 6, step: 0.01 },
  { section: 'Light', key: 'fillX', label: 'Fill X', min: -8, max: 8, step: 0.01 },
  { section: 'Light', key: 'fillY', label: 'Fill Y', min: -3, max: 8, step: 0.01 },
  { section: 'Light', key: 'fillZ', label: 'Fill Z', min: -8, max: 8, step: 0.01 },
  { section: 'Light', key: 'fillIntensity', label: 'Fill Intensity', min: 0, max: 4, step: 0.01 }
]

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v))
}

function createRoundedRect(width, height, radius) {
  const w = width / 2
  const h = height / 2
  const r = clamp(radius, 0, Math.min(width, height) * 0.49)
  const s = new THREE.Shape()
  s.moveTo(-w + r, h)
  s.lineTo(w - r, h)
  if (r > 0) s.quadraticCurveTo(w, h, w, h - r)
  s.lineTo(w, -h + r)
  if (r > 0) s.quadraticCurveTo(w, -h, w - r, -h)
  s.lineTo(-w + r, -h)
  if (r > 0) s.quadraticCurveTo(-w, -h, -w, -h + r)
  s.lineTo(-w, h - r)
  if (r > 0) s.quadraticCurveTo(-w, h, -w + r, h)
  return s
}

function createArch(width, height, radius) {
  const w = width / 2
  const h = height / 2
  const archR = clamp(radius, width * 0.2, width * 0.65)
  const s = new THREE.Shape()
  s.moveTo(-w, -h)
  s.lineTo(-w, h - archR)
  s.quadraticCurveTo(-w, h, -w + archR, h)
  s.lineTo(w - archR, h)
  s.quadraticCurveTo(w, h, w, h - archR)
  s.lineTo(w, -h)
  s.lineTo(-w, -h)
  return s
}

function createCircle(width, height) {
  const r = Math.min(width, height) / 2
  return new THREE.Shape().absarc(0, 0, r, 0, Math.PI * 2)
}

function makeWallWithHole(cfg) {
  const outer = new THREE.Shape()
  outer.moveTo(-cfg.wallWidth / 2, cfg.wallHeight / 2)
  outer.lineTo(cfg.wallWidth / 2, cfg.wallHeight / 2)
  outer.lineTo(cfg.wallWidth / 2, -cfg.wallHeight / 2)
  outer.lineTo(-cfg.wallWidth / 2, -cfg.wallHeight / 2)
  outer.lineTo(-cfg.wallWidth / 2, cfg.wallHeight / 2)

  let hole
  if (cfg.holeShape === 'circle') {
    hole = createCircle(cfg.holeWidth, cfg.holeHeight)
  } else if (cfg.holeShape === 'arch') {
    hole = createArch(cfg.holeWidth, cfg.holeHeight, cfg.holeRadius)
  } else {
    hole = createRoundedRect(cfg.holeWidth, cfg.holeHeight, cfg.holeRadius)
  }

  const pts = hole.getPoints(96)
  if (THREE.ShapeUtils.isClockWise(pts)) pts.reverse()
  outer.holes.push(new THREE.Path(pts))

  const geo = new THREE.ExtrudeGeometry(outer, {
    depth: cfg.wallDepth,
    steps: 1,
    bevelEnabled: true,
    bevelSegments: 4,
    bevelSize: 0.03,
    bevelThickness: 0.02,
    curveSegments: 36
  })
  geo.center()
  return geo
}

function disposeObject(obj) {
  obj.traverse((node) => {
    if (node.geometry) node.geometry.dispose()
    if (node.material) {
      if (Array.isArray(node.material)) node.material.forEach((m) => m.dispose())
      else node.material.dispose()
    }
  })
}

export default function FiberWall() {
  const mountRef = useRef(null)
  const sceneRef = useRef(null)
  const [config, setConfig] = useState(DEFAULT_CONFIG)
  const [copyState, setCopyState] = useState('Copy Config')
  const [isHelperOpen, setIsHelperOpen] = useState(true)

  const serialized = useMemo(() => JSON.stringify(config, null, 2), [config])

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#dfe3ea')

    const camera = new THREE.PerspectiveCamera(56, mount.clientWidth / mount.clientHeight, 0.1, 100)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.15
    mount.appendChild(renderer.domElement)

    const ambient = new THREE.HemisphereLight('#ffffff', '#bbc2d1', 0.85)
    scene.add(ambient)

    const key = new THREE.PointLight('#ffffff', 2.2, 40)
    scene.add(key)

    const fill = new THREE.PointLight('#d6e6ff', 0.9, 36)
    scene.add(fill)

    const wallGroup = new THREE.Group()
    scene.add(wallGroup)

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(16, 96),
      new THREE.MeshPhysicalMaterial({
        color: '#eef1f8',
        roughness: 0.08,
        metalness: 0.24,
        clearcoat: 1,
        clearcoatRoughness: 0.04,
        side: THREE.DoubleSide
      })
    )
    floor.rotation.x = Math.PI / 2
    floor.position.y = -3.1
    scene.add(floor)

    const halo = new THREE.Mesh(
      new THREE.RingGeometry(2.2, 3.8, 80),
      new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.14, side: THREE.DoubleSide })
    )
    halo.rotation.x = Math.PI / 2
    halo.position.set(0, -2.98, 0)
    scene.add(halo)

    function rebuild(cfg) {
      disposeObject(wallGroup)
      wallGroup.clear()

      const wall = new THREE.Mesh(
        makeWallWithHole(cfg),
        new THREE.MeshPhysicalMaterial({
          color: cfg.wallColor,
          roughness: cfg.wallRoughness,
          metalness: cfg.wallMetalness,
          clearcoat: cfg.wallClearcoat,
          clearcoatRoughness: cfg.wallClearcoatRoughness,
          sheen: 1,
          sheenColor: new THREE.Color('#ffffff'),
          sheenRoughness: 0.16
        })
      )
      wall.castShadow = false
      wall.receiveShadow = true
      wallGroup.add(wall)

      wallGroup.rotation.y = THREE.MathUtils.degToRad(cfg.sceneRotationY)
      wallGroup.rotation.x = THREE.MathUtils.degToRad(cfg.sceneRotationX)
      wallGroup.position.y = cfg.scenePosY

      key.position.set(cfg.lightX, cfg.lightY, cfg.lightZ)
      key.intensity = cfg.lightIntensity

      fill.position.set(cfg.fillX, cfg.fillY, cfg.fillZ)
      fill.intensity = cfg.fillIntensity

      camera.fov = cfg.cameraFov
      camera.position.set(cfg.cameraX, cfg.cameraY, cfg.cameraZ)
      camera.lookAt(0, cfg.cameraLookY, 0)
      camera.updateProjectionMatrix()
    }

    rebuild(config)

    const onResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(mount.clientWidth, mount.clientHeight)
    }

    window.addEventListener('resize', onResize)

    let rafId = 0
    const tick = () => {
      halo.rotation.z += 0.0016
      renderer.render(scene, camera)
      rafId = window.requestAnimationFrame(tick)
    }
    tick()

    sceneRef.current = {
      rebuild,
      dispose() {
        window.cancelAnimationFrame(rafId)
        window.removeEventListener('resize', onResize)
        disposeObject(wallGroup)
        wallGroup.clear()
        renderer.dispose()
        if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
      }
    }

    return () => {
      sceneRef.current?.dispose()
      sceneRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!sceneRef.current) return
    sceneRef.current.rebuild(config)
  }, [config])

  const groupedControls = CONTROLS.reduce((acc, c) => {
    if (!acc[c.section]) acc[c.section] = []
    acc[c.section].push(c)
    return acc
  }, {})

  const copyConfig = async () => {
    try {
      await navigator.clipboard.writeText(serialized)
      setCopyState('Copied')
      window.setTimeout(() => setCopyState('Copy Config'), 1200)
    } catch {
      setCopyState('Copy Failed')
      window.setTimeout(() => setCopyState('Copy Config'), 1200)
    }
  }

  return (
    <div className="app-shell">
      <div className={`toolbar ${isHelperOpen ? '' : 'toolbar-collapsed'}`}>
        <div className="toolbar-head">
          <strong>Wall Studio</strong>
          <button type="button" onClick={() => setConfig(DEFAULT_CONFIG)}>Reset</button>
          <button type="button" onClick={copyConfig}>{copyState}</button>
          <button type="button" onClick={() => setIsHelperOpen((v) => !v)}>
            {isHelperOpen ? 'Hide Helper' : 'Show Helper'}
          </button>
          <a href="#/" className="route-link-btn">Routes</a>
        </div>
        <p className="hint">Glossy palace-white wall with editable hole, camera, scene and light controls.</p>

        <div className={`section-grid ${isHelperOpen ? '' : 'hidden'}`}>
          <section className="control-section">
            <h4>Hole Shape</h4>
            <label className="control-item select-item">
              <span>Shape</span>
              <select
                value={config.holeShape}
                onChange={(e) => setConfig((p) => ({ ...p, holeShape: e.target.value }))}
              >
                <option value="roundedRect">Rounded Rect</option>
                <option value="arch">Arch</option>
                <option value="circle">Circle</option>
              </select>
            </label>
            <label className="control-item color-item">
              <span>Wall Color</span>
              <input
                type="color"
                value={config.wallColor}
                onChange={(e) => setConfig((p) => ({ ...p, wallColor: e.target.value }))}
              />
            </label>
          </section>

          {Object.entries(groupedControls).map(([section, controls]) => (
            <section className="control-section" key={section}>
              <h4>{section}</h4>
              <div className="controls-grid">
                {controls.map((control) => (
                  <label className="control-item" key={control.key}>
                    <span>{control.label}</span>
                    <input
                      type="range"
                      min={control.min}
                      max={control.max}
                      step={control.step}
                      value={config[control.key]}
                      onChange={(e) => setConfig((p) => ({ ...p, [control.key]: Number(e.target.value) }))}
                    />
                    <small>{Number(config[control.key]).toFixed(3).replace(/\.000$/, '')}</small>
                  </label>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      <div className="scene-wrap" ref={mountRef} />
    </div>
  )
}
