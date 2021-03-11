import SCENE from '../scaffold/SCENE.js'

import {
	BoxBufferGeometry,
	MeshLambertMaterial,
	Mesh,
	Vector3,
} from '../node_modules/three/build/three.module.js'


const generate_maze = ( x, y ) => { // this will eventually be server-side
	let tiles = []
	for( let ix = 0; ix < x; ix++ ){
		tiles[ ix ] = []
		for( let iy = 0; iy < y; iy++ ){
			tiles[ix][iy] = Math.random() > .5
		}
	}
	return tiles
}


class Maze {

	constructor( cell_dimension, cell_width,  ){
		this.cell_dimension = cell_dimension || 10
		this.cell_width = cell_width || 10		
		this.geo = new BoxBufferGeometry( 
			this.cell_width, 
			this.cell_width, 
			this.cell_width 
		)
		this.mat = new MeshLambertMaterial({
			// color: 'blue',
			transparent: true,
			opacity: .5,
			// depthWrite: false, // ??
		})
		this.offset = ( this.cell_dimension * this.cell_width ) / 2
		this.origin_offset = new Vector3( -this.offset, 0, -this.offset )
	}

	fill_tiles(){
		this.tiles = generate_maze( 
			this.cell_dimension, 
			this.cell_dimension 
		)
	}

	render_tiles(){

		let tile
		const maze = this
		for( let x = 0; x < this.tiles.length; x++ ){
			for( let z = 0; z < this.tiles[x].length; z++ ){
				tile = new Tile({
					filled:  maze.tiles[x][z],
					geo: maze.geo,
					mat: maze.mat,
					cell_width: maze.cell_width,
					origin_offset: maze.origin_offset,
					x: x,
					z: z,
				})
				tile.render()				
			}

		}
	}

}




class Tile {

	constructor( init ){
		init = init || {}
		this.filled = init.filled
		this.geo = init.geo
		this.mat = init.mat
		this.cell_width = init.cell_width
		this.origin_offset = init.origin_offset

		this.x = init.x
		this.z = init.z
		this.y = 0
	}

	render(){

		if( this.filled ){
			this.mesh = new Mesh( this.geo, this.mat )			
			this.mesh.position.set(
				( this.x * this.cell_width ) + this.origin_offset.x + ( this.cell_width / 2 ),
				this.y + ( this.cell_width / 2 ),
				( this.z * this.cell_width ) + this.origin_offset.z + ( this.cell_width / 2 ),
			)
			SCENE.add( this.mesh )
		}else{
			//
		}

	}

}


export {
	Maze,
}