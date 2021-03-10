import * as THREE from '../scaffold/three.module.js'
import SCENE from '../scaffold/SCENE.js'
import CAMERA from '../scaffold/CAMERA.js'
import * as LIGHT from '../scaffold/LIGHT.js'
import RENDERER from '../scaffold/RENDERER.js'
import { OrbitControls } from '../scaffold/OrbitControls.js'

import {
	composeAnimate,
	initGUI,
	// addBloom,
	// removeBloom
} from '../plugins/ComposerSelectiveBloom.js'


initGUI()

const state = {
	pending_cube: false,
}

const track_icon = document.createElement('div')
track_icon.classList.add('button', 'tracker')
document.body.appendChild( track_icon )

const tracking = e => {
	track_icon.style.left = e.clientX + 'px'
	track_icon.style.top = e.clientY + 'px'
}

const addCube = () => {

	if( state.pending_cube ) return true

	const dimensions = { x: 5, y: 5, z: 5 }

	const cubeMesh = new THREE.Mesh(
	    new THREE.BoxBufferGeometry( dimensions.x, dimensions.y, dimensions.z ),
	    new THREE.MeshPhongMaterial({
	        color: 0x2255ff,
	    })
	);
	cubeMesh.castShadow = true;
	cubeMesh.position.y = 5;
	cubeMesh.userData.dimensions = dimensions
	cubes.push( cubeMesh )

	state.pending_cube = cubeMesh

	document.addEventListener('mousemove', tracking )
	track_icon.style.display = 'initial'

}



const add_cube = document.createElement('div')
add_cube.classList.add('button')
add_cube.style.top = '0px'
add_cube.innerText = 'add cube'
add_cube.addEventListener('click', addCube )
document.body.appendChild( add_cube )




SCENE.background = new THREE.Color(0x000000)

LIGHT.directional.position.set(100, 100, 100)
SCENE.add(LIGHT.directional)

const controls = new OrbitControls( CAMERA, RENDERER.domElement )

const cubes = window.cubes = []


// const ground = window.ground = {}
// const skybox = window.skybox = {}




const handle_clicked = e => {

	const intersect = RENDERER.get_clicked( e, false )

	if( intersect && state.pending_cube ){
		// state.pending_cube = intersect.object
		SCENE.add( state.pending_cube )
		state.pending_cube.position.copy( intersect.point )
		state.pending_cube.position.y += ( state.pending_cube.userData.dimensions.y / 2 ) + .01 // ( so shadow is above )
		delete state.pending_cube
	}else{
		delete state.pending_cube
	}

	document.removeEventListener('mousemove', tracking )
	track_icon.style.display = 'none'

}


window.addEventListener('pointerdown', handle_clicked, false )





const groundGeometry = new THREE.PlaneGeometry(100, 100, 1)
const groundMesh = new THREE.Mesh(
    groundGeometry,
    new THREE.MeshBasicMaterial({
        color: 0xff4422,
        side: THREE.DoubleSide
    })    
)
groundMesh.receiveShadow = true
groundMesh.rotation.x = -Math.PI / 2
SCENE.add(groundMesh)

CAMERA.position.set( -150, 150, 10 )
CAMERA.lookAt( new THREE.Vector3() )

animate()

function animate() {
    requestAnimationFrame(animate)
    controls.update()
    // RENDERER.render(SCENE, CAMERA);
    composeAnimate()
}
