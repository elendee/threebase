export function load_image(url, callback) {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
        callback(img);
    }
    img.src = url;
}

export function parse_image(img, options = {
    format: "rgb"
}) {
    const locationColors = {};
    const colorCounts = {};
    const {
        canvas,
        ctx
    } = image_to_canvas(img);
    if (options.ctxOnly) {
        return ctx;
    }
    const data = ctx.getImageData(0, 0, img.width, img.height).data;
    if (options.dataOnly) {
        return {
            width: canvas.width,
            height: canvas.height,
            data
        };
    }
    for (var x = 0; x < canvas.width; x++) {
        for (var y = 0; y < canvas.height; y++) {
            if (!locationColors[x]) {
                locationColors[x] = {};
            }
            const i = (x + y * canvas.width) * 4;
            let colorKey;
            if (options.format === "rgb") {
                colorKey = rgbToHex(
                    data[i],
                    data[i + 1],
                    data[i + 2]
                );
                locationColors[x][y] = colorKey;
            } else {
                locationColors[x][y] = {
                    r: data[i],
                    g: data[i + 1],
                    b: data[i + 2],
                    a: data[i + 3]
                };
                colorKey = `${
                    locationColors[x][y].r
                }_${
                    locationColors[x][y].g
                }_${
                    locationColors[x][y].b
                }_${
                    locationColors[x][y].a
                }`;
            }
            if (!colorCounts[colorKey]) colorCounts[colorKey] = 0;
            colorCounts[colorKey]++;
        }
    }
    return {
        locationColors,
        colorCounts,
        width: canvas.width,
        height: canvas.height,
        data
    };

    function rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }
}

export function image_to_canvas(img) { // deprecated... dont use this...
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    return {
        canvas,
        ctx
    };
}

export function imageToCanvas(img) {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    return canvas;
}

export function imageToCanvasCtx(img) {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    return ctx;
}

