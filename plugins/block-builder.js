

// ________________________ copied out of custom.js, not yet modularized ________________________

const cubes = window.cubes = []


const state = {
	pending_cube: false,
}

const track_icon = document.createElement('div')
track_icon.classList.add('button', 'tracker')
document.body.appendChild( track_icon )

const track_add_cube = e => {
	track_icon.style.left = e.clientX + 'px'
	track_icon.style.top = e.clientY + 'px'
}

const addCube = () => {

	if( state.pending_cube ) return true

	const dimensions = { x: 5, y: 5, z: 5 }

	const cubeMesh = new THREE.Mesh(
	    new THREE.BoxBufferGeometry( dimensions.x, dimensions.y, dimensions.z ),
	    new THREE.MeshLambertMaterial({
	        color: 0x2255ff,
	    })
	);
	cubeMesh.castShadow = true;
	cubeMesh.position.y = 5;
	cubeMesh.userData.dimensions = dimensions
	cubes.push( cubeMesh )

	state.pending_cube = cubeMesh

	document.addEventListener('mousemove', track_add_cube )
	track_icon.style.display = 'initial'

}



const add_cube = document.createElement('div')
add_cube.classList.add('button')
add_cube.style.top = '0px'
add_cube.innerText = 'add cube'
add_cube.addEventListener('click', addCube )
document.body.appendChild( add_cube )






const handle_clicked = e => {

	const intersect = RENDERER.get_clicked( e, false )

	if( intersect && state.pending_cube ){
		// state.pending_cube = intersect.object
		SCENE.add( state.pending_cube )
		state.pending_cube.position.copy( intersect.point )
		state.pending_cube.position.y += ( state.pending_cube.userData.dimensions.y / 2 ) + .01 // ( so shadow is above )
		delete state.pending_cube
	}else{
		delete state.pending_cube
	}

	document.removeEventListener('mousemove', track_add_cube )
	track_icon.style.display = 'none'

}


window.addEventListener('pointerdown', handle_clicked, false )