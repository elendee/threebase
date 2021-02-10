import {
	WebGLRenderer,
	PCFSoftShadowMap,
} from './three.module.js'

import camera from './CAMERA.js'



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

window.onresize = RENDERER.onWindowResize

export default RENDERER