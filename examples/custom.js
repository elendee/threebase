import * as THREE from '../scaffold/three.module.js'
import SCENE from '../scaffold/SCENE.js'
import CAMERA from '../scaffold/CAMERA.js'
import * as LIGHT from '../scaffold/LIGHT.js'
import RENDERER from '../scaffold/RENDERER.js'
import { OrbitControls } from '../scaffold/OrbitControls.js'

SCENE.background = new THREE.Color(0x222222);

LIGHT.directional.position.set(100, 100, 100);
SCENE.add(LIGHT.directional);

const controls = new OrbitControls(CAMERA, RENDERER.domElement);

const cubeMesh = new THREE.Mesh(
    new THREE.BoxBufferGeometry(5, 5, 5),
    new THREE.MeshPhongMaterial({
        color: 0xffcd75,
    })
);
cubeMesh.castShadow = true;
cubeMesh.position.y = 5;
SCENE.add(cubeMesh);

const groundGeometry = new THREE.PlaneGeometry(100, 100, 1)
const groundMesh = new THREE.Mesh(
    groundGeometry,
    new THREE.MeshBasicMaterial({
        color: 0xffcd75,
        side: THREE.DoubleSide
    })    
);
groundMesh.receiveShadow = true;
groundMesh.rotation.x = Math.PI / 2;
SCENE.add(groundMesh);

CAMERA.position.set(-10, 10, 10);
CAMERA.lookAt(cubeMesh.position);

animate();

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    RENDERER.render(SCENE, CAMERA);
}
