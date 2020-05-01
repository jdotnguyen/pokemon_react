import fetch from 'cross-fetch'

export function fetchMoves() {
    return fetch('https://pokeapi.co/api/v2/move/')
        .then(response => response.json())
        .then(json => {return json})
        .catch(error => console.warn(error));
}