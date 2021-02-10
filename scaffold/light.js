import { 
	DirectionalLight, 
	SpotLight,
	DirectionalLightHelper,
	HemisphereLight,
} from './three.module.js'



const directional = new DirectionalLight( 0xffffff, .7 )
const spotlight = new SpotLight( 0xffffff )
const hemispherical = new HemisphereLight( 0xffffff, 0xffffff, .7 )
const helper = new DirectionalLightHelper( directional )



window.light = {
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