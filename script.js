/* ============================================================
   BEYOND THE SUNSET
   script.js

   Cinematic 3D Fairy-Tale Experience
   Three.js | WebGL | GLTF | AnimationMixer | Particle Effects

   MAIN FEATURES:
   1. Cinematic sunset environment
   2. Ocean and coastal landscape
   3. Realistic flower meadow
   4. First-person camera
   5. Butterfly flight animation
   6. Male protagonist hand integration
   7. Female character integration
   8. Magical butterfly transformation
   9. First-person sitting animation
   10. Ambient audio controls

   REQUIRED ASSETS:
   assets/environment/sunset-meadow.jpg
   assets/characters/boy-hand.glb
   assets/characters/girl.glb
   assets/butterflies/butterfly.glb
   assets/audio/ocean.mp3
   assets/audio/wind.mp3
   assets/audio/magic.mp3

   IMPORTANT:
   Realistic character models must be supplied as rigged GLB files.
============================================================ */


/* ============================================================
   01. IMPORTS
============================================================ */

import * as THREE from "three";

import { GLTFLoader } from
    "three/addons/loaders/GLTFLoader.js";

import { DRACOLoader } from
    "three/addons/loaders/DRACOLoader.js";


/* ============================================================
   02. DOM ELEMENTS
============================================================ */

const sceneContainer =
    document.getElementById("scene-container");

const startScreen =
    document.getElementById("start-screen");

const startButton =
    document.getElementById("start-button");

const loadingScreen =
    document.getElementById("loading-screen");

const loadingProgress =
    document.getElementById("loading-progress");

const loadingPercentage =
    document.getElementById("loading-percentage");

const loadingMessage =
    document.getElementById("loading-message");

const cinematicHUD =
    document.getElementById("cinematic-hud");

const sceneDescription =
    document.getElementById("scene-description");

const soundButton =
    document.getElementById("sound-button");

const soundIcon =
    document.getElementById("sound-icon");

const pauseScreen =
    document.getElementById("pause-screen");

const resumeButton =
    document.getElementById("resume-button");

const errorScreen =
    document.getElementById("error-screen");

const errorMessage =
    document.getElementById("error-message");

const retryButton =
    document.getElementById("retry-button");


/* ============================================================
   03. CONFIGURATION
============================================================ */

const CONFIG = {

    assets: {

        environment:
            "./assets/environment/sunset-meadow.jpg",

        boyHand:
            "./assets/characters/boy-hand.glb",

        girl:
            "./assets/characters/girl.glb",

        butterfly:
            "./assets/butterflies/butterfly.glb",

        oceanAudio:
            "./assets/audio/ocean.mp3",

        windAudio:
            "./assets/audio/wind.mp3",

        magicAudio:
            "./assets/audio/magic.mp3"

    },

    camera: {

        fov: 65,

        near: 0.1,

        far: 1500,

        eyeHeight: 1.7

    },

    environment: {

        meadowSize: 180,

        meadowSegments: 120,

        flowerCount: 2200,

        grassCount: 7000,

        oceanSize: 500,

        horizonHeight: 0

    },

    butterflies: {

        initialCount: 1,

        transformationCount: 180,

        flightSpeed: 1.2,

        spreadRadius: 18

    },

    animation: {

        transitionSpeed: 0.8,

        cameraSmoothness: 2.5,

        transformationDuration: 4.5,

        endingDuration: 8

    }

};


/* ============================================================
   04. APPLICATION STATE
============================================================ */

const STATE = {

    initialized: false,

    started: false,

    loading: false,

    paused: false,

    muted: false,

    scenePhase: "intro",

    elapsedTime: 0,

    phaseTime: 0,

    transformationStarted: false,

    transformationFinished: false,

    endingStarted: false,

    audioInitialized: false,

    assetsLoaded: false

};


/* ============================================================
   05. THREE.JS VARIABLES
============================================================ */

let scene;

let camera;

let renderer;

let clock;

let gltfLoader;

let dracoLoader;

let environmentTexture;

let ocean;

let oceanMaterial;

let sun;

let sunLight;

let ambientLight;

let meadow;

let grassGroup;

let flowerGroup;

let butterflyModel;

let butterflies = [];

let transformationParticles = [];

let girlModel;

let boyHandModel;

let girlMixer;

let boyHandMixer;

let animationFrameId = null;

let audioListener;

let audioElements = {};

let raycaster;

let pointer;


/* ============================================================
   06. CAMERA TARGETS
============================================================ */

const CAMERA = {

    initialPosition:
        new THREE.Vector3(0, 1.7, 8),

    initialLook:
        new THREE.Vector3(0, 1.7, -10),

    chasePosition:
        new THREE.Vector3(0, 1.7, 0),

    destinationPosition:
        new THREE.Vector3(0, 1.7, -8),

    seatedPosition:
        new THREE.Vector3(0, 0.85, -8),

    currentLook:
        new THREE.Vector3(0, 1.7, -10),

    targetLook:
        new THREE.Vector3(0, 1.7, -10)

};


/* ============================================================
   07. CHARACTER POSITIONS
============================================================ */

const POSITIONS = {

    boyHand:
        new THREE.Vector3(0.48, -0.42, -0.75),

    girl:
        new THREE.Vector3(0, 0, -12),

    butterfly:
        new THREE.Vector3(0, 2.1, -3),

    transformation:
        new THREE.Vector3(0, 1.7, -12)

};


/* ============================================================
   08. UTILITY FUNCTIONS
============================================================ */

function clamp(value, min, max) {

    return Math.max(min, Math.min(max, value));

}


function lerp(start, end, amount) {

    return start + (end - start) * amount;

}


