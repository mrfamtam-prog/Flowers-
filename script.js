
/* ============================================================
   BEYOND THE SUNSET
   Complete Cinematic 3D Experience
   Three.js 0.180.0
============================================================ */

import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";

/* ============================================================
   01. DOM ELEMENTS
============================================================ */

const $ = id => document.getElementById(id);

const sceneContainer = $("scene-container");
const startScreen = $("start-screen");
const startButton = $("start-button");
const loadingScreen = $("loading-screen");
const loadingProgress = $("loading-progress");
const loadingPercentage = $("loading-percentage");
const loadingMessage = $("loading-message");
const cinematicHUD = $("cinematic-hud");
const sceneDescription = $("scene-description");
const soundButton = $("sound-button");
const soundIcon = $("sound-icon");
const pauseScreen = $("pause-screen");
const resumeButton = $("resume-button");
const errorScreen = $("error-screen");
const errorMessage = $("error-message");
const retryButton = $("retry-button");

/* ============================================================
   02. CONFIGURATION
============================================================ */

const CONFIG = {
    assets: {
        girl: "./assets/characters/girl.glb",
        boyHand: "./assets/characters/boy-hand.glb",
        butterfly: "./assets/butterflies/butterfly.glb",
        oceanAudio: "./assets/audio/ocean.mp3",
        windAudio: "./assets/audio/wind.mp3",
        magicAudio: "./assets/audio/magic.mp3"
    },

    camera: {
        fov: 65,
        near: 0.1,
        far: 1000
    },

    meadow: {
        size: 180,
        grassCount: 4500,
        flowerCount: 650
    },

    butterflies: {
        initialCount: 1,
        transformationCount: 180
    },

    story: {
        chase: 12,
        approach: 8,
        reveal: 7,
        touch: 3
    }
};

/* ============================================================
   03. APPLICATION STATE
============================================================ */

const STATE = {
    initialized: false,
    started: false,
    loading: false,
    paused: false,
    muted: false,
    scenePhase: "intro",
    phaseTime: 0,
    elapsedTime: 0,
    transformationStarted: false,
    transformationFinished: false
};

/* ============================================================
   04. THREE.JS VARIABLES
============================================================ */

let scene;
let camera;
let renderer;
let clock;
let gltfLoader;
let dracoLoader;

let sun;
let sunLight;
let ocean;
let meadow;
let flowerGroup;
let grassGroup;

let girlModel;
let boyHandModel;
let butterflyModel;

let girlMixer;
let boyHandMixer;

let butterflies = [];
let particles = [];
let audioElements = {};

let animationFrameId = null;
let listenersInitialized = false;

/* ============================================================
   05. POSITIONS
============================================================ */

const POSITIONS = {
    girl: new THREE.Vector3(0, 0, -12),
    butterfly: new THREE.Vector3(0, 2.1, -3),
    transformation: new THREE.Vector3(0, 1.7, -12)
};

const CAMERA = {
    initial: new THREE.Vector3(0, 1.7, 8),
    currentLook: new THREE.Vector3(0, 1.7, -10)
};

/* ============================================================
   06. UTILITIES
============================================================ */

const clamp = (v, min, max) =>
    Math.max(min, Math.min(max, v));

const random = (min, max) =>
    Math.random() * (max - min) + min;

const smooth = t => {
    t = clamp(t, 0, 1);
    return t * t * (3 - 2 * t);
};

function updateProgress(value, message) {
    value = clamp(value, 0, 100);

    if (loadingProgress)
        loadingProgress.style.width = `${value}%`;

    if (loadingPercentage)
        loadingPercentage.textContent = `${Math.round(value)}%`;

    if (loadingMessage && message)
        loadingMessage.textContent = message;
}

function updateDescription(message) {
    if (sceneDescription)
        sceneDescription.textContent = message;
}

function showError(message) {
    console.error("[Beyond the Sunset]", message);

    if (errorMessage)
        errorMessage.textContent = message;

    if (errorScreen)
        errorScreen.hidden = false;
}

function hideError() {
    if (errorScreen)
        errorScreen.hidden = true;
}

/* ============================================================
   07. INITIALIZE APPLICATION
============================================================ */

function initializeApplication() {
    if (STATE.initialized) return true;

    if (!sceneContainer) {
        showError("Scene container was not found.");
        return false;
    }

    try {
        // Bind buttons before starting expensive WebGL work.
        initializeEventListeners();

        initializeScene();
        initializeCamera();
        initializeRenderer();
        initializeLighting();
        initializeLoaders();

        createEnvironment();
        createOcean();
        createMeadow();
        createGrass();
        createFlowers();
        createSun();
        createButterflies();

        clock = new THREE.Clock();

        STATE.initialized = true;

        animate();

        console.log("Beyond the Sunset initialized.");

        return true;

    } catch (error) {
        STATE.initialized = false;

        showError(
            "Unable to initialize the 3D experience: " +
            error.message
        );

        return false;
    }
}

/* ============================================================
   08. SCENE
============================================================ */

function initializeScene() {
    scene = new THREE.Scene();

    scene.background = new THREE.Color(0xf5a47f);

    scene.fog = new THREE.FogExp2(
        0xeaa27e,
        0.0018
    );
}

/* ============================================================
   09. CAMERA
============================================================ */

