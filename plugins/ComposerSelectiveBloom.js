import {
	Vector2,
	Layers,
	ReinhardToneMapping,
	ShaderMaterial,
	MeshBasicMaterial,
	DoubleSide,
} from '../node_modules/three/build/three.module.js'

import SCENE from '../scaffold/SCENE.js'
import CAMERA from '../scaffold/CAMERA.js'
import RENDERER from '../scaffold/RENDERER.js'

import {
	EffectComposer,
} from '../node_modules/three/examples/jsm/postprocessing/EffectComposer.js'
import { ShaderPass } from '../node_modules/three/examples/jsm/postprocessing/ShaderPass.js'
import { RenderPass } from '../node_modules/three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from '../node_modules/three/examples/jsm/postprocessing/UnrealBloomPass.js'




const addBloom = window.addBloom = obj => {

	obj.layers.enable( BLOOM_LAYER )
	materials[ obj.uuid ] = obj.material

}

const removeBloom = window.removeBloom = obj => {

	obj.layers.disable( BLOOM_LAYER )
	delete materials[ obj.uuid ]

}





const initSelectiveBloomGUI = () => {

	const glow_indicator = document.createElement('div')
	glow_indicator.classList.add('glow-indicator')
	document.body.appendChild( glow_indicator )

	const remove_indicator = document.createElement('div')
	remove_indicator.classList.add('remove-indicator')
	remove_indicator.innerHTML = '&times;'
	document.body.appendChild( remove_indicator )

	const glow_track = e => {
		glow_indicator.style.left = e.clientX + 'px'
		glow_indicator.style.top = e.clientY + 'px'
	}

	const remove_track = e => {
		remove_indicator.style.left = e.clientX + 'px'
		remove_indicator.style.top = e.clientY + 'px'
	}

	const addGlowClick = e => {

		const intersect = RENDERER.get_clicked( e, false )
		if( intersect ) addBloom( intersect.object )

		glow_indicator.style.display = 'none'
		document.body.removeEventListener('mousemove', glow_track )
		document.body.removeEventListener('click', addGlowClick )
	}

	const removeGlowClick = e => {

		const intersect = RENDERER.get_clicked( e, false )
		if( intersect ) removeBloom( intersect.object )	

		remove_indicator.style.display = 'none'
		document.body.removeEventListener('mousemove', remove_track )
		document.body.removeEventListener('click', removeGlowClick )

	}

	const addGlowState = e => {

		e.stopPropagation()

		glow_indicator.style.display = 'initial'
		document.body.addEventListener('mousemove', glow_track )
		document.body.addEventListener('click', addGlowClick )

	}

	const removeGlowState = e => {

		e.stopPropagation()

		remove_indicator.style.display = 'initial'
		document.body.addEventListener('mousemove', remove_track )
		document.body.addEventListener('click', removeGlowClick )

	}

	const add_glow = document.createElement('div')
	add_glow.classList.add('button')
	add_glow.style.top = '100px'
	add_glow.innerText = 'add glow'
	add_glow.addEventListener('click', addGlowState )
	document.body.appendChild( add_glow )

	const remove_glow = document.createElement('div')
	remove_glow.classList.add('button')
	remove_glow.style.top = '120px'
	remove_glow.innerText = 'remove glow'
	remove_glow.addEventListener('click', removeGlowState )
	document.body.appendChild( remove_glow )

}










const vshader = document.createElement('script')
vshader.type = 'x-shader/x-vertex'
vshader.id = 'vertexshader'
vshader.innerHTML = `
varying vec2 vUv;
void main() {
	vUv = uv;
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`
document.body.appendChild( vshader )

const fshader = document.createElement('script')
fshader.type = 'x-shader/x-fragment'
fshader.id = 'fragmentshader'
fshader.innerHTML = `
uniform sampler2D baseTexture;
uniform sampler2D bloomTexture;
varying vec2 vUv;
void main() {
	gl_FragColor = ( texture2D( baseTexture, vUv ) + vec4( 1.0 ) * texture2D( bloomTexture, vUv ) );
}`
document.body.appendChild( fshader )

const bloom_params = {
	exposure: 1,
	strength: 1.5,
	threshold: 0,
	radius: 0,
}

const BLOOM_LAYER = 1
const DEFAULT_LAYER = 0

const bloomLayer = new Layers();
bloomLayer.set( BLOOM_LAYER );

const bloomComposer = new EffectComposer( RENDERER )
const renderScene = new RenderPass( SCENE, CAMERA )

RENDERER.toneMapping = ReinhardToneMapping;

const bloomPass = new UnrealBloomPass( new Vector2( window.innerWidth, window.innerHeight ), 0, 0, 0 ); // 1.5, 0.4, 0.85
bloomPass.threshold = bloom_params.threshold
bloomPass.strength = bloom_params.strength;
bloomPass.radius = bloom_params.radius;

bloomComposer.renderToScreen = false
bloomComposer.addPass( renderScene )
bloomComposer.addPass( bloomPass )


const finalPass = new ShaderPass(
	new ShaderMaterial( {
		uniforms: {
			baseTexture: { value: null },
			bloomTexture: { value: bloomComposer.renderTarget2.texture }
		},
		vertexShader: document.getElementById( 'vertexshader' ).textContent,
		fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
		defines: {}
	} ), "baseTexture"
);
finalPass.needsSwap = true;

const finalComposer = new EffectComposer( RENDERER );
finalComposer.addPass( renderScene )
finalComposer.addPass( finalPass )

const darkMaterial = new MeshBasicMaterial( { color: "black", side: DoubleSide } );
const materials = {}

function darkenNonBloomed( obj ) {
	if ( obj.isMesh && bloomLayer.test( obj.layers ) === false ) {
		materials[ obj.uuid ] = obj.material;
		obj.material = darkMaterial;
	}
}

function restoreMaterial( obj ) {
	if ( materials[ obj.uuid ] ) {
		obj.material = materials[ obj.uuid ];
		delete materials[ obj.uuid ];
	}
}


const composeAnimate = () => {

	SCENE.traverse( darkenNonBloomed )

	// CAMERA.layers.enable( BLOOM_LAYER )
    bloomComposer.render()
	SCENE.traverse( restoreMaterial )

    // CAMERA.layers.disable( BLOOM_LAYER )
    finalComposer.render()


}



export {
	composeAnimate,
	addBloom,
	removeBloom,
	initSelectiveBloomGUI,
}