function smoothStep(value) {

    const t = clamp(value, 0, 1);

    return t * t * (3 - 2 * t);

}


function random(min, max) {

    return Math.random() * (max - min) + min;

}


function updateProgress(value, message) {

    const progress = clamp(value, 0, 100);

    if (loadingProgress) {

        loadingProgress.style.width =
            `${progress}%`;

    }

    if (loadingPercentage) {

        loadingPercentage.textContent =
            `${Math.round(progress)}%`;

    }

    if (loadingMessage && message) {

        loadingMessage.textContent = message;

    }

}


function updateSceneDescription(message) {

    if (!sceneDescription) return;

    sceneDescription.textContent = message;

}


function showError(message) {

    console.error("[Beyond the Sunset]", message);

    if (errorMessage) {

        errorMessage.textContent = message;

    }

    if (errorScreen) {

        errorScreen.hidden = false;

    }

}


/* ============================================================
   09. INITIALIZE APPLICATION
============================================================ */

function initializeApplication() {

    if (STATE.initialized) return;

    if (!sceneContainer) {

        console.error(
            "Scene container was not found."
        );

        return;

    }

    try {

        initializeScene();

        initializeCamera();

        initializeRenderer();

        initializeLighting();

        initializeLoaders();

        initializeRaycaster();

        initializeClock();

        createEnvironment();

        createMeadow();

        createOcean();

        createSun();

        createGrass();

        createFlowers();

        createButterflies();

        initializeEventListeners();

        STATE.initialized = true;

        animate();

        console.log(
            "Beyond the Sunset initialized successfully."
        );

    }

    catch (error) {

        showError(
            "Unable to initialize the 3D experience: " +
            error.message
        );

    }

}


/* ============================================================
   10. INITIALIZE SCENE
============================================================ */

function initializeScene() {

    scene = new THREE.Scene();

    scene.background =
        new THREE.Color(0xf5a47f);

    scene.fog = new THREE.FogExp2(
        0xeaa27e,
        0.0018
    );

}


/* ============================================================
   11. INITIALIZE CAMERA
============================================================ */

function initializeCamera() {

    camera = new THREE.PerspectiveCamera(

        CONFIG.camera.fov,

        window.innerWidth / window.innerHeight,

        CONFIG.camera.near,

        CONFIG.camera.far

    );

    camera.position.copy(
        CAMERA.initialPosition
    );

    camera.lookAt(
        CAMERA.initialLook
    );

}


/* ============================================================
   12. INITIALIZE RENDERER
============================================================ */

function initializeRenderer() {

    renderer = new THREE.WebGLRenderer({

        antialias: true,

        alpha: false,

        powerPreference: "high-performance"

    });

    renderer.setPixelRatio(

        Math.min(
            window.devicePixelRatio,
            1.75
        )

    );

    renderer.setSize(

        window.innerWidth,
        window.innerHeight

    );

    renderer.outputColorSpace =
        THREE.SRGBColorSpace;

    renderer.toneMapping =
        THREE.ACESFilmicToneMapping;

    renderer.toneMappingExposure = 1.15;

    renderer.shadowMap.enabled = true;

    renderer.shadowMap.type =
        THREE.PCFSoftShadowMap;

    renderer.domElement.setAttribute(
        "aria-label",
        "Interactive sunset meadow 3D scene"
    );

    sceneContainer.appendChild(
        renderer.domElement
    );

}


/* ============================================================
   13. LIGHTING
============================================================ */

function initializeLighting() {

    ambientLight = new THREE.HemisphereLight(

        0xffd9b0,

        0x38452c,

        1.4

    );

    scene.add(ambientLight);


    sunLight = new THREE.DirectionalLight(

        0xffc16b,

        3.2

    );

    sunLight.position.set(

        20,
        30,
        -35

    );

    sunLight.castShadow = true;

    sunLight.shadow.mapSize.width = 2048;

    sunLight.shadow.mapSize.height = 2048;

    sunLight.shadow.camera.near = 1;

    sunLight.shadow.camera.far = 100;

    sunLight.shadow.bias = -0.0002;

    scene.add(sunLight);


    const fillLight =
        new THREE.DirectionalLight(
            0xffa7a1,
            0.8
        );

    fillLight.position.set(
        -20,
        12,
        15
    );

    scene.add(fillLight);


    const sunsetGlow =
        new THREE.PointLight(
            0xffa23e,
            2,
            100
        );

    sunsetGlow.position.set(
        0,
        10,
        -55
    );

    scene.add(sunsetGlow);

}


/* ============================================================
   14. LOADERS
============================================================ */

function initializeLoaders() {

    gltfLoader = new GLTFLoader();

    dracoLoader = new DRACOLoader();

    dracoLoader.setDecoderPath(

        "https://www.gstatic.com/draco/versioned/decoders/1.5.7/"

    );

    gltfLoader.setDRACOLoader(
        dracoLoader
    );

}


/* ============================================================
   15. CLOCK
============================================================ */

function initializeClock() {

    clock = new THREE.Clock();

}


/* ============================================================
   16. RAYCASTER
============================================================ */

function initializeRaycaster() {

    raycaster = new THREE.Raycaster();

    pointer = new THREE.Vector2();

}


/* ============================================================
   17. ENVIRONMENT
============================================================ */

