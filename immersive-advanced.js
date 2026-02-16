const artifacts = [
  {
    year: "986 - 2000",
    title: "Rise of Blogging",
    description:
      "Serialized writing evolved into public digital diaries, defining how personality and publishing merged online.",
    image:
      "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=1600&q=80",
  },
  {
    year: "1998 - 2004",
    title: "Wordpressism",
    description:
      "Theme culture and plug-in ecosystems transformed blogging into a design-first movement for self-expression.",
    image:
      "https://images.unsplash.com/photo-1464254786740-b97e5423f7d8?auto=format&fit=crop&w=1600&q=80",
  },
  {
    year: "2003 - 2006",
    title: "MySpacism",
    description:
      "Profile customization turned identity into an editable canvas, pushing users toward creative social performance.",
    image:
      "https://images.unsplash.com/photo-1501139083538-0139583c060f?auto=format&fit=crop&w=1600&q=80",
  },
  {
    year: "2004 - present",
    title: "Facebook Art",
    description:
      "Real-name networks normalized persistent timelines, social graphs, and high-frequency content rituals.",
    image:
      "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=1600&q=80",
  },
  {
    year: "2005 - present",
    title: "Youtubism",
    description:
      "Video-native creators rewired influence, audience trust, and long-form digital storytelling.",
    image:
      "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=1600&q=80",
  },
  {
    year: "2006 - present",
    title: "Twitt Art",
    description:
      "Micro-post velocity made commentary immediate, shaping global attention through short-form discourse.",
    image:
      "https://images.unsplash.com/photo-1551817958-20204d6ab9ff?auto=format&fit=crop&w=1600&q=80",
  },
  {
    year: "2010 - present",
    title: "Instagraminism",
    description:
      "Visual-first publishing elevated aesthetics and made cultural trends legible through images and reels.",
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=80",
  },
  {
    year: "2016 - present",
    title: "Tiktokkism",
    description:
      "Algorithmic feeds accelerated meme cycles and birthed high-impact short video cultures.",
    image:
      "https://images.unsplash.com/photo-1611162616475-46b635cb6868?auto=format&fit=crop&w=1600&q=80",
  },
];

const canvas = document.getElementById("grand-canvas");
const epochEl = document.getElementById("grand-epoch");
const titleEl = document.getElementById("grand-title");
const descriptionEl = document.getElementById("grand-description");
const timelineEl = document.getElementById("grand-timeline");

const state = {
  progress: 0,
  targetProgress: 0,
  activeIndex: -1,
  hoverIndex: -1,
  pointerX: 0,
  pointerY: 0,
  pointerTargetX: 0,
  pointerTargetY: 0,
};

const config = {
  radius: 9.8,
  centerZ: -14,
  spacingAngle: 0.56,
  floorY: -2.35,
};

let renderer;
let scene;
let camera;
let raycaster;
let cardsGroup;
let timelineProgress;
let raf = 0;
let scrollTrigger = null;
const cardRefs = [];
const timelineRefs = [];
const DEPENDENCY_ERROR =
  "Three.js, GSAP, and ScrollTrigger are required for immersive-advanced.js.";
const DEPENDENCY_SOURCES = {
  threeModule: [
    "./node_modules/three/build/three.module.min.js",
    "https://unpkg.com/three@0.165.0/build/three.module.min.js",
    "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.min.js",
  ],
  gsap: [
    "./vendor/gsap.min.js",
    "https://unpkg.com/gsap@3.12.5/dist/gsap.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js",
    "https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js",
  ],
  scrollTrigger: [
    "./vendor/ScrollTrigger.min.js",
    "https://unpkg.com/gsap@3.12.5/dist/ScrollTrigger.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js",
    "https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js",
  ],
};

function loadExternalScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = false;
    script.addEventListener("load", resolve);
    script.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)));
    document.head.appendChild(script);
  });
}

async function loadFromCandidates(candidates) {
  let lastError = null;
  for (const src of candidates) {
    try {
      await loadExternalScript(src);
      return true;
    } catch (error) {
      lastError = error;
    }
  }
  if (lastError) {
    throw lastError;
  }
  return false;
}

async function loadThreeFromModule(candidates) {
  let lastError = null;
  for (const src of candidates) {
    try {
      const mod = await import(src);
      if (mod) {
        window.THREE = mod;
        return true;
      }
    } catch (error) {
      lastError = error;
    }
  }
  if (lastError) {
    throw lastError;
  }
  return false;
}

