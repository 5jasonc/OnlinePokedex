"use strict"

// Stores user's searched term to display
let displayTerm = "";

// Will hold lists for all Pokemon objects, names, and URLs
let pokeList;
let pokeNameList = [];
let pokeUrlList = [];
let tempPokeNameList = [];
let tempPokeUrlList = [];

// Will hold state if a selected Pokemon is being viewed
let isViewingEntry = false;

// Holds temporary screen content when viewing entry
let tempLine = "";

let info = ""; // Will store result contents as inner HTML value
let search = ""; // Stores search side of page to hide and re-display as we please

// Tie search button to click event and populate Pokemon data once page loads
window.onload = (e) => { 
    document.querySelector("#submit").onclick = searchClicked;
    getList();

    // Save neccessary page elements
    info = document.querySelector("#info");
};

// Gets data of all Pokemon from PokeAPI to store for later use
function getList() {
    // URL to access list of all Pokemon names and URLs from PokeAPI
    const POKEMON_LIST_URL = "https://pokeapi.co/api/v2/pokemon/?offset=0&limit=964";

    // Get data
    getData(POKEMON_LIST_URL);
}

// Use XMLHttpRequest to attempt attempt connection
function getData(url) {
    let xhr = new XMLHttpRequest();

    if(url.includes("?")) { xhr.onload = initialDataLoaded; } // Initially loads all basic Pokemon info into lists
    else if(isViewingEntry) { xhr.onload = specificDataLoaded; }   // Accesses specific Pokemon stats
    else if(url.includes("type")) { xhr.onload = typeDataLoaded; } // Accesses Pokemon type lists for searching by type
    else { xhr.onload = dataLoaded; }                         // Accesses thumbnails and names for displaying results

    xhr.onerror = dataError;

    xhr.open("GET", url);
    xhr.send();
}

// Error caught if XMLHttpRequest fails
function dataError(e) {
    console.log("ERROR: An error occured accessing data from PokeAPI.");
}

// Builds list of all Pokemon from data gained from PokeAPI
function initialDataLoaded(e) {
    let xhr = e.target;

    // Creates object containing all pokemon names and URLs from PokeAPI
    let pokeListObj = JSON.parse(xhr.responseText);
    
    // Exit function if there is no data
    if(pokeListObj.results == 0 || !pokeListObj) {
        console.log("ERROR: No data obtained from PokeAPI");
        return;
    }
    
    // Create list of all Pokemon objects, names, and URLs
    pokeList = pokeListObj.results;

    for(let pokemon in pokeList) {
        pokeNameList.push(pokeList[pokemon].name);
        pokeUrlList.push(pokeList[pokemon].url);
    }

    // Log results for debugging
    //console.log(pokeList);
    //console.log(pokeNameList);
    //console.log(pokeUrlList);
}

// Obtains thumbnails and name of Pokemon for displaying results
function dataLoaded(e) {
    let xhr = e.target;

    tempPokeNameList = []; // Resets temporary Pokemon lists
    tempPokeUrlList = [];
    
    // Creates object containing all pokemon stats
    let pokemonObj = JSON.parse(xhr.responseText);
    //console.log(pokemonObj);

    // Exit function if there is no data
    if(pokemonObj.name == 0 || !pokemonObj) {
        console.log("ERROR: No data obtained from PokeAPI");
        return;
    }

    // Update screen to display pokemon information
    // Give every element in every result same class so any element clicked in div references same name
    let line = "<div class='result' onClick='entryClicked();' id='" + pokemonObj.name + "'>";
    line += "<p class='" + pokemonObj.name + "'>" + pokemonObj.name.toUpperCase() + "</p>";

    if(pokemonObj.sprites.front_default) {  // Checks if image exists before displaying it
        line += "<img src='" + pokemonObj.sprites.front_default;
        line += "' title='" + pokemonObj.name + " sprite' class='" + pokemonObj.name + "'/>";
    }
    else {
        line += "<img src='media/pokeball.png'";
        line += " title='No image for this Pokemon' class='" + pokemonObj.name + "'/>"
    }

    line += "</div>";

    info.innerHTML += line;
    tempLine += line;
}

