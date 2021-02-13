import {
    analyzeImageDataColors,
    flipImageData,
    imageToImageData,
    copyImageData,
    concatHorizImageData,
    imageDataToCanvas,
    concatVertImageData
} from './image_parser.js';

import * as THREE from '../node_modules/three/build/three.module.js';

export class Voxelizer {
    constructor(options) {
        Object.assign(this, options);
        if(this.side) {
            if(!this.back)this.back = this.side;
            if(!this.top)this.top = this.side;
        }
        this.voxelize();
    }
    voxelize() {
        this.sideData = imageToImageData(this.side);
        this.backData = imageToImageData(this.back);
        this.topData = imageToImageData(this.top);
        this.mesh = voxelizedMesh(
            this.sideData,
            this.topData,
            this.backData
        );
    }
}
export class GridVoxelizer extends Voxelizer {
    constructor(options) {
        super(options);
        this.sideGrid = options.sideGrid;
        this.backGrid = options.backGrid;
        this.topGrid = options.topGrid;
        this.sideIdx = options.sideIdx ?? 0;
        this.backIdx = options.backIdx ?? 0;
        this.topIdx = options.topIdx ?? 0;
        this.voxelize();
    }
    voxelize() {
        this.mesh = voxelizedMesh(
            this.sideGrid[this.sideIdx],
            this.topGrid[this.topIdx],
            this.backGrid[this.backIdx]
        );
    }
}
export class HalfGridVoxelizer extends GridVoxelizer {
    voxelize() {
        this.mesh = voxelizedFromSideAndHalfs(
            this.sideGrid[this.sideIdx],
            this.topGrid[this.topIdx],
            this.backGrid[this.backIdx]
        );
    }
}

export function voxelizedFromSideAndHalfs(sideData, topHalfData, backHalfData) {
    const _topHalfData = copyImageData(topHalfData);
    const _backHalfData = copyImageData(backHalfData);
    const topData = concatVertImageData(
        topHalfData,
        flipImageData(_topHalfData, false, true)
    );

    const backData = concatHorizImageData(
        backHalfData,
        flipImageData(_backHalfData, true, false)
    );

    const previewCanvas = imageDataToCanvas(topData);
    const previewCanvas2 = imageDataToCanvas(backData);
    document.body.appendChild(previewCanvas);
    document.body.appendChild(previewCanvas2);

    return voxelizedMesh(sideData, topData, backData);

}

export function voxelizedMesh(sideData, topData, backData) {

    const frameGroup = new THREE.Group();

    const sheet_data = {};
    const color_data = {};

    sheet_data.side = sideData;
    color_data.side = analyzeImageDataColors(sheet_data.side);

    sheet_data.top = topData;
    color_data.top = analyzeImageDataColors(sheet_data.top);

    sheet_data.back = backData;
    color_data.back = analyzeImageDataColors(sheet_data.back);

    const edge_data = analyzeVoxelData(color_data, sheet_data);
    console.log('edge_data === ', JSON.stringify(edge_data));
    const geometry = new THREE.BoxGeometry(1, 1, 1);

    for (let z = 0; z < sheet_data.top.height; z++) {
        for (let x = 0; x < sheet_data.side.width; x++) {
            const topColorIdx = color_data.top.colorMap[`${x}_${z}`];
            // const topColor = color_data.top.colors[topColorIdx];
            for (let y = 0; y < sheet_data.side.height; y++) {
                const sideColorIdx = color_data.side.colorMap[`${x}_${y}`];
                const backColorIdx = color_data.back.colorMap[`${z}_${y}`];
                // const frontColorIdx = color_data.front.colorMap[`${z}_${y}`];
                const sideColor = color_data.side.colors[sideColorIdx];
                // const backColor = color_data.back.colors[backColorIdx];
                // const frontColor = color_data.front.colors[frontColorIdx];
                if (
                    typeof topColorIdx !== "undefined" &&
                    typeof sideColorIdx !== "undefined" &&
                    typeof backColorIdx !== "undefined"
                ) {
                    if (edge_data.all[`${x}_${y}_${z}`]) {
                        const material = new THREE.MeshLambertMaterial({
                            color: _getIdealColor(x, y, z)
                        });
                        const cube = new THREE.Mesh(geometry, material);
                        cube.castShadow = true;
                        cube.receiveShadow = true;
                        cube.position.x = x;
                        cube.position.y = sheet_data.side.height - y;
                        cube.position.z = z;
                        frameGroup.add(cube);
                    }
                }

                function _getIdealColor(x, y, z) {
                    let color = sideColor;
                    // TODO = more sophisticated color selection
                    return color;
                }
            }
        }
    }

    frameGroup.position.x = -sheet_data.side.width / 2;
    frameGroup.position.y = -sheet_data.side.height / 2;
    frameGroup.position.z = -sheet_data.top.height / 2;

    return frameGroup;

}