async function ensureDependencies() {
  try {
    if (!window.THREE) {
      await loadThreeFromModule(DEPENDENCY_SOURCES.threeModule);
    }

    if (!window.gsap) {
      await loadFromCandidates(DEPENDENCY_SOURCES.gsap);
    }

    if (!window.ScrollTrigger) {
      await loadFromCandidates(DEPENDENCY_SOURCES.scrollTrigger);
    }
  } catch (error) {
    console.error(`${DEPENDENCY_ERROR} ${error?.message || ""}`.trim());
    return false;
  }

  if (!window.THREE || !window.gsap || !window.ScrollTrigger) {
    console.error(DEPENDENCY_ERROR);
    return false;
  }

  window.gsap.registerPlugin(window.ScrollTrigger);
  return true;
}

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

function smoothstep(min, max, x) {
  const t = clamp01((x - min) / (max - min));
  return t * t * (3 - 2 * t);
}

function createFallbackTexture(label) {
  const size = 1024;
  const board = document.createElement("canvas");
  board.width = size;
  board.height = size;
  const ctx = board.getContext("2d");
  if (!ctx) {
    return null;
  }

  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, "#324764");
  grad.addColorStop(1, "#0f1725");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  ctx.strokeStyle = "rgba(255,255,255,0.25)";
  ctx.lineWidth = 12;
  ctx.strokeRect(36, 36, size - 72, size - 72);

  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.font = "600 72px Cormorant Garamond, serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label.slice(0, 20), size / 2, size / 2);

  const texture = new THREE.CanvasTexture(board);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function loadTexture(url, label) {
  const loader = new THREE.TextureLoader();
  loader.setCrossOrigin("anonymous");
  return new Promise((resolve) => {
    loader.load(
      url,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = 8;
        resolve(texture);
      },
      undefined,
      () => {
        const fallback = createFallbackTexture(label);
        if (fallback) {
          resolve(fallback);
          return;
        }
        const pixel = new Uint8Array([80, 96, 122, 255]);
        const data = new THREE.DataTexture(pixel, 1, 1);
        data.colorSpace = THREE.SRGBColorSpace;
        data.needsUpdate = true;
        resolve(data);
      },
    );
  });
}

function createDomMaterial(texture) {
  return new THREE.ShaderMaterial({
    transparent: true,
    side: THREE.DoubleSide,
    uniforms: {
      uMap: { value: texture },
      uTime: { value: 0 },
      uHover: { value: 0 },
      uFocus: { value: 0 },
      uOpacity: { value: 1 },
      uMouse: { value: new THREE.Vector2(0, 0) },
    },
    vertexShader: `
      uniform float uTime;
      uniform float uHover;
      uniform float uFocus;
      varying vec2 vUv;
      varying float vWave;

      void main() {
        vUv = uv;
        vec3 pos = position;

        float band = sin((uv.y * 22.0) + (uv.x * 6.0) + (uTime * 2.0));
        float ripple = sin((uv.x * 40.0) - (uTime * 3.2)) * 0.5 + 0.5;
        float wave = band * ripple;
        float strength = 0.04 + (uHover * 0.22) + (uFocus * 0.03);

        pos.z += wave * strength;
        pos.x += sin((uv.y * 8.0) + uTime * 1.4) * uHover * 0.03;

        vWave = wave * strength;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D uMap;
      uniform float uTime;
      uniform float uHover;
      uniform float uFocus;
      uniform float uOpacity;
      uniform vec2 uMouse;
      varying vec2 vUv;
      varying float vWave;

      float domeMask(vec2 uv) {
        vec2 p = uv - vec2(0.5);
        float rect = step(abs(p.x), 0.48) * step(uv.y, 0.52);
        float top = step(length(vec2(p.x, uv.y - 0.52)), 0.48) * step(0.52, uv.y);
        return max(rect, top);
      }

      void main() {
        float mask = domeMask(vUv);
        if (mask < 0.5) {
          discard;
        }

        vec2 hoverOffset = vec2(
          sin(vUv.y * 18.0 + uTime * 2.2),
          cos(vUv.x * 24.0 - uTime * 2.8)
        ) * (0.01 + uHover * 0.022);

        vec4 tex = texture2D(uMap, vUv + hoverOffset + (uMouse * 0.006));
        vec3 color = tex.rgb;

        color = (color - 0.5) * (1.12 + uFocus * 0.2) + 0.5;

        float caustic = sin((vUv.x + vUv.y + uTime * 0.65) * 60.0);
        caustic += sin((vUv.x * 1.8 - vUv.y + uTime * 0.48) * 46.0);
        caustic = caustic * 0.04 + 0.04;

        float edge = smoothstep(0.0, 0.24, vUv.x) * smoothstep(0.0, 0.24, 1.0 - vUv.x);
        edge *= smoothstep(0.0, 0.14, vUv.y);

        vec2 glossCenter = vec2(0.45 + uMouse.x * 0.08, 0.78 + uMouse.y * 0.05);
        float gloss = exp(-dot(vUv - glossCenter, vUv - glossCenter) * 30.0) * (0.1 + uHover * 0.28);

        color += caustic * (0.4 + uHover * 0.9);
        color += gloss;
        color += edge * (0.05 + uFocus * 0.1);

        float finalOpacity = uOpacity * mask;
        gl_FragColor = vec4(color, finalOpacity);
      }
    `,
  });
}