function createEnvironment() {

    const skyGeometry =
        new THREE.SphereGeometry(
            450,
            64,
            32
        );

    const skyMaterial =
        new THREE.ShaderMaterial({

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

                    vWorldPosition =
                        worldPosition.xyz;

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

                    float h = normalize(
                        vWorldPosition
                    ).y;

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

    const sky = new THREE.Mesh(
        skyGeometry,
        skyMaterial
    );

    scene.add(sky);


    /* Environment reference image */

    const textureLoader =
        new THREE.TextureLoader();

    textureLoader.load(

        CONFIG.assets.environment,

        texture => {

            environmentTexture = texture;

            environmentTexture.colorSpace =
                THREE.SRGBColorSpace;

            console.log(
                "Environment reference image loaded."
            );

        },

        undefined,

        error => {

            console.warn(
                "Environment reference image unavailable. " +
                "Using procedural environment.",
                error
            );

        }

    );


    createSunsetClouds();

}


/* ============================================================
   18. SUNSET CLOUDS
============================================================ */

function createSunsetClouds() {

    const cloudGroup = new THREE.Group();

    const cloudMaterial =
        new THREE.MeshStandardMaterial({

            color: 0xffb18c,

            roughness: 1,

            transparent: true,

            opacity: 0.75

        });


    for (let i = 0; i < 24; i++) {

        const cloud = new THREE.Group();

        const cloudCount =
            Math.floor(random(3, 8));

        for (let j = 0; j < cloudCount; j++) {

            const geometry =
                new THREE.SphereGeometry(

                    random(2, 5),

                    12,
                    10

                );

            const mesh = new THREE.Mesh(

                geometry,
                cloudMaterial.clone()

            );

            mesh.position.set(

                j * random(1.5, 3),

                random(-1, 1),
                random(-1, 1)

            );

            mesh.scale.y = 0.45;

            cloud.add(mesh);

        }

        cloud.position.set(

            random(-110, 110),

            random(22, 65),

            random(-100, -55)

        );

        cloudGroup.add(cloud);

    }

    scene.add(cloudGroup);

}


/* ============================================================
   19. OCEAN
============================================================ */

function createOcean() {

    const oceanGeometry =
        new THREE.PlaneGeometry(

            CONFIG.environment.oceanSize,

            CONFIG.environment.oceanSize,

            120,
            120

        );

    oceanMaterial =
        new THREE.MeshStandardMaterial({

            color: 0x6d8490,

            roughness: 0.28,

            metalness: 0.25

        });

    ocean = new THREE.Mesh(

        oceanGeometry,
        oceanMaterial

    );

    ocean.rotation.x =
        -Math.PI / 2;

    ocean.position.set(

        0,
        -0.3,
        -100

    );

    ocean.receiveShadow = true;

    scene.add(ocean);


    /* Ocean reflection light */

    const reflection =
        new THREE.PointLight(
            0xffa52f,
            3,
            80
        );

    reflection.position.set(
        0,
        3,
        -95
    );

    scene.add(reflection);

}


/* ============================================================
   20. SUN
============================================================ */

function createSun() {

    const sunGeometry =
        new THREE.SphereGeometry(
            3.1,
            48,
            48
        );

    const sunMaterial =
        new THREE.MeshBasicMaterial({

            color: 0xfff0a0

        });

    sun = new THREE.Mesh(

        sunGeometry,
        sunMaterial

    );

    sun.position.set(

        0,
        18,
        -125

    );

    scene.add(sun);


    const glowGeometry =
        new THREE.SphereGeometry(
            6,
            32,
            32
        );

    const glowMaterial =
        new THREE.MeshBasicMaterial({

            color: 0xffa52e,

            transparent: true,

            opacity: 0.18,

            side: THREE.BackSide

        });

    const glow = new THREE.Mesh(

        glowGeometry,
        glowMaterial

    );

    sun.add(glow);

}


/* ============================================================
   21. MEADOW TERRAIN
============================================================ */

function createMeadow() {

    const geometry =
        new THREE.PlaneGeometry(

            CONFIG.environment.meadowSize,

            CONFIG.environment.meadowSize,

            CONFIG.environment.meadowSegments,

            CONFIG.environment.meadowSegments

        );

    const positions =
        geometry.attributes.position;

    for (
        let i = 0;
        i < positions.count;
        i++
    ) {

        const x = positions.getX(i);

        const y = positions.getY(i);

        const distance =
            Math.sqrt(x * x + y * y);

        const gentleVariation =
            Math.sin(x * 0.06) * 0.12 +
            Math.cos(y * 0.05) * 0.10;

        const height =
            gentleVariation *
            Math.min(distance / 30, 1);

        positions.setZ(i, height);

    }

    geometry.computeVertexNormals();

    const material =
        new THREE.MeshStandardMaterial({

            color: 0x405b29,

            roughness: 1,

            metalness: 0

        });

    meadow = new THREE.Mesh(

        geometry,
        material

    );

    meadow.rotation.x =
        -Math.PI / 2;

    meadow.position.set(
        0,
        -0.1,
        -12
    );

    meadow.receiveShadow = true;

    scene.add(meadow);

}


/* ============================================================
   22. GRASS
============================================================ */

function createGrass() {

    grassGroup = new THREE.Group();

    const grassGeometry =
        new THREE.BufferGeometry();

    const grassPositions = [];

    const grassColors = [];

    const grassIndices = [];

    const colorPalette = [

        new THREE.Color(0x526e2c),

        new THREE.Color(0x728c38),

        new THREE.Color(0x9a9d42),

        new THREE.Color(0x3b5927)

    ];


    for (
        let i = 0;
        i < CONFIG.environment.grassCount;
        i++
    ) {

        const x = random(-85, 85);

        const z = random(-90, 65);

        const y = -0.05;

        const height =
            random(0.25, 0.8);

        const width =
            random(0.025, 0.07);

        const color =
            colorPalette[
                Math.floor(
                    Math.random() *
                    colorPalette.length
                )
            ];

        const vertexStart =
            grassPositions.length / 3;


        grassPositions.push(

            x - width, y, z,

            x + width, y, z,

            x, y + height, z + random(-0.1, 0.1)

        );


        for (let j = 0; j < 3; j++) {

            grassColors.push(

                color.r,
                color.g,
                color.b

            );

        }


        grassIndices.push(

            vertexStart,
            vertexStart + 1,
            vertexStart + 2

        );

    }


    grassGeometry.setAttribute(

        "position",

        new THREE.Float32BufferAttribute(
            grassPositions,
            3
        )

    );

    grassGeometry.setAttribute(

        "color",

        new THREE.Float32BufferAttribute(
            grassColors,
            3
        )

    );

    grassGeometry.setIndex(grassIndices);

    grassGeometry.computeVertexNormals();


    const grassMaterial =
        new THREE.MeshStandardMaterial({

            vertexColors: true,

            side: THREE.DoubleSide,

            roughness: 1

        });


    const grassMesh =
        new THREE.Mesh(

            grassGeometry,
            grassMaterial

        );

    grassMesh.receiveShadow = true;

    grassGroup.add(grassMesh);

    scene.add(grassGroup);

}


/* ============================================================
   23. FLOWERS
============================================================ */

function createFlowers() {

    flowerGroup = new THREE.Group();

    const flowerColors = [

        0xffc52f,

        0xffe2a0,

        0xe88aa9,

        0xb66cbd,

        0xffffff,

        0xf28d48

    ];


    for (
        let i = 0;
        i < CONFIG.environment.flowerCount;
        i++
    ) {

        const x = random(-85, 85);

        const z = random(-85, 55);

        const flowerHeight =
            random(0.18, 0.6);

        const flowerSize =
            random(0.07, 0.19);

        const flowerColor =
            flowerColors[
                Math.floor(
                    Math.random() *
                    flowerColors.length
                )
            ];


        const stemGeometry =
            new THREE.CylinderGeometry(

                0.012,
                0.018,

                flowerHeight,

                5

            );

        const stemMaterial =
            new THREE.MeshStandardMaterial({

                color: 0x547b35

            });

        const stem = new THREE.Mesh(

            stemGeometry,
            stemMaterial

        );

        stem.position.set(

            x,
            flowerHeight / 2,
            z

        );


        const petalGroup =
            new THREE.Group();

        const petalMaterial =
            new THREE.MeshStandardMaterial({

                color: flowerColor,

                roughness: 0.8

            });


        for (let p = 0; p < 6; p++) {

            const angle =
                (Math.PI * 2 / 6) * p;

            const petalGeometry =
                new THREE.SphereGeometry(

                    flowerSize,

                    8,
                    6

                );

            const petal = new THREE.Mesh(

                petalGeometry,
                petalMaterial

            );

            petal.scale.set(
                1,
                0.38,
                0.7
            );

            petal.position.set(

                Math.cos(angle) * flowerSize,

                0,

                Math.sin(angle) * flowerSize

            );

            petalGroup.add(petal);

        }


        const centerGeometry =
            new THREE.SphereGeometry(

                flowerSize * 0.4,

                8,
                8

            );

        const centerMaterial =
            new THREE.MeshStandardMaterial({

                color: 0x8b5220

            });

        const center =
            new THREE.Mesh(

                centerGeometry,
                centerMaterial

            );

        petalGroup.add(center);


        petalGroup.position.set(

            x,
            flowerHeight,
            z

        );


        flowerGroup.add(stem);

        flowerGroup.add(petalGroup);


        petalGroup.userData.originalRotation =
            petalGroup.rotation.z;

        petalGroup.userData.phase =
            random(0, Math.PI * 2);

        petalGroup.userData.isFlower = true;

    }


    scene.add(flowerGroup);

}


/* ============================================================
   24. BUTTERFLY GEOMETRY FALLBACK

   This procedural butterfly is a visual fallback.
   Replace it with a properly animated GLB butterfly
   for realistic wing anatomy.
============================================================ */

function createProceduralButterfly() {

    const group = new THREE.Group();

    const wingMaterial =
        new THREE.MeshStandardMaterial({

            color: 0xffb7dc,

            side: THREE.DoubleSide,

            roughness: 0.45,

            emissive: 0x3a1230,

            emissiveIntensity: 0.15

        });


    const wingGeometry =
        new THREE.BufferGeometry();

    const vertices = [

        0, 0, 0,

        -0.35, 0.25, 0,

        -0.75, 0.05, 0,

        -0.35, -0.15, 0,

        0, 0, 0,

        0.35, 0.25, 0,

        0.75, 0.05, 0,

        0.35, -0.15, 0

    ];

    wingGeometry.setAttribute(

        "position",

        new THREE.Float32BufferAttribute(
            vertices,
            3
        )

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


    const bodyGeometry =
        new THREE.CylinderGeometry(

            0.025,
            0.035,

            0.35,

            8

        );

    const bodyMaterial =
        new THREE.MeshStandardMaterial({

            color: 0x33222c

        });

    const body =
        new THREE.Mesh(

            bodyGeometry,
            bodyMaterial

        );

    body.rotation.x =
        Math.PI / 2;

    group.add(body);


    group.userData.wings = wings;

    group.userData.phase =
        random(0, Math.PI * 2);

    group.userData.basePosition =
        new THREE.Vector3();

    group.userData.targetPosition =
        new THREE.Vector3();

    return group;

}


/* ============================================================
   25. CREATE BUTTERFLIES
============================================================ */

function createButterflies() {

    butterflyModel =
        createProceduralButterfly();


    for (
        let i = 0;
        i < CONFIG.butterflies.initialCount;
        i++
    ) {

        const butterfly =
            createProceduralButterfly();

        butterfly.position.copy(
            POSITIONS.butterfly
        );

        butterfly.scale.setScalar(0.75);

        butterfly.userData.isGuide = true;

        butterfly.userData.phase =
            random(0, Math.PI * 2);

        butterfly.userData.flightOffset =
            new THREE.Vector3(
                random(-1, 1),
                random(-0.5, 0.5),
                random(-1, 1)
            );

        butterflies.push(butterfly);

        scene.add(butterfly);

    }

}


/* ============================================================
   26. LOAD GLTF ASSETS
============================================================ */

function loadGLTF(path) {

    return new Promise((resolve, reject) => {

        gltfLoader.load(

            path,

            gltf => {

                resolve(gltf);

            },

            undefined,

            error => {

                reject(error);

            }

        );

    });

}


/* ============================================================
   27. LOAD CHARACTER ASSETS
============================================================ */

async function loadCharacterAssets() {

    const loadingTasks = [

        {

            name: "Male protagonist hand",

            path: CONFIG.assets.boyHand,

            required: false,

            callback: result => {

                boyHandModel =
                    result.scene;

                boyHandModel.position.copy(
                    POSITIONS.boyHand
                );

                boyHandModel.scale.setScalar(
                    0.35
                );

                camera.add(boyHandModel);

                if (result.animations.length) {

                    boyHandMixer =
                        new THREE.AnimationMixer(
                            boyHandModel
                        );

                }

            }

        },

        {

            name: "Female protagonist",

            path: CONFIG.assets.girl,

            required: true,

            callback: result => {

                girlModel =
                    result.scene;

                girlModel.position.copy(
                    POSITIONS.girl
                );

                girlModel.scale.setScalar(
                    1
                );

                girlModel.traverse(object => {

                    if (object.isMesh) {

                        object.castShadow = true;

                        object.receiveShadow = true;

                    }

                });

                scene.add(girlModel);

                if (result.animations.length) {

                    girlMixer =
                        new THREE.AnimationMixer(
                            girlModel
                        );

                }

            }

        },

        {

            name: "Realistic butterfly",

            path: CONFIG.assets.butterfly,

            required: false,

            callback: result => {

                butterflyModel =
                    result.scene;

                butterflyModel.scale.setScalar(
                    0.4
                );

                console.log(
                    "Realistic butterfly asset loaded."
                );

            }

        }

    ];


    const results = await Promise.allSettled(

        loadingTasks.map(async task => {

            try {

                const result =
                    await loadGLTF(task.path);

                task.callback(result);

                return true;

            }

            catch (error) {

                console.warn(

                    `${task.name} could not be loaded:`,
                    error

                );

                if (task.required) {

                    throw new Error(

                        `${task.name} is required. ` +
                        `Please provide ${task.path}.`

                    );

                }

                return false;

            }

        })

    );


    const requiredFailure =
        results.find(

            (result, index) =>

                loadingTasks[index].required &&
                result.status === "rejected"

        );


    if (requiredFailure) {

        throw requiredFailure.reason;

    }

}


/* ============================================================
   28. LOAD AUDIO
============================================================ */

function initializeAudio() {

    audioElements.ocean =
        new Audio(
            CONFIG.assets.oceanAudio
        );

    audioElements.wind =
        new Audio(
            CONFIG.assets.windAudio
        );

    audioElements.magic =
        new Audio(
            CONFIG.assets.magicAudio
        );


    audioElements.ocean.loop = true;

    audioElements.wind.loop = true;


    audioElements.ocean.volume = 0.35;

    audioElements.wind.volume = 0.22;

    audioElements.magic.volume = 0.65;


    Object.values(audioElements).forEach(audio => {

        audio.addEventListener(
            "error",
            () => {

                console.warn(
                    "An audio asset could not be loaded."
                );

            }
        );

    });

}


async function startAudio() {

    if (!STATE.audioInitialized) {

        initializeAudio();

        STATE.audioInitialized = true;

    }


    if (STATE.muted) return;


    try {

        await Promise.all([

            audioElements.ocean.play(),

            audioElements.wind.play()

        ]);

    }

    catch (error) {

        console.warn(
            "Audio playback requires user interaction.",
            error
        );

    }

}


function playMagicSound() {

    if (
        STATE.muted ||
        !audioElements.magic
    ) return;

    audioElements.magic.currentTime = 0;

    audioElements.magic.play().catch(error => {

        console.warn(
            "Magic audio unavailable.",
            error
        );

    });

}


/* ============================================================
   29. AUDIO CONTROL
============================================================ */

function toggleSound() {

    STATE.muted = !STATE.muted;

    Object.values(audioElements).forEach(audio => {

        if (audio) {

            audio.muted = STATE.muted;

        }

    });


    if (soundIcon) {

        soundIcon.textContent =
            STATE.muted ? "×" : "♪";

    }


    if (soundButton) {

        soundButton.setAttribute(

            "aria-pressed",

            String(!STATE.muted)

        );

        soundButton.setAttribute(

            "aria-label",

            STATE.muted
                ? "Enable sound"
                : "Mute sound"

        );

    }


    if (!STATE.muted) {

        startAudio();

    }

}


/* ============================================================
   30. START EXPERIENCE
============================================================ */

async function startExperience() {

    if (STATE.started || STATE.loading) return;

    if (!STATE.initialized) {

        initializeApplication();

    }

    if (!STATE.initialized) return;


    STATE.loading = true;

    if (startButton) {

        startButton.disabled = true;

    }

    if (startScreen) {

        startScreen.classList.add("fade-out");

    }

    if (loadingScreen) {

        loadingScreen.hidden = false;

    }


    updateProgress(
        10,
        "Preparing the sunset environment..."
    );


    try {

        await new Promise(resolve => {

            requestAnimationFrame(resolve);

        });


        updateProgress(
            30,
            "Loading character models..."
        );


        await loadCharacterAssets();


        updateProgress(
            70,
            "Preparing the cinematic experience..."
        );


        await startAudio();


        updateProgress(
            100,
            "Your journey is ready..."
        );


        await new Promise(resolve => {

            setTimeout(resolve, 600);

        });


        if (loadingScreen) {

            loadingScreen.hidden = true;

        }

        if (cinematicHUD) {

            cinematicHUD.hidden = false;

        }


        STATE.started = true;

        STATE.loading = false;

        STATE.scenePhase = "chase";

        STATE.phaseTime = 0;

        updateSceneDescription(
            "Follow the butterfly..."
        );


    }

    catch (error) {

        STATE.loading = false;

        if (startButton) {

            startButton.disabled = false;

        }

        if (loadingScreen) {

            loadingScreen.hidden = true;

        }

        showError(error.message);

    }

}


/* ============================================================
   31. BUTTERFLY FLIGHT ANIMATION
============================================================ */

function updateButterflies(delta, elapsed) {

    butterflies.forEach((butterfly, index) => {

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

            else if (
                STATE.scenePhase === "approach"
            ) {

                butterfly.position.lerp(

                    new THREE.Vector3(
                        0.5,
                        2,
                        -11
                    ),

                    delta * 0.5

                );

            }

        }

        else if (butterfly.userData.transformed) {

            butterfly.position.addScaledVector(

                butterfly.userData.velocity,

                delta

            );

            butterfly.position.y +=
                Math.sin(phase * 1.5) *
                delta * 0.3;

        }


        if (butterfly.userData.wings) {

            butterfly.userData.wings.rotation.y =
                Math.sin(phase * 8) * 0.6;

        }

    });

}


/* ============================================================
   32. BUTTERFLY WING ANIMATION
============================================================ */

function updateButterflyWings(elapsed) {

    butterflies.forEach(butterfly => {

        const wings =
            butterfly.userData.wings;

        if (!wings) return;

        wings.scale.y =
            0.8 +
            Math.abs(
                Math.sin(elapsed * 12)
            ) * 0.35;

    });

}


/* ============================================================
   33. GRASS AND FLOWER WIND
============================================================ */

function updateEnvironmentAnimations(elapsed) {

    if (flowerGroup) {

        flowerGroup.children.forEach(flower => {

            if (!flower.userData.isFlower) return;

            const phase =
                flower.userData.phase;

            flower.rotation.z =

                Math.sin(
                    elapsed * 1.2 + phase
                ) * 0.035;

        });

    }

}


/* ============================================================
   34. FIRST-PERSON CAMERA
============================================================ */

function updateCamera(delta) {

    if (!STATE.started) return;


    let targetPosition;

    let targetLook;


    switch (STATE.scenePhase) {

        case "chase":

            targetPosition =
                new THREE.Vector3(
                    0,
                    1.7,
                    lerp(8, 0, clamp(
                        STATE.phaseTime / 12,
                        0,
                        1
                    ))
                );

            targetLook =
                new THREE.Vector3(
                    0,
                    1.9,
                    -15
                );

            break;


        case "approach":

            targetPosition =
                new THREE.Vector3(
                    0,
                    1.7,
                    -5
                );

            targetLook =
                new THREE.Vector3(
                    0,
                    1.7,
                    -12
                );

            break;


        case "reveal":

            targetPosition =
                new THREE.Vector3(
                    0,
                    1.7,
                    -7
                );

            targetLook =
                new THREE.Vector3(
                    0,
                    1.7,
                    -12
                );

            break;


        case "touch":

            targetPosition =
                new THREE.Vector3(
                    0,
                    1.7,
                    -8
                );

            targetLook =
                new THREE.Vector3(
                    0,
                    1.7,
                    -12
                );

            break;


        case "transformation":

            targetPosition =
                new THREE.Vector3(
                    0,
                    1.7,
                    -8
                );

            targetLook =
                new THREE.Vector3(
                    0,
                    1.7,
                    -12
                );

            break;


        case "ending":

            targetPosition =
                CAMERA.seatedPosition;

            targetLook =
                new THREE.Vector3(
                    0,
                    1.4,
                    -20
                );

            break;


        default:

            targetPosition =
                CAMERA.initialPosition;

            targetLook =
                CAMERA.initialLook;

    }


    const smooth =
        1 - Math.exp(
            -CONFIG.animation.cameraSmoothness *
            delta
        );


    camera.position.lerp(
        targetPosition,
        smooth
    );


    CAMERA.currentLook.lerp(
        targetLook,
        smooth
    );


    camera.lookAt(
        CAMERA.currentLook
    );

}


/* ============================================================
   35. MALE PROTAGONIST HAND
============================================================ */

function updateBoyHand(delta) {

    if (!boyHandModel) return;

    if (boyHandMixer) {

        boyHandMixer.update(delta);

    }


    if (
        STATE.scenePhase === "touch" ||
        STATE.scenePhase === "transformation"
    ) {

        const targetPosition =
            new THREE.Vector3(
                0.35,
                -0.15,
                -0.95
            );

        boyHandModel.position.lerp(
            targetPosition,
            delta * 1.5
        );

    }

    else if (
        STATE.scenePhase === "ending"
    ) {

        const targetPosition =
            new THREE.Vector3(
                0.35,
                -0.55,
                -0.5
            );

        boyHandModel.position.lerp(
            targetPosition,
            delta * 1.2
        );

    }

}


/* ============================================================
   36. FEMALE CHARACTER ANIMATION
============================================================ */

function updateGirl(delta) {

    if (!girlModel) return;

    if (girlMixer) {

        girlMixer.update(delta);

    }


    if (
        STATE.scenePhase === "transformation"
    ) {

        if (!STATE.transformationStarted) {

            STATE.transformationStarted = true;

            beginTransformation();

        }

    }

}


/* ============================================================
   37. CREATE TRANSFORMATION PARTICLES
============================================================ */

function createTransformationParticles() {

    const particleGroup =
        new THREE.Group();


    const colors = [

        0xffa7c9,

        0xffd4e8,

        0xffdf9b,

        0xffffff,

        0xd9b6ff,

        0xffb7a1

    ];


    for (
        let i = 0;
        i < CONFIG.butterflies.transformationCount;
        i++
    ) {

        const geometry =
            new THREE.SphereGeometry(

                random(0.025, 0.075),

                6,
                6

            );


        const material =
            new THREE.MeshBasicMaterial({

                color:
                    colors[
                        Math.floor(
                            Math.random() *
                            colors.length
                        )
                    ],

                transparent: true,

                opacity: 0.95

            });


        const particle = new THREE.Mesh(

            geometry,
            material

        );


        particle.position.copy(
            POSITIONS.transformation
        );


        particle.userData.velocity =
            new THREE.Vector3(

                random(-1, 1),

                random(-0.2, 1.3),

                random(-1, 1)

            ).normalize();


        particle.userData.speed =
            random(1.5, 5);


        particle.userData.life =
            random(2, 5);


        particle.userData.initialScale =
            random(0.5, 1.5);


        particle.scale.setScalar(0);

        transformationParticles.push(
            particle
        );

        particleGroup.add(particle);

    }


    scene.add(particleGroup);

    return particleGroup;

}


/* ============================================================
   38. BUTTERFLY TRANSFORMATION
============================================================ */

function beginTransformation() {

    if (STATE.transformationFinished) return;

    console.log(
        "Magical transformation started."
    );


    playMagicSound();


    /* Hide the girl at transformation start.
       Her body is replaced by the butterfly effect. */

    if (girlModel) {

        girlModel.visible = false;

    }


    /* Create magical particles */

    createTransformationParticles();


    /* Create hundreds of butterflies */

    createTransformationButterflies();


    STATE.transformationStarted = true;

    STATE.transformationFinished = true;

    STATE.scenePhase = "ending";

    STATE.phaseTime = 0;

    STATE.endingStarted = true;


    updateSceneDescription(
        "Some beautiful moments become memories..."
    );

}


/* ============================================================
   39. CREATE TRANSFORMED BUTTERFLIES
============================================================ */

function createTransformationButterflies() {

    for (
        let i = 0;
        i < CONFIG.butterflies.transformationCount;
        i++
    ) {

        const butterfly =
            butterflyModel
                ? butterflyModel.clone()
                : createProceduralButterfly();


        butterfly.position.copy(
            POSITIONS.transformation
        );


        butterfly.scale.setScalar(
            random(0.08, 0.22)
        );


        butterfly.userData.transformed = true;


        const direction =
            new THREE.Vector3(

                random(-1, 1),

                random(0.1, 1.2),

                random(-1, 1)

            ).normalize();


        butterfly.userData.velocity =
            direction.multiplyScalar(
                random(1.5, 4)
            );


        butterfly.userData.phase =
            random(0, Math.PI * 2);


        butterfly.userData.life =
            random(8, 14);


        butterflies.push(butterfly);

        scene.add(butterfly);

    }

}


/* ============================================================
   40. UPDATE TRANSFORMATION PARTICLES
============================================================ */

function updateTransformationParticles(delta) {

    transformationParticles.forEach(particle => {

        particle.userData.life -= delta;


        if (particle.userData.life > 0) {

            particle.position.addScaledVector(

                particle.userData.velocity,

                particle.userData.speed * delta

            );


            particle.scale.lerp(

                new THREE.Vector3(
                    0.3,
                    0.3,
                    0.3
                ),

                delta * 1.5

            );


            particle.material.opacity =
                clamp(
                    particle.userData.life / 3,
                    0,
                    1
                );

        }

        else {

            particle.visible = false;

        }

    });

}


/* ============================================================
   41. STORY SEQUENCE CONTROLLER
============================================================ */

function updateStorySequence(delta) {

    if (!STATE.started || STATE.paused) return;


    STATE.phaseTime += delta;

    STATE.elapsedTime += delta;


    switch (STATE.scenePhase) {


        /* ---------------------------------------------
           SCENE 1: FIRST-PERSON BUTTERFLY CHASE
        --------------------------------------------- */

        case "chase":

            updateSceneDescription(
                "Follow the butterfly..."
            );


            if (STATE.phaseTime >= 12) {

                changeScenePhase("approach");

            }

            break;


        /* ---------------------------------------------
           SCENE 2: APPROACH THE OCEAN VIEWPOINT
        --------------------------------------------- */

        case "approach":

            updateSceneDescription(
                "A beautiful world awaits ahead..."
            );


            if (STATE.phaseTime >= 8) {

                changeScenePhase("reveal");

            }

            break;


        /* ---------------------------------------------
           SCENE 3: GIRL REVEAL
        --------------------------------------------- */

        case "reveal":

            updateSceneDescription(
                "A moment that feels like a dream..."
            );


            if (STATE.phaseTime >= 7) {

                changeScenePhase("touch");

            }

            break;


        /* ---------------------------------------------
           SCENE 4: TOUCH
        --------------------------------------------- */

        case "touch":

            updateSceneDescription(
                "One touch can change everything..."
            );


            if (STATE.phaseTime >= 3) {

                changeScenePhase(
                    "transformation"
                );

            }

            break;


        /* ---------------------------------------------
           SCENE 5: TRANSFORMATION
        --------------------------------------------- */

        case "transformation":

            updateSceneDescription(
                "She became a thousand butterflies..."
            );


            if (!STATE.transformationStarted) {

                beginTransformation();

            }

            break;


        /* ---------------------------------------------
           SCENE 6: EMOTIONAL ENDING
        --------------------------------------------- */

        case "ending":

            updateSceneDescription(
                "Some moments stay forever..."
            );

            break;

    }

}


/* ============================================================
   42. CHANGE SCENE PHASE
============================================================ */

function changeScenePhase(nextPhase) {

    STATE.scenePhase = nextPhase;

    STATE.phaseTime = 0;


    console.log(
        "Scene changed to:",
        nextPhase
    );


    switch (nextPhase) {

        case "approach":

            updateSceneDescription(
                "The ocean is waiting..."
            );

            break;


        case "reveal":

            updateSceneDescription(
                "There she is..."
            );

            break;


        case "touch":

            updateSceneDescription(
                "A magical moment..."
            );

            break;


        case "transformation":

            updateSceneDescription(
                "A beautiful transformation..."
            );

            break;


        case "ending":

            updateSceneDescription(
                "Some moments stay forever..."
            );

            break;

    }

}


/* ============================================================
   43. SUNSET LIGHT ANIMATION
============================================================ */

function updateSunset(delta, elapsed) {

    if (!sun) return;


    const sunHeight =
        18 - elapsed * 0.015;

    sun.position.y =
        Math.max(5, sunHeight);


    if (sunLight) {

        sunLight.intensity =
            lerp(
                3.2,
                1.5,
                clamp(elapsed / 100, 0, 1)
            );

    }

}


/* ============================================================
   44. MAIN UPDATE LOOP
============================================================ */

function update(delta, elapsed) {

    if (STATE.paused) return;


    updateEnvironmentAnimations(elapsed);

    updateButterflies(delta, elapsed);

    updateButterflyWings(elapsed);

    updateTransformationParticles(delta);

    updateCamera(delta);

    updateBoyHand(delta);

    updateGirl(delta);

    updateSunset(delta, elapsed);

    updateStorySequence(delta);

}


/* ============================================================
   45. RENDER LOOP
============================================================ */

function animate() {

    animationFrameId =
        requestAnimationFrame(animate);


    if (!renderer || !scene || !camera) {

        return;

    }


    const delta =
        Math.min(clock.getDelta(), 0.05);


    const elapsed =
        clock.elapsedTime;


    if (!STATE.paused) {

        update(delta, elapsed);

    }


    renderer.render(
        scene,
        camera
    );

}


/* ============================================================
   46. PAUSE EXPERIENCE
============================================================ */

function pauseExperience() {

    if (!STATE.started || STATE.paused) return;

    STATE.paused = true;

    if (pauseScreen) {

        pauseScreen.hidden = false;

    }

    Object.values(audioElements).forEach(audio => {

        if (audio) {

            audio.pause();

        }

    });

}


/* ============================================================
   47. RESUME EXPERIENCE
============================================================ */

function resumeExperience() {

    if (!STATE.paused) return;

    STATE.paused = false;

    if (pauseScreen) {

        pauseScreen.hidden = true;

    }

    if (!STATE.muted) {

        startAudio();

    }

}


/* ============================================================
   48. WINDOW RESIZE
============================================================ */

function handleResize() {

    if (!camera || !renderer) return;


    camera.aspect =
        window.innerWidth /
        window.innerHeight;


    camera.updateProjectionMatrix();


    renderer.setSize(

        window.innerWidth,
        window.innerHeight

    );


    renderer.setPixelRatio(

        Math.min(
            window.devicePixelRatio,
            1.75
        )

    );

}


/* ============================================================
   49. VISIBILITY CHANGE
============================================================ */

function handleVisibilityChange() {

    if (document.hidden) {

        if (STATE.started) {

            pauseExperience();

        }

    }

}


/* ============================================================
   50. EVENT LISTENERS
============================================================ */

function initializeEventListeners() {


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

            () => {

                window.location.reload();

            }

        );

    }


    window.addEventListener(

        "resize",

        handleResize

    );


    document.addEventListener(

        "visibilitychange",

        handleVisibilityChange

    );


    window.addEventListener(

        "keydown",

        event => {

            if (
                event.code === "Escape" &&
                STATE.started
            ) {

                if (STATE.paused) {

                    resumeExperience();

                }

                else {

                    pauseExperience();

                }

            }

        }

    );

}


/* ============================================================
   51. CLEANUP
============================================================ */

function disposeApplication() {

    if (animationFrameId !== null) {

        cancelAnimationFrame(
            animationFrameId
        );

    }


    Object.values(audioElements).forEach(audio => {

        if (audio) {

            audio.pause();

            audio.src = "";

        }

    });


    if (scene) {

        scene.traverse(object => {

            if (object.geometry) {

                object.geometry.dispose();

            }

            if (object.material) {

                const materials =
                    Array.isArray(object.material)
                        ? object.material
                        : [object.material];


                materials.forEach(material => {

                    Object.values(material).forEach(value => {

                        if (
                            value &&
                            value.isTexture
                        ) {

                            value.dispose();

                        }

                    });

                    material.dispose();

                });

            }

        });

    }


    if (renderer) {

        renderer.dispose();

    }


    if (dracoLoader) {

        dracoLoader.dispose();

    }

}


/* ============================================================
   52. APPLICATION STARTUP
============================================================ */

initializeApplication();


/* ============================================================
   53. BROWSER CLEANUP
============================================================ */

window.addEventListener(

    "pagehide",

    disposeApplication,

    { once: true }

);


/* ============================================================
   END OF script.js
============================================================ */
