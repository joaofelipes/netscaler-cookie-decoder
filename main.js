function cookieinfo(){
	var title = document.createElement("b");
	title.appendChild(document.createTextNode("CHOOSE NETSCALER COOKIE:"));
	title.setAttribute("class","title");
	title.setAttribute("id","title");
	document.body.appendChild(title);
    chrome.tabs.query({"status":"complete","windowId":chrome.windows.WINDOW_ID_CURRENT,"active":true}, function(tab){
            chrome.cookies.getAll({"url":tab[0].url},function (cookie){
                allCookieInfo = "";
                for(i=0;i<cookie.length;i++){
                    var bDiv = document.createElement("div");
                    bDiv.appendChild(document.createTextNode(cookie[i].name));
                    bDiv.setAttribute("class","bDiv");
                    bDiv.setAttribute("id","bDiv");
					newDiv = document.body.appendChild(bDiv);
					newDiv.addEventListener("click",function( id ){selectcookie( cookie[id] )}.bind(this,i),false);
                    allCookieInfo = allCookieInfo + JSON.stringify(cookie[i]);
                }
                localStorage.currentCookieInfo = allCookieInfo;

            });
    });
}

function parseCookie(cookie) {
    const searchPattern = /NSC_([a-zA-Z0-9\-\_\.]*)=[0-9a-f]{8}([0-9a-f]{8}).*([0-9a-f]{4})$/
    const parseResults = searchPattern.exec(cookie)

    if (!parseResults || parseResults.length < 4)
        throw 'Could not parse cookie'

    return {
        serviceName: parseResults[1], 
        serverIP: parseInt(parseResults[2], 16), 
        serverPort: parseInt(parseResults[3], 16)}
}

function decryptServiceName(serviceName) {
    // This decrypts the Caesar Subsitution Cipher Encryption used on the Netscaler Cookie Name
    const substitutions = {
        key:   'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
        value: 'zabcdefghijklmnopqrstuvwxyZABCDEFGHIJKLMNOPQRSTUVWXY'
    }

    return serviceName
        .split('')
        .reduce((name, character) => {
            const keyIndex = substitutions.key.indexOf(character)

            if (keyIndex >= 0) {
                return name += substitutions.value[keyIndex]
            } 
            
            return name += character
        }, '')
}


function decryptServerIP(serverIP) {
    const ipKey = 0x03081e11
    const decodedIP = (serverIP ^ ipKey)
        .toString(16)       // convert integer to hex string
        .padStart(8, '0')   // pad hex string with left 0's to make 8 characters
    
    return decodedIP
        .match(/([a-f0-9]{2})/g)            // split hex into 2 character tokens
        .map(token => parseInt(token, 16))  // map each hex element to a decimal value
        .join('.')                          // join tokens by '.'
}

function decryptServerPort(serverPort) {
    const portKey = 0x3630
    const decodedPort = serverPort ^ portKey // no need to convert to hex since an integer will do for port
 
    return String(decodedPort)
}

function decryptCookie(cookie) {
    const {serviceName, serverIP, serverPort} = parseCookie(cookie)
    // console.log(parseCookie(cookie))

    return {
        realName: decryptServiceName(serviceName),
        realIP: decryptServerIP(serverIP),
        realPort: decryptServerPort(serverPort)
    }
}

function selectcookie( cookieItem ){
	cookie = cookieItem.name + "=" + cookieItem.value
	decrypted_data = decryptCookie(cookie)
	
	// Clear body
	document.body.innerHTML = "";
	$('html').height(50); 
	$('html').width(320); 
	var finalText = "Node address: " + decrypted_data.realIP + ":" + decrypted_data.realPort;
	var vipText =  "VIP Name: " + decrypted_data.realName; 
	var awnser = document.createElement("div");	
	var vipdiv = document.createElement("div");
	awnser.appendChild(document.createTextNode(finalText));
	vipdiv.appendChild(document.createTextNode(vipText))
	awnser.setAttribute("class","awnser");
	awnser.setAttribute("id","awnser");
	vipdiv.setAttribute("class", "vipdiv")
	vipdiv.setAttribute("id","vipdiv");
	document.body.style.height=126
	document.body.appendChild(awnser);
	document.body.appendChild(vipdiv);
}

// Attach function to on load event
if (window.attachEvent) {window.attachEvent('onload', cookieinfo);}
else if (window.addEventListener) {window.addEventListener('load', cookieinfo, false);}
else {document.addEventListener('load', cookieinfo, false);}


