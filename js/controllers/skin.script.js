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

    $scope.mineskinAccount = undefined;
    $scope.checkAccount = function (cb) {
        if ($scope.mineskinAccount && cb) {
            cb($scope.mineskinAccount);
            return;
        }
        $http({
            method: 'GET',
            url: apiBaseUrl + '/account',
            withCredentials: true,
        }).then(res => {
            $timeout(function () {
                $scope.mineskinAccount = res.data;
            })
            if (cb) cb(res.data);
        }).catch(err => {
            console.warn(err);
            if (cb) cb(false);
        })
    };

    $scope.googleSignedIn = function (data) {
        $timeout(function () {
            $http({
                method: 'POST',
                url: apiBaseUrl + '/account/google/callback',
                withCredentials: true,
                data: data
            }).then(function (res) {
                location.reload();
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
        })
    };
    // window.onGoogleSignedIn = $scope.googleSignedIn;


    $timeout(function () {
        google.accounts.id.initialize({
            client_id: '352641379376-54jd29mpaorrk7bdvqh4qlll4a4n5g2b.apps.googleusercontent.com',
            context: 'use',
            ux_mode: 'popup',
            callback: $scope.googleSignedIn
        });

        $scope.checkAccount(function (account) {
            if (!account) {
                google.accounts.id.prompt();
            }
        });
    }, 500);

}]);
