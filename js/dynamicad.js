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

        const script1 = document.createElement("script");
        script1.src = "https://cdn.jsdelivr.net/gh/InventivetalentDev/AdBlockBanner@master/abb.min.js";
        script1.setAttribute("async", "");
        document.body.append(script1);
    } else {
        console.log("Ad-free grants detected")
    }
}

function c() {
    return window._mineskinGrants || {};
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