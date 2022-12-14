import { projects } from "./projects.js";
const projectContainer = document.getElementById("projects-container");
const projectCards = Array.from(projectContainer.children);
console.log(projectCards)
const templateProjectCard = projectCards[0];
console.log(templateProjectCard)

const tileLinks = document.getElementsByClassName("tile-link")

const baseURL = './model-viewer.html';

for(let project of projects) {
    // Create a new card
    const newCard = templateProjectCard.cloneNode(true);
    console.log(newCard)
    // Add project name to card
    const cardTitle = newCard.querySelector('h2');
    cardTitle.textContent = project.name;

    // Add project URL to card
    const button = newCard.querySelector('a');
    button.href = baseURL + `?id=${project.id}`;

    // Add card to container
    projectContainer.appendChild(newCard);
}

templateProjectCard.remove();