function initializeCamera() {
    camera = new THREE.PerspectiveCamera(
        CONFIG.camera.fov,
        window.innerWidth / window.innerHeight,
        CONFIG.camera.near,
        CONFIG.camera.far
    );

    camera.position.copy(CAMERA.initial);

    camera.lookAt(0, 1.7, -10);
}

/* ============================================================
   10. RENDERER
============================================================ */

function initializeRenderer() {
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: "high-performance"
    });

    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio || 1, 1.5)
    );

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    renderer.domElement.setAttribute(
        "aria-label",
        "Beyond the Sunset 3D experience"
    );

    sceneContainer.appendChild(renderer.domElement);
}

/* ============================================================
   11. LIGHTING
============================================================ */

function initializeLighting() {
    const hemisphere = new THREE.HemisphereLight(
        0xffd9b0,
        0x38452c,
        1.5
    );

    scene.add(hemisphere);

    sunLight = new THREE.DirectionalLight(
        0xffc16b,
        3
    );

    sunLight.position.set(20, 30, -35);
    sunLight.castShadow = true;

    sunLight.shadow.mapSize.set(1024, 1024);

    scene.add(sunLight);

    const fill = new THREE.DirectionalLight(
        0xffa7a1,
        0.8
    );

    fill.position.set(-20, 12, 15);
    scene.add(fill);

    const glow = new THREE.PointLight(
        0xffa23e,
        2,
        100
    );

    glow.position.set(0, 10, -55);
    scene.add(glow);
}

/* ============================================================
   12. GLTF LOADER
============================================================ */

function initializeLoaders() {
    gltfLoader = new GLTFLoader();

    dracoLoader = new DRACOLoader();

    dracoLoader.setDecoderPath(
        "https://www.gstatic.com/draco/versioned/decoders/1.5.7/"
    );

    gltfLoader.setDRACOLoader(dracoLoader);
}

function loadGLTF(path) {
    return new Promise((resolve, reject) => {
        if (!path) {
            reject(new Error("Missing GLB asset path."));
            return;
        }

        gltfLoader.load(
            path,
            resolve,
            undefined,
            reject
        );
    });
}

/* ============================================================
   13. SKY AND CLOUDS
============================================================ */

function createEnvironment() {
    const skyGeometry = new THREE.SphereGeometry(
        450,
        48,
        32
    );

    const skyMaterial = new THREE.ShaderMaterial({
        side: THREE.BackSide,

        uniforms: {
            topColor: {
                value: new THREE.Color(0x9e9cbb)
            },
            horizonColor: {
                value: new THREE.Color(0xffa47e)
            },
            bottomColor: {
                value: new THREE.Color(0xffd08a)
            }
        },

        vertexShader: `
            varying vec3 vWorldPosition;

            void main() {
                vec4 worldPosition =
                    modelMatrix * vec4(position, 1.0);

                vWorldPosition = worldPosition.xyz;

                gl_Position =
                    projectionMatrix *
                    modelViewMatrix *
                    vec4(position, 1.0);
            }
        `,

        fragmentShader: `
            uniform vec3 topColor;
            uniform vec3 horizonColor;
            uniform vec3 bottomColor;

            varying vec3 vWorldPosition;

            void main() {
                float h = normalize(vWorldPosition).y;

                vec3 color;

                if (h > 0.0) {
                    color = mix(
                        horizonColor,
                        topColor,
                        smoothstep(0.0, 0.8, h)
                    );
                } else {
                    color = mix(
                        horizonColor,
                        bottomColor,
                        smoothstep(0.0, -0.4, h)
                    );
                }

                gl_FragColor = vec4(color, 1.0);
            }
        `
    });

    scene.add(
        new THREE.Mesh(skyGeometry, skyMaterial)
    );

    createSunsetClouds();
}

function createSunsetClouds() {
    const group = new THREE.Group();

    const geometry = new THREE.SphereGeometry(
        1,
        12,
        10
    );

    const material = new THREE.MeshStandardMaterial({
        color: 0xffb18c,
        roughness: 1,
        transparent: true,
        opacity: 0.65
    });

    for (let i = 0; i < 20; i++) {
        const cloud = new THREE.Group();

        const count = Math.floor(random(3, 7));

        for (let j = 0; j < count; j++) {
            const mesh = new THREE.Mesh(
                geometry,
                material
            );

            mesh.position.set(
                j * random(1.5, 3),
                random(-1, 1),
                random(-1, 1)
            );

            mesh.scale.set(
                random(2, 5),
                random(0.8, 1.8),
                random(1.5, 3)
            );

            cloud.add(mesh);
        }

        cloud.position.set(
            random(-110, 110),
            random(22, 65),
            random(-100, -55)
        );

        group.add(cloud);
    }

    scene.add(group);
}

/* ============================================================
   14. OCEAN
============================================================ */

function createOcean() {
    const geometry = new THREE.PlaneGeometry(
        500,
        500,
        100,
        100
    );

    const material = new THREE.MeshStandardMaterial({
        color: 0x6d8490,
        roughness: 0.28,
        metalness: 0.25
    });

    ocean = new THREE.Mesh(geometry, material);

    ocean.rotation.x = -Math.PI / 2;
    ocean.position.set(0, -0.3, -100);

    ocean.receiveShadow = true;

    scene.add(ocean);

    const reflection = new THREE.PointLight(
        0xffa52f,
        3,
        80
    );

    reflection.position.set(0, 3, -95);

    scene.add(reflection);
}

