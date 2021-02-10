# threebase
threejs scaffolding

*You must write your own custom.js file, using es6 module `import`/`export`*

You can then share `custom.js` files with friends for quick collaboration.

Copy this sample `custom.js` template to get started:
```js
import * as THREE from './scaffold/three.module.js'
import SCENE from './scaffold/SCENE.js'
import CAMERA from './scaffold/CAMERA.js'
import * as LIGHT from './scaffold/LIGHT.js'
import RENDERER from './scaffold/RENDERER.js'
import { OrbitControls } from './scaffold/OrbitControls.js'




//////////////////////////////////////////////// sample init tweaks
SCENE.background = new THREE.Color( 0x222222 )

LIGHT.directional.position.set( 100, 100, 100 )
SCENE.add( LIGHT.directional )

const controls = new OrbitControls( CAMERA, RENDERER.domElement )




//////////////////////////////////////////////// core code
const toon = {
	geo: new THREE.BoxBufferGeometry(5, 5, 5),
	mat: new THREE.MeshPhongMaterial({
		color: 0xff0000,
	}),
}
toon.mesh = new THREE.Mesh( toon.geo, toon.mat )
toon.mesh.castShadow = true
SCENE.add( toon.mesh )

const ground = {
	geo: new THREE.PlaneGeometry(100, 100, 1),
	mat: new THREE.MeshPhongMaterial({
		color: 0x00ff00,
		side: THREE.DoubleSide,
	})
}
ground.mesh = new THREE.Mesh( ground.geo, ground.mat )
ground.mesh.receiveShadow = true
ground.mesh.rotation.x = Math.PI / 2
SCENE.add( ground.mesh )




//////////////////////////////////////////////// and off we go

CAMERA.position.set(-10, 10, 10)
CAMERA.lookAt( toon.mesh.position )




const animate = () => {

	requestAnimationFrame( animate )

	controls.update()

	RENDERER.render( SCENE, CAMERA )

}


animate()


export default {}```
