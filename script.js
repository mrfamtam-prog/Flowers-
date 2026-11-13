
/* ============================================================
   PROCEDURAL FEMALE CHARACTER FALLBACK
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

    const dressLight = new THREE.MeshStandardMaterial({
        color: 0xe5a5c7,
        roughness: 0.8
    });

    const shoes = new THREE.MeshStandardMaterial({
        color: 0x65483f,
        roughness: 0.85
    });

    const eyes = new THREE.MeshStandardMaterial({
        color: 0x241b19
    });

    function addMesh(geometry, material, position, scale) {

        const mesh = new THREE.Mesh(geometry, material);

        mesh.position.set(...position);

        if (scale) {
            mesh.scale.set(...scale);
        }

        mesh.castShadow = true;
        mesh.receiveShadow = true;

        group.add(mesh);

        return mesh;
    }

    // Legs
    addMesh(
        new THREE.CylinderGeometry(0.105, 0.12, 0.72, 12),
        skin,
        [-0.16, 0.48, 0]
    );

    addMesh(
        new THREE.CylinderGeometry(0.105, 0.12, 0.72, 12),
        skin,
        [0.16, 0.48, 0]
    );

    // Shoes
    addMesh(
        new THREE.SphereGeometry(0.13, 16, 12),
        shoes,
        [-0.16, 0.09, 0.07],
        [1.2, 0.65, 1.8]
    );

    addMesh(
        new THREE.SphereGeometry(0.13, 16, 12),
        shoes,
        [0.16, 0.09, 0.07],
        [1.2, 0.65, 1.8]
    );

    // Dress
    addMesh(
        new THREE.CylinderGeometry(0.19, 0.52, 0.82, 24),
        dress,
        [0, 1.18, 0]
    );

    addMesh(
        new THREE.CylinderGeometry(0.2, 0.2, 0.16, 20),
        dressLight,
        [0, 1.55, 0]
    );

    // Body and neck
    addMesh(
        new THREE.SphereGeometry(0.25, 20, 16),
        skin,
        [0, 1.72, 0]
    );

    addMesh(
        new THREE.CylinderGeometry(0.085, 0.09, 0.18, 12),
        skin,
        [0, 1.91, 0]
    );

    // Head
    addMesh(
        new THREE.SphereGeometry(0.34, 24, 20),
        skin,
        [0, 2.2, 0]
    );

    // Hair
    addMesh(
        new THREE.SphereGeometry(0.365, 24, 18),
        hair,
        [0, 2.34, -0.055],
        [1.04, 1, 0.92]
    );

    addMesh(
        new THREE.SphereGeometry(0.19, 18, 14),
        hair,
        [-0.27, 2.08, -0.015],
        [0.62, 1.35, 0.72]
    );

    addMesh(
        new THREE.SphereGeometry(0.19, 18, 14),
        hair,
        [0.27, 2.08, -0.015],
        [0.62, 1.35, 0.72]
    );

    // Eyes
    addMesh(
        new THREE.SphereGeometry(0.035, 10, 8),
        eyes,
        [-0.115, 2.22, 0.397]
    );

    addMesh(
        new THREE.SphereGeometry(0.035, 10, 8),
        eyes,
        [0.115, 2.22, 0.397]
    );

    // Nose
    addMesh(
        new THREE.SphereGeometry(0.025, 10, 8),
        skin,
        [0, 2.15, 0.42]
    );

    // Arms
    const leftArm = addMesh(
        new THREE.CylinderGeometry(0.075, 0.06, 0.68, 12),
        skin,
        [-0.34, 1.42, 0]
    );

    leftArm.rotation.z = -0.22;

    const rightArm = addMesh(
        new THREE.CylinderGeometry(0.075, 0.06, 0.68, 12),
        skin,
        [0.34, 1.42, 0]
    );

    rightArm.rotation.z = 0.22;

    // Hands
    addMesh(
        new THREE.SphereGeometry(0.085, 12, 10),
        skin,
        [-0.42, 1.08, 0.015]
    );

    addMesh(
        new THREE.SphereGeometry(0.085, 12, 10),
        skin,
        [0.42, 1.08, 0.015]
    );

    // Dress flower
    addMesh(
        new THREE.SphereGeometry(0.055, 12, 10),
        dressLight,
        [0.12, 1.35, 0.205],
        [1, 1, 0.35]
    );

    group.position.copy(POSITIONS.girl);

    group.scale.setScalar(0.9);

    group.userData.proceduralFallback = true;

    group.userData.baseY = group.position.y;

    group.userData.swayPhase = Math.random() * Math.PI * 2;

    return group;
}


/* ============================================================
   27. LOAD CHARACTER ASSETS
============================================================ */

async function loadCharacterAssets() {

    const loadingTasks = [

        {
            name: "Male protagonist hand",

            path: CONFIG.assets.boyHand,

            callback: result => {

                boyHandModel = result.scene;

                boyHandModel.position.copy(
                    POSITIONS.boyHand
                );

                boyHandModel.scale.setScalar(0.35);

                camera.add(boyHandModel);

                if (result.animations.length) {

                    boyHandMixer =
                        new THREE.AnimationMixer(boyHandModel);

                }

            }
        },

        {
            name: "Female protagonist",

            path: CONFIG.assets.girl,

            callback: result => {

                girlModel = result.scene;

                girlModel.position.copy(
                    POSITIONS.girl
                );

                girlModel.scale.setScalar(1);

                girlModel.traverse(object => {

                    if (object.isMesh) {

                        object.castShadow = true;

                        object.receiveShadow = true;

                    }

                });

                scene.add(girlModel);

                if (result.animations.length) {

                    girlMixer =
                        new THREE.AnimationMixer(girlModel);

                }

            }
        },

        {
            name: "Realistic butterfly",

            path: CONFIG.assets.butterfly,

            callback: result => {

                butterflyModel = result.scene;

                butterflyModel.scale.setScalar(0.4);

                console.log("Realistic butterfly loaded.");

            }
        }

    ];

    await Promise.allSettled(

        loadingTasks.map(async task => {

            try {

                const result = await loadGLTF(task.path);

                task.callback(result);

                return true;

            } catch (error) {

                console.warn(
                    `${task.name} unavailable. Using fallback if available.`,
                    error
                );

                return false;

            }

        })

    );

    // IMPORTANT: Missing girl.glb will no longer stop the experience.

    if (!girlModel) {

        girlModel = createProceduralGirl();

        scene.add(girlModel);

        console.warn(
            "girl.glb missing. Procedural female character created."
        );

    }

    console.log("Character loading completed.");

}