export function analyzeVoxelData(color_data, sheet_data) {
    const edge_data = {
        all: {},
        corner: {},
        front: {},
        back: {},
        top: {},
        bottom: {},
        left: {},
        right: {}
    };
    Object.keys(color_data.side.colorMap).forEach(xy => {
        const [x, y] = xy.split("_").map(Number);
        for (let z = 0; z < sheet_data.top.height; z++) {

            const bEdge = (x === 0 || color_data.side.transparents[`${x-1}_${y}`] || color_data.top
                .transparents[`${x-1}_${z}`]) && !color_data.side.transparents[`${x}_${y}`];
            const fEdge = (x === sheet_data.side.width - 1 || color_data.side.transparents[`${x+1}_${y}`] ||
                color_data.top.transparents[`${x+1}_${z}`]) && !color_data.side.transparents[
                `${x}_${y}`];
            const lEdge = (z === 0 || color_data.back.transparents[`${z-1}_${y}`] || color_data.top
                .transparents[`${x}_${z-1}`]) && !color_data.back.transparents[`${z}_${y}`];
            const rEdge = (z === sheet_data.back.width - 1 || color_data.back.transparents[`${z+1}_${y}`] ||
                color_data.top.transparents[`${x}_${z+1}`]) && !color_data.back.transparents[
                `${z}_${y}`];

            const topEdge = (
                    y === 0 ||
                    color_data.back.transparents[`${z}_${y-1}`] ||
                    color_data.side.transparents[`${x}_${y-1}`]
                ) &&
                !color_data.back.transparents[`${z}_${y}`];
            const botEdge = (y === sheet_data.back.height - 1 || color_data.back.transparents[
                    `${z}_${y+1}`] || color_data.side.transparents[`${x}_${y+1}`]) && !color_data.back
                .transparents[`${z}_${y}`];
            const truthArr = [
                (bEdge || fEdge),
                (lEdge || rEdge),
                (topEdge || botEdge)
            ].filter(n => n);
            if (truthArr.length > 1) {
                edge_data.corner[`${x}_${y}_${z}`] = 1; //TODO - return color array here?
            } else {
                if (bEdge) edge_data.back[`${x}_${y}_${z}`] = 1;
                if (fEdge) edge_data.front[`${x}_${y}_${z}`] = 1;
                if (lEdge) edge_data.left[`${x}_${y}_${z}`] = 1;
                if (rEdge) edge_data.right[`${x}_${y}_${z}`] = 1;
                if (topEdge) edge_data.top[`${x}_${y}_${z}`] = 1;
                if (botEdge) edge_data.bottom[`${x}_${y}_${z}`] = 1;
            }
            if (truthArr.length > 0) edge_data.all[`${x}_${y}_${z}`] = 1;
        }
    });
    console.log('color_data === ', color_data);
    return edge_data;
}

export function exportGLTF(input) {
    const gltfExporter = new THREE.GLTFExporter();
    const options = {
        trs: true, //document.getElementById( 'option_trs' ).checked,
        onlyVisible: true, //document.getElementById( 'option_visible' ).checked,
        truncateDrawRange: true, //document.getElementById( 'option_drawrange' ).checked,
        binary: true, //document.getElementById( 'option_binary' ).checked,
        forcePowerOfTwoTextures: true, //document.getElementById( 'option_forcepot' ).checked,
        maxTextureSize: Infinity, //Number( document.getElementById( 'option_maxsize' ).value ) || Infinity // To prevent NaN value
    };
    const link = document.createElement('a');
    link.style.display = 'none';
    document.body.appendChild(link);
    gltfExporter.parse(input, function (result) {
        if (result instanceof ArrayBuffer) {
            saveArrayBuffer(result, 'scene.glb');
        } else {
            const output = JSON.stringify(result, null, 2);
            // console.log(output);
            saveString(output, 'scene.gltf');
        }
    }, options);

    function save(blob, filename) {
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    }

    function saveString(text, filename) {
        save(new Blob([text], {
            type: 'text/plain'
        }), filename);
    }

    function saveArrayBuffer(buffer, filename) {
        save(new Blob([buffer], {
            type: 'application/octet-stream'
        }), filename);
    }
}