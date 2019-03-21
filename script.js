var apiBaseUrl = "https://api.mineskin.org";
var websiteBaseUrl = "https://mineskin.org";

var mineskinApp = angular.module("mineskinApp", ["ui.router", "ui.materialize", "ngFileUpload", "ngCookies", "angularModalService", "ngMeta", "ngStorage"]);

mineskinApp.directive("ngPreloadSrc", function () {
    return {
        restrict: "A",
        replace: true,
        link: function (scope, element, attrs) {
            var $preloader = $("<img style='display:none'>");
            $preloader.attr("src", attrs.ngPreloadSrc);
            $preloader.on("load", function () {
                element.attr("src", attrs.ngPreloadSrc);
                $preloader.remove();
            });
            $preloader.on("error", function () {
                if (attrs.ngPreloadFallback) {
                    element.attr("src", attrs.ngPreloadFallback);
                }
                $preloader.remove();
            });
            $preloader.appendTo(element);
        }
    }
});

// Based on https://gist.github.com/Shoen/6350967
mineskinApp.directive('twitter', ["$timeout",
    function ($timeout) {
        return {
            link: function (scope, element, attr) {
                $timeout(function () {
                    twttr.widgets.createShareButton(
                        attr.url,
                        element[0],
                        function (el) {
                        }, {
                            count: 'none',
                            text: attr.text
                        }
                    );
                });
            }
        }
    }
]);

mineskinApp.directive('selectOnClick', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            element.on('click', function () {
                this.select();
            });
        }
    };
});

mineskinApp.config(function ($stateProvider, $locationProvider, ngMetaProvider) {

    // $routeProvider
    //     .when("/", {
    //         templateUrl: "/pages/generate.html",
    //         controller: "generatorController"
    //     })
    //     .when("/gallery", {redirectTo: "/gallery/1"})
    //     .when("/gallery/:page?", {
    //         templateUrl: "/pages/gallery.html",
    //         controller: "galleryController"
    //     })
    //     .when("/stats", {
    //         templateUrl: "/pages/stats.html"
    //     })
    //     .when("/:id", {
    //         templateUrl: "/pages/view.html",
    //         controller: "viewController"
    //     });
    $stateProvider
        .state("index", {
            url: "/?generateUrl&generateName&generatePrivate&generateCallback",
            views: {
                'tab1': {
                    templateUrl: "/pages/generate.html",
                    controller: "indexController",
                }
            },
            data: {
                meta: {
                    title: "MineSkin - Custom Skin Generator",
                    titleSuffix: "",
                    image: "https://mineskin.org/favicon.png"
                }
            }
        })
        .state("index.stats", {
            url: "^/stats",
            onEnter: ["$state", "$stateParams", "ModalService", function ($state, $stateParams, ModalService) {
                ModalService.showModal({
                    templateUrl: "/pages/stats.html",
                    controller: ["$scope", "$http", "$interval", function ($scope, $http, $interval) {
                        $scope.refreshStats = function () {
                            $http({
                                url: apiBaseUrl + "/get/stats/details",
                                method: "GET"
                            }).then(function (response) {
                                $scope.stats = response.data;
                            });
                        }
                        $scope.refreshStats();
                        $interval(function () {
                            $scope.refreshStats();
                        }, 10000);
                    }]
                }).then(function (modal) {
                    modal.element.modal({
                        ready: function () {
                            console.log("ready");
                        },
                        complete: function () {
                            console.log("complete");
                            $(".modal").remove()
                            $state.go("^");
                        }
                    })
                    modal.element.modal("open");

                })
            }],
            data: {
                meta: {
                    title: "Stats",
                    image: "https://mineskin.org/favicon.png"
                }
            }
        })
        .state("gallery", {
            url: "/gallery/:page?query",
            params: {
                page: {value: "1"}
            },
            views: {
                'tab1': {},
                'tab2': {
                    templateUrl: "/pages/gallery.html",
                    controller: "galleryController"
                }
            },
            data: {
                meta: {
                    title: "Gallery",
                    image: "https://mineskin.org/favicon.png"
                }
            }
        })
        .state("gallery.view", {
            url: "^/{id:[0-9]{1,10}}",
            onEnter: ["$state", "$stateParams", "ModalService", "ngMeta", function ($state, $stateParams, ModalService, ngMeta) {
                console.info("onEnter");
                console.log($stateParams);
                if (!$stateParams.id) return;

                ModalService.showModal({
                    templateUrl: "/pages/view.html",
                    controller: "viewController",
                    inputs: {
                        '$stateParams': $stateParams
                    }
                }).then(function (modal) {
                    modal.element.modal({
                        ready: function () {
                            console.log("ready");
                        },
                        complete: function () {
                            console.log("complete");
                            $(".modal").remove()
                            $state.go("^");
                        }
                    })
                    modal.element.modal("open");

                })
            }],
            onExit: ["$state", function ($state) {
                console.info("onExit")
            }]
        })
        .state("account", {
            url: "/account",
            views: {
                'tab1': {
                    templateUrl: "/pages/account.html",
                    controller: "accountController"
                }
            },
            data: {
                meta: {
                    title: "Account",
                    image: "https://mineskin.org/favicon.png"
                }
            }
        })


    $locationProvider.html5Mode(true);


    ngMetaProvider.useTitleSuffix(true);
    ngMetaProvider.setDefaultTitleSuffix(" | MineSkin");
    ngMetaProvider.setDefaultTitle("MineSkin - Custom Skin Generator");
    ngMetaProvider.setDefaultTag("image", "https://mineskin.org/favicon.png");

});
mineskinApp.run(['$transitions', '$rootScope', 'ngMeta', function ($transitions, $rootScope, ngMeta) {
    // https://github.com/vinaygopinath/ngMeta/issues/36#issuecomment-311581385 -> https://github.com/vinaygopinath/ngMeta/issues/25#issuecomment-268954483
    $transitions.onFinish({}, function (trans) {
        $rootScope.$broadcast('$routeChangeSuccess', trans.to());
    });

    ngMeta.init()
}])