// Obtains specific stats of Pokemon clicked
function specificDataLoaded(e) {
    let xhr = e.target;

    // Creates object containing all pokemon stats
    let pokemonObj = JSON.parse(xhr.responseText);
    console.log(pokemonObj);

    // Exit function if there is no data
    if(!pokemonObj) {
        console.log("ERROR: No data obtained from PokeAPI");
        return;
    }

    // Update screen to show specific pokemon stats
    info.innerHTML = ""; // Clears screen

    let line = "<div id='entry'>";
    line += "<button type='button' id='backButton' onClick='backClicked();'>";
    line += "Go Back" + "</button>";
    line += "<p>" + pokemonObj.name.toUpperCase() + "</p>";     // Name
    
    // Makes sure image src is not null before displaying
    if(pokemonObj.sprites.front_default) {
        line += "<img src='" + pokemonObj.sprites.front_default;    // Images
        line += "' title='" + pokemonObj.name + " sprite'/>";
    }

    if(pokemonObj.sprites.back_default) {
        line += "<img src='" + pokemonObj.sprites.back_default;
        line += "' title='" + pokemonObj.name + " back facing sprite'/>";
    }

    line += "<br>";

    if(pokemonObj.sprites.front_shiny) {     
        line += "<img src='" + pokemonObj.sprites.front_shiny;
        line += "' title='" + pokemonObj.name + " shiny sprite'/>";
    }
    
    if(pokemonObj.sprites.back_shiny) {
        line += "<img src='" + pokemonObj.sprites.back_shiny;
        line += "' title='" + pokemonObj.name + " back facing shiny sprite'/>";
        line += "<br>";
    }
    
    let stats = pokemonObj.stats    // Stats

    for(let i = 0; i < 6; i++) {    // Loops through all stats
        line += "<p>" + stats[i].stat.name.toUpperCase() + ": ";
        line += stats[i].base_stat + "</p><br>";
    }

    let types = pokemonObj.types    // Types

    info.innerHTML = line; // Add to screen
}

// Loads list of pokemon of specific type to sort through
function typeDataLoaded(e) {
    let xhr = e.target;

    // Creates object containing all pokemon with selected type
    let pokemonOfType = JSON.parse(xhr.responseText).pokemon;

    console.log("Type Data loaded");

    // Add names and urls of Pokemon that fit type to temporary lists to be scanned
    for(let pokemonIndex of pokemonOfType) {
        tempPokeNameList.push(pokemonIndex.pokemon.name);
        tempPokeUrlList.push(pokemonIndex.pokemon.url);
    }

    // Scan smaller, type filtered list of Pokemon names for matching substring
    // Gets data for matching Pokemon
    for(let i = 0; i < tempPokeNameList.length; i++) {
        if(tempPokeNameList[i].includes(document.querySelector("#searchBar").value.trim().replace(" ", "-"))) {
            getData(tempPokeUrlList[i]);
        }
    }
}

// Executes search of list based on control values
function searchClicked() {
    console.log("Search button clicked.");

    isViewingEntry = false;

    // Resets results
    info.innerHTML = "";
    tempLine = ""; // Resets displayed search results

    // Save and trim search term
    let searchTerm = document.querySelector("#searchBar").value;
    searchTerm = searchTerm.trim();
    let tempSearchTerm = searchTerm.replace(" ", "-"); //Replace any spaces with dash for use in search

    // Save selected type value
    let types = document.querySelector("#type");
    let typeValue = types[types.selectedIndex].value;

    // Save selected search limit
    let limit = document.querySelector("#limit").value;

    // Checks if user has selected type, will then scan shorter list of Pokemon and get results
    if(typeValue != "all") {
        getData("https://pokeapi.co/api/v2/type/" + typeValue);

        return; // Exits function as search is completed on smaller list
    }
    
    // Scan global Pokemon list for any Pokemon names with a substring that matches the term
    for(let i = 0; i < pokeNameList.length; i++) {
        if(pokeNameList[i].includes(tempSearchTerm)) {
            getData(pokeUrlList[i]);
        }
    }
}

// Updates page to display specific Pokemon info when an entry is clicked.
function entryClicked() {
    console.log("Entry Clicked.");

    let poke_url = "https://pokeapi.co/api/v2/pokemon/"; // We will add target url to this
    isViewingEntry = true; // Changes state to track how long user is viewing entry

    // Gets data for the specific Pokemon clicked
    if(pokeNameList.indexOf(event.target.className) == -1) {
        poke_url += adjustIndex(pokeNameList.indexOf(event.target.id));      // If div is clicked use id (already has class)
    }
    else {
        poke_url += adjustIndex(pokeNameList.indexOf(event.target.className)); // Uses class (Pokemon Name) of div clicked
    }

    getData(poke_url);
}

// Re-displays search results saved in tempList when done viewing entry
function backClicked() {
    console.log("Back button clicked.");

    info.innerHTML = tempLine;

    isViewingEntry = false; // Sets state back so program knows player is done viewing entry
}

// If pokemon is a special type or mega evolution, their index must be shifted to use proper url
// Returns shifted index
function adjustIndex(index) {
    if(index > 806) { // Any index after 806 is when PokeAPI starts numbering pokemon starting with 10001
        index -= 806;
        index += 10000;
        return index;
    }

    return index + 1;
}