/* ============================================================
   15. SUN
============================================================ */

function createSun() {
    const geometry = new THREE.SphereGeometry(
        3.1,
        40,
        40
    );

    const material = new THREE.MeshBasicMaterial({
        color: 0xfff0a0
    });

    sun = new THREE.Mesh(geometry, material);

    sun.position.set(0, 18, -125);

    scene.add(sun);

    const glow = new THREE.Mesh(
        new THREE.SphereGeometry(6, 24, 24),
        new THREE.MeshBasicMaterial({
            color: 0xffa52e,
            transparent: true,
            opacity: 0.18,
            side: THREE.BackSide
        })
    );

    sun.add(glow);
}

/* ============================================================
   16. MEADOW
============================================================ */

function createMeadow() {
    const geometry = new THREE.PlaneGeometry(
        CONFIG.meadow.size,
        CONFIG.meadow.size,
        100,
        100
    );

    const positions = geometry.attributes.position;

    for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const z = positions.getY(i);

        const variation =
            Math.sin(x * 0.06) * 0.12 +
            Math.cos(z * 0.05) * 0.1;

        positions.setZ(i, variation);
    }

    geometry.computeVertexNormals();

    const material = new THREE.MeshStandardMaterial({
        color: 0x405b29,
        roughness: 1
    });

    meadow = new THREE.Mesh(geometry, material);

    meadow.rotation.x = -Math.PI / 2;
    meadow.position.set(0, -0.1, -12);
    meadow.receiveShadow = true;

    scene.add(meadow);
}

/* ============================================================
   17. GRASS - INSTANCED FOR PERFORMANCE
============================================================ */

function createGrass() {
    grassGroup = new THREE.Group();

    const geometry = new THREE.ConeGeometry(
        0.045,
        0.65,
        3
    );

    const material = new THREE.MeshStandardMaterial({
        color: 0x66813a,
        roughness: 1
    });

    const grass = new THREE.InstancedMesh(
        geometry,
        material,
        CONFIG.meadow.grassCount
    );

    const dummy = new THREE.Object3D();

    for (let i = 0; i < CONFIG.meadow.grassCount; i++) {
        dummy.position.set(
            random(-85, 85),
            0.2,
            random(-90, 65)
        );

        dummy.rotation.set(
            random(-0.1, 0.1),
            random(0, Math.PI),
            random(-0.1, 0.1)
        );

        dummy.scale.setScalar(random(0.5, 1.3));

        dummy.updateMatrix();

        grass.setMatrixAt(i, dummy.matrix);
    }

    grass.instanceMatrix.needsUpdate = true;

    grassGroup.add(grass);
    scene.add(grassGroup);
}

/* ============================================================
   18. FLOWERS - INSTANCED FOR PERFORMANCE
============================================================ */

function createFlowers() {
    flowerGroup = new THREE.Group();

    const colors = [
        0xffc52f,
        0xffe2a0,
        0xe88aa9,
        0xb66cbd,
        0xffffff,
        0xf28d48
    ];

    const flowerGeometry = new THREE.SphereGeometry(
        0.13,
        8,
        6
    );

    const centerGeometry = new THREE.SphereGeometry(
        0.055,
        8,
        8
    );

    const stemGeometry = new THREE.CylinderGeometry(
        0.012,
        0.018,
        0.35,
        5
    );

    const stemMaterial = new THREE.MeshStandardMaterial({
        color: 0x547b35
    });

    const dummy = new THREE.Object3D();

    const total = CONFIG.meadow.flowerCount;

    const petals = colors.map(color => {
        const material = new THREE.MeshStandardMaterial({
            color,
            roughness: 0.8
        });

        return new THREE.InstancedMesh(
            flowerGeometry,
            material,
            total * 5
        );
    });

    const centers = new THREE.InstancedMesh(
        centerGeometry,
        new THREE.MeshStandardMaterial({
            color: 0x8b5220
        }),
        total
    );

    const stems = new THREE.InstancedMesh(
        stemGeometry,
        stemMaterial,
        total
    );

    const counts = new Array(colors.length).fill(0);

    for (let i = 0; i < total; i++) {
        const x = random(-85, 85);
        const z = random(-85, 55);

        const height = random(0.18, 0.6);
        const size = random(0.07, 0.19);

        const colorIndex = Math.floor(
            Math.random() * colors.length
        );

        dummy.position.set(x, height, z);
        dummy.scale.set(1, height / 0.35, 1);
        dummy.updateMatrix();

        stems.setMatrixAt(i, dummy.matrix);

        dummy.position.set(x, height, z);
        dummy.scale.setScalar(size);
        dummy.updateMatrix();

        centers.setMatrixAt(i, dummy.matrix);

        for (let p = 0; p < 5; p++) {
            const angle = p * Math.PI * 2 / 5;

            dummy.position.set(
                x + Math.cos(angle) * size,
                height,
                z + Math.sin(angle) * size
            );

            dummy.rotation.set(
                0,
                -angle,
                0
            );

            dummy.scale.set(size, size * 0.38, size * 0.7);
            dummy.updateMatrix();

            petals[colorIndex].setMatrixAt(
                colorIndex * 0 + counts[colorIndex],
                dummy.matrix
            );

            counts[colorIndex]++;
        }
    }

    stems.instanceMatrix.needsUpdate = true;
    centers.instanceMatrix.needsUpdate = true;

    flowerGroup.add(stems);
    flowerGroup.add(centers);

    petals.forEach(mesh => {
        mesh.instanceMatrix.needsUpdate = true;
        flowerGroup.add(mesh);
    });

    scene.add(flowerGroup);
}

