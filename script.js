var apiBaseUrl = "https://api.mineskin.org";


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

// based on https://www.javainuse.com/angular/angular2_adsense
mineskinApp.directive('googleAd', ['$timeout',
    function ($timeout) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                console.log(attrs);
                return $timeout(function () {
                    element.append("<ins class=\"adsbygoogle\" style=\"display:block\" data-ad-client=\"ca-pub-2604356629473365\" data-ad-slot=\"" + (attrs.googleAd || '7160666614') + "\" data-ad-format=\"auto\" data-full-width-responsive=\"true\"></ins>");
                    return (adsbygoogle = window.adsbygoogle || []).push({});
                })
            }
        }
    }
]);

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
        .state("bulk", {
            url: "/bulk",
            views: {
                'tab1': {
                    templateUrl: "/pages/generate_bulk.html",
                    controller: "bulkController",
                }
            },
            data: {
                meta: {
                    title: "Generate Bulk | MineSkin",
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
                                url: apiBaseUrl + "/get/stats",
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
    /**@deprecated**/
    $scope.skinModel = "steve";
    $scope.skinVariant = "";

    $scope.generating = false;
    $scope.generateSeconds = 0;
    $scope.generateTimer = null;
    $scope.generateProgress = 0;
    $scope.generateAttempt = 0;

    $scope.$storage = $localStorage;

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

        let avgGenSeconds = Math.round($scope.stats.avgGenerateDuration / 1000);
        $interval.cancel($scope.generateTimer);
        $scope.generateTimer = $interval(function () {
            $scope.generateProgress = ($scope.generateSeconds++) / avgGenSeconds * 100;
        }, 1000);

        if ($scope.skinUrl) {
            $scope.generating = true;
            $scope.generateProgress = 0;
            let genAlert = $scope.addAlert("Generating Skin from URL...", "info", 15000);
            setTimeout(function () {
                $http({
                    url: apiBaseUrl + "/generate/url",
                    method: "POST",
                    data: {
                        url: $scope.skinUrl,
                        name: $scope.skinName,
                        variant: $scope.skinVariant,
                        visibility: $scope.privateUpload ? 1 : 0
                    }
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
            $scope.generateProgress = 0;
            let genAlert = $scope.addAlert("Uploading Skin...", "info", 15000);
            setTimeout(function () {
                Upload.upload({
                    url: apiBaseUrl + "/generate/upload",
                    method: "POST",
                    data: {
                        file: $scope.skinUpload,
                        name: $scope.skinName,
                        variant: $scope.skinVariant,
                        visibility: $scope.privateUpload ? 1 : 0
                    }
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
            $scope.generateProgress = 0;
            let skinUuid;

            function generateUser(uuid) {
                let genAlert = $scope.addAlert("Loading skin data...", "info", 15000);
                setTimeout(function () {
                    $http({
                        url: apiBaseUrl + "/generate/user",
                        method: "POST",
                        data: {
                            uuid: uuid,
                            name: $scope.skinName,
                            variant: $scope.skinVariant,
                            visibility: $scope.privateUpload ? 1 : 0
                        }
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
                let validateAlert = $scope.addAlert("Validating Username...", "info", 10000);
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
        $interval.cancel($scope.generateTimer);
        $scope.generating = false;
        $scope.generateProgress = 100;
        $scope.generateAttempt = 0;
        var successAlert = $scope.addAlert("Skin Generated!", "success", 10000);
        if (genAlert) {
            genAlert.close();
        }

        setTimeout(function () {
            successAlert.close();

            var recentSkins = $scope.$storage.recentSkins;
            if (!recentSkins) recentSkins = [];
            recentSkins.unshift(data.id);
            if (recentSkins.length > 20) recentSkins.pop();
            $scope.$storage.recentSkins = recentSkins;

            if ($stateParams.generateCallback) {
                window.location = $stateParams.generateCallback.replace(":id", data.id);
            } else {
                $state.go("gallery.view", {id: data.id})
            }
        }, 1500);
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

mineskinApp.controller("bulkController", ["$scope", "Upload", "$state", "$http", "$timeout", "$interval", "$stateParams", "$localStorage", function ($scope, Upload, $state, $http, $timeout, $interval, $stateParams, $localStorage) {
    console.info("bulkController")

    let skinObjTemplate = {
        upload: undefined,
        url: undefined,
        user: undefined,
        privateUpload: false,
        skinName: "",
        skinModel: "steve"
    }

    $scope.skins = [
        Object.assign({}, skinObjTemplate)
    ];

    $scope.global = {
        privateUpload: false,
        upload: undefined,
        skinName: "",
        skinModel: "steve",
        skinVariant: ""
    };

    $scope.addFromGlobal = function () {
        console.log($scope.global);

        let toAddBase = Object.assign({}, skinObjTemplate); // clone
        toAddBase.privateUpload = $scope.global.privateUpload;
        toAddBase.skinName = $scope.global.skinName;
        toAddBase.skinModel = $scope.global.skinModel;
        toAddBase.skinVariant = $scope.global.skinVariant;

        for (let upload of $scope.global.upload) {
            let toAdd = Object.assign({}, toAddBase); // clone
            toAdd.upload = upload;
            $scope.skins.push(toAdd);
        }

        $scope.materializeInit("tab1");
    }

    $scope.addSkinInput = function () {
        let last = $scope.skins[$scope.skins.length - 1];
        let toAdd = Object.assign({}, skinObjTemplate); // clone
        if (last) {
            toAdd.privateUpload = last.privateUpload;
            toAdd.skinModel = last.skinModel;
        }
        $scope.skins.push(toAdd);
        $scope.materializeInit("tab1");
    }

    $scope.removeSkinInput = function (index) {
        $scope.skins.splice(index, 1);
    }

    $scope.generating = false;
    $scope.finished = false;
    $scope.generateSeconds = 0;
    $scope.generateTimer = null;
    $scope.generateInterval = null;
    $scope.generateProgress = 0;
    $scope.generateAttempt = 0;
    $scope.generateEstimateMinutes = 0;
    $scope.successCount = 0;
    $scope.errorCount = 0;

    $scope.$storage = $localStorage;

    $scope.materializeInit('tab1');

    ///TODO

    $scope.startGenerate = function () {
        if ($scope.generating) return;
        $scope.generating = true;
        window.onbeforeunload = function (e) {
            return 'Skins are still being generated, are you sure you want to leave?';
        };
        console.log($scope.skins);

        $scope.generateEstimateMinutes = Math.round((15 * $scope.skins.length / 60) * 10) / 10;

        $scope.tryGenerateNext(0);
    }

    $scope.tryGenerateNext = function (nextIndex) {
        $scope.generateProgress = nextIndex / $scope.skins.length * 100;
        if (nextIndex >= $scope.skins.length) {
            $scope.onFinished();
        } else {
            let delay = Math.max(4, $scope.generatorDelay) * ((1700 + (Math.random() * 1000)) + (Math.random() * 1000));
            console.log("Will generate skin #" + (nextIndex + 1) + " in " + delay + "ms");
            let nextSkin = $scope.skins[nextIndex];
            $scope.generateInterval = $timeout(function () {
                nextSkin.info = {};
                if (!nextSkin.generateAttempt) nextSkin.generateAttempt = 0;
                $scope.generateNext(nextSkin, function (err, data, doNotRetry) {
                    let success = !err && data;

                    nextSkin.info.data = data;
                    nextSkin.info.error = err;

                    if (success) {
                        $scope.successCount++;
                        var recentSkins = $scope.$storage.recentSkins;
                        if (!recentSkins) recentSkins = [];
                        recentSkins.unshift(data.id);
                        if (recentSkins.length > 50) recentSkins.pop();
                        $scope.$storage.recentSkins = recentSkins;

                        $scope.tryGenerateNext(nextIndex + 1);
                    } else {
                        if (!doNotRetry && nextSkin.generateAttempt++ < 3) {
                            $scope.tryGenerateNext(nextIndex);//try again
                        } else {
                            //skip
                            $scope.tryGenerateNext(nextIndex + 1);
                            $scope.errorCount++;
                        }
                    }
                })
            }, delay);
        }
    }

    $scope.onFinished = function () {
        //TODO
        $scope.generating = false;
        $scope.finished = true;
        console.log("Finished!");
        window.onbeforeunload = null;
    }

    $scope.generateNext = function (skin, cb) {
        console.log("  URL:");
        console.log(skin.url);

        console.log("  Upload:");
        console.log(skin.upload);

        console.log("  User:");
        console.log(skin.user);

        if (!skin.url && !skin.upload && !skin.user) {
            cb("no skin selected", null, true);
            // just skip it
            return;
        }

        if (skin.url) {
            setTimeout(function () {
                $http({
                    url: apiBaseUrl + "/generate/url",
                    method: "POST",
                    data: {
                        url: skin.url,
                        name: skin.skinName,
                        model: skin.skinModel,
                        variant: skin.skinVariant,
                        visibility: skin.privateUpload ? 1 : 0
                    }
                }).then(function (response) {
                    console.log(response);
                    if (!response.data.error) {
                        cb(null, response.data);
                    } else {
                        cb(response.data.error, null);
                    }
                }, function (response) {
                    console.log(response);
                    cb(response.data.error, null);
                });
            }, 500);
        } else if (skin.upload) {
            setTimeout(function () {
                Upload.upload({
                    url: apiBaseUrl + "/generate/upload",
                    method: "POST",
                    data: {
                        file: skin.upload,
                        name: skin.skinName,
                        model: skin.skinModel,
                        variant: skin.skinVariant,
                        visibility: skin.privateUpload ? 1 : 0
                    }
                }).then(function (response) {
                    console.log(response);
                    if (!response.data.error) {
                        cb(null, response.data);
                    } else {
                        cb(response.data.error, null);
                    }
                }, function (response) {
                    console.log(response);
                    cb(response.data.error, null);
                });
            }, 500);
        } else if (skin.user) {
            let skinUuid;

            function generateUser(uuid) {
                setTimeout(function () {
                    $http({
                        url: apiBaseUrl + "/generate/user",
                        method: "POST",
                        data: {
                            uuid: uuid,
                            name: skin.skinName,
                            model: skin.skinModel,
                            variant: skin.skinVariant,
                            visibility: skin.privateUpload ? 1 : 0
                        }
                    }).then(function (response) {
                        console.log(response);
                        if (!response.data.error) {
                            cb(null, response.data);
                        } else {
                            cb(response.data.error, null);
                        }
                    }, function (response) {
                        console.log(response);
                        cb(response.data.error, null);
                    });
                }, 500);
            }

            if (skin.user.length > 16) {// Possibly a UUID
                if ((/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(skin.user)) || (/^[0-9a-f]{8}[0-9a-f]{4}[1-5][0-9a-f]{3}[89ab][0-9a-f]{3}[0-9a-f]{12}$/i.test(skin.user))) {
                    skinUuid = $scope.skinUser;
                    generateUser(skinUuid);
                } else {
                    cb("invalid uuid", null, true);
                }
            } else {
                let validateAlert = $scope.addAlert("Validating Username...", "info", 10000);
                $.ajax({
                    url: apiBaseUrl + "/validate/user/" + skin.user,
                    success: function (data) {
                        if (data.valid) {
                            $scope.addAlert("Username is valid", "success", 1000);
                            skinUuid = data.uuid;
                            generateUser(skinUuid);
                        } else {
                            $scope.addAlert("Username is not valid", "danger", 10000);
                            cb("invalid email", null, true);
                        }
                        validateAlert.close();
                    }
                });
            }
        }
    };


    $scope.generatorTimeout = 0;
    $scope.generatorDelay = 0;

    $scope.refreshTimeout = function () {
        $.ajax({
            url: apiBaseUrl + "/get/delay",
            success: function (data) {
                $scope.generatorDelay = data.delay;
                $scope.generatorTimeout = data.nextRelative;

                if ($scope.generatorTimeout >= 0.1) {
                    $timeout($scope.refreshTimeout(), 10000);
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
            $scope.pagination.itemsPerPage = 28;
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

    materializeBaseInit();

    $scope.giveCommandVersion = "1_13";
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

        // 1.16 UUID format support
        $scope.skin.data.uuidAsArray = formatInt32UUID(getInt32ForUUID($scope.skin.data.uuid));

        ngMeta.setTitle($scope.skin.name || "#" + $scope.skin.id);
        ngMeta.setTag("image", $sce.trustAsResourceUrl(apiBaseUrl + "/render/" + $scope.skin.id + "/head"));

        $timeout(function () {
            materializeBaseInit();
            $("#giveCommand").trigger("autoresize");
            $("#javaGameProfile").trigger("autoresize");
        }, 100);
    });
}])

mineskinApp.controller("accountController", ["$scope", "$http", "$cookies", "$timeout", "$stateParams", "$sce", "ngMeta", "$window", function ($scope, $http, $cookies, $timeout, $stateParams, $sce, ngMeta, $window) {
    console.info("accountController")

    // Login

    $scope.email = "";
    $scope.password = "";

    $scope.accountServer = "";

    $scope.loggingIn = false;
    $scope.loggedIn = false;
    $scope.token = "";
    $scope.loginProfile = {};

    // Challenges

    $scope.securityQuestions = [];
    $scope.securityAnswers = [];
    $scope.needToSolveChallenges = true;
    $scope.challengesSolved = false;
    $scope.skipSecurityChallenges = false;

    // Profile

    $scope.uuid = "";
    $scope.userProfile;
    $scope.myAccount;

    $scope.accountExists = false;
    $scope.accountEnabled = false;
    $scope.accountAdded = false;
    $scope.accountLinkedToDiscord = false;
    $scope.sendAccountEmails = false;

    $scope.loginWithMicrosoft = false;

    $scope.checkUnderstoodLogin = false;
    $scope.checkReadTerms = false;
    $scope.checkAcceptSkins = false;
    $scope.checkAcceptPassword = false;

    // Temp thing for testing
    // TODO: add switch to page for properly switching account type
    window.useMicrosoftLogin = function () {
        $timeout(function () {
            $scope.loginWithMicrosoft = true;
        }, 1);
    };
    window.__scope = $scope;

    window.forceAccountServer = function (server) {
        $scope.accountServer = {
            server: server,
            host: `${ server }.api.mineskin.org`
        }
    };

    //// MOJANG

    $scope.loginMojang = function () {
        if (!$scope.email || !$scope.password) return;

        $scope.loggingIn = true;
        Materialize.toast("Logging in via Mojang...");

        $scope.getPreferredAccountServer(accountServer => {
            $http({
                method: "POST",
                url: `https://${ accountServer.host }/accountManager/mojang/login?t=${ Date.now() }`,
                withCredentials: true,
                data: {
                    email: $scope.email,
                    password: btoa($scope.password)
                }
            }).then(loginResponse => {
                if (loginResponse.data["error"] || !loginResponse.data["success"]) {
                    $scope.handleResponseError(loginResponse);
                    return;
                }

                $scope.token = loginResponse.data["token"];
                $scope.loginProfile = loginResponse.data["profile"];
                $scope.loggedIn = true;
                $scope.loggingIn = false;

                $scope.getMojangChallenges();
            }).catch(response => $scope.handleResponseError(response));
        });
    };

    $scope.getMojangChallenges = function () {
        if (!$scope.token || !$scope.loggedIn) return;

        $scope.getPreferredAccountServer(accountServer => {

            $http({
                method: "POST",
                url: `https://${ accountServer.host }/accountManager/mojang/getChallenges`,
                withCredentials: true,
                headers: {
                    "Authorization": `Bearer ${ $scope.token }`
                }
            }).then(challengesResponse => {
                if (challengesResponse.data["error"] || !challengesResponse.data["success"]) {
                    $scope.handleResponseError(challengesResponse);
                    return;
                }

                $scope.needToSolveChallenges = challengesResponse.data["needToSolveChallenges"];
                $scope.securityQuestions = challengesResponse.data["questions"];

                if (!$scope.needToSolveChallenges) {
                    $scope.skipMojangChallenges();
                }
            }).catch(response => $scope.handleResponseError(response));

        })
    };

    $scope.solveMojangChallenges = function () {
        if (!$scope.token || !$scope.loggedIn) return;

        for (let i = 0; i < $scope.securityQuestions.length; i++) {
            $scope.securityAnswers[i] = $scope.securityQuestions[i].answer;
        }

        $scope.getPreferredAccountServer(accountServer => {
            $http({
                method: "POST",
                url: `https://${ accountServer.host }/accountManager/mojang/solveChallenges`,
                withCredentials: true,
                headers: {
                    "Authorization": `Bearer ${ $scope.token }`
                },
                data: {
                    securityAnswers: $scope.securityAnswers
                }
            }).then(solveResponse => {
                if (solveResponse.data["error"] || !solveResponse.data["success"]) {
                    $scope.handleResponseError(solveResponse);
                    return;
                }

                $scope.challengesSolved = true;
                $scope.getUserProfile();
            }).catch(response => $scope.handleResponseError(response));
        })
    };

    $scope.skipMojangChallenges = function () {
        $scope.challengesSolved = true;
        $scope.skipSecurityChallenges = true;

        $scope.getUserProfile();
    }

    //// MICROSOFT

    $scope.loginMicrosoft = function () {
        if (!$scope.email || !$scope.password) return;

        $scope.loggingIn = true;
        Materialize.toast("Logging in via Microsoft...");

        $scope.getPreferredAccountServer(accountServer => {
            $http({
                method: "POST",
                url: `https://${ accountServer.host }/accountManager/microsoft/login?t=${ Date.now() }`,
                withCredentials: true,
                data: {
                    email: $scope.email,
                    password: btoa($scope.password)
                }
            }).then(loginResponse => {
                if (loginResponse.data["error"] || !loginResponse.data["success"]) {
                    $scope.handleResponseError(loginResponse);
                    return;
                }

                $scope.token = loginResponse.data["token"];
                $scope.loggedIn = true;
                $scope.loggingIn = false;

                $scope.getUserProfile();
            }).catch(response => $scope.handleResponseError(response));
        });
    };

    //// INDEPENDENT STUFF

    $scope.doLogin = function () {
        if ($scope.loginWithMicrosoft) {
            $scope.loginMicrosoft();
        } else {
            $scope.loginMojang();
        }
        $timeout(function () {
            $scope.loggingIn = false;
        }, 20000);
    };

    $scope.getPreferredAccountServer = function (cb) {
        if ($scope.accountServer && $scope.accountServer.host) {
            cb($scope.accountServer);
            return;
        }
        $http({
            method: "GET",
            url: apiBaseUrl + "/accountManager/preferredAccountServer"
        }).then(function (response) {
            $scope.accountServer = response.data;
            console.log("Using account server " + JSON.stringify(response.data));
            cb($scope.accountServer);
        });
    };

    $scope.logout = function () {
        $http({
            method: "POST",
            url: `https://${ $scope.accountServer ? $scope.accountServer.host : 'api.mineskin.org' }/accountManager/logout`,
            withCredentials: true,
        }).then(logoutResponse => {
            $scope.loggedIn = false;
            $scope.accountServer = undefined;
            window.location.reload();
        })
    };

    $scope.getUserProfile = function () {
        if (!$scope.loggedIn || !$scope.token) return;

        $scope.getPreferredAccountServer(accountServer => {
            $http({
                method: "POST",
                url: `https://${ accountServer.host }/accountManager/userProfile`,
                withCredentials: true,
                headers: {
                    "Authorization": `Bearer ${ $scope.token }`
                }
            }).then(profileResponse => {
                if (profileResponse.data["error"]) {
                    $scope.handleResponseError(profileResponse);
                    return;
                }

                $scope.uuid = profileResponse.data.id;
                $scope.userProfile = profileResponse.data;

                $scope.getAccount();
            }).catch(response => $scope.handleResponseError(response));
        })
    };

    $scope.getAccount = function () {
        if (!$scope.loggedIn || !$scope.token || !$scope.uuid) return;

        $scope.getPreferredAccountServer(accountServer => {
            let data = {
                uuid: $scope.uuid,
                email: $scope.email
            };
            if ($scope.password) {
                data.password = btoa($scope.password)
            }
            if ($scope.securityAnswers) {
                data.securityAnswers = $scope.securityAnswers;
            }
            $http({
                method: "POST",
                url: `https://${ accountServer.host }/accountManager/myAccount`,
                withCredentials: true,
                headers: {
                    "Authorization": `Bearer ${ $scope.token }`
                },
                data: data
            }).then(accountResponse => {
                if (accountResponse.data["error"]) {
                    if (accountResponse.status === 404) {
                        // account does not exist
                        $scope.accountExists = false;
                    } else {
                        $scope.handleResponseError(accountResponse);
                    }
                    return;
                }

                $scope.myAccount = accountResponse.data;
                $scope.accountExists = true;
                $scope.accountEnabled = accountResponse.data.settings.enabled || accountResponse.data.enabled;
                $scope.accountLinkedToDiscord = accountResponse.data.discordLinked;
                $scope.sendAccountEmails = accountResponse.data.settings.emails || accountResponse.data.sendEmails;
            }).catch(response => {
                if (response.status === 404) {
                    // account does not exist
                    $scope.accountExists = false;
                } else {
                    $scope.handleResponseError(response)
                }
            });
        });
    };

    $scope.submitAccount = function () {
        if (!$scope.loggedIn || !$scope.token || !$scope.uuid || !$scope.password) return;

        $scope.getPreferredAccountServer(accountServer => {
            let data = {
                email: $scope.email,
                password: btoa($scope.password),
                uuid: $scope.uuid,

                securityAnswers: $scope.securityAnswers,

                checks: {
                    readTerms: $scope.checkReadTerms,
                    acceptSkins: $scope.checkAcceptSkins,
                    acceptPassword: $scope.checkAcceptPassword
                }
            };
            $http({
                method: "POST",
                url: `https://${ accountServer.host }/accountManager/confirmAccountSubmission`,
                withCredentials: true,
                headers: {
                    "Authorization": `Bearer ${ $scope.token }`
                },
                data: data
            }).then(submitResponse => {
                if (submitResponse.data["error"] || !submitResponse.data["success"]) {
                    $scope.handleResponseError(submitResponse);
                    return;
                }

                $scope.accountAdded = true;
                Materialize.toast(submitResponse.data.msg);
            }).catch(response => $scope.handleResponseError(response));
        });
    };

    $scope.updateAccountSetting = function (setting, key, value, cb) {
        if (!$scope.loggedIn || !$scope.token || !$scope.uuid || !$scope.email) return;
        let data = {
            email: $scope.email,
            uuid: $scope.uuid
        };
        data[key] = value;
        $http({
            method: "PUT",
            url: `https://${ $scope.accountServer ? $scope.accountServer.host : 'api.mineskin.org' }/accountManager/settings/${ setting }`,
            withCredentials: true,
            headers: {
                "Authorization": `Bearer ${ $scope.token }`
            },
            data: data
        }).then(settingResponse => {
            if (settingResponse.data["error"] || !settingResponse.data["success"]) {
                $scope.handleResponseError(settingResponse);
                if (cb) {
                    cb(undefined/*new value*/, false/*updated*/);
                }
                return;
            }

            if (cb) {
                cb(value/*new value*/, settingResponse.data["success"]/*updated*/);
            }
        }).catch(response => $scope.handleResponseError(response));
    };

    $scope.enableAccount = function () {
        $scope.updateAccountSetting('status', 'enabled', true, (v, u) => {
            $scope.accountEnabled = typeof v !== "undefined" ? v : $scope.accountEnabled;
        });
    };

    $scope.disableAccount = function () {
        $scope.updateAccountSetting('status', 'enabled', false, (v, u) => {
            $scope.accountEnabled = typeof v !== "undefined" ? v : $scope.accountEnabled;
        });
    };

    $scope.linkDiscord = function () {
        if (!$scope.loggedIn || !$scope.token || !$scope.uuid) return;
        $window.open(`https://${ $scope.accountServer ? $scope.accountServer.host : 'api.mineskin.org' }/accountManager/discord/oauth/start?email=${ $scope.email }&uuid=${ $scope.uuid }`, "_blank");
    };

    $scope.deleteAccount = function () {
        if (!$scope.loggedIn || !$scope.token || !$scope.uuid || !$scope.accountExists || $scope.accountEnabled) return;

        $http({
            method: "DELETE",
            url: `https://${ $scope.accountServer ? $scope.accountServer.host : 'api.mineskin.org' }/accountManager/deleteAccount`,
            withCredentials: true,
            headers: {
                "Authorization": `Bearer ${ $scope.token }`
            },
            data: {
                email: $scope.email,
                uuid: $scope.uuid
            }
        }).then(deleteResponse => {
            if (deleteResponse.data["error"] || !deleteResponse.data["success"]) {
                $scope.handleResponseError(deleteResponse);
                return;
            }

            $scope.accountAdded = false;
            $scope.accountExists = false;
            Materialize.toast(deleteResponse.data.msg);
            setTimeout(() => {
                window.location.reload();
            });
        }).catch(response => $scope.handleResponseError(response));
    };

    /// UTIL

    $scope.handleResponseError = function (response) {
        if (response.data) {
            console.warn(response.data);
            Materialize.toast("Error: " + (response.data.msg || response.data.error));
        } else {
            console.warn(response.data);
        }
    }

}])

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
}]);

function materializeBaseInit() {
    $('select').material_select();
    // https://stackoverflow.com/a/56725559/6257838
    document.querySelectorAll('.select-wrapper').forEach(t => t.addEventListener('click', e => e.stopPropagation()))
    $('.tooltipped').tooltip();
    Materialize.updateTextFields();
}

//// https://github.com/MineSkin/mineskin.org/issues/13 by @SpraxDev
const uuidView = new DataView(new ArrayBuffer(16));

/**
 * Takes an UUID and converts it into four int32
 *
 * @param {string} uuid Valid UUID (with or without hyphens)
 *
 * @returns {number[]}
 */
function getInt32ForUUID(uuid) {
    uuid = uuid.replace(/-/g, '');  // Remove hyphens
    const result = [];

    uuidView.setBigUint64(0, BigInt(`0x${ uuid.substring(0, 16) }`));  // most significant bits (hex)
    uuidView.setBigUint64(8, BigInt(`0x${ uuid.substring(16) }`));     // least significant bits (hex)

    // read int32
    for (let i = 0; i < 4; i++) {
        result[i] = uuidView.getInt32(i * 4, false);
    }

    return result;
}

/**
 * Takes an array with four int32 and return a string representation
 * that can be used for Minecraft 1.16+ commands (nbt)
 *
 * @param {number[]} uuidInt32
 *
 * @returns {string}
 */
function formatInt32UUID(uuidInt32) {
    return `[I;${ uuidInt32[0] },${ uuidInt32[1] },${ uuidInt32[2] },${ uuidInt32[3] }]`;
}

///
