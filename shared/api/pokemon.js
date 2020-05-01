import fetch from 'cross-fetch'

export function fetchPokemon() {
    return fetch('https://pokeapi.co/api/v2/pokemon/')
        .then(response => response.json())
        .then(json => {return json})
        .catch(error => console.warn(error));
}