/* ============================================================
   19. PROCEDURAL BUTTERFLY
============================================================ */

function createProceduralButterfly() {
    const group = new THREE.Group();

    const wingMaterial = new THREE.MeshStandardMaterial({
        color: 0xffb7dc,
        side: THREE.DoubleSide,
        roughness: 0.45,
        emissive: 0x3a1230,
        emissiveIntensity: 0.15
    });

    const wingGeometry = new THREE.BufferGeometry();

    wingGeometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute([
            0, 0, 0,
            -0.35, 0.25, 0,
            -0.75, 0.05, 0,
            -0.35, -0.15, 0,
            0, 0, 0,
            0.35, 0.25, 0,
            0.75, 0.05, 0,
            0.35, -0.15, 0
        ], 3)
    );

    wingGeometry.setIndex([
        0, 1, 2,
        0, 2, 3,
        4, 5, 6,
        4, 6, 7
    ]);

    wingGeometry.computeVertexNormals();

    const wings = new THREE.Mesh(
        wingGeometry,
        wingMaterial
    );

    group.add(wings);

    const body = new THREE.Mesh(
        new THREE.CylinderGeometry(
            0.025,
            0.035,
            0.35,
            8
        ),
        new THREE.MeshStandardMaterial({
            color: 0x33222c
        })
    );

    body.rotation.x = Math.PI / 2;

    group.add(body);

    group.userData.wings = wings;
    group.userData.phase = random(0, Math.PI * 2);

    return group;
}

/* ============================================================
   20. INITIAL BUTTERFLY
============================================================ */

function createButterflies() {
    butterflyModel = createProceduralButterfly();

    for (
        let i = 0;
        i < CONFIG.butterflies.initialCount;
        i++
    ) {
        const butterfly = createProceduralButterfly();

        butterfly.position.copy(POSITIONS.butterfly);
        butterfly.scale.setScalar(0.75);

        butterfly.userData.isGuide = true;
        butterfly.userData.phase = random(0, Math.PI * 2);

        butterflies.push(butterfly);

        scene.add(butterfly);
    }
}

/* ============================================================
   21. PROCEDURAL FEMALE CHARACTER
============================================================ */

function createProceduralGirl() {
    const group = new THREE.Group();

    group.name = "Procedural Female Protagonist";

    const skin = new THREE.MeshStandardMaterial({
        color: 0xf2c6a5,
        roughness: 0.82
    });

    const hair = new THREE.MeshStandardMaterial({
        color: 0x38251f,
        roughness: 0.9
    });

    const dress = new THREE.MeshStandardMaterial({
        color: 0xc77aa8,
        roughness: 0.78
    });

    const trim = new THREE.MeshStandardMaterial({
        color: 0xe5a5c7
    });

    const shoes = new THREE.MeshStandardMaterial({
        color: 0x65483f
    });

    const eyes = new THREE.MeshStandardMaterial({
        color: 0x241b19
    });

    function add(geometry, material, position, scale) {
        const mesh = new THREE.Mesh(geometry, material);

        mesh.position.set(...position);

        if (scale)
            mesh.scale.set(...scale);

        mesh.castShadow = true;
        mesh.receiveShadow = true;

        group.add(mesh);

        return mesh;
    }

    // Legs
    add(
        new THREE.CylinderGeometry(0.105, 0.12, 0.72, 12),
        skin,
        [-0.16, 0.48, 0]
    );

    add(
        new THREE.CylinderGeometry(0.105, 0.12, 0.72, 12),
        skin,
        [0.16, 0.48, 0]
    );

    // Shoes
    add(
        new THREE.SphereGeometry(0.13, 16, 12),
        shoes,
        [-0.16, 0.09, 0.07],
        [1.2, 0.65, 1.8]
    );

    add(
        new THREE.SphereGeometry(0.13, 16, 12),
        shoes,
        [0.16, 0.09, 0.07],
        [1.2, 0.65, 1.8]
    );

    // Dress
    add(
        new THREE.CylinderGeometry(0.19, 0.52, 0.82, 24),
        dress,
        [0, 1.18, 0]
    );

    add(
        new THREE.CylinderGeometry(0.2, 0.2, 0.16, 20),
        trim,
        [0, 1.55, 0]
    );

    // Body and neck
    add(
        new THREE.SphereGeometry(0.25, 20, 16),
        skin,
        [0, 1.72, 0]
    );

    add(
        new THREE.CylinderGeometry(0.085, 0.09, 0.18, 12),
        skin,
        [0, 1.91, 0]
    );

    // Head
    add(
        new THREE.SphereGeometry(0.34, 24, 20),
        skin,
        [0, 2.2, 0]
    );

    // Hair
    add(
        new THREE.SphereGeometry(0.365, 24, 18),
        hair,
        [0, 2.34, -0.055],
        [1.04, 1, 0.92]
    );

    add(
        new THREE.SphereGeometry(0.19, 18, 14),
        hair,
        [-0.27, 2.08, -0.015],
        [0.62, 1.35, 0.72]
    );

    add(
        new THREE.SphereGeometry(0.19, 18, 14),
        hair,
        [0.27, 2.08, -0.015],
        [0.62, 1.35, 0.72]
    );

    // Eyes
    add(
        new THREE.SphereGeometry(0.035, 10, 8),
        eyes,
        [-0.115, 2.22, 0.397]
    );

    add(
        new THREE.SphereGeometry(0.035, 10, 8),
        eyes,
        [0.115, 2.22, 0.397]
    );

    // Nose
    add(
        new THREE.SphereGeometry(0.025, 10, 8),
        skin,
        [0, 2.15, 0.42]
    );

    // Arms
    const leftArm = add(
        new THREE.CylinderGeometry(0.075, 0.06, 0.68, 12),
        skin,
        [-0.34, 1.42, 0]
    );

    leftArm.rotation.z = -0.22;

    const rightArm = add(
        new THREE.CylinderGeometry(0.075, 0.06, 0.68, 12),
        skin,
        [0.34, 1.42, 0]
    );

    rightArm.rotation.z = 0.22;

    // Hands
    add(
        new THREE.SphereGeometry(0.085, 12, 10),
        skin,
        [-0.42, 1.08, 0.015]
    );

    add(
        new THREE.SphereGeometry(0.085, 12, 10),
        skin,
        [0.42, 1.08, 0.015]
    );

    // Dress decoration
    add(
        new THREE.SphereGeometry(0.055, 12, 10),
        trim,
        [0.12, 1.35, 0.205],
        [1, 1, 0.35]
    );

    group.position.copy(POSITIONS.girl);
    group.scale.setScalar(0.9);

    group.userData.proceduralFallback = true;
    group.userData.baseY = group.position.y;
    group.userData.swayPhase = random(0, Math.PI * 2);

    return group;
}

