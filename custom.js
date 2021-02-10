import * as THREE from './scaffold/three.module.js'
import SCENE from './scaffold/SCENE.js'
import CAMERA from './scaffold/CAMERA.js'
import * as LIGHT from './scaffold/LIGHT.js'
import RENDERER from './scaffold/RENDERER.js'
import { OrbitControls } from './scaffold/OrbitControls.js'


////// sample init modifications
SCENE.background = new THREE.Color( 0x222222 )

// LIGHT
LIGHT.directional.position.set( 100, 100, 100 )


////// bulk of the custom stuff here
const toon = {
	geo: new THREE.BoxBufferGeometry(5, 5, 5),
	mat: new THREE.MeshPhongMaterial({
		color: 0xff0000,
	}),
}

toon.mesh = new THREE.Mesh( toon.geo, toon.mat )

const controls = new OrbitControls( CAMERA, RENDERER.domElement )


SCENE.add( toon.mesh )
SCENE.add( LIGHT.directional )

CAMERA.position.set(10, 100, 10)
CAMERA.lookAt( toon.mesh.position )






const animate = () => {

	requestAnimationFrame( animate )

	controls.update()

	RENDERER.render( SCENE, CAMERA )

}


animate()


export default {}