export function imageToImageData(img) {
    const canvas = imageToCanvas(img);
    const ctx = canvas.getContext("2d");
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

export function analyzeImageDataColors(imageData) {
    const ret = {
        colors: [],
        transparents: {},
        colorMap: {},
    };
    for (let x = 0; x < imageData.width; x++) {
        for (let y = 0; y < imageData.height; y++) {
            const i = (x + y * imageData.width) * 4;
            if (imageData.data[i + 3] !== 0) {
                const r = imageData.data[i];
                const g = imageData.data[i + 1];
                const b = imageData.data[i + 2];
                const color = `rgb(${r},${g},${b})`;
                let colorIdx = ret.colors.indexOf(color);
                if (colorIdx === -1) {
                    colorIdx = ret.colors.length;
                    ret.colors.push(color);
                }
                ret.colorMap[`${x}_${y}`] = colorIdx;
            } else {
                ret.transparents[`${x}_${y}`] = 1;
            }
        }
    }
    return ret;
}

export function getImageDataTilemap(imageData, colorArr) {
    if (!colorArr) {
        colorArr = Object.keys(countImageDataColors(imageData)).map(n => {
            return n.replace("rgba(", "").split(",").slice(0, -1).join(":");
        });
    }
    // console.log('colorArr === ',colorArr);
    const ret = [];
    const w = imageData.width;
    const h = imageData.height;
    for (let y = 0; y < h; y++) {
        const row = [];
        for (let x = 0; x < w; x++) {
            const i = (x + y * w) * 4;
            const r = imageData.data[i];
            const g = imageData.data[i + 1];
            const b = imageData.data[i + 2];
            const a = imageData.data[i + 3];
            let id = 0;
            if (a > 0) {
                const idx = colorArr.indexOf(`${r}:${g}:${b}`);
                // console.log('idx === ', idx);
                id = idx + 1;
            }
            row.push(id);
        }
        ret.push(row);
    }
    return ret;
}

export function getImageDataGrid(img, cw = 32, ch = 32, xo = 0, yo = 0, accessor) {
    const ret = {};
    const {
        canvas,
        ctx
    } = image_to_canvas(img);
    const imageData = ctx.getImageData(0, 0, img.width, img.height);
    const w = imageData.width;
    const h = imageData.height;
    let _x = 0;
    let _y = 0;
    for (let x = xo; x < w; x += cw) {
        for (let y = yo; y < h; y += ch) {
            const _imageData = ctx.getImageData(x, y, cw, ch);
            if (accessor) {
                accessor(_imageData);
            }
            ret[`${_x}_${_y}`] = _imageData;
            _y++;
        }
        _x++;
        _y = 0;
    }
    return ret;
}
export function getLinearImageDataGrid(img, cw = 32, ch = 32, xo = 0, yo = 0, accessor) {
    const ret = [];
    const {
        canvas,
        ctx
    } = image_to_canvas(img);
    const imageData = ctx.getImageData(0, 0, img.width, img.height);
    const w = imageData.width;
    const h = imageData.height;
    for (let y = yo; y < h; y += ch) {
        for (let x = xo; x < w; x += cw) {
            const _imageData = ctx.getImageData(x, y, cw, ch);
            if (accessor) {
                accessor(_imageData);
            }
            ret.push(_imageData);
        }
    }
    return ret;
}

export function flipImageData(imageData, horiz = false, vert = false) {
    const w = imageData.width;
    const h = imageData.height;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const flippedImageData = ctx.createImageData(w, h);
    for (let x = 0; x < w; x++) {
        for (let y = 0; y < h; y++) {
            const i = _i(x, y);
            const i2 = _i(
                horiz ? w - x - 1 : x,
                vert ? h - y - 1 : y,
            );
            flippedImageData.data[i2] = imageData.data[i];
            flippedImageData.data[i2 + 1] = imageData.data[i + 1];
            flippedImageData.data[i2 + 2] = imageData.data[i + 2];
            flippedImageData.data[i2 + 3] = imageData.data[i + 3];
        }
    }
    return flippedImageData;

    function _i(x, y) {
        return (x + y * imageData.width) * 4;
    }
}

export function rotateImageData(imageData, radians) {
    const w = imageData.width;
    const h = imageData.height;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext('2d');
    const flippedImageData = ctx.createImageData(w, h);

    for (let x = 0; x < w; x++) {
        for (let y = 0; y < h; y++) {
            const i = _i(x, y);
            const i2 = _i(
                (x * Math.cos(radians)) - (y * Math.sin(radians)),
                (x * Math.sin(radians)) - (y * Math.cos(radians)),
            );
            flippedImageData.data[i2] = imageData.data[i];
            flippedImageData.data[i2 + 1] = imageData.data[i + 1];
            flippedImageData.data[i2 + 2] = imageData.data[i + 2];
            flippedImageData.data[i2 + 3] = imageData.data[i + 3];
        }
    }
    return flippedImageData;

    function _i(x, y) {
        return (x + y * imageData.width) * 4;
    }
}

export function countImageDataColors(imageData) {
    const w = imageData.width;
    const h = imageData.height;
    const colorCounts = {};
    for (let x = 0; x < w; x++) {
        for (let y = 0; y < h; y++) {
            const i = (x + y * w) * 4;
            const r = imageData.data[i];
            const g = imageData.data[i + 1];
            const b = imageData.data[i + 2];
            const a = imageData.data[i + 3];
            const key = `rgba(${r},${g},${b},${a})`;
            if (!colorCounts[key]) colorCounts[key] = 0;
            colorCounts[key]++;
        }
    }
    return colorCounts;
}

export function replaceImageDataColor(imageData, rgba, rgba2) {
    const w = imageData.width;
    const h = imageData.height;
    for (let x = 0; x < w; x++) {
        for (let y = 0; y < h; y++) {
            const i = (x + y * w) * 4;
            const r = rgba.r === imageData.data[i];
            const g = rgba.g === imageData.data[i + 1];
            const b = rgba.b === imageData.data[i + 2];
            const a = rgba.a === imageData.data[i + 3];
            if (r && g && b && a) {
                imageData.data[i] = rgba2.r;
                imageData.data[i + 1] = rgba2.g;
                imageData.data[i + 2] = rgba2.b;
                imageData.data[i + 3] = rgba2.a;
            }
        }
    }
}

export function removeImageDataColor(imageData, rgba) {
    replaceImageDataColor(imageData, rgba, {
        r: 0,
        g: 0,
        b: 0,
        a: 0
    });
}

export function whiteListImageDataColors(imageData, rgbaArr) {
    const w = imageData.width;
    const h = imageData.height;
    for (let x = 0; x < w; x++) {
        for (let y = 0; y < h; y++) {
            const i = (x + y * w) * 4;
            let remove = true;
            rgbaArr.forEach(rgba => {
                const r = rgba.r === imageData.data[i];
                const g = rgba.g === imageData.data[i + 1];
                const b = rgba.b === imageData.data[i + 2];
                const a = rgba.a === imageData.data[i + 3];
                if (r && g && b && a) {
                    imageData.data[i] = rgba2.r;
                    imageData.data[i + 1] = rgba2.g;
                    imageData.data[i + 2] = rgba2.b;
                    imageData.data[i + 3] = rgba2.a;
                    remove = false;
                }
            });
            if (remove) {
                imageData.data[i] = 0;
                imageData.data[i + 1] = 0;
                imageData.data[i + 2] = 0;
                imageData.data[i + 3] = 0;
            }
        }
    }
}

export function fullAlphaImageData(imageData) {
    const w = imageData.width;
    const h = imageData.height;
    for (let x = 0; x < w; x++) {
        for (let y = 0; y < h; y++) {
            const i = (x + y * w) * 4;
            if (imageData.data[i + 3] > 0) {
                imageData.data[i + 3] = 255;
            }
        }
    }
    return imageData;
}

export function filterAlphaImageData(imageData, filter) {
    const w = imageData.width;
    const h = imageData.height;
    for (let x = 0; x < w; x++) {
        for (let y = 0; y < h; y++) {
            const i = (x + y * w) * 4;
            if (filter(imageData.data[i + 3])) {
                imageData.data[i + 3] = 255;
            } else {
                imageData.data[i + 3] = 0;
            }
        }
    }
    return imageData;
}

export function getPixelsFromImageData(imageData, rgba) {
    const w = imageData.width;
    const h = imageData.height;
    const points = [];
    for (let x = 0; x < w; x++) {
        for (let y = 0; y < h; y++) {
            const i = (x + y * w) * 4;
            const r = rgba.r === imageData.data[i];
            const g = rgba.g === imageData.data[i + 1];
            const b = rgba.b === imageData.data[i + 2];
            const a = !rgba.a || rgba.a === imageData.data[i + 3];
            if (r && g && b && a) {
                points.push([x, y]);
            }
        }
    }
    return points;
}

export function fillTransparentNeighbors(imageData, ignoreRGBAArr, fillRGBA) {
    const w = imageData.width;
    const h = imageData.height;
    const cache = {};
    const filledCache = {};
    for (let x = 0; x < w; x++) {
        if (!filledCache[x]) filledCache[x] = {};
        for (let y = 0; y < h; y++) {
            const i = (x + y * w) * 4;
            // console.log('ignore(i), x, y === ',ignore(i), x, y);
            if (imageData.data[i + 3] > 0 && !ignore(i) && !filledCache[x][y]) {
                maybeFillNeighbor(x, y - 1); //n
                maybeFillNeighbor(x, y + 1); //s
                maybeFillNeighbor(x + 1, y); //e
                maybeFillNeighbor(x - 1, y); //w
            }
        }
    }

    function maybeFillNeighbor(x, y) {
        const _i = (x + y * w) * 4;
        if (!cache[x]) cache[x] = {};
        if (!cache[x][y]) {
            cache[x][y] = {
                r: imageData.data[_i],
                g: imageData.data[_i + 1],
                b: imageData.data[_i + 2],
                a: imageData.data[_i + 3]
            }
        }
        if (cache[x][y].a === 0) {
            if (!filledCache[x]) filledCache[x] = {};
            filledCache[x][y] = 1;
            cache[x][y].r = imageData.data[_i] = fillRGBA.r;
            cache[x][y].g = imageData.data[_i + 1] = fillRGBA.g;
            cache[x][y].b = imageData.data[_i + 2] = fillRGBA.b;
            cache[x][y].a = imageData.data[_i + 3] = fillRGBA.a;
        }
    }

    function ignore(_i) {
        let count = 0;
        ignoreRGBAArr.forEach(rgba => {
            if (rgba.r === imageData.data[_i] &&
                rgba.g === imageData.data[_i + 1] &&
                rgba.b === imageData.data[_i + 2] &&
                rgba.a === imageData.data[_i + 3]) {
                // console.log(`${rgba.r} === ${imageData.data[_i]}
                // || ${rgba.g} === ${imageData.data[_i + 1]}
                // || ${rgba.b} === ${imageData.data[_i + 2]}
                // || ${rgba.a} === ${imageData.data[_i + 3]}`);
                count++;
            }
        });
        return count > 0;
    }
}

export function fullOutlineImageData(imageData, ignoreRGBAArr, fillRGBA) {
    const w = imageData.width;
    const h = imageData.height;
    const cache = {};
    const filledCache = {};
    for (let x = 0; x < w; x++) {
        if (!filledCache[x]) filledCache[x] = {};
        for (let y = 0; y < h; y++) {
            const i = (x + y * w) * 4;
            // console.log('ignore(i), x, y === ',ignore(i), x, y);
            if (imageData.data[i + 3] > 0 && !ignore(i) && !filledCache[x][y]) {
                maybeFillNeighbor(x, y - 1); //n
                maybeFillNeighbor(x, y + 1); //s
                maybeFillNeighbor(x + 1, y); //e
                maybeFillNeighbor(x - 1, y); //w
                maybeFillNeighbor(x - 1, y - 1); //nw
                maybeFillNeighbor(x + 1, y - 1); //ne
                maybeFillNeighbor(x - 1, y + 1); //sw
                maybeFillNeighbor(x + 1, y + 1); //se
            }
        }
    }

    function maybeFillNeighbor(x, y) {
        const _i = (x + y * w) * 4;
        if (!cache[x]) cache[x] = {};
        if (!cache[x][y]) {
            cache[x][y] = {
                r: imageData.data[_i],
                g: imageData.data[_i + 1],
                b: imageData.data[_i + 2],
                a: imageData.data[_i + 3]
            }
        }
        if (cache[x][y].a === 0) {
            if (!filledCache[x]) filledCache[x] = {};
            filledCache[x][y] = 1;
            cache[x][y].r = imageData.data[_i] = fillRGBA.r;
            cache[x][y].g = imageData.data[_i + 1] = fillRGBA.g;
            cache[x][y].b = imageData.data[_i + 2] = fillRGBA.b;
            cache[x][y].a = imageData.data[_i + 3] = fillRGBA.a;
        }
    }

    function ignore(_i) {
        let count = 0;
        ignoreRGBAArr.forEach(rgba => {
            if (rgba.r === imageData.data[_i] &&
                rgba.g === imageData.data[_i + 1] &&
                rgba.b === imageData.data[_i + 2] &&
                rgba.a === imageData.data[_i + 3]) {
                // console.log(`${rgba.r} === ${imageData.data[_i]}
                // || ${rgba.g} === ${imageData.data[_i + 1]}
                // || ${rgba.b} === ${imageData.data[_i + 2]}
                // || ${rgba.a} === ${imageData.data[_i + 3]}`);
                count++;
            }
        });
        return count > 0;
    }
}

export function rotateImageDataCounterClockwise(imageData) {
    const w = imageData.width;
    const h = imageData.height;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext('2d');
    const flippedImageData = ctx.createImageData(w, h);
    for (let x = 0; x < w; x++) {
        for (let y = 0; y < h; y++) {
            const i = _i(x, y);
            const x2 = y;
            const y2 = h - x - 1;
            const i2 = _i(
                x2,
                y2
            );
            flippedImageData.data[i2] = imageData.data[i];
            flippedImageData.data[i2 + 1] = imageData.data[i + 1];
            flippedImageData.data[i2 + 2] = imageData.data[i + 2];
            flippedImageData.data[i2 + 3] = imageData.data[i + 3];
        }
    }
    return flippedImageData;
    // return flipImageData(flippedImageData, true);

    function _i(x, y) {
        return (x + y * imageData.width) * 4;
    }
}

export function copyImageData(imageData) {
    const canvas = document.createElement('canvas');
    const w = canvas.width = imageData.width;
    const h = canvas.height = imageData.height;
    const ctx = canvas.getContext('2d');
    const imageData2 = ctx.createImageData(w, h);
    for (let x = 0; x < w; x++) {
        for (let y = 0; y < h; y++) {
            const i = (x + y * imageData.width) * 4;
            if (imageData.data[i + 3] > 0) {
                imageData2.data[i] = imageData.data[i];
                imageData2.data[i + 1] = imageData.data[i + 1];
                imageData2.data[i + 2] = imageData.data[i + 2];
                imageData2.data[i + 3] = imageData.data[i + 3];
            }
        }
    }
    return imageData2;
}

export function cropImageData(imageData, xo, yo, w, h) {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    const imageData2 = ctx.createImageData(w, h);
    for (let x = xo; x < w + xo; x++) {
        for (let y = yo; y < h + yo; y++) {
            const i = (x + y * imageData.width) * 4;
            const i2 = ((x - xo) + (y - yo) * w) * 4;
            if (imageData.data[i + 3] > 0) {
                imageData2.data[i2] = imageData.data[i];
                imageData2.data[i2 + 1] = imageData.data[i + 1];
                imageData2.data[i2 + 2] = imageData.data[i + 2];
                imageData2.data[i2 + 3] = imageData.data[i + 3];
            }
        }
    }
    return imageData2;
}

export function cropImageToCanvas(image, xo, yo, w, h) {
    const ctx = imageToCanvasCtx(image);
    const imageData = ctx.getImageData(0, 0, image.width, image.height);
    const canvas2 = document.createElement('canvas');
    canvas2.width = w;
    canvas2.height = h;
    const ctx2 = canvas2.getContext('2d');
    const imageData2 = ctx2.createImageData(w, h);
    for (let x = xo; x < w + xo; x++) {
        for (let y = yo; y < h + yo; y++) {
            const i = (x + y * imageData.width) * 4;
            const i2 = ((x - xo) + (y - yo) * w) * 4;
            if (imageData.data[i + 3] > 0) {
                imageData2.data[i2] = imageData.data[i];
                imageData2.data[i2 + 1] = imageData.data[i + 1];
                imageData2.data[i2 + 2] = imageData.data[i + 2];
                imageData2.data[i2 + 3] = imageData.data[i + 3];
            }
        }
    }
    ctx2.putImageData(imageData2, 0, 0);
    return canvas2;
}

export function createImageData(width, height, colors = {}) {
    const canvas = document.createElement('canvas');
    const w = canvas.width = width;
    const h = canvas.height = height;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(w, h);
    Object.keys(colors).forEach(color => {
        const [r, g, b, a] = color.split("_").map(n => Number(n));
        const points = colors[color];
        points.forEach(point => {
            const [x, y] = point;
            const i = (x + y * w) * 4;
            imageData.data[i] = r;
            imageData.data[i + 1] = g;
            imageData.data[i + 2] = b;
            imageData.data[i + 3] = a === undefined ? 255 : a;
        })
    })
    return imageData;
}

export function maskImageData(imageData, imageData2, xo, yo) {
    const w = imageData.width;
    const h = imageData.height;
    for (let x = 0; x < w; x++) {
        for (let y = 0; y < h; y++) {
            const i = (x + y * imageData.width) * 4;
            const x2 = x - xo;
            const y2 = y - yo;
            const i2 = (x2 + y2 * imageData2.width) * 4;
            const visible = imageData.data[i + 3] && imageData.data[i + 3] > 0;
            const visible2 = imageData2.data[i2 + 3] && imageData2.data[i2 + 3] > 0;
            if (visible && visible2) {
                imageData.data[i] = imageData2.data[i2];
                imageData.data[i + 1] = imageData2.data[i2 + 1];
                imageData.data[i + 2] = imageData2.data[i2 + 2];
                imageData.data[i + 3] = imageData2.data[i2 + 3];
            }
        }
    }
}

export function concatHorizImageData(imageData1, imageData2) {
    const imageData = createImageData(imageData1.width + imageData2.width, imageData1.height);
    mergeImageData(imageData, imageData1);
    mergeImageData(imageData, imageData2, imageData1.width);
    return imageData;
}
export function concatVertImageData(imageData1, imageData2) {
    const imageData = createImageData(imageData1.width, imageData1.height + imageData2.height);
    mergeImageData(imageData, imageData1);
    mergeImageData(imageData, imageData2, 0, imageData1.height);
    return imageData;
}
export function mergeImageData(imageData, imageData2, xo = 0, yo = 0) {
    const w = imageData2.width;
    const h = imageData2.height;
    for (let x = 0; x < w; x++) {
        for (let y = 0; y < h; y++) {
            const i = (x + y * imageData2.width) * 4;
            const x0 = x + xo;
            const y0 = y + yo;
            const i0 = (x0 + y0 * imageData.width) * 4;
            if (imageData2.data[i + 3] > 0 && x0 >= 0 && y0 >= 0 && x0 < imageData.width && y0 < imageData.height) {
                imageData.data[i0] = imageData2.data[i];
                imageData.data[i0 + 1] = imageData2.data[i + 1];
                imageData.data[i0 + 2] = imageData2.data[i + 2];
                imageData.data[i0 + 3] = imageData2.data[i + 3];
            }
        }
    }
    return imageData;
}

export function mixImageData(imageData, imageData2, xo = 0, yo = 0) {
    // merge and average
    const w = imageData2.width;
    const h = imageData2.height;
    for (let x = 0; x < w; x++) {
        for (let y = 0; y < h; y++) {
            const i = (x + y * imageData2.width) * 4;
            const x0 = x + xo;
            const y0 = y + yo;
            const i0 = (x0 + y0 * imageData.width) * 4;
            if (imageData2.data[i + 3] > 0 && x0 >= 0 && y0 >= 0 && x0 < imageData.width && y0 < imageData.height) {
                if (imageData.data[i0 + 3]) {
                    imageData.data[i0] = Math.ceil((imageData.data[i0] + imageData2.data[i]) / 2);
                    imageData.data[i0 + 1] = Math.ceil((imageData.data[i0 + 1] + imageData2.data[i + 1]) / 2);
                    imageData.data[i0 + 2] = Math.ceil((imageData.data[i0 + 2] + imageData2.data[i + 2]) / 2);
                    imageData.data[i0 + 3] = Math.ceil((imageData.data[i0 + 3] + imageData2.data[i + 3]) / 2);
                } else {
                    imageData.data[i0] = imageData2.data[i];
                    imageData.data[i0 + 1] = imageData2.data[i + 1];
                    imageData.data[i0 + 2] = imageData2.data[i + 2];
                    imageData.data[i0 + 3] = imageData2.data[i + 3];
                }
            }
        }
    }
    return imageData;
}

export function trimImageData(imageData) {
    const b = imageDataBounds(imageData);
    console.log('b === ', b);
    return cropImageData(
        imageData,
        b.minX,
        b.minY,
        b.maxX - b.minX + 1,
        b.maxY - b.minY + 1
    );
}

export function imageDataBounds(imageData) {
    const w = imageData.width;
    const h = imageData.height;
    const ret = {
        minX: Infinity,
        minY: Infinity,
        maxX: -Infinity,
        maxY: -Infinity
    };
    for (let x = 0; x < w; x++) {
        for (let y = 0; y < h; y++) {
            const i = (x + y * imageData.width) * 4;
            if (imageData.data[i + 3] > 0) {
                if (ret.minX > x) ret.minX = x;
                if (ret.maxX < x) ret.maxX = x;
                if (ret.minY > y) ret.minY = y;
                if (ret.maxY < y) ret.maxY = y;
            }
        }
    }
    // if(ret.maxY !== -Infinity) {
    //     for (let x = ret.minX; x <= ret.maxX; x++) {
    //         const y = ret.maxY;
    //         const i = (x + y * imageData.width) * 4;
    //         if(imageData.data[i + 3] > 0) {
    //             if (typeof ret.maxYminX === "undefined") {//TODO - wtf was I doing here??
    //                 ret.maxYminX = x;
    //             }
    //             if (typeof ret.maxYmaxX === "undefined" || ret.maxYmaxX < x) {//TODO - wtf was I doing here??
    //                 ret.maxYmaxX = x;
    //             }
    //         }
    //     }
    // }
    return ret;
}

export function onionImageData(imageData, imageData2, xo, yo, alpha) {
    const w = imageData2.width;
    const h = imageData2.height;
    for (let x = 0; x < w; x++) {
        for (let y = 0; y < h; y++) {
            const i = (x + y * imageData2.width) * 4;
            const x0 = x + xo;
            const y0 = y + yo;
            const i0 = (x0 + y0 * imageData.width) * 4;
            if (imageData2.data[i + 3] > 0) {
                imageData.data[i0] = imageData2.data[i];
                imageData.data[i0 + 1] = imageData2.data[i + 1];
                imageData.data[i0 + 2] = imageData2.data[i + 2];
                imageData.data[i0 + 3] = imageData2.data[i + 3];
            } else if (imageData.data[i0 + 3] > 0) {
                imageData.data[i0 + 3] = alpha;
            }
        }
    }
}

export function partImageData(part, w, h) {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const _part = part.part ? part.part : part;
    const ctx = canvas.getContext('2d');
    ctx.putImageData(
        _part.data,
        (w / 2) - (_part.cw / 2),
        (h / 2) - (_part.ch / 2)
    );
    return ctx.getImageData(0, 0, w, h);
}

export function imageDataToCanvas(imageData, x = 0, y = 0) {
    const canvas = document.createElement('canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext('2d');
    ctx.putImageData(imageData, x, y);
    return canvas;
}

export function shiftImageData(imageData, x = 0, y = 0) {
    const canvas = document.createElement('canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext('2d');
    ctx.putImageData(imageData, x, y);
    return ctx.getImageData(0, 0, imageData.width, imageData.height);
}

export function imageDataToCanvasScaled(imageData, scale, x = 0, y = 0) {
    const canvas = document.createElement('canvas');
    canvas.width = imageData.width * scale;
    canvas.height = imageData.height * scale;
    const ctx = canvas.getContext('2d');
    ctx.putImageData(scaleImageData(imageData, scale), x, y);
    return canvas;
}

export function scaleImageData(imageData, scale) {
    if (scale === 1) return imageData;
    var scaledImageData = document.createElement("canvas").getContext("2d").createImageData(imageData.width * scale, imageData.height * scale);
    for (var row = 0; row < imageData.height; row++) {
        for (var col = 0; col < imageData.width; col++) {
            var sourcePixel = [
                imageData.data[(row * imageData.width + col) * 4 + 0],
                imageData.data[(row * imageData.width + col) * 4 + 1],
                imageData.data[(row * imageData.width + col) * 4 + 2],
                imageData.data[(row * imageData.width + col) * 4 + 3]
            ];
            for (var y = 0; y < scale; y++) {
                var destRow = row * scale + y;
                for (var x = 0; x < scale; x++) {
                    var destCol = col * scale + x;
                    for (var i = 0; i < 4; i++) {
                        scaledImageData.data[(destRow * scaledImageData.width + destCol) * 4 + i] =
                            sourcePixel[i];
                    }
                }
            }
        }
    }
    return scaledImageData;
}

export function transformImageData(imageData, arr) {
    arr.forEach(row => {
        switch (row.type) {
            case "replace":
                replaceImageDataColor(imageData, row.rgba, row.rgba2);
                break;
            case "scale":
                imageData = scaleImageData(imageData, row.scale);
                break;
            case "outline":
                fillTransparentNeighbors(
                    imageData,
                    row.ignore ?? [],
                    row.rgba
                );
                break;
            case "gradient":
                const canvas = document.createElement('canvas');
                const w = canvas.width = imageData.width;
                const h = canvas.height = imageData.height;
                const ctx = canvas.getContext('2d');
                const gradient = ctx.createLinearGradient(0, 0, 0, h);
                row.colors.forEach(n => {
                    gradient.addColorStop(...n);
                });
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, w, h);
                const imageData2 = ctx.getImageData(0, 0, w, h);
                maskImageData(imageData, imageData2, 0, 0);

                break;
            case "full-outline":
                fullOutlineImageData( //TODO - add room for the outline if it doesnt exist
                    imageData,
                    row.ignore ?? [],
                    row.rgba
                );
                break;
        }
    })
    return imageData;
}

export function append_alpha(color, aa) {
    if (color && color[0] === "#" && color.length === 7) {
        return color + aa;
    }
    return color;
}
// function tilemapToTypedTilemap(tileMap, columnCount) {
//     return tileMap.map((arr,x)=>{
//         return arr.map((_,y)=>{
//             return getTileType(x, y);
//         })
//     })
//     function getTileType(x, y) {
//         const type = tileMap[x][y];

//         // LNE
//         /*****//*****/
//         /**6**//*[1]*/
//         /*****//*****/
//         /*****//*****/
//         /**5**//**7**/
//         /*****//*****/
//         // OSW
//         /*****//*****/
//         /**1**//*[1]*/
//         /*****//*****/
//         /*****//*****/
//         /**5**//**1**/
//         /*****//*****/
//         const _LNE = tileMap[x-1] && tileMap[x][y+1] !== type && tileMap[x-1][y] !== type && tileMap[x-1][y+1] !== type;
//         const _LNW = tileMap[x+1] && tileMap[x][y+1] !== type && tileMap[x+1][y] !== type && tileMap[x+1][y+1] !== type;
//         const _LSW = tileMap[x+1] && tileMap[x][y-1] !== type && tileMap[x+1][y] !== type && tileMap[x+1][y-1] !== type;
//         const _LSE = tileMap[x-1] && tileMap[x][y-1] !== type && tileMap[x-1][y] !== type && tileMap[x-1][y-1] !== type;
//         const _ONE = tileMap[x+1] && tileMap[x][y-1] === type && tileMap[x+1][y] === type && tileMap[x+1][y-1] !== type;
//         const _ONW = tileMap[x-1] && tileMap[x][y-1] === type && tileMap[x-1][y] === type && tileMap[x-1][y-1] !== type;
//         const _OSW = tileMap[x-1] && tileMap[x][y+1] === type && tileMap[x-1][y] === type && tileMap[x-1][y+1] !== type;
//         const _OSE = tileMap[x+1] && tileMap[x][y+1] === type && tileMap[x+1][y] === type && tileMap[x+1][y+1] !== type;
//         const _N = tileMap[x][y-1] !== type;
//         const _E = tileMap[x+1] && tileMap[x+1][y] !== type;
//         const _S = tileMap[x][y+1] !== type;
//         const _W = tileMap[x-1] && tileMap[x-1][y] !== type;

//         if(_LNE)return type + (columnCount * 10);
//         if(_LNW)return type + (columnCount * 11);
//         if(_LSE)return type + (columnCount * 4);
//         if(_LSW)return type + (columnCount * 5);
//         if(_ONW)return type + (columnCount * 23);
//         if(_ONE)return type + (columnCount * 25);
//         if(_OSE)return type + (columnCount * 26);
//         if(_OSW)return type + (columnCount * 24);
//         if(_N)return type + (columnCount * 1);
//         if(_S)return type + (columnCount * 9);
//         if(_E)return type + (columnCount * 3);
//         if(_W)return type + (columnCount * 2);
//         return type;
//     }
// }
export function tilemapToTypedTilemap(tileMap, columnCount) {
    return tileMap.map((arr, y) => {
        return arr.map((_, x) => {
            return getTileType(x, y);
        })
    })

    function getTileType(_x, _y) {
        const type = tileMap[_y][_x];
        if (type === 0) return type;

        const no_N = tileMap[_y - 1] && typeof tileMap[_y - 1][_x] !== "undefined" && tileMap[_y - 1][_x] !== type;
        const no_E = typeof tileMap[_y][_x + 1] !== "undefined" && tileMap[_y][_x + 1] !== type;
        const no_S = tileMap[_y + 1] && typeof tileMap[_y + 1][_x] !== "undefined" && tileMap[_y + 1][_x] !== type;
        const no_W = typeof tileMap[_y][_x - 1] !== "undefined" && tileMap[_y][_x - 1] !== type;
        const no_NE = tileMap[_y - 1] && typeof tileMap[_y - 1][_x + 1] !== "undefined" && tileMap[_y - 1][_x + 1] !== type;
        const no_SE = tileMap[_y + 1] && typeof tileMap[_y + 1][_x + 1] !== "undefined" && tileMap[_y + 1][_x + 1] !== type;
        const no_SW = tileMap[_y + 1] && typeof tileMap[_y + 1][_x - 1] !== "undefined" && tileMap[_y + 1][_x - 1] !== type;
        const no_NW = tileMap[_y - 1] && typeof tileMap[_y - 1][_x - 1] !== "undefined" && tileMap[_y - 1][_x - 1] !== type;

        const typeMap = {
            "N_E_S_W": no_N && no_E && no_S && no_W,
            "NE_SE_SW_NW": (no_NE && !no_N && !no_E) && (no_SE && !no_S && !no_E) && (no_SW && !no_S && !no_W) && (no_NW && !no_N && !no_W),
            "N_E_S": no_N && no_E && no_S,
            "N_E_W": no_N && no_E && no_W,
            "N_E_SW": no_N && no_E && (no_SW && !no_S && !no_W),
            "N_S_W": no_N && no_S && no_W,
            "N_W_SE": no_N && no_W && (no_SE && !no_S && !no_E),
            "N_SE_SW": no_N && (no_SE && !no_S && !no_E) && (no_SW && !no_S && !no_W),
            "E_S_W": no_E && no_S && no_W,
            "E_S_NW": no_E && no_S && (no_NW && !no_N && !no_W),
            "E_SW_NW": no_E && (no_SW && !no_S && !no_W) && (no_NW && !no_N && !no_W),
            "S_W_NE": no_S && no_W && (no_NE && !no_N && !no_E),
            "S_NE_NW": no_S && (no_NE && !no_N && !no_E) && (no_NW && !no_N && !no_W),
            "W_NE_SE": no_W && (no_NE && !no_N && !no_E) && (no_SE && !no_S && !no_E),
            "NE_SW_NW": (no_NE && !no_N && !no_E) && (no_SW && !no_S && !no_W) && (no_NW && !no_N && !no_W),
            "NE_SE_SW": (no_NE && !no_N && !no_E) && (no_SE && !no_S && !no_E) && (no_SW && !no_S && !no_W),
            "NE_SE_NW": (no_NE && !no_N && !no_E) && (no_SE && !no_S && !no_E) && (no_NW && !no_N && !no_W),
            "SE_SW_NW": (no_SE && !no_S && !no_E) && (no_SW && !no_S && !no_W) && (no_NW && !no_N && !no_W),
            "N_E": no_N && no_E,
            "N_S": no_N && no_S,
            "N_W": no_N && no_W,
            "N_SE": no_N && (no_SE && !no_S && !no_E),
            "N_SW": no_N && (no_SW && !no_S && !no_W),
            "E_S": no_E && no_S,
            "E_W": no_E && no_W,
            "E_SW": no_E && (no_SW && !no_S && !no_W),
            "E_NW": no_E && (no_NW && !no_N && !no_W),
            "S_W": no_S && no_W,
            "S_NE": no_S && (no_NE && !no_N && !no_E),
            "S_NW": no_S && (no_NW && !no_N && !no_W),
            "W_NE": no_W && (no_NE && !no_N && !no_E),
            "W_SE": no_W && (no_SE && !no_S && !no_E),
            "NE_SE": (no_NE && !no_N && !no_E) && (no_SE && !no_S && !no_E),
            "NE_SW": (no_NE && !no_N && !no_E) && (no_SW && !no_S && !no_W),
            "NE_NW": (no_NE && !no_N && !no_E) && (no_NW && !no_N && !no_W),
            "SE_SW": (no_SE && !no_S && !no_E) && (no_SW && !no_S && !no_W),
            "SE_NW": (no_SE && !no_S && !no_E) && (no_NW && !no_N && !no_W),
            "SW_NW": (no_SW && !no_S && !no_W) && (no_NW && !no_N && !no_W),
            "NE": (no_NE && !no_N && !no_E),
            "SE": (no_SE && !no_S && !no_E),
            "SW": (no_SW && !no_S && !no_W),
            "NW": (no_NW && !no_N && !no_W),
            "N": no_N,
            "E": no_E,
            "S": no_S,
            "W": no_W,
            "SOLID": Math.random() > 0.62,
            "SOLID_ALT": Math.random() > 0.62,
            "SOLID_ALT2": Math.random() > 0.62,
            "SOLID_ALT3": true,
        };
        let idx = 0;
        const typeMapKeys = Object.keys(typeMap);
        for(const k of typeMapKeys){
            if(typeMap[k]) {
                break;
            }
            idx++;
        }
        const ret = type + (columnCount * idx);
        // console.log('_x, _y, ret === ',_x, _y, ret);
        // if(_x === 9 && _y === 8){
        //     debugger;
        // }
        return ret;
    }
}

export function testingTileTypes() {
    // const a = [
        //     "N_E_S_W",
        //     "NE_SE_SW_NW",
        //     "N_E_S",
        //     "N_E_W",
        //     "N_E_SW",
        //     "N_S_W",
        //     "N_W_SE",
        //     "N_SE_SW",
        //     "E_S_W",
        //     "E_S_NW",
        //     "E_SW_NW",
        //     "S_W_NE",
        //     "S_NE_NW",
        //     "W_NE_SE",
        //     "NE_SW_NW",
        //     "NE_SE_SW",
        //     "NE_SE_NW",
        //     "SE_SW_NW",
        //     "N_E",
        //     "N_S",
        //     "N_W",
        //     "N_SE",
        //     "N_SW",
        //     "E_S",
        //     "E_W",
        //     "E_SW",
        //     "E_NW",
        //     "S_W",
        //     "S_NE",
        //     "S_NW",
        //     "W_NE",
        //     "W_SE",
        //     "NE_SE",
        //     "NE_SW",
        //     "NE_NW",
        //     "SE_SW",
        //     "SE_NW",
        //     "SW_NW",
        //     "NE",
        //     "SE",
        //     "SW",
        //     "NW",
        //     "N",
        //     "E",
        //     "S",
        //     "W",
        // ];

        var b = ['{'];
        var c = {};
        a.forEach(n=>{
            const arr = n.split("_");
            if(c[n]){
                console.error(n + "already exists");
            }
            c[n] = 1;
            b.push(`"${n}": ${
                arr.map(str=>{
                    if(str.length === 2) { // NE, SE, SW, NW
                        const [_a, _b] = str.split("");
                        return `(no_${str} && !no_${_a} && !no_${_b})`;
                    } else {
                        return `no_${str}`;
                    }
                }).join(" && ")
            },`);
        });
        b.push('}');
        console.log(b.join("\n"));

        function calcNeighbors() {
            const [_n, _e, _s, _w, _ne, _se, _sw, _nw] = [...Array(8)].map(() => [0, 1]);
            let count = 0;
    
            _n.forEach(n => {
                _e.forEach(e => {
                    _s.forEach(s => {
                        _w.forEach(w => {
                            _ne.forEach(ne => {
                                _se.forEach(se => {
                                    _sw.forEach(sw => {
                                        _nw.forEach(nw => {
                                            if (n && e) count++;
                                        })
                                    })
                                })
                            })
                            _se.forEach(se => {
                                _sw.forEach(sw => {
                                    _nw.forEach(nw => {
                                        if (s && e) count++;
                                    })
                                })
                            })
                            _sw.forEach(sw => {
                                _nw.forEach(nw => {
                                    if (s && w) count++;
                                })
                            })
                            _nw.forEach(nw => {
                                if (n && w) count++;
                            })
                        })
                    })
                })
            })
            console.log('count === ', count);
        }
}

export function fragmentsToTilesetCanvas(tileSize, fragmentsImage) {

    const xo = tileSize;

    const fragMap = {
        "N_E_S_W": [],
        "NE_SE_SW_NW": [],
        "N_E_S": [],
        "N_E_W": [], // no_N && no_E && no_W,
        "N_E_SW": [], // no_N && no_E && (no_SW && !no_S && !no_W),
        "N_S_W": [], // no_N && no_S && no_W,
        "N_W_SE": [], // no_N && no_W && (no_SE && !no_S && !no_E),
        "N_SE_SW": [], // no_N && (no_SE && !no_S && !no_E) && (no_SW && !no_S && !no_W),
        "E_S_W": [], // no_E && no_S && no_W,
        "E_S_NW": [], // no_E && no_S && (no_NW && !no_N && !no_W),
        "E_SW_NW": [], // no_E && (no_SW && !no_S && !no_W) && (no_NW && !no_N && !no_W),
        "S_W_NE": [], // no_S && no_W && (no_NE && !no_N && !no_E),
        "S_NE_NW": [], // no_S && (no_NE && !no_N && !no_E) && (no_NW && !no_N && !no_W),
        "W_NE_SE": [], // no_W && (no_NE && !no_N && !no_E) && (no_SE && !no_S && !no_E),
        "NE_SW_NW": [], // (no_NE && !no_N && !no_E) && (no_SW && !no_S && !no_W) && (no_NW && !no_N && !no_W),
        "NE_SE_SW": [], // (no_NE && !no_N && !no_E) && (no_SE && !no_S && !no_E) && (no_SW && !no_S && !no_W),
        "NE_SE_NW": [], // (no_NE && !no_N && !no_E) && (no_SE && !no_S && !no_E) && (no_NW && !no_N && !no_W),
        "SE_SW_NW": [], // (no_SE && !no_S && !no_E) && (no_SW && !no_S && !no_W) && (no_NW && !no_N && !no_W),
        "N_E": [], // no_N && no_E,
        "N_S": [], // no_N && no_S,
        "N_W": [], // no_N && no_W,
        "N_SE": [], // no_N && (no_SE && !no_S && !no_E),
        "N_SW": [], // no_N && (no_SW && !no_S && !no_W),
        "E_S": [], // no_E && no_S,
        "E_W": [], // no_E && no_W,
        "E_SW": [], // no_E && (no_SW && !no_S && !no_W),
        "E_NW": [], // no_E && (no_NW && !no_N && !no_W),
        "S_W": [], // no_S && no_W,
        "S_NE": [], // no_S && (no_NE && !no_N && !no_E),
        "S_NW": [], // no_S && (no_NW && !no_N && !no_W),
        "W_NE": [], // no_W && (no_NE && !no_N && !no_E),
        "W_SE": [], // no_W && (no_SE && !no_S && !no_E),
        "NE_SE": [], // (no_NE && !no_N && !no_E) && (no_SE && !no_S && !no_E),
        "NE_SW": [], // (no_NE && !no_N && !no_E) && (no_SW && !no_S && !no_W),
        "NE_NW": [], // (no_NE && !no_N && !no_E) && (no_NW && !no_N && !no_W),
        "SE_SW": [], // (no_SE && !no_S && !no_E) && (no_SW && !no_S && !no_W),
        "SE_NW": [], // (no_SE && !no_S && !no_E) && (no_NW && !no_N && !no_W),
        "SW_NW": [], // (no_SW && !no_S && !no_W) && (no_NW && !no_N && !no_W),
        "NE": [], // (no_NE && !no_N && !no_E),
        "SE": [], // (no_SE && !no_S && !no_E),
        "SW": [], // (no_SW && !no_S && !no_W),
        "NW": [], // (no_NW && !no_N && !no_W),
        "N": [], // no_N,
        "E": [], // no_E,
        "S": [], // no_S,
        "W": [], // no_W,
        "SOLID": [], // Math.random() > 0.62,
        "SOLID_ALT": [], // Math.random() > 0.62,
        "SOLID_ALT2": [], // Math.random() > 0.62,
        "SOLID_ALT3": [], // true,
    };

    const canvas2 = document.createElement('canvas');
    const ctx = canvas2.getContext("2d");
    const w2 = canvas2.width = fragmentsImage.width;
    const h2 = canvas2.height = fragmentsImage.height;

    ctx.drawImage(fragmentsImage, 0, 0);

    const canvas = document.createElement('canvas');
    canvas.width = fragmentsImage.width + tileSize;
    canvas.height = Object.keys(fragMap).length * tileSize;
    const _ctx = canvas.getContext('2d');

    const fragW = tileSize/2;
    const fragH = tileSize/2;

    _fragments_to_tilemap();

    return canvas;

    function _fragments_to_tilemap() {

        const fragData = [];

        [...Array(canvas.width / fragW)].forEach((_, i2) => {
            fragData.push([]);
            [...Array(canvas.height / fragH)].forEach((_, i) => {
                const _y = i * fragH;
                const _x = i2 * fragW;
                const imageData = ctx.getImageData(_x, _y, fragW, fragH);
                fragData[i2].push(imageData);
            })
        })

        const sideMap = {
            "N": [1, 0],
            "E": [1, 4],
            "S": [0, 4],
            "W": [0, 0],
            "NE": [1, 1],
            "SE": [1, 6],
            "SW": [0, 6],
            "NW": [0, 1]
        };
        [...Array(4)].forEach((_, _i) => {
            Object.keys(fragMap).forEach(k => {
                const sides = k.split("_");
                let ne_set = false;
                let se_set = false;
                let sw_set = false;
                let nw_set = false;
                const arr = [
                    [0, 0],
                    [0, 0],
                    [0, 0],
                    [0, 0]
                ];

                const _n = sides.indexOf("N") === -1;
                const _e = sides.indexOf("E") === -1;
                const _s = sides.indexOf("S") === -1;
                const _w = sides.indexOf("W") === -1;
                const _ne = sides.indexOf("NE") === -1;
                const _se = sides.indexOf("SE") === -1;
                const _sw = sides.indexOf("SW") === -1;
                const _nw = sides.indexOf("NW") === -1;

                const _0 = 0 + (2 * _i);
                const _1 = 1 + (2 * _i);

                // set north east fragment
                if(!_n && !_e)arr[0] = [_1, 0];
                else if(!_n && _e)arr[0] = [_1, 2];
                else if(_n && !_e)arr[0] = [_1, 3];
                else if(_n && _e && _ne)arr[0] = [_1, 8];
                else if(_n && _e)arr[0] = [_1, 1];

                // set south east fragment
                if(!_s && !_e)arr[1] = [_1, 4];
                else if(!_s && _e)arr[1] = [_1, 7];
                else if(_s && !_e)arr[1] = [_1, 5];
                else if(_s && _e && _se)arr[1] = [_1, 9];
                else if(_s && _e)arr[1] = [_1, 6];

                // set south west fragment
                if(!_s && !_w)arr[2] = [_0, 4];
                else if(!_s && _w)arr[2] = [_0, 7];
                else if(_s && !_w)arr[2] = [_0, 5];
                else if(_s && _w && _sw)arr[2] = [_0, 9];
                else if(_s && _w)arr[2] = [_0, 6];

                // set north west fragment
                if(!_n && !_w)arr[3] = [_0, 0];
                else if(!_n && _w)arr[3] = [_0, 2];
                else if(_n && !_w)arr[3] = [_0, 3];
                else if(_n && _w && _nw)arr[3] = [_0, 8];
                else if(_n && _w)arr[3] = [_0, 1];

                fragMap[k] = arr;
            });

            const col = 0;

            Object.keys(fragMap).forEach((k, i) => {
                const y = (i * (fragH * 2));
                const x = (col * (fragW * 2)) + (_i * (fragW * 2)) + xo;
                _ctx.putImageData(fragData[fragMap[k][0][0]][fragMap[k][0][1]], x + fragW, y);
                _ctx.putImageData(fragData[fragMap[k][1][0]][fragMap[k][1][1]], x + fragW, y + fragH);
                _ctx.putImageData(fragData[fragMap[k][2][0]][fragMap[k][2][1]], x, y + fragH);
                _ctx.putImageData(fragData[fragMap[k][3][0]][fragMap[k][3][1]], x, y);
            });
        });
    }
}

export function tilemapToCanvas(tilemap, tileset, tileSize) {
    console.log('tileset === ',tileset);
    const w = tilemap[0].length * tileSize;
    const h = tilemap.length * tileSize;
    console.log('w === ',w);
    console.log('h === ',h);
    const grid = getLinearImageDataGrid(tileset, tileSize, tileSize);
    console.log('grid === ',grid);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    tilemap.forEach((n,y) => {
        n.forEach((v,x) => {
            const _x = x * tileSize;
            const _y = y * tileSize;
            ctx.putImageData(grid[v], _x, _y);
        })
    })
    return canvas;
}
export function tilemapToDebugCanvas(tilemap, tileset, tileSize) {
    console.log('tileset === ',tileset);
    const w = tilemap[0].length * tileSize;
    const h = tilemap.length * tileSize;
    console.log('w === ',w);
    console.log('h === ',h);
    const grid = getLinearImageDataGrid(tileset, tileSize, tileSize);
    console.log('grid === ',grid);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    tilemap.forEach((n,y) => {
        n.forEach((v,x) => {
            const _x = x * tileSize;
            const _y = y * tileSize;
            ctx.fillText(""+v, _x, _y);
            // ctx.putImageData(grid[v], _x, _y);
        })
    })
    return canvas;
}