/* ============================================================
   22. PROCEDURAL BOY HAND FALLBACK
============================================================ */

function createProceduralBoyHand() {
    const group = new THREE.Group();

    const skin = new THREE.MeshStandardMaterial({
        color: 0xd9a47e,
        roughness: 0.7
    });

    const forearm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.105, 0.13, 0.55, 16),
        skin
    );

    forearm.position.y = -0.25;
    forearm.rotation.x = -0.2;

    group.add(forearm);

    const palm = new THREE.Mesh(
        new THREE.SphereGeometry(0.17, 20, 16),
        skin
    );

    palm.position.set(0, 0.04, -0.12);
    palm.scale.set(0.85, 1, 0.65);

    group.add(palm);

    const fingerLengths = [0.23, 0.28, 0.25, 0.20];

    for (let i = 0; i < 4; i++) {
        const finger = new THREE.Mesh(
            new THREE.CapsuleGeometry(0.035, fingerLengths[i], 4, 8),
            skin
        );

        finger.position.set(
            -0.105 + i * 0.07,
            0.20,
            -0.17
        );

        finger.rotation.x = -0.2;

        group.add(finger);
    }

    const thumb = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.04, 0.17, 4, 8),
        skin
    );

    thumb.position.set(0.19, 0.03, -0.12);
    thumb.rotation.z = -0.65;

    group.add(thumb);

    group.position.set(0.48, -0.42, -0.75);
    group.scale.setScalar(0.8);

    return group;
}

/* ============================================================
   23. LOAD CHARACTER ASSETS
============================================================ */

async function loadCharacterAssets() {
    const tasks = [
        {
            name: "Girl",
            path: CONFIG.assets.girl
        },
        {
            name: "Boy hand",
            path: CONFIG.assets.boyHand
        },
        {
            name: "Butterfly",
            path: CONFIG.assets.butterfly
        }
    ];

    await Promise.allSettled(
        tasks.map(async task => {
            try {
                const result = await loadGLTF(task.path);

                if (task.name === "Girl") {
                    girlModel = result.scene;

                    girlModel.position.copy(POSITIONS.girl);
                    girlModel.scale.setScalar(1);

                    girlModel.traverse(object => {
                        if (object.isMesh) {
                            object.castShadow = true;
                            object.receiveShadow = true;
                        }
                    });

                    scene.add(girlModel);

                    if (result.animations.length) {
                        girlMixer = new THREE.AnimationMixer(
                            girlModel
                        );

                        const action = girlMixer.clipAction(
                            result.animations[0]
                        );

                        action.play();
                    }
                }

                if (task.name === "Boy hand") {
                    boyHandModel = result.scene;

                    boyHandModel.position.set(
                        0.48,
                        -0.42,
                        -0.75
                    );

                    boyHandModel.scale.setScalar(0.35);

                    camera.add(boyHandModel);

                    if (result.animations.length) {
                        boyHandMixer = new THREE.AnimationMixer(
                            boyHandModel
                        );

                        boyHandMixer.clipAction(
                            result.animations[0]
                        ).play();
                    }
                }

                if (task.name === "Butterfly") {
                    butterflyModel = result.scene;
                    butterflyModel.scale.setScalar(0.4);
                }

            } catch (error) {
                console.warn(
                    `${task.name} asset unavailable. Using fallback.`,
                    error
                );
            }
        })
    );

    // Missing girl model is not a fatal error.
    if (!girlModel) {
        girlModel = createProceduralGirl();
        scene.add(girlModel);
    }

    // Missing boy hand model is not a fatal error.
    if (!boyHandModel) {
        boyHandModel = createProceduralBoyHand();
        camera.add(boyHandModel);
    }

    console.log("Character loading completed.");
}