function buildTimeline() {
  const line = document.createElement("div");
  line.className = "timeline-line";
  timelineEl.appendChild(line);

  timelineProgress = document.createElement("div");
  timelineProgress.className = "timeline-progress";
  timelineEl.appendChild(timelineProgress);

  artifacts.forEach((item, index) => {
    const ratio = artifacts.length === 1 ? 0.5 : index / (artifacts.length - 1);

    const dot = document.createElement("button");
    dot.className = "timeline-dot";
    dot.type = "button";
    dot.style.left = `${6 + ratio * 88}%`;
    dot.setAttribute("aria-label", `Jump to ${item.title}`);

    dot.addEventListener("click", () => {
      if (!scrollTrigger) {
        return;
      }
      const y = scrollTrigger.start + ratio * (scrollTrigger.end - scrollTrigger.start);
      window.scrollTo({ top: y, behavior: "smooth" });
    });

    const label = document.createElement("span");
    label.className = "timeline-label";
    label.style.left = `${6 + ratio * 88}%`;
    label.textContent = item.title;

    timelineEl.append(dot, label);
    timelineRefs.push({ dot, label });
  });
}

function setupScene() {
  scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xccd5e5, 12, 42);

  camera = new THREE.PerspectiveCamera(46, window.innerWidth / window.innerHeight, 0.1, 120);
  camera.position.set(0, 0.35, 5.4);

  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const hemi = new THREE.HemisphereLight(0xf7f9ff, 0xa8b4ca, 1.0);
  scene.add(hemi);

  const key = new THREE.DirectionalLight(0xffffff, 1.25);
  key.position.set(5, 6, 7);
  scene.add(key);

  const rim = new THREE.DirectionalLight(0xaed9ff, 0.78);
  rim.position.set(-4, 3, -2);
  scene.add(rim);

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(56, 64, 180, 180),
    new THREE.ShaderMaterial({
      transparent: true,
      uniforms: {
        uTime: { value: 0 },
      },
      vertexShader: `
        uniform float uTime;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vec3 pos = position;
          pos.z += sin((uv.x * 14.0) + uTime * 0.9) * 0.08;
          pos.z += sin((uv.y * 10.0) - uTime * 0.65) * 0.05;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        varying vec2 vUv;
        void main() {
          float gridX = abs(fract(vUv.x * 50.0 + uTime * 0.08) - 0.5);
          float gridY = abs(fract(vUv.y * 38.0) - 0.5);
          float line = smoothstep(0.46, 0.5, max(gridX, gridY));

          vec3 base = mix(vec3(0.81, 0.84, 0.9), vec3(0.63, 0.68, 0.79), vUv.y);
          base += line * 0.07;

          float vignette = smoothstep(0.95, 0.2, distance(vUv, vec2(0.5, 0.3)));
          base *= 0.86 + vignette * 0.18;

          gl_FragColor = vec4(base, 0.72);
        }
      `,
    }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, config.floorY, config.centerZ - 2.8);
  scene.add(floor);

  const backdrop = new THREE.Mesh(
    new THREE.CylinderGeometry(22, 22, 13, 64, 1, true),
    new THREE.MeshStandardMaterial({
      color: 0xd0d8e7,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.62,
      roughness: 1,
      metalness: 0,
    }),
  );
  backdrop.position.set(0, 1.5, config.centerZ - 2);
  scene.add(backdrop);

  cardsGroup = new THREE.Group();
  scene.add(cardsGroup);

  raycaster = new THREE.Raycaster();
}

async function buildCards() {
  const textures = await Promise.all(artifacts.map((item) => loadTexture(item.image, item.title)));

  textures.forEach((texture, index) => {
    const material = createDomMaterial(texture);
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(3.8, 5.4, 78, 118), material);

    mesh.userData = {
      index,
      material,
      hoverMix: 0,
      focus: 0,
    };

    cardsGroup.add(mesh);
    cardRefs.push(mesh);
  });
}

