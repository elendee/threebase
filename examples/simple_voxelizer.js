import * as THREE from '../scaffold/three.module.js'
import SCENE from '../scaffold/SCENE.js'
import CAMERA from '../scaffold/CAMERA.js'
import * as LIGHT from '../scaffold/LIGHT.js'
import RENDERER from '../scaffold/RENDERER.js'
import {
    OrbitControls
} from '../scaffold/OrbitControls.js'

import { Voxelizer } from '../plugins/voxelizer.js';

Promise.all([
    loadImage("/examples/assets/tree_side.png"),
    loadImage("/examples/assets/tree_top.png"),
    loadImage("/examples/assets/tree_side.png")
]).then(imgArr=>{

    const vox = new Voxelizer({
        side: imgArr[0],
        top: imgArr[1],
        back: imgArr[2]
    });

    SCENE.add(vox.mesh);
})

function loadImage(url) {
    return new Promise(function (resolve) {
        const img = new Image();
        img.onload = _ => resolve(img);
        img.src = url;
    });
}

SCENE.background = new THREE.Color(0x222222);

LIGHT.directional.position.set(100, 100, 100);
SCENE.add(LIGHT.directional);

const controls = new OrbitControls(CAMERA, RENDERER.domElement);

CAMERA.position.set(-10, 10, 10);
CAMERA.lookAt(new THREE.Vector3(0,0,0));

animate();

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    RENDERER.render(SCENE, CAMERA);
}