/* ============================================================
   24. AUDIO
============================================================ */

function initializeAudio() {
    const createAudio = (name, path, volume, loop) => {
        const audio = new Audio(path);

        audio.volume = volume;
        audio.loop = loop;
        audio.preload = "auto";

        audio.addEventListener("error", () => {
            console.warn(`${name} audio is unavailable.`);
        });

        return audio;
    };

    audioElements.ocean = createAudio(
        "Ocean",
        CONFIG.assets.oceanAudio,
        0.35,
        true
    );

    audioElements.wind = createAudio(
        "Wind",
        CONFIG.assets.windAudio,
        0.22,
        true
    );

    audioElements.magic = createAudio(
        "Magic",
        CONFIG.assets.magicAudio,
        0.65,
        false
    );
}

async function startAudio() {
    if (!Object.keys(audioElements).length)
        initializeAudio();

    if (STATE.muted) return;

    const tracks = [
        audioElements.ocean,
        audioElements.wind
    ];

    await Promise.allSettled(
        tracks.map(audio => {
            if (!audio) return Promise.resolve();
            return audio.play();
        })
    );
}

function playMagicSound() {
    if (STATE.muted) return;

    if (!audioElements.magic)
        initializeAudio();

    const audio = audioElements.magic;

    if (!audio) return;

    audio.currentTime = 0;

    audio.play().catch(error => {
        console.warn("Magic sound unavailable.", error);
    });
}

function toggleSound() {
    STATE.muted = !STATE.muted;

    Object.values(audioElements).forEach(audio => {
        if (audio)
            audio.muted = STATE.muted;
    });

    if (soundIcon)
        soundIcon.textContent = STATE.muted ? "×" : "♪";

    if (soundButton) {
        soundButton.setAttribute(
            "aria-pressed",
            String(!STATE.muted)
        );

        soundButton.setAttribute(
            "aria-label",
            STATE.muted ? "Enable sound" : "Mute sound"
        );
    }

    if (!STATE.muted && STATE.started)
        startAudio();
}

/* ============================================================
   25. START EXPERIENCE
============================================================ */

async function startExperience() {
    if (STATE.started || STATE.loading) return;

    hideError();

    // If initial setup previously failed, try again.
    if (!STATE.initialized) {
        const success = initializeApplication();

        if (!success) return;
    }

    STATE.loading = true;

    if (startButton)
        startButton.disabled = true;

    if (startScreen)
        startScreen.classList.add("fade-out");

    if (loadingScreen)
        loadingScreen.hidden = false;

    updateProgress(
        10,
        "Preparing the sunset environment..."
    );

    try {
        await new Promise(resolve =>
            requestAnimationFrame(resolve)
        );

        updateProgress(
            30,
            "Loading character models..."
        );

        await loadCharacterAssets();

        updateProgress(
            65,
            "Preparing the magical world..."
        );

        // Audio errors must never prevent the story from starting.
        try {
            await startAudio();
        } catch (error) {
            console.warn("Audio could not start.", error);
        }

        updateProgress(
            100,
            "Your journey is ready..."
        );

        await new Promise(resolve =>
            setTimeout(resolve, 500)
        );

        if (loadingScreen)
            loadingScreen.hidden = true;

        if (cinematicHUD)
            cinematicHUD.hidden = false;

        STATE.started = true;
        STATE.loading = false;
        STATE.scenePhase = "chase";
        STATE.phaseTime = 0;
        STATE.elapsedTime = 0;

        updateDescription("Follow the butterfly...");

    } catch (error) {
        console.error("Start experience failed:", error);

        STATE.loading = false;

        if (startButton)
            startButton.disabled = false;

        if (loadingScreen)
            loadingScreen.hidden = true;

        showError(
            "The experience could not start: " +
            error.message
        );
    }
}

/* ============================================================
   26. BUTTERFLY FLIGHT
============================================================ */

function updateButterflies(delta, elapsed) {
    butterflies.forEach(butterfly => {
        const phase =
            elapsed * 2.2 +
            butterfly.userData.phase;

        if (butterfly.userData.isGuide) {
            if (STATE.scenePhase === "chase") {
                butterfly.position.x =
                    Math.sin(phase * 0.65) * 2.5;

                butterfly.position.y =
                    2.1 + Math.sin(phase) * 0.45;

                butterfly.position.z =
                    -3 - elapsed * 0.35;
            }

            if (STATE.scenePhase === "approach") {
                butterfly.position.lerp(
                    new THREE.Vector3(0.5, 2, -11),
                    delta * 0.5
                );
            }
        }

        if (butterfly.userData.transformed) {
            butterfly.position.addScaledVector(
                butterfly.userData.velocity,
                delta
            );

            butterfly.position.y +=
                Math.sin(phase * 1.5) * delta * 0.3;
        }

        if (butterfly.userData.wings) {
            butterfly.userData.wings.scale.y =
                0.8 + Math.abs(Math.sin(elapsed * 12)) * 0.35;
        }
    });
}

/* ============================================================
   27. CAMERA MOVEMENT
============================================================ */

