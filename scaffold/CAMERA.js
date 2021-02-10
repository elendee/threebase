import {
	PerspectiveCamera,
} from './three.module.js'

import SCENE from './SCENE.js'

const CAMERA = window.CAMERA = new PerspectiveCamera( 30,  window.innerWidth / window.innerHeight,  1,  3000 )

export default CAMERA