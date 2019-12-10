console.log("hey")

// Minimal jQuery
const $$ = document.querySelectorAll.bind(document);
const $  = document.querySelector.bind(document);


$('#netflixCreate').addEventListener('click', () => {
    chrome.runtime.sendMessage({type: "createSession", for: "netflix"});
});

$('#huluCreate').addEventListener('click', () => {
    chrome.runtime.sendMessage({type: "createSession", for: "hulu"});
});

$('#cbsCreate').addEventListener('click', () => {
    chrome.runtime.sendMessage({type: "createSession", for: "cbs"});
});

$('#showtimeCreate').addEventListener('click', () => {
    chrome.runtime.sendMessage({type: "createSession", for: "showtime"});
});

$('#disneyCreate').addEventListener('click', () => {
    chrome.runtime.sendMessage({type: "createSession", for: "disney"});
});


// document.addEventListener('DOMContentLoaded', main);