function updateCamera(delta) {
    if (!STATE.started) return;

    let targetPosition;
    let targetLook;

    switch (STATE.scenePhase) {
        case "chase":
            targetPosition = new THREE.Vector3(
                0,
                1.7,
                THREE.MathUtils.lerp(
                    8,
                    0,
                    smooth(STATE.phaseTime / CONFIG.story.chase)
                )
            );

            targetLook = new THREE.Vector3(0, 1.9, -15);
            break;

        case "approach":
            targetPosition = new THREE.Vector3(0, 1.7, -5);
            targetLook = new THREE.Vector3(0, 1.7, -12);
            break;

        case "reveal":
            targetPosition = new THREE.Vector3(0, 1.7, -7);
            targetLook = new THREE.Vector3(0, 1.7, -12);
            break;

        case "touch":
        case "transformation":
            targetPosition = new THREE.Vector3(0, 1.7, -8);
            targetLook = new THREE.Vector3(0, 1.7, -12);
            break;

        case "ending":
            targetPosition = new THREE.Vector3(0, 0.85, -8);
            targetLook = new THREE.Vector3(0, 1.4, -20);
            break;

        default:
            targetPosition = CAMERA.initial;
            targetLook = new THREE.Vector3(0, 1.7, -10);
    }

    const amount =
        1 - Math.exp(-2.5 * delta);

    camera.position.lerp(
        targetPosition,
        amount
    );

    CAMERA.currentLook.lerp(
        targetLook,
        amount
    );

    camera.lookAt(CAMERA.currentLook);
}

/* ============================================================
   28. CHARACTER ANIMATION
============================================================ */

function updateCharacters(delta) {
    if (girlMixer)
        girlMixer.update(delta);

    if (boyHandMixer)
        boyHandMixer.update(delta);

    if (
        girlModel &&
        girlModel.userData.proceduralFallback
    ) {
        girlModel.position.y =
            girlModel.userData.baseY +
            Math.sin(
                STATE.elapsedTime * 1.5 +
                girlModel.userData.swayPhase
            ) * 0.035;

        girlModel.rotation.y =
            Math.sin(STATE.elapsedTime * 0.7) * 0.04;
    }

    if (!boyHandModel) return;

    if (
        STATE.scenePhase === "touch" ||
        STATE.scenePhase === "transformation"
    ) {
        boyHandModel.position.lerp(
            new THREE.Vector3(0.35, -0.15, -0.95),
            delta * 1.5
        );
    }

    if (STATE.scenePhase === "ending") {
        boyHandModel.position.lerp(
            new THREE.Vector3(0.35, -0.55, -0.5),
            delta * 1.2
        );
    }
}

/* ============================================================
   29. MAGICAL PARTICLES
============================================================ */

function createTransformationParticles() {
    const colors = [
        0xffa7c9,
        0xffd4e8,
        0xffdf9b,
        0xffffff,
        0xd9b6ff,
        0xffb7a1
    ];

    for (let i = 0; i < 180; i++) {
        const particle = new THREE.Mesh(
            new THREE.SphereGeometry(
                random(0.025, 0.075),
                6,
                6
            ),
            new THREE.MeshBasicMaterial({
                color: colors[
                    Math.floor(Math.random() * colors.length)
                ],
                transparent: true,
                opacity: 0.95
            })
        );

        particle.position.copy(POSITIONS.transformation);

        particle.userData.velocity =
            new THREE.Vector3(
                random(-1, 1),
                random(-0.2, 1.3),
                random(-1, 1)
            ).normalize();

        particle.userData.speed = random(1.5, 5);
        particle.userData.life = random(2, 5);

        particle.scale.setScalar(0);

        particles.push(particle);
        scene.add(particle);
    }
}

/* ============================================================
   30. BUTTERFLY TRANSFORMATION
============================================================ */

function createTransformationButterflies() {
    for (
        let i = 0;
        i < CONFIG.butterflies.transformationCount;
        i++
    ) {
        const butterfly = butterflyModel
            ? butterflyModel.clone()
            : createProceduralButterfly();

        butterfly.position.copy(POSITIONS.transformation);

        butterfly.scale.setScalar(random(0.08, 0.22));

        butterfly.userData.transformed = true;

        butterfly.userData.velocity =
            new THREE.Vector3(
                random(-1, 1),
                random(0.1, 1.2),
                random(-1, 1)
            ).normalize().multiplyScalar(random(1.5, 4));

        butterfly.userData.phase = random(0, Math.PI * 2);

        butterflies.push(butterfly);

        scene.add(butterfly);
    }
}

function beginTransformation() {
    if (STATE.transformationFinished) return;

    STATE.transformationStarted = true;
    STATE.transformationFinished = true;

    if (girlModel)
        girlModel.visible = false;

    playMagicSound();

    createTransformationParticles();
    createTransformationButterflies();

    STATE.scenePhase = "ending";
    STATE.phaseTime = 0;

    updateDescription(
        "Some beautiful moments become memories..."
    );
}

/* ============================================================
   31. PARTICLE ANIMATION
============================================================ */

function updateParticles(delta) {
    particles.forEach(particle => {
        particle.userData.life -= delta;

        if (particle.userData.life > 0) {
            particle.position.addScaledVector(
                particle.userData.velocity,
                particle.userData.speed * delta
            );

            particle.scale.lerp(
                new THREE.Vector3(0.3, 0.3, 0.3),
                delta * 1.5
            );

            particle.material.opacity =
                clamp(particle.userData.life / 3, 0, 1);
        } else {
            particle.visible = false;
        }
    });
}

