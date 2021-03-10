import {
	Raycaster,
} from './three.module.js'

import {
	WebGLRenderer,
	PCFSoftShadowMap,
} from './three.module.js'

const RAYCASTER = new Raycaster()


const set_renderer = r => {  // for scaling resolution up or down
	r.setSize( 
		window.innerWidth / 1, 
		window.innerHeight / 1, 
		false 
	)
}

const RENDERER = window.RENDERER = new WebGLRenderer( { 
	antialias: true,
	alpha: true
} )

RENDERER.setPixelRatio( window.devicePixelRatio )
set_renderer( RENDERER )

RENDERER.shadowMap.enabled = true
RENDERER.shadowMap.type = PCFSoftShadowMap

RENDERER.domElement.id = 'custom-canvas'
// RENDERER.domElement.tabindex = 1

document.body.appendChild( RENDERER.domElement )

RENDERER.onWindowResize = function(){

	CAMERA.aspect = window.innerWidth / window.innerHeight
	CAMERA.updateProjectionMatrix()

	set_renderer( RENDERER )

}


RENDERER.get_clicked = ( e, deep ) => {

	e.preventDefault();

	const x = ( e.clientX / RENDERER.domElement.clientWidth ) * 2 - 1
	const y =  - ( e.clientY / RENDERER.domElement.clientHeight ) * 2 + 1

	RAYCASTER.setFromCamera({
		x: x, 
		y: y
	}, CAMERA )

	const intersects = RAYCASTER.intersectObjects( SCENE.children, true ) // [ objects ], recursive (children) (ok to turn on if needed)

	if( intersects.length <= 0 ){ // 1 == skybox
		return false
	}	

	return deep ? intersects : intersects[0]

}


window.onresize = RENDERER.onWindowResize

export default RENDERER