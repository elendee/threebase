import {
	PerspectiveCamera,
} from './three.module.js'

const camera = window.camera = new PerspectiveCamera( 30,  window.innerWidth / window.innerHeight,  1,  3000 )

export default camera