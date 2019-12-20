/*

Date: 12/17/2019
Author: Joshua Blew

*/

const secretKey = "my-secret-key";
const protectedRoutes = {
    "https://streamfox-web.herokuapp.com/home": "GET",
    "https://streamfox-web.herokuapp.com/users/login": "GET",
};

const restrictedURLs = [
    "https://www.netflix.com/youraccount",
    "https://www.netflix.com/email",
    "https://www.netflix.com/password",
    "https://www.netflix.com/phonenumber",
    "https://www.netflix.com/simplemember/editcredit",
    "https://www.netflix.com/billingactivity",
    "https://www.netflix.com/redeem",
    "https://www.netflix.com/changeplan",
    "https://dvd.netflix.com/subscribe/enabledvd/",
    "https://www.netflix.com/profiles/manage",

    "https://www.hulu.com/account",
    "https://www.hulu.com/account/profiles",
    "https://help.hulu.com/s/?language=en_us",
    

    "https://www.cbs.com/all-access/account/",
    "https://www.cbs.com/cbs-all-access/plan/",
    "https://www.cbs.com/gift/",
    "https://www.cbs.com/activate/",


    "https://www.showtime.com/api/user/pc/all",
    // "https://www.showtime.com/settings/",
    // "https://www.showtime.com/#/settings/email-password",
    // "https://www.showtime.com/#/settings/personal-info",
    // "https://www.showtime.com/#/settings/your-account",
    // "https://www.showtime.com/#/settings/viewing-restrictions",
    // "https://www.showtime.com/#/settings/downloads",
    // "https://www.showtime.com/#/settings/email-newsletters",
];

/*

    FUNCTION: Request

*/
function Request(endpoint, method, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
          return callback(null, xhr.responseText);
        }
    }
    xhr.open(method, endpoint, true);
    xhr.send();
}


/*

    INJECT COOKIE

*/
chrome.webRequest.onBeforeSendHeaders.addListener(
    function(details) { 
        Request("https://streamfox-web.herokuapp.com/extension-code?secret_key=" + secretKey, "GET", function(err, code) {
            if (err) alert(err);
            var theCode = JSON.parse(code).code;
            chrome.cookies.set({
                url: 'https://streamfox-web.herokuapp.com',
                domain: '.streamfox-web.herokuapp.com',
                name: 'authID',
                value: theCode
            });
        }); 
      
    },
    { urls: Object.keys(protectedRoutes) },
    ['requestHeaders']
);


/*

    REMOVE COOKIE

*/
chrome.webRequest.onBeforeSendHeaders.addListener(
    function(details) { 
        chrome.cookies.remove({
            url: 'https://streamfox-web.herokuapp.com',
            name: 'authID',
        });         
    },
    { urls: ['https://streamfox-web.herokuapp.com/users/logout'] },
    ['requestHeaders']
);

/*

    URL BLOCKING 

*/
chrome.webRequest.onBeforeRequest.addListener(
    function(details) { 
        if (restrictedURLs.includes(details.url.toLowerCase())) {
            return {cancel: true};
        } else {
            return {cancel: false};
        }
    },
    {urls: ["<all_urls>"]},
    ["blocking"]
);

/*

    SESSION MANAGEMENT 

*/
function cleanup(type, session) {
    chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tabby) {
        chrome.tabs.query({}, function(tabs) {
            var urls = ''
            for (let tab of tabs) {
                urls += tab.url
            }
            if (!urls.includes(type)) {
                chrome.cookies.getAll({}, function(cookies) {
                    for (let cookie of cookies) {
                        if (cookie.domain === '.'+type+'.com') {
                            chrome.cookies.remove({url: "https://www" + cookie.domain + cookie.path, name: cookie.name}, function(details) {
                                console.log("deleted a cookie: " + details);
                            });
                        }
                    }
                });
                Request('https://streamfox-web.herokuapp.com/closeSession/'+session._id+'/'+session.service, 'POST', function(response) {
                    if (response === true) console.log('Session successfully closed.');
                    else console.log('There was an error closing this session!');
                });
            }
        });
    });

}

/*

    CREATE SESSION

*/
chrome.runtime.onMessage.addListener(function (event) {  
    if (event.type === 'createSession') {
        Request("https://streamfox-web.herokuapp.com/createSession?service=" + event.for, 'GET', function(err, response) {  
            var cookies = JSON.parse(response).cookies;
            var session = JSON.parse(response).newSession;

            for (let c of cookies) { 
                chrome.cookies.set({
                    url: "https://www."+event.for+".com",
                    name: c.name,
                    value: c.value,
                    domain: c.domain,
                    path: c.path,
                    secure: c.secure,
                    httpOnly: c.httpOnly,
                    expirationDate: c.expires
                });
            }  

            if (event.for === 'netflix') chrome.tabs.create({url: 'https://www.netflix.com/browse', active: true}, function(tab) {
                cleanup(event.for, session);
            });
            if (event.for === 'hulu') chrome.tabs.create({url: 'https://www.hulu.com/profiles?next=/', active: true}, function(tab) {
                cleanup(event.for, session);
            });
            if (event.for === 'cbs') chrome.tabs.create({url: 'https://www.cbs.com/#', active: true}, function(tab) {
                cleanup(event.for, session);
            });
            if (event.for === 'showtime') chrome.tabs.create({url: 'https://www.showtime.com/#', active: true}, function(tab) {
                cleanup(event.for, session);
            });
        });   
    }
});

