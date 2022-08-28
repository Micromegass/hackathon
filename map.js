import {create_map_villa} from "./map_villa";
import {create_map_cabin} from "./map_cabin";
import {projects} from "./projects";

const currentUrl = window.location.href;
const url = new URL(currentUrl);
const currentProjectID = url.searchParams.get("id");
const currentProject = projects.find(project => project.id === currentProjectID);
const linkToProject = currentProject.url

let coordinates
let zoom
mapboxgl.accessToken = 'pk.eyJ1IjoiYnJhdW5zY2h3ZWlnZXIiLCJhIjoiY2w3OWJxNW9lMDJ0bzN2cHVndXQ4Mng0eCJ9.DXHTQQSp-pTqaKNp1Ma29A';

if (currentProjectID === "1") {
    coordinates = [139.60581970441717, 35.84818561338292]
    zoom = 16.5
    create_map_villa(zoom, coordinates, linkToProject)
} else if (currentProjectID === "2") {
    coordinates = [-75.33217575906961, 6.288372749267765]
    zoom = 18.5
    create_map_cabin(zoom, coordinates, linkToProject)
}