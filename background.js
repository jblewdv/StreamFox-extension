const $$ = document.querySelectorAll.bind(document);
const $  = document.querySelector.bind(document);

function API(endpoint, method, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
          return callback(null, JSON.parse(xhr.responseText));
        }
    }
    xhr.open(method, endpoint, true);
    xhr.send();
}

chrome.runtime.onMessage.addListener(function (event) {

    if (event.type === 'createSession') {
        if (event.for === 'hulu') {
            chrome.tabs.create({url: 'https://www.hulu.com/login', active: true});
            chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
                if (changeInfo.status == 'complete') {
                    API('https://streamfox-chrome-node.herokuapp.com/test', 'GET', function(err, cookies) {
                        console.log(cookies);
                    })

                    
        
                    
                }
            });
        }

    }

});
chrome.webRequest.onBeforeRequest.addListener(function(details) { 
    if(details.url === "http://localhost:3000/users/login") {
        console.log('trying to login');
        chrome.cookies.set({
            url: 'http://localhost:3000',
            name: 'extensionCookie',
            value: 'test_value'
        }, function(cookie) {
            console.log(cookie);
        });
    }
},
{ urls: ["http://localhost:3000/users/login"] },
["requestBody"]
);

// chrome.webRequest.onCompleted.addListener(function(details) {
//     if(details.method === "GET" && details.url === "http://localhost:3000/home") { 
//         chrome.cookies.remove({
//             url: 'http://localhost:3000',
//             name: 'extensionCookie',
//         }, function(deletedCookie) {
//             console.log(deletedCookie);
//         });  
//         console.log('removing cookie');
//     } 
    
// },
// { urls: ["http://localhost:3000/home"] }
// );