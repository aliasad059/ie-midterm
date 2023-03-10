function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    let expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    document.getElementById("action_result").innerHTML = "";
    console.log("Cookie Set");
}

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    console.log(ca);
    for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    console.log("Cookie not found");
    return "";
}

function clearCookies(){
    let cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i];
        let eqPos = cookie.indexOf("=");
        let name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
    console.log("Cookies Cleared");
}

function setLocalStorage(username, data){
    localStorage.setItem(username, data);
    console.log("Local Storage Set");
}

function getLocalStorage(username){
    let data = localStorage.getItem(username);
    if (data == null) {
        console.log("Local Storage not found");
        return false;
    }
    return data;
}

async function fetchUserData(username){
    var response = await fetch(`https://api.github.com/users/${username}`);
    var data = await response.json();
    return data;
}

function setDataValue(data){
    if (data.avatar_url) {document.getElementById("user-avatar").src = data.avatar_url ;}
    if (data.name) {document.getElementById("full-name").innerHTML = data.name} else {document.getElementById("account-name").innerHTML = "unknown"}
    if (data.bio) {document.getElementById("bio").innerHTML = data.bio;} else {document.getElementById("bio").innerHTML = "No Bio"}
    if (data.location) {document.getElementById("location").innerHTML = data.location} else {document.getElementById("location").innerHTML = "Location not specified"}
    if (data.followers) {document.getElementById("followers").innerHTML = data.followers} else {document.getElementById("followers").innerHTML = "unknown"}
    if (data.following) {document.getElementById("following").innerHTML = data.following} else {document.getElementById("following").innerHTML = "unknown"}
    if (data.blog) {document.getElementById("blog").innerHTML = data.blog;} else {document.getElementById("blog").innerHTML = "No Blog"}
    if (data.public_repos) {document.getElementById("public-repos").innerHTML = data.public_repos} else {document.getElementById("public-repos").innerHTML = "unknown"}
}

async function getFavoriteLang(repos_url){
    let langs = [];
    const response = fetch(repos_url);

    // convert to json then sort by created_at
    var f = response
    .then((response) => response.json())
    .then((response) => response.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)))
    .then((repos) => {
        
        // get last 5 repos languages
        for (let i = 0; i < 5; i++) {
            if (repos[i].language) {
                langs.push(repos[i].language);
            }
        }

        // get most used language
        let favorite_lang = langs.sort((a, b) =>
            langs.filter(v => v === a).length
            - langs.filter(v => v === b).length
        ).pop();

        return favorite_lang;
    });

    return f;
}

function clearLocalStorage(){
    localStorage.clear();
    console.log("Local Storage Cleared");
}

async function getUser(){
    let username = document.getElementById("username").value

    if (getLocalStorage(username)) {
        let s_data = getLocalStorage(username);
        var data = JSON.parse(s_data);
        document.getElementById("action_result").innerHTML = "Cached Data Loaded from Local Storage";
    } else {
        var data = await fetchUserData(username);
        let s_data = JSON.stringify(data);
        setLocalStorage(username, s_data);
        document.getElementById("action_result").innerHTML = "";
    }
    
    if (getCookie(username) == "") {
        var data = await fetchUserData(username);
        let s_data = JSON.stringify(data);
        setCookie(username, s_data, 1);
        document.getElementById("action_result").innerHTML = "";
    } else {
        let s_data = getCookie(username);
        var data = JSON.parse(s_data);
        document.getElementById("action_result").innerHTML = "Cached Data Loaded from Cookies";
    }
    
    if (data.message) {
        document.getElementsByClassName("info-box")[0].style.opacity = 0.2
        document.getElementById("action_result").innerHTML = "Selected User Not Found";
    } else {
        if (document.getElementById("action_result").innerHTML == "Selected User Not Found") {
            document.getElementById("action_result").innerHTML = "";
        }
        document.getElementsByClassName("info-box")[0].style.opacity = 1;
        setDataValue(data);
    }
    
    if (data.repos_url) {
        document.getElementById("favorite-language").innerHTML = await getFavoriteLang(data.repos_url);
    } else {
        document.getElementById("favorite-language").innerHTML = 'Not Specified';   
    }   
}