mineskinApp.controller("indexController", ["$scope", "Upload", "$state", "$http", "$timeout", "$interval", "$stateParams", "$localStorage", function ($scope, Upload, $state, $http, $timeout, $interval, $stateParams, $localStorage) {
    console.info("indexController")

    $scope.skinUpload = undefined;
    $scope.skinUrl = undefined;
    $scope.skinUser = undefined;

    $scope.privateUpload = false;
    $scope.skinName = "";
    $scope.skinModel = "steve";

    $scope.generating = false;
    $scope.generateAttempt = 0;

    $scope.materializeInit('tab1');

    $interval(function () {
        console.log($scope.windowFocused)
        if ($scope.windowFocused) {
            $scope.refreshStats();
        }
    }, 10000);

    $scope.generate = function () {
        console.log("  URL:");
        console.log($scope.skinUrl);

        console.log("  Upload:");
        console.log($scope.skinUpload);

        console.log("  User:");
        console.log($scope.skinUser);

        if ($scope.skinUrl) {
            $scope.generating = true;
            var genAlert = $scope.addAlert("Generating Skin from URL...", "info", 15000);
            setTimeout(function () {
                $http({
                    url: apiBaseUrl + "/generate/url?url=" + $scope.skinUrl + "&name=" + $scope.skinName + "&model=" + $scope.skinModel + "&visibility=" + ($scope.privateUpload ? 1 : 0),
                    method: "POST"
                }).then(function (response) {
                    console.log(response);
                    if (!response.data.error) {
                        $scope.generateSuccess(response.data, genAlert);
                    } else {
                        $scope.generateError(response.data.error, genAlert);
                    }
                }, function (response) {
                    console.log(response);
                    $scope.generateError(response.data.error, genAlert);
                });
            }, 500);
        } else if ($scope.skinUpload) {
            $scope.generating = true;
            var genAlert = $scope.addAlert("Uploading Skin...", "info", 15000);
            setTimeout(function () {
                Upload.upload({
                    url: apiBaseUrl + "/generate/upload?name=" + $scope.skinName + "&model=" + $scope.skinModel + "&visibility=" + ($scope.privateUpload ? 1 : 0),
                    method: "POST",
                    data: {file: $scope.skinUpload}
                }).then(function (response) {
                    console.log(response);
                    if (!response.data.error) {
                        $scope.generateSuccess(response.data, genAlert);
                    } else {
                        $scope.generateError(response.data.error, genAlert);
                    }
                }, function (response) {
                    console.log(response);
                    $scope.generateError(response.data.error, genAlert);
                });
            }, 500);
        } else if ($scope.skinUser) {
            $scope.generating = true;
            var skinUuid;

            function generateUser(uuid) {
                var genAlert = $scope.addAlert("Loading skin data...", "info", 15000);
                setTimeout(function () {
                    $http({
                        url: apiBaseUrl + "/generate/user/" + uuid + "?name=" + $scope.skinName + "&model=" + $scope.skinModel + "&visibility=" + ($scope.privateUpload ? 1 : 0),
                        method: "GET"
                    }).then(function (response) {
                        console.log(response);
                        if (!response.data.error) {
                            $scope.generateSuccess(response.data, genAlert);
                        } else {
                            $scope.generateError(response.data.error, genAlert);
                        }
                    }, function (response) {
                        console.log(response);
                        $scope.generateError(response.data.error, genAlert);
                    });
                }, 500);
            }

            if ($scope.skinUser.length > 16) {// Possibly a UUID
                if ((/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test($scope.skinUser)) || (/^[0-9a-f]{8}[0-9a-f]{4}[1-5][0-9a-f]{3}[89ab][0-9a-f]{3}[0-9a-f]{12}$/i.test($scope.skinUser))) {
                    skinUuid = $scope.skinUser;
                    generateUser(skinUuid);
                }
            } else {
                var validateAlert = $scope.addAlert("Validating Username...", "info", 10000);
                $.ajax({
                    url: apiBaseUrl + "/validate/user/" + $scope.skinUser,
                    success: function (data) {
                        if (data.valid) {
                            $scope.addAlert("Username is valid", "success", 1000);
                            skinUuid = data.uuid;
                            generateUser(skinUuid);
                        } else {
                            $scope.addAlert("Username is not valid", "danger", 10000);
                        }
                        validateAlert.close();
                    }
                });
            }
        }
    };
    $scope.generateSuccess = function (data, genAlert) {
        $scope.generating = false;
        $scope.generateAttempt = 0;
        var successAlert = $scope.addAlert("Skin Generated!", "success", 10000);
        if (genAlert) {
            genAlert.close();
        }

        setTimeout(function () {
            successAlert.close();

            var recentSkins = $localStorage.recentSkins;
            if (!recentSkins) recentSkins = [];
            recentSkins.unshift(data.id);
            if (recentSkins.length > 20) recentSkins.pop();
            $localStorage.recentSkins = recentSkins;

            if ($stateParams.generateCallback) {
                window.location = $stateParams.generateCallback.replace(":id", data.id);
            } else {
                $state.go("gallery.view", {id: data.id})
            }
        }, 1000);
    };
    $scope.generateError = function (message, genAlert) {
        // $scope.generating = false;
        $scope.generateAttempt++;
        $scope.addAlert("Failed to generate Skin: " + message, "danger", 2000);
        if (genAlert) {
            genAlert.close();
        }

        if ($scope.generateAttempt > 5) {
            $scope.generating = false;
            return;
        }
        $timeout(function () {
            Materialize.toast("Waiting 5 seconds and trying again...", 5000);
            $timeout(function () {
                $scope.generate();
            }, 7000 + ($scope.generatorDelay * 1000));
        }, 500);
    };

    if ($stateParams.generateName && $stateParams.generateName.length > 0) {
        $scope.skinName = $stateParams.generateName;
    }
    if ($stateParams.generatePrivate) {
        $scope.privateUpload = $stateParams.generatePrivate;
    }
    if ($stateParams.generateUrl && $stateParams.generateUrl.length > 0) {
        $scope.skinUrl = $stateParams.generateUrl;
        $scope.generate();
    }

    $scope.generatorTimeout = 0;
    $scope.generatorDelay = 0;

    $scope.refreshTimeout = function () {
        $.ajax({
            url: apiBaseUrl + "/get/delay",
            success: function (data) {
                $scope.generatorDelay = data.delay;
                $scope.generatorTimeout = data.nextRelative;

                if ($scope.generatorTimeout >= 0.1) {
                    $timeout($scope.refreshTimeout(), 1000);
                }
            }
        });
    };
}]);

