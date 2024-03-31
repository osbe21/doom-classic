import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


class Game extends THREE.Scene {
    renderer;
    clock;
    framerate;
    dimensions;
    camera;
    cpuDelta;
    frameDelta;
    mapObj;

    isShooting;
    bullets;

    enemies;

    constructor() {
        super();

        this.dimensions = [1000/2, 720/2];
        this.framerate = 20;
        this.frameDelta = 0;

        this.clock = new THREE.Clock();
        this.cpuDelta = 0;

        this.background = new THREE.Color(0x1c1c1c);

        this.isShooting = false;
        this.bullets = 50;

        // this.enemies = [new Zombie()];
        // this.add(this.enemies[0])

        mouseMovedCallbacks.push(this.RotateCamera.bind(this));
        mousePressedCallbacks.push(this.Shoot.bind(this));

        this.InitScene();

        this.LoadMap().then(
            this.LoadNextFrame.bind(this)
        );
    }

    InitScene() {
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(this.dimensions[0], this.dimensions[1], false);
        document.getElementById("game").appendChild(this.renderer.domElement);

        this.camera = new THREE.PerspectiveCamera(90, this.dimensions[0]/this.dimensions[1], 0.1, 1500);
        this.add(this.camera);


        // Musikk
        this.audioListener = new THREE.AudioListener();
        this.camera.add(this.audioListener);

        const sound = new THREE.Audio(this.audioListener);

        const audioLoader = new THREE.AudioLoader();
        audioLoader.load('/doom-classic/audio/main_theme.mp3', function(buffer) {
            sound.setBuffer( buffer );
            sound.setLoop( true );
            sound.setVolume( 0.5 );
            sound.play();
        });


        // Skybox
        const skyGeometry = new THREE.CylinderGeometry(1000, 1000, 1200, 16);
        const texture = new THREE.TextureLoader().load("/doom-classic/images/sky.png");
        texture.minFilter = THREE.NearestFilter;
        texture.magFilter = THREE.NearestFilter;
        const mat = new THREE.MeshBasicMaterial({map: texture, side: THREE.BackSide});
        const skyMesh = new THREE.Mesh(skyGeometry, mat);
        skyMesh.position.y = 500;
        this.add(skyMesh);
    }

    async LoadMap() {
        const loader = new GLTFLoader();

        const model = await loader.loadAsync('/doom-classic/models/map.glb');

        model.scene.traverse((obj) => {
            if (!(obj.material && obj.material.map)) return;

            obj.material.map.magFilter = THREE.NearestFilter;
            obj.material.map.minFilter = THREE.NearestFilter;
        });

        this.mapObj = model.scene;
        this.add(this.mapObj);
    }

    LoadNextFrame() {
        this.cpuDelta = this.clock.getDelta();
        this.frameDelta += this.cpuDelta;

        if (this.frameDelta > 1 / this.framerate) {
            this.Update();
            this.renderer.render(this, this.camera);
            this.frameDelta = 0;
        }

        requestAnimationFrame(this.LoadNextFrame.bind(this));
    }

    Update() {
        this.MoveCamera();
        this.SetCameraHeight();

        // this.enemies.forEach((enemy) => {
        //     enemy.Update(this);
        // });
    }

    MoveCamera() {
        const speed = 8;

        if (keyPressed.w)
            this.camera.translateOnAxis(new THREE.Vector3(0, 0, 1), -speed * this.frameDelta);
        if (keyPressed.s)
            this.camera.translateOnAxis(new THREE.Vector3(0, 0, 1), speed * this.frameDelta);
        if (keyPressed.d)
            this.camera.translateOnAxis(new THREE.Vector3(1, 0, 0), speed * this.frameDelta);
        if (keyPressed.a)
            this.camera.translateOnAxis(new THREE.Vector3(1, 0, 0), -speed * this.frameDelta);
        if (keyPressed.e)
            this.camera.translateOnAxis(new THREE.Vector3(0, 1, 0), speed * this.frameDelta);
        if (keyPressed.q)
            this.camera.translateOnAxis(new THREE.Vector3(0, 1, 0), -speed * this.frameDelta);
    }

    SetCameraHeight() {
        const height = 2;
        const bobbingSpeed = 15;
        const bobbingAmount = .2;

        let currentHeight = height;

        if (Object.values(keyPressed).some(Boolean))
            currentHeight += bobbingAmount * Math.sin(bobbingSpeed * this.clock.elapsedTime);

        const raycast = new THREE.Raycaster(this.camera.position, new THREE.Vector3(0, -1, 0), 0, 10);

        const collisions = raycast.intersectObject(this.mapObj);

        if (collisions.length !== 0)
            this.camera.position.y = collisions[0].point.y + currentHeight;
    }

    RotateCamera(mouseX, mouseY) {
        const turnSpeed = .3;

        this.camera.rotation.y -= turnSpeed * mouseX * this.frameDelta;
    }

    Shoot() {
        if (this.isShooting || this.bullets == 0) return;

        this.isShooting = true;
        this.bullets--;

        // Raycast monstre

        // const dir = new THREE.Vector3();
        // this.camera.getWorldDirection(dir);
        // const raycast = new THREE.Raycaster(this.camera.position, dir);
        // raycast.camera = this.camera;
        // const hits = raycast.intersectObjects(this.enemies);
        // if (hits.length !== 0) {
        //     hits[0].object.removeFromParent();
        // }

        // Oppdater UI

        const ammoCount = document.getElementById("ammo-count");
        ammoCount.innerHTML = this.bullets;

        // Spill av lyd

        const sound = new THREE.Audio(this.audioListener);
        const audioLoader = new THREE.AudioLoader();
        audioLoader.load('/doom-classic/audio/shot.mp3', function( buffer ) {
            sound.setBuffer( buffer );
            sound.setVolume( 0.5 );
            sound.play();
        });

        // Spill av animasjon

        const weapon = document.getElementById("weapon");
        weapon.setAttribute("src", "/doom-classic/images/shooting/pistolShoot.gif");

        setTimeout(() => {
            weapon.setAttribute("src", "/doom-classic/images/shooting/pistolStatic.png");
            this.isShooting = false;
        }, 1350/3);
    }
}


new Game();
