(() => {
    document.addEventListener("DOMContentLoaded", () => r());
})();

async function r() {
    const grants = Math.random() > 0.9 ? await l() : c();
    console.log("grants", grants);
    if (!grants || !grants.ad_free || grants.ad_free !== true) {
        const script = document.createElement("script");
        script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
        script.setAttribute("async", "");
        script.setAttribute("data-cookie-consent", "targeting");
        document.body.append(script);
    } else {
        console.log("Ad-free grants detected")
    }
}

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
    let grants = {};
    if (c) {
        const t = j(c);
        grants = t?.grants || {};
    }
    return grants;
}

function l() {
    return fetch("https://account-api.mineskin.org/auth/tokens/web/grants", {
        method: "GET",
        credentials: "include"
    })
        .then(res => res.json())
        .then(res => {
            if (res?.grants) {
                window._mineskinGrants = res.grants;
                return res.grants;
            }
            return {};
        }).catch(err => {
            $scope.minsekinGrants = {};
            return {};
        });
}