mineskinApp.controller("galleryController", ["$scope", "$stateParams", "$http", "$cookies", "$window", "$state", "$timeout", "$sce", "ngMeta", "$localStorage", function ($scope, $stateParams, $http, $cookies, $window, $state, $timeout, $sce, ngMeta, $localStorage) {
    console.info("galleryController")

    $scope.materializeInit('tab2');

    $scope.$storage = $localStorage;

    // To keep track of reloads (new-loads), since the pagination seems to reset the route-param back to its default value
    var newLoad = true;

    $scope.searchQuery = $stateParams.query || "";
    $scope.searchTimeout = null;
    $scope.searchChanged = function () {
        if ($scope.searchTimeout) {
            $timeout.cancel($scope.searchTimeout);
        }
        $scope.searchTimeout = $timeout(function () {
            $state.transitionTo('gallery', {page: $stateParams.page, query: $scope.searchQuery}, {notify: false});
            $scope.reloadGallery();
        }, 500);
    };
    $scope.viewMode = parseInt($cookies.get("viewMode") || 0);// 0 = heads only; 1 = full skins
    $scope.resultType = $cookies.get("resultType");
    if ($scope.resultType == undefined) {
        $scope.resultType = "list";
    }
    $scope.toggleViewMode = function () {
        $scope.viewMode = 1 - $scope.viewMode;// Toggle 1/0

        if ($scope.viewMode === 1) {
            $scope.pagination.itemsPerPage = 12;
        } else {
            $scope.pagination.itemsPerPage = 32;
        }

        var now = new $window.Date();
        var expires = new $window.Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

        $cookies.put("viewMode", $scope.viewMode, {
            expires: expires
        });

        $state.reload();
    };
    $scope.resultTypeChanged = function () {
        var now = new $window.Date();
        var expires = new $window.Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

        $cookies.put("resultType", $scope.resultType, {
            expires: expires
        });

        $state.reload();
    };

    $scope.pagination = {
        page: 0,
        pages: 0,
        totalItems: 0,
        itemsPerPage: $scope.viewMode === 1 ? 12 : 32,
        maxSize: 4
    };
    $scope.skins = [];
    $scope.reloadGallery = function () {
        console.log("reload gallery #" + $scope.pagination.page);
        $scope.skins = [];
        $http({
            url: apiBaseUrl + "/get/" + $scope.resultType + "/" + $scope.pagination.page + "?size=" + $scope.pagination.itemsPerPage + ($scope.searchQuery ? "&filter=" + $scope.searchQuery : ""),
            method: "GET"
        }).then(function (response) {
            console.log(response);
            $timeout(function () {
                $scope.skins = response.data.skins;
                $scope.pagination.page = response.data.page.index;
                $scope.pagination.pages = response.data.page.amount;
                $scope.pagination.totalItems = response.data.page.total;
                newLoad = false;
            });
        });
    };
    $scope.galleryInit = function () {
        // Set page after init, so the pagination gets updated
        $scope.pagination.page = $stateParams.page;
        $scope.reloadGallery();
    };

    $scope.pageChanged = function (page) {
        $scope.pagination.page = page;
        $state.go('gallery', {page: $scope.pagination.page}, {notify: false});
    };
    $scope.getLastSkinCookie = function () {
        var id = $cookies.get("lastSkinId");
        if (!id) {
            var now = new $window.Date();
            var expires = new $window.Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

            $cookies.put("lastSkinId", "0", {
                expires: expires
            });
            return 0;
        }
        return id;
    };
}]);

