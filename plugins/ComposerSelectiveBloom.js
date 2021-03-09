import {
	Vector2,
	Layers,
	ReinhardToneMapping,
	ShaderMaterial,
	MeshBasicMaterial,
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
	strength: 2,
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

const darkMaterial = new MeshBasicMaterial( { color: "black" } );
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

const addBloom = window.addBloom = obj => {

	obj.layers.enable( BLOOM_LAYER )
	materials[ obj.uuid ] = obj.material

}

const removeBloom = window.removeBloom = obj => {

	obj.layers.disable( BLOOM_LAYER )
	delete materials[ obj.uuid ]

}


export {
	composeAnimate,
	addBloom,
	removeBloom,
}

