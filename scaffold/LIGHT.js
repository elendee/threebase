import { 
	DirectionalLight, 
	SpotLight,
	DirectionalLightHelper,
	HemisphereLight,
} from './three.module.js'



const directional = new DirectionalLight( 0xffffff, 1 )
directional.castShadow = true
directional.shadow.camera.near = 10;
directional.shadow.camera.far = 3200;
// bounds
directional.shadow.camera.left = -500;
directional.shadow.camera.right = 500;
directional.shadow.camera.top = 500;
directional.shadow.camera.bottom = -500;
// resolution
directional.shadow.mapSize.width = 2000;
directional.shadow.mapSize.height = 2000;


const spotlight = new SpotLight( 0xffffff )
spotlight.shadow.mapSize.width = 1024;
spotlight.shadow.mapSize.height = 1024;

spotlight.shadow.camera.near = 10;
spotlight.shadow.camera.far = 4000;
spotlight.shadow.camera.fov = 30;
spotlight.castShadow = true

const hemispherical = new HemisphereLight( 0xffffff, 0xffffff, .7 )
// hemispherical.castShadow = true


const helper = new DirectionalLightHelper( spotlight )



window.LIGHT = {
	directional: directional,
	hemispherical: hemispherical,
	spotlight: spotlight,
	helper: helper
}

export { 
	directional, 
	hemispherical,
	spotlight,
	helper,
}