mineskinApp.controller("viewController", ["$scope", "$http", "$cookies", "$timeout", "$stateParams", "$sce", "ngMeta", function ($scope, $http, $cookies, $timeout, $stateParams, $sce, ngMeta) {
    console.info("viewController")

    console.log($stateParams);

    $scope.useNewGiveCommand = true;
    $scope.skin = undefined;
    $scope.skinRotation = 35;
    $scope.skinImageLoaded = true;
//                $("#skinImage").off();
//                $("#skinImage").on("load",  function () {
//                    console.log("onLoad")
//                    $timeout(function () {
//                        console.log("skinImageLoaded")
//                        $scope.skinImageLoaded = true;
//                    })
//                });
    $http({
        url: apiBaseUrl + "/get/id/" + $stateParams.id,
        method: "GET"
    }).then(function (response) {
        $scope.skin = response.data;

        ngMeta.setTitle($scope.skin.name || "#" + $scope.skin.id);
        ngMeta.setTag("image", $sce.trustAsResourceUrl(apiBaseUrl + "/render/" + $scope.skin.id + "/head"));

        $timeout(function () {
            Materialize.updateTextFields();
            $("#giveCommand").trigger("autoresize");
            $("#javaGameProfile").trigger("autoresize");
        }, 100);
    });
}])

