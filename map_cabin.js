import {
    Camera,
    DirectionalLight,
    Matrix4,
    Scene,
    Vector3,
    WebGLRenderer
} from "three";
import {IFCLoader} from "web-ifc-three";

function create_map_cabin(zoom, coordinates, linkToProject) {
    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/navigation-night-v1',
        zoom: zoom,
        center: coordinates,
        pitch: 60,
        antialias: true
    });
    const popup = new mapboxgl.Popup({closeOnClick: false})
        .setLngLat(coordinates)
        .setHTML('<div>Cabin in Akigase Park (Japan)</div>')
        .addTo(map);

    function rotateCamera(timestamp) {
        map.rotateTo((timestamp / 100) % 360, {duration: 0});
        requestAnimationFrame(rotateCamera);
    }

    const modelOrigin = coordinates;
    const modelAltitude = 0;
    const modelRotate = [Math.PI / 2, 0, 0];
    const modelAsMercatorCoordinate = mapboxgl.MercatorCoordinate.fromLngLat(
        modelOrigin,
        modelAltitude
    );
    const modelTransform = {
        translateX: modelAsMercatorCoordinate.x,
        translateY: modelAsMercatorCoordinate.y,
        translateZ: modelAsMercatorCoordinate.z,
        rotateX: modelRotate[0],
        rotateY: modelRotate[1],
        rotateZ: modelRotate[2],
        scale: modelAsMercatorCoordinate.meterInMercatorCoordinateUnits()
    };
    const customLayer = {
        id: '3d-model',
        type: 'custom',
        renderingMode: '3d',
        onAdd: function (map, gl) {
            this.camera = new Camera();
            this.scene = new Scene();
            loadModel(this.scene)
            const directionalLight = new DirectionalLight(0xffffff);
            directionalLight.position.set(0, -70, 100).normalize();
            this.scene.add(directionalLight);
            const directionalLight2 = new DirectionalLight(0xffffff);
            directionalLight2.position.set(0, 70, 100).normalize();
            this.scene.add(directionalLight2);
            this.map = map;
            this.renderer = new WebGLRenderer({
                canvas: map.getCanvas(),
                context: gl,
                antialias: true
            });
            this.renderer.autoClear = false;
        },
        render: function (gl, matrix) {
            const rotationX = new Matrix4().makeRotationAxis(
                new Vector3(1, 0, 0),
                modelTransform.rotateX
            );
            const rotationY = new Matrix4().makeRotationAxis(
                new Vector3(0, 1, 0),
                modelTransform.rotateY
            );
            const rotationZ = new Matrix4().makeRotationAxis(
                new Vector3(0, 0, 1),
                modelTransform.rotateZ
            );
            const m = new Matrix4().fromArray(matrix);
            const l = new Matrix4()
                .makeTranslation(
                    modelTransform.translateX,
                    modelTransform.translateY,
                    modelTransform.translateZ
                )
                .scale(
                    new Vector3(
                        modelTransform.scale,
                        -modelTransform.scale,
                        modelTransform.scale
                    )
                )
                .multiply(rotationX)
                .multiply(rotationY)
                .multiply(rotationZ);
            this.camera.projectionMatrix = m.multiply(l);
            this.renderer.resetState();
            this.renderer.render(this.scene, this.camera);
            this.map.triggerRepaint();
        }
    };
    map.on('style.load', () => {
        map.addLayer(customLayer, 'waterway-label');
    });
    map.on('load', () => {
        rotateCamera(0);
        const layers = map.getStyle().layers;
        const labelLayerId = layers.find(
            (layer) => layer.type === 'symbol' && layer.layout['text-field']
        ).id;
        map.addLayer(
            {
                'id': 'add-3d-buildings',
                'source': 'composite',
                'source-layer': 'building',
                'filter': ['==', 'extrude', 'true'],
                'type': 'fill-extrusion',
                'minzoom': 15,
                'paint': {
                    'fill-extrusion-color': '#aaa',
                    'fill-extrusion-height': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        15,
                        0,
                        15.05,
                        ['get', 'height']
                    ],
                    'fill-extrusion-base': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        15,
                        0,
                        15.05,
                        ['get', 'min_height']
                    ],
                    'fill-extrusion-opacity': 0.6
                }
            },
            labelLayerId
        );
    });

    async function loadModel(scene) {
        const loader = new IFCLoader();
        await loader.ifcManager.setWasmPath("./wasm/");
        const model = await loader.loadAsync(linkToProject)
        scene.add(model)
        const loadingScreen = document.getElementById("loader-container");
        loadingScreen.classList.add("hidden")
    }
}

export {create_map_cabin}