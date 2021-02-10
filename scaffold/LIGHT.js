import { 
	DirectionalLight, 
	SpotLight,
	DirectionalLightHelper,
	HemisphereLight,
} from './three.module.js'



const directional = new DirectionalLight( 0xffffff, .7 )
directional.castShadow = true
directional.shadowCameraNear = 10;
directional.shadowCameraFar = 3200;
// bounds
directional.shadowCameraLeft = -500;
directional.shadowCameraRight = 500;
directional.shadowCameraTop = 500;
directional.shadowCameraBottom = -500;
// resolution
directional.shadowMapWidth = 2000;
directional.shadowMapHeight = 2000;


const spotlight = new SpotLight( 0xffffff )


const hemispherical = new HemisphereLight( 0xffffff, 0xffffff, .7 )


const helper = new DirectionalLightHelper( directional )



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