mineskinApp.controller("accountController", ["$scope", "$http", "$cookies", "$timeout", "$stateParams", "$sce", "ngMeta", function ($scope, $http, $cookies, $timeout, $stateParams, $sce, ngMeta) {
    console.info("accountController")

    $scope.username = "";
    $scope.password = "";
    $scope.token = "";
    $scope.securityAnswer = "";
    $scope.uuid = "";
    $scope.user;
    $scope.userProfile;
    $scope.myAccount;

    $scope.loggedIn = false;
    $scope.challengesSolved = false;
    $scope.accountExists = false;
    $scope.accountEnabled = false;
    $scope.accountAdded = false;

    $scope.doLogin = function () {
        if (!$scope.username || !$scope.password) return;

        $http({
            url: apiBaseUrl + "/accountManager/auth/login?t="+Date.now(),
            method: "POST",
            data: {
                username: $scope.username,
                password: btoa($scope.password)
            }
        }).then(function (response) {
            if (response.data.error) {
                Materialize.toast("Error: " + (response.data.errorMessage || response.data.msg || response.data.error));
                return;
            }
            if (response.data.success) {
                $scope.token = response.data.token;
                $scope.loggedIn = true;
            }
        }, function (response) {
            console.log(response);
            if (response.data.error) {
                Materialize.toast("Error: " + (response.data.errorMessage || response.data.msg || response.data.error));
            }
        });
    }

    $scope.solveChallenges = function () {
        if (!$scope.username || !$scope.password || !$scope.securityAnswer || !$scope.token || !$scope.loggedIn) return;

        $http({
            url: apiBaseUrl + "/accountManager/auth/solveChallenges?t="+Date.now(),
            method: "POST",
            data: {
                token: $scope.token,
                securityAnswer: $scope.securityAnswer
            }
        }).then(function (response) {
            if (response.data.error || !response.data.success) {
                Materialize.toast("Error: " + (response.data.errorMessage || response.data.msg || response.data.error));
                return;
            }
            if (response.data.success) {
                $scope.challengesSolved = true;

                $scope.getUser();
                $scope.getUserProfile();
            }
        }, function (response) {
            console.log(response);
            if (response.data.error) {
                Materialize.toast("Error: " + (response.data.errorMessage || response.data.msg || response.data.error));
            }
        });
    };
    $scope.skipChallenges = function () {
        $scope.challengesSolved = true;

        $scope.getUser();
        $scope.getUserProfile();
    }

    $scope.getUser = function () {
        $http({
            url: apiBaseUrl + "/accountManager/auth/user?token=" + $scope.token,
            method: "GET",
        }).then(function (response) {
            if (response.data.error) {
                Materialize.toast("Error: " + (response.data.errorMessage || response.data.msg || response.data.error));
                return;
            }
            $scope.user = response.data;
        }, function (response) {
            console.log(response);
            if (response.data.error) {
                Materialize.toast("Error: " + (response.data.errorMessage || response.data.msg || response.data.error));
            }
        });
    }

    $scope.getUserProfile = function () {
        $http({
            url: apiBaseUrl + "/accountManager/auth/userProfile?token=" + $scope.token,
            method: "GET"
        }).then(function (response) {
            if (response.data.error) {
                Materialize.toast("Error: " + (response.data.errorMessage || response.data.msg || response.data.error));
                return;
            }
            $scope.userProfile = response.data;
            $scope.uuid = response.data.uuid;

            $scope.accountStatus();
        }, function (response) {
            console.log(response);
            if (response.data.error) {
                Materialize.toast("Error: " + (response.data.errorMessage || response.data.msg || response.data.error));
            }
        });
    }

    $scope.accountStatus = function () {
        $http({
            url: apiBaseUrl + "/accountManager/accountStatus?username=" + $scope.username + "&uuid=" + $scope.uuid,
            method: "GET"
        }).then(function (response) {
            if (response.data.error) {
                Materialize.toast("Error: " + (response.data.errorMessage || response.data.msg || response.data.error));
                return;
            }
            $scope.accountExists = response.data.exists;
            $scope.accountEnabled = response.data.exists && response.data.enabled;

            if (response.data.exists) {
                $scope.getAccount();
            }
        }, function (response) {
            console.log(response);
            if (response.data.error) {
                Materialize.toast("Error: " + (response.data.errorMessage || response.data.msg || response.data.error));
            }
        });
    };

    $scope.getAccount = function () {
        $http({
            url: apiBaseUrl + "/accountManager/myAccount?username=" + $scope.username + "&token=" + $scope.token,
            method: "GET"
        }).then(function (response) {
            if (response.data.error) {
                Materialize.toast("Error: " + (response.data.errorMessage || response.data.msg || response.data.error));
                return;
            }
            $scope.myAccount = response.data;
        }, function (response) {
            console.log(response);
            if (response.data.error) {
                Materialize.toast("Error: " + (response.data.errorMessage || response.data.msg || response.data.error));
            }
        });
    };

    $scope.submitAccount = function () {
        $http({
            url: apiBaseUrl + "/accountManager/confirmAccountSubmission",
            method: "POST",
            data: {
                token: $scope.token,
                username: $scope.username,
                password: $scope.password,
                uuid: $scope.uuid,
                securityAnswer: $scope.securityAnswer
            }
        }).then(function (response) {
            if (response.data.error) {
                Materialize.toast("Error: " + (response.data.errorMessage || response.data.msg || response.data.error));
                return;
            }
            if (response.data.success) {
                $scope.accountAdded = true;
            }
        }, function (response) {
            console.log(response);
            if (response.data.error) {
                Materialize.toast("Error: " + (response.data.errorMessage || response.data.msg || response.data.error));
            }
        });
    }

    $scope.enableAccount = function () {
        $scope.updateAccountStatus(true)
    }

    $scope.disableAccount = function () {
        $scope.updateAccountStatus(false)
    }

    $scope.updateAccountStatus = function (enabled) {
        $http({
            url: apiBaseUrl + "/accountManager/settings/status",
            method: "POST",
            data: {
                token: $scope.token,
                username: $scope.username,
                enabled: enabled
            }
        }).then(function (response) {
            if (response.data.error) {
                Materialize.toast("Error: " + (response.data.errorMessage || response.data.msg || response.data.error));
                return;
            }
            if (response.data.success) {
                $scope.accountEnabled = response.data.enabled;
            }
        }, function (response) {
            console.log(response);
            if (response.data.error) {
                Materialize.toast("Error: " + (response.data.errorMessage || response.data.msg || response.data.error));
            }
        });
    }

    $scope.deleteAccount = function () {
        if (confirm("Are you sure you want to delete the account?")) {
            $http({
                url: apiBaseUrl + "/accountManager/deleteAccount",
                method: "POST",
                data: {
                    token: $scope.token,
                    username: $scope.username,
                    uuid: $scope.uuid
                }
            }).then(function (response) {
                if (response.data.error) {
                    Materialize.toast("Error: " + (response.data.errorMessage || response.data.msg || response.data.error));
                    return;
                }
                if (response.data.success) {
                    Materialize.toast("Account deleted.", 900);
                    setTimeout(function () {
                        location.reload();
                    }, 1000);
                }
            }, function (response) {
                console.log(response);
                if (response.data.error) {
                    Materialize.toast("Error: " + (response.data.errorMessage || response.data.msg || response.data.error));
                }
            });
        }
    }

}])

mineskinApp.controller("skinController", ["$scope", "$timeout", "$http", "$state", "$cookies", function ($scope, $timeout, $http, $state, $cookies) {
    apiBaseUrl = $cookies.get("apiBaseUrl") || apiBaseUrl;

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
        var statsUrl = apiBaseUrl + "/get/stats";
        if (details) {
            statsUrl += "/details";
        }
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
    $scope.onfocus = function () {
        $scope.windowFocused = true;
    };
    $scope.onblur = function () {
        $scope.windowFocused = false;
    };
    /* -Stats */

    $scope.browser = {
        isFirefox: function () {
            return (navigator.userAgent.indexOf('Firefox') > -1);
        }
    };

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
            $('select').material_select();
            $('.tooltipped').tooltip();
            $('ul.tabs').tabs();
//                        $('ul.tabs').tabs("select_tab",tab);
            // 'select_tab' doesn't work, because ui-sref replaces the href attribute
            $("#" + tab + "-trigger").trigger("click");
            Materialize.updateTextFields();
        }, 100);
    };
}]);