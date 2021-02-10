import * as THREE from './scaffold/three.module.js'
import scene from './scaffold/scene.js'
import camera from './scaffold/camera.js'
import * as light from './scaffold/light.js'
import renderer from './scaffold/renderer.js'



////// sample init modifications
scene.background = new THREE.Color( 0x222222 )
// scene.fog = new THREE.FogExp2( 0xffffff, .02 )

// light
light.directional.position.set( 100, 100, 100 )
light.directional.castShadow = true
light.directional.shadowCameraNear = 10;
light.directional.shadowCameraFar = 3200;
// bounds
light.directional.shadowCameraLeft = -500;
light.directional.shadowCameraRight = 500;
light.directional.shadowCameraTop = 500;
light.directional.shadowCameraBottom = -500;
// resolution
light.directional.shadowMapWidth = 2000;
light.directional.shadowMapHeight = 2000;



////// bulk of the custom stuff here
const toon = {
	geo: new THREE.BoxBufferGeometry(5, 5, 5),
	mat: new THREE.MeshPhongMaterial({
		color: 0xff0000,
	}),
}

toon.mesh = new THREE.Mesh( toon.geo, toon.mat )

scene.add( toon.mesh )
scene.add( camera )
scene.add( light.directional )

camera.position.set(10, 100, 10)
camera.lookAt( toon.mesh.position )






const animate = () => {

	requestAnimationFrame( animate )

	renderer.render( scene, camera )

}


animate()


export default {}