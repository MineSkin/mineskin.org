(() => {
    document.addEventListener("DOMContentLoaded", () => {
        l().then(grants => {
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
        })
    });
})();

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