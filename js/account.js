(() => {
    document.addEventListener("DOMContentLoaded", () => c());
    c();
})();

// https://stackoverflow.com/a/11767598/6257838
function g(cookiename) {
    // Get name followed by anything except a semicolon
    var cookiestring = RegExp(cookiename + "=[^;]+").exec(document.cookie);
    // Return everything after the equal sign, or an empty string if the cookie name not found
    return decodeURIComponent(!!cookiestring ? cookiestring.toString().replace(/^[^=]+./, "") : "");
}

// https://stackoverflow.com/a/38552302/6257838
function j(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

function c() {
    const c = g('mskweb');
    if (c) {
        window._mineskinUser = j(c);
        console.debug('User:', window._mineskinUser);
        window._mineskinGrants = window._mineskinUser?.grants || window._mineskinGrants || {};
    }
}