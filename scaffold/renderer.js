import {
	WebGLRenderer,
	PCFSoftShadowMap,
} from './three.module.js'

import camera from './camera.js'



const set_renderer = r => {  // for scaling resolution up or down
	r.setSize( 
		window.innerWidth / 1, 
		window.innerHeight / 1, 
		false 
	)
}

const renderer = window.renderer = new WebGLRenderer( { 
	antialias: true,
	alpha: true
} )

renderer.setPixelRatio( window.devicePixelRatio )
set_renderer( renderer )

renderer.shadowMap.enabled = true
renderer.shadowMap.type = PCFSoftShadowMap

renderer.domElement.id = 'custom-canvas'
// renderer.domElement.tabindex = 1

document.body.appendChild( renderer.domElement )

renderer.onWindowResize = function(){

	camera.aspect = window.innerWidth / window.innerHeight
	camera.updateProjectionMatrix()

	set_renderer( renderer )

}

window.onresize = renderer.onWindowResize

export default renderer