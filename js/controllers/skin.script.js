mineskinApp.controller("skinController", ["$scope", "$timeout", "$http", "$state", "$cookies", "$window", function ($scope, $timeout, $http, $state, $cookies, $window) {
    apiBaseUrl = $cookies.get("apiBaseUrl") || apiBaseUrl;

    window.__scope = $scope;

    /* +Alerts */
    $scope.alerts = [];
    $scope.addAlert = function (msg, type, timeout) {
//                    var newAlert = {type: type, msg: msg, timeout: timeout};
//                    $timeout(function () {
//                        $scope.alerts.push(newAlert);
//                    });
        var toast = Materialize.toast(msg, timeout);
        return {
            alert: toast,
            close: function () {
                if (toast)
                    toast.remove();
            }
        }
    };
    $scope.closeAlert = function (index) {
        $timeout(function () {
            $scope.alerts.splice(index, 1);
        });
    };
    $scope.clearAlerts = function () {
        $timeout(function () {
            $scope.alerts.splice(0, $scope.alerts.length);
        });
    };
    /* -Alerts */

    $scope.state = $state;

    /* +Head */
    $scope.head = {
        pageTitle: "MineSkin - Custom Skin Generator",
        pageIcon: "favicon.png",
        pageDescription: "MineSkin.org allows you to generate skin texture data for Minecraft which is signed by Mojang."
    };
    /* -Head */

    /* +Stats */
    $scope.stats = {
        total: 0,
        unique: 0,
        duplicate: 0,
        private: 0,
        lastDay: 0,
        accounts: 0,
        delay: 0
    };
    $scope.refreshStats = function (details) {
        let statsUrl = apiBaseUrl + "/get/stats";
        $http({
            url: statsUrl,
            method: "GET"
        }).then(function (response) {
            $timeout(function () {
                $scope.stats = response.data;
            });
        });
    };
    $scope.windowFocused = false;
    $window.onfocus = function () {
        $scope.windowFocused = true;
    };
    $window.onblur = function () {
        $scope.windowFocused = false;
    };
    /* -Stats */

    $scope.browser = {
        isFirefox: function () {
            return (navigator.userAgent.indexOf('Firefox') > -1);
        }
    };

    $scope.backToTop = function () {
        $("html,body").animate({scrollTop: 0}, 1000);
    }

    $scope.navigateTo = function (path) {
        $location.path(path);
    };

    $scope.range = function (count) {
        var a = [];
        for (var i = 0; i < count; i++) {
            a.push(i)
        }
        return a;
    }
    $scope.max = Math.max;
    $scope.min = Math.min;

    $scope.materializeInit = function (tab) {
        console.log("MATERIALIZE INIT")
        $timeout(function () {
            $('ul.tabs').tabs();
//                        $('ul.tabs').tabs("select_tab",tab);
            // 'select_tab' doesn't work, because ui-sref replaces the href attribute
            $("#" + tab + "-trigger").trigger("click");
            materializeBaseInit();
        }, 100);
    };

    /// Auth

    $scope.googleUser = undefined;
    $scope.mineskinAccount = undefined;
    $scope.checkAccount = function (cb) {
        if ($scope.mineskinAccount && cb) {
            cb($scope.mineskinAccount);
            return;
        }

        $timeout(function () {
            let body = {};
            // let token = localStorage.getItem('web_refresh_token');
            let lastRefresh = Number(localStorage.getItem('web_refresh_token_last'));
            // if (token) {
                if (lastRefresh) {
                    if (Date.now() - lastRefresh < 1000 * 60 * 45) {
                        return;
                    }
                }

            //     body.token = token;
            // }
            $http({
                method: 'POST',
                url: 'https://account-api.mineskin.org/auth/tokens/web/refresh',
                withCredentials: true
            }).then(function (res) {
                if (res.status === 200) {
                    console.log("refreshed token");
                    // localStorage.setItem('web_refresh_token', res.data.refresh);

                    localStorage.setItem('web_refresh_token_last', `${Date.now()}`);

                    $timeout(function () {
                        $scope.checkGrants();
                    })
                } else if (res.status === 401) {
                    // localStorage.removeItem('web_refresh_token');
                }
            }).catch(err => {
                console.warn(err);
                // localStorage.removeItem('web_refresh_token');
            })
        })

        $http({
            method: 'GET',
            url: apiBaseUrl + '/account',
            withCredentials: true,
        }).then(res => {
            $timeout(function () {
                $scope.mineskinAccount = res.data;

                if (res.data.sessionTimeout) {
                    $scope.mineskinAccount?.$sessionTimer?.cancel();
                    $scope.mineskinAccount.$sessionTimer = $timeout(function () {
                        $scope.mineskinAccount = {};
                    }, res.data.sessionTimeout * 1000);
                }
            })
            if (cb) cb(res.data);
        }).catch(err => {
            console.warn(err);
            if (cb) cb(false);
        })

        const str = localStorage.getItem('g_user');
        if (str) {
            $timeout(function () {
                $scope.googleUser = JSON.parse(str);
            });
        }
    };
    $scope.mineskinGrants = undefined;
    $scope.checkGrants = function (cb) {
        if ($scope.mineskinGrants && cb) {
            cb($scope.mineskinGrants);
            return
        }
        if (window._mineskinGrants && cb) {
            $scope.mineskinGrants = window._mineskinGrants;
            cb(window._mineskinGrants);
            return;
        }
        $http({
            method: 'GET',
            url: 'https://account-api.mineskin.org/auth/tokens/web/grants',
            withCredentials: true
        }).then(function (res) {
            if (res.data?.grants) {
                $scope.mineskinGrants = res.data.grants;
                window._mineskinGrants = res.data.grants;
            }
            if (cb) cb(res.data.grants);
        }).catch(err => {
            $scope.minsekinGrants = {};
            console.warn(err);
            if (cb) cb({});
        })
    }
    $scope.checkGrants();

    $scope.googleSignedIn = function (data) {
        $timeout(function () {
            $http({
                method: 'POST',
                url: apiBaseUrl + '/account/google/callback',
                withCredentials: true,
                data: data
            }).then(function (res) {
                //location.reload();
            })
            // fetch('https://toast.api.mineskin.org/account/google/callback', {//TODO: url
            //     method: 'POST',
            //     credentials: 'include',
            //     cache: 'no-cache',
            //     referrerPolicy: 'origin-when-cross-origin',
            //     headers: {
            //         'Content-Type': 'application/json'
            //     },
            //     body: JSON.stringify(data)
            // })
            //     .then(res => res.json())
            //     .then(data => {
            //         window.mineskinAccount = data;
            //     });
        });

        try {
            const decoded = JSON.parse(atob(data.credential.split('.')[1]));
            console.log(decoded);
            const gUser = {
                name: decoded['preferred_name'] || decoded['given_name'] || decoded['name'],
                email: decoded['email'],
                picture: decoded['picture']
            };
            console.log(gUser)
            localStorage.setItem('g_user', JSON.stringify(gUser))
        } catch (e) {
            console.warn(e);
        }
    };
    // window.onGoogleSignedIn = $scope.googleSignedIn;

    $scope.visitCount = 0;
    $scope.stateCookie = {
        visits: 0
    };

    $scope.updateStateCookie = function () {
        if ($scope.stateCookie && $scope.stateCookie.visits > 0) {
            // save updated
            let now = new Date();
            let expires = new $window.Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
            $cookies.put("mineskin", btoa(JSON.stringify($scope.stateCookie)), {expires});
            return;
        }

        let stateCookie = $cookies.get("mineskin");
        if (stateCookie) {
            try {
                stateCookie = JSON.parse(atob(stateCookie));
                $scope.stateCookie = stateCookie;
            } catch (e) {
                console.warn(e);
                $scope.stateCookie = {};
                $scope.updateStateCookie();
            }
        }
    };
    $scope.updateStateCookie();


    $timeout(function () {
        // google.accounts.id.initialize({
        //     client_id: '352641379376-54jd29mpaorrk7bdvqh4qlll4a4n5g2b.apps.googleusercontent.com',
        //     auto_select: true,
        //     context: 'use',
        //     ux_mode: 'popup',
        //     callback: $scope.googleSignedIn
        // });

        $scope.checkAccount(function (account) {
            if (!account) {
                if ($scope.stateCookie.visits > 2) { // don't annoy them on the first visits
                    //google.accounts.id.prompt();
                }
            }
        });

        $scope.stateCookie.visits++;
        $scope.updateStateCookie();
    }, 500);

}]);
