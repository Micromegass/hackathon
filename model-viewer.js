import {projects} from "./projects.js";
import {IfcViewerAPI} from "web-ifc-viewer";
import {Color} from "three"


const currentUrl = window.location.href;
const url = new URL(currentUrl);
const currentProjectID = url.searchParams.get("id");
const currentProject = projects.find(project => project.id === currentProjectID);
console.log(currentProject)


const container = document.getElementById("viewer-container")
const viewer = new IfcViewerAPI({
    container,
    backgroundColor: new Color("255, 255, 255")
})
viewer.axes.setAxes();
viewer.grid.setGrid();


await loadIfc(currentProject.url)

//button logic clipper
const clipperButton = document.getElementById("clipper-button");
let clippingPlanesActive = false
clipperButton.onclick = () => {
    clippingPlanesActive = !clippingPlanesActive
    viewer.clipper.active = clippingPlanesActive

    if (clippingPlanesActive) {
        clipperButton.classList.add("active")
    } else {
        clipperButton.classList.remove("active")
    }
}
// window.onkeydown = (event) => {
//     if (event.code === "Delete" && clippingPlanesActive) {
//         viewer.clipper.deletePlane();
//     }
// }


// button logic picking
let pickerButtonActive = false

function handlePicking() {
    if (!pickerButtonActive) {
        console.log("active")
        window.onclick = async () => {
            const result = await viewer.IFC.selector.pickIfcItem();
            if (!result) return;
            const {modelID, id} = result;
            const props = await viewer.IFC.getProperties(modelID, id, true, false);
            document.getElementById("express-id").innerHTML = props.expressID
            document.getElementById("global-id").innerHTML = props.GlobalId.value;
            pickerButton.classList.add("active")
            pickerButtonActive = true
        };
    } else {
        window.onclick = async () => {
            console.log("not-active")
            const result = await viewer.IFC.selector.unpickIfcItems();
            pickerButton.classList.remove("active")
            pickerButtonActive = false
        }
    }
}

const pickerButton = document.getElementById("pickerButton");
pickerButton.onclick = handlePicking

// button logic drawing
let drawingActive = false
function handleDrawing() {
    if (!drawingActive) {
        drawingActive = true
        viewer.dimensions.active = true;
        viewer.dimensions.previewActive = true;
        window.ondblclick = () => {
            viewer.dimensions.create();
        }
        window.onkeydown = (event) => {
            if (event.code === 'Delete') {
                viewer.dimensions.delete();
            }
        }
    } else {
        drawingActive = false
        viewer.dimensions.active = false;
        viewer.dimensions.previewActive = false;
    }
}
const drawButton = document.getElementById("drawButton");
drawButton.onclick = handleDrawing

// button logic download
function handleDownload() {
    document.getElementById("download-link").click()
}
const downloadButton = document.getElementById("downloadButton");
downloadButton.onclick = handleDownload


async function loadIfc(url) {
    await viewer.IFC.setWasmPath("./wasm/");
    const model = await viewer.IFC.loadIfcUrl(url);
    const result = await viewer.IFC.properties.serializeAllProperties(model);
    const file = new File(result, 'properties');
    const link = document.createElement('a');
    link.setAttribute("id", "download-link");
    document.body.appendChild(link);
    link.href = URL.createObjectURL(file);
    link.download = 'properties.json';
    await viewer.shadowDropper.renderShadow(model.modelID);
    viewer.context.renderer.postProduction.active = true;
    const loadingScreen = document.getElementById("loader-container");
    loadingScreen.classList.add("hidden")
}