/* ============================================================
   32. STORY SEQUENCE
============================================================ */

function changeScenePhase(phase) {
    STATE.scenePhase = phase;
    STATE.phaseTime = 0;

    console.log("Scene changed:", phase);

    const descriptions = {
        approach: "The ocean is waiting...",
        reveal: "There she is...",
        touch: "One touch can change everything...",
        transformation: "A beautiful transformation...",
        ending: "Some moments stay forever..."
    };

    updateDescription(
        descriptions[phase] || "Follow the butterfly..."
    );
}

function updateStorySequence(delta) {
    if (!STATE.started || STATE.paused) return;

    STATE.phaseTime += delta;
    STATE.elapsedTime += delta;

    switch (STATE.scenePhase) {
        case "chase":
            updateDescription("Follow the butterfly...");

            if (STATE.phaseTime >= CONFIG.story.chase)
                changeScenePhase("approach");

            break;

        case "approach":
            updateDescription("A beautiful world awaits ahead...");

            if (STATE.phaseTime >= CONFIG.story.approach)
                changeScenePhase("reveal");

            break;

        case "reveal":
            updateDescription("A moment that feels like a dream...");

            if (STATE.phaseTime >= CONFIG.story.reveal)
                changeScenePhase("touch");

            break;

        case "touch":
            updateDescription("One touch can change everything...");

            if (STATE.phaseTime >= CONFIG.story.touch)
                changeScenePhase("transformation");

            break;

        case "transformation":
            beginTransformation();
            break;

        case "ending":
            updateDescription("Some moments stay forever...");
            break;
    }
}

/* ============================================================
   33. SUNSET ANIMATION
============================================================ */

function updateSunset(elapsed) {
    if (!sun) return;

    sun.position.y = Math.max(
        5,
        18 - elapsed * 0.015
    );

    if (sunLight) {
        sunLight.intensity = THREE.MathUtils.lerp(
            3.2,
            1.5,
            clamp(elapsed / 100, 0, 1)
        );
    }
}

/* ============================================================
   34. UPDATE LOOP
============================================================ */

function update(delta, elapsed) {
    if (STATE.paused) return;

    updateButterflies(delta, elapsed);
    updateCamera(delta);
    updateCharacters(delta);
    updateParticles(delta);
    updateSunset(elapsed);
    updateStorySequence(delta);
}

/* ============================================================
   35. RENDER LOOP
============================================================ */

function animate() {
    animationFrameId = requestAnimationFrame(animate);

    if (!renderer || !scene || !camera)
        return;

    const delta = Math.min(clock.getDelta(), 0.05);
    const elapsed = clock.elapsedTime;

    if (!STATE.paused)
        update(delta, elapsed);

    renderer.render(scene, camera);
}

/* ============================================================
   36. PAUSE AND RESUME
============================================================ */

function pauseExperience() {
    if (!STATE.started || STATE.paused) return;

    STATE.paused = true;

    if (pauseScreen)
        pauseScreen.hidden = false;

    Object.values(audioElements).forEach(audio => {
        if (audio)
            audio.pause();
    });
}

function resumeExperience() {
    if (!STATE.paused) return;

    STATE.paused = false;

    if (pauseScreen)
        pauseScreen.hidden = true;

    if (!STATE.muted)
        startAudio();
}

/* ============================================================
   37. WINDOW RESIZE
============================================================ */

function handleResize() {
    if (!camera || !renderer) return;

    camera.aspect =
        window.innerWidth / window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio || 1, 1.5)
    );
}

/* ============================================================
   38. EVENT LISTENERS
============================================================ */

function initializeEventListeners() {
    if (listenersInitialized) return;

    listenersInitialized = true;

    if (startButton) {
        startButton.addEventListener(
            "click",
            startExperience
        );
    }

    if (soundButton) {
        soundButton.addEventListener(
            "click",
            toggleSound
        );
    }

    if (resumeButton) {
        resumeButton.addEventListener(
            "click",
            resumeExperience
        );
    }

    if (retryButton) {
        retryButton.addEventListener(
            "click",
            () => window.location.reload()
        );
    }

    window.addEventListener(
        "resize",
        handleResize
    );

    document.addEventListener(
        "visibilitychange",
        () => {
            if (document.hidden && STATE.started)
                pauseExperience();
        }
    );

    window.addEventListener(
        "keydown",
        event => {
            if (event.code === "Escape" && STATE.started) {
                if (STATE.paused)
                    resumeExperience();
                else
                    pauseExperience();
            }
        }
    );
}

/* ============================================================
   39. CLEANUP
============================================================ */

function disposeApplication() {
    if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

    Object.values(audioElements).forEach(audio => {
        if (audio) {
            audio.pause();
            audio.src = "";
        }
    });

    if (renderer) {
        renderer.dispose();

        if (renderer.domElement.parentNode)
            renderer.domElement.parentNode.removeChild(
                renderer.domElement
            );
    }

    if (dracoLoader)
        dracoLoader.dispose();
}

/* ============================================================
   40. APPLICATION STARTUP
============================================================ */

// Register buttons before initializing WebGL.
initializeEventListeners();

// Initialize the 3D scene.
initializeApplication();

// Browser cleanup.
window.addEventListener(
    "pagehide",
    disposeApplication,
    { once: true }
);

/* ============================================================
   END OF BEYOND THE SUNSET
============================================================ */
