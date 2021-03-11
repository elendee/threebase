import * as THREE from '../scaffold/three.module.js'
import SCENE from '../scaffold/SCENE.js'
import CAMERA from '../scaffold/CAMERA.js'
import * as LIGHT from '../scaffold/LIGHT.js'
import RENDERER from '../scaffold/RENDERER.js'
import { OrbitControls } from '../scaffold/OrbitControls.js'

import {
	composeAnimate,
	initSelectiveBloomGUI,
} from '../plugins/ComposerSelectiveBloom.js'

import { 
	Maze,
} from '../plugins/mazer.js'




initSelectiveBloomGUI()

SCENE.background = new THREE.Color(0x000000)

LIGHT.spotlight.position.set(50, 50, 50)
SCENE.add(LIGHT.spotlight )
SCENE.add(LIGHT.helper )

const controls = new OrbitControls( CAMERA, RENDERER.domElement )

const groundGeometry = new THREE.PlaneGeometry(100, 100, 1)
const groundMesh = new THREE.Mesh(
    groundGeometry,
    new THREE.MeshLambertMaterial({
        color: 0xff4422,
        side: THREE.DoubleSide,
    })    
)
groundMesh.receiveShadow = true
groundMesh.rotation.x = -Math.PI / 2
SCENE.add(groundMesh)



CAMERA.position.set( -150, 150, 10 )
CAMERA.lookAt( new THREE.Vector3() )




const maze = new Maze()
maze.fill_tiles()
maze.render_tiles()





animate()

function animate() {
    requestAnimationFrame(animate)
    controls.update()
    // RENDERER.render(SCENE, CAMERA);
    composeAnimate()
}