function setActive(index) {
  if (index === state.activeIndex) {
    return;
  }

  state.activeIndex = index;
  const item = artifacts[index];
  epochEl.textContent = item.year;
  titleEl.textContent = item.title;
  descriptionEl.textContent = item.description;

  gsap.fromTo(
    [epochEl, titleEl, descriptionEl],
    { autoAlpha: 0, y: 10, filter: "blur(6px)" },
    { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.42, stagger: 0.04, ease: "power3.out" },
  );

  timelineRefs.forEach((ref, i) => {
    const active = i === index;
    ref.dot.classList.toggle("active", active);
    ref.label.classList.toggle("active", active);
  });
}

function setupScroll() {
  const distance = window.innerHeight * 9.2;
  document.body.style.height = `${distance + window.innerHeight}px`;

  scrollTrigger = ScrollTrigger.create({
    trigger: document.body,
    start: "top top",
    end: `+=${distance}`,
    scrub: 1,
    onUpdate: (self) => {
      state.targetProgress = self.progress;
    },
  });
}

function updatePointer(event) {
  const nx = (event.clientX / window.innerWidth) * 2 - 1;
  const ny = -((event.clientY / window.innerHeight) * 2 - 1);
  state.pointerTargetX = nx;
  state.pointerTargetY = ny;
}

function clearPointer() {
  state.pointerTargetX = 0;
  state.pointerTargetY = 0;
}

function updateHover() {
  raycaster.setFromCamera(
    new THREE.Vector2(state.pointerX, state.pointerY),
    camera,
  );
  const hits = raycaster.intersectObjects(cardRefs, false);
  state.hoverIndex = hits.length ? hits[0].object.userData.index : -1;
}

function render() {
  state.progress += (state.targetProgress - state.progress) * 0.07;
  state.pointerX += (state.pointerTargetX - state.pointerX) * 0.1;
  state.pointerY += (state.pointerTargetY - state.pointerY) * 0.1;

  const indexProgress = state.progress * (artifacts.length - 1);

  let closest = 0;
  let closestAbs = Infinity;

  cardRefs.forEach((mesh, index) => {
    const rel = index - indexProgress;
    const theta = rel * config.spacingAngle;
    const absTheta = Math.abs(theta);

    const x = Math.sin(theta) * config.radius;
    const z = config.centerZ + Math.cos(theta) * config.radius;

    mesh.position.set(x, 0.22 + Math.sin(theta * 0.5) * 0.06, z);
    mesh.lookAt(0, 0.1, config.centerZ - 0.45);

    const focus = smoothstep(1.55, 0.0, absTheta);
    const visible = smoothstep(2.25, 0.45, absTheta);

    mesh.userData.focus = focus;
    mesh.userData.hoverMix += ((state.hoverIndex === index ? 1 : 0) - mesh.userData.hoverMix) * 0.13;

    const scale = 0.86 + focus * 0.34;
    mesh.scale.setScalar(scale);

    mesh.userData.material.uniforms.uTime.value = performance.now() * 0.001;
    mesh.userData.material.uniforms.uHover.value = mesh.userData.hoverMix;
    mesh.userData.material.uniforms.uFocus.value = focus;
    mesh.userData.material.uniforms.uOpacity.value = 0.08 + visible * 0.92;
    mesh.userData.material.uniforms.uMouse.value.set(state.pointerX, state.pointerY);

    if (absTheta < closestAbs) {
      closestAbs = absTheta;
      closest = index;
    }
  });

  if (timelineProgress) {
    timelineProgress.style.width = `${state.progress * 88}%`;
    timelineProgress.style.left = "6%";
  }

  setActive(closest);

  updateHover();

  camera.position.x = state.pointerX * 0.4;
  camera.position.y = 0.35 + state.pointerY * 0.2;
  camera.lookAt(0, 0.08, config.centerZ);

  const floorMaterial = scene.children.find((obj) => obj.type === "Mesh" && obj.material.uniforms?.uTime)?.material;
  if (floorMaterial) {
    floorMaterial.uniforms.uTime.value = performance.now() * 0.001;
  }

  renderer.render(scene, camera);
  raf = requestAnimationFrame(render);
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  ScrollTrigger.refresh();
}

async function init() {
  const ready = await ensureDependencies();
  if (!ready) {
    return;
  }

  buildTimeline();
  setupScene();
  await buildCards();
  setupScroll();
  setActive(0);
  render();

  window.addEventListener("pointermove", updatePointer, { passive: true });
  window.addEventListener("pointerleave", clearPointer);
  window.addEventListener("resize", onResize);
}

init().catch((error) => {
  console.error("Failed to initialize advanced immersive scene", error);
});

window.addEventListener("beforeunload", () => {
  if (raf) {
    cancelAnimationFrame(raf);
  }
  if (window.ScrollTrigger) {
    window.ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
  }
  window.removeEventListener("pointermove", updatePointer);
  window.removeEventListener("pointerleave", clearPointer);
  window.removeEventListener("resize", onResize);
  renderer?.dispose();
});
