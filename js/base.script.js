let apiBaseUrl = "https://api.mineskin.org";

const mineskinApp = angular.module("mineskinApp", ["ui.router", "ui.materialize", "ngFileUpload", "ngCookies", "angularModalService", "ngMeta", "ngStorage"]);

mineskinApp.directive("ngPreloadSrc", function () {
    return {
        restrict: "A",
        replace: true,
        link: function (scope, element, attrs) {
            var $preloader = $("<img style='display:none'>");
            setTimeout(function () {
                $preloader.attr("src", attrs.ngPreloadSrc);
            }, 500 * Math.random());
            $preloader.on("load", function () {
                setTimeout(function () {
                    element.attr("src", attrs.ngPreloadSrc);
                }, 1);
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
                    if (window._mineskinGrants && window._mineskinGrants.ad_free) return;
                    element.append("<ins class=\"adsbygoogle\" style=\"display:block\" data-ad-client=\"ca-pub-2604356629473365\" data-ad-slot=\"" + (attrs.googleAd || '7160666614') + "\" data-ad-format=\"auto\" data-full-width-responsive=\"true\"></ins>");
                    return (adsbygoogle = window.adsbygoogle || []).push({});
                })
            }
        }
    }
]);

mineskinApp.directive('scrollWithView', ['$window', function ($window) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            let timeout = false;
            element.css("margin-top", "50px");
            element.css("transition", "margin-top 50ms linear")
            angular.element($window).bind('scroll', function () {
                // if (timeout) return;
                element.css("margin-top", $window.scrollY + 20);
                // setTimeout(() => {
                //     timeout = false;
                // }, 100);
                // timeout = true;
            })
        }
    }
}])

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
                    title: "MineSkin - Skin Signature Generator",
                    titleSuffix: "",
                    image: "https://mineskin.org/favicon.png",
                    path: ""
                }
            },
            onEnter: ["$state", "$stateParams", function ($state, $stateParams) {
                document.getElementById('canonical-link').setAttribute('content', 'https://mineskin.org');
            }]
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
                    image: "https://mineskin.org/favicon.png",
                    path: "/bulk"
                }
            },
            onEnter: ["$state", "$stateParams", function ($state, $stateParams) {
                document.getElementById('canonical-link').setAttribute('content', 'https://mineskin.org/bulk');
            }]
        })
        .state("index.stats", {
            url: "^/stats",
            onEnter: ["$state", "$stateParams", "ModalService", function ($state, $stateParams, ModalService) {
                document.getElementById('canonical-link').setAttribute('content', 'https://mineskin.org/stats');

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
            onExit: ["$state", "$stateParams", function ($state, $stateParams) {
                document.getElementById('canonical-link').setAttribute('content', 'https://mineskin.org');
            }],
            data: {
                meta: {
                    title: "Stats",
                    image: "https://mineskin.org/favicon.png",
                    path: "/stats"
                }
            }
        })
        .state("gallery_legacy", {
            url: "/gallery/:page?query",
            redirectTo: "gallery"
        })
        .state("gallery", {
            url: "/gallery?query",
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
                    image: "https://mineskin.org/favicon.png",
                    path: "/gallery"
                }
            },
            onEnter: ["$state", "$stateParams", function ($state, $stateParams) {
                document.getElementById('canonical-link').setAttribute('content', 'https://mineskin.org/gallery');
            }]
        })
        .state("gallery.view", {
            url: "^/{id:[0-9a-z]{1,32}}",
            onEnter: ["$state", "$stateParams", "ModalService", "ngMeta", function ($state, $stateParams, ModalService, ngMeta) {
                console.info("onEnter");
                console.log($stateParams);
                if (!$stateParams.id) return;

                document.getElementById('canonical-link').setAttribute('content', 'https://mineskin.org/' + $stateParams.id);

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

                            document.getElementById('canonical-link').setAttribute('content', 'https://mineskin.org/gallery');
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
                    image: "https://mineskin.org/favicon.png",
                    path: "/account"
                }
            },
            onEnter: ["$state", "$stateParams", function ($state, $stateParams) {
                document.getElementById('canonical-link').setAttribute('content', 'https://mineskin.org/account');
            }]
        })
        .state("account_minecraft", {
            url: "/account/minecraft?email&force_account",
            views: {
                'tab1': {
                    templateUrl: "/pages/account_minecraft.html",
                    controller: "minecraftAccountController"
                }
            },
            data: {
                meta: {
                    title: "Account | Minecraft",
                    image: "https://mineskin.org/favicon.png"
                }
            },
            onEnter: ["$state", "$stateParams", function ($state, $stateParams) {
                document.getElementById('canonical-link').setAttribute('content', 'https://mineskin.org/account/minecraft');
            }]
        })
        .state("apikey", {
            url: "/apikey",
            views: {
                'tab1': {
                    templateUrl: "/pages/apikey.html",
                    controller: "apiKeyController"
                }
            },
            data: {
                meta: {
                    title: "API Keys",
                    image: "https://mineskin.org/favicon.png",
                    path: "/apikey"
                }
            },
            onEnter: ["$state", "$stateParams", function ($state, $stateParams) {
                document.getElementById('canonical-link').setAttribute('content', 'https://mineskin.org/apikey');
            }]
        })
        .state("hiatus", {
            url: "/hiatus",
            views: {
                'tab1': {
                    templateUrl: "/pages/hiatus.html"
                }
            },
            data: {
                meta: {
                    title: "MineSkin Hiatus",
                    image: "https://mineskin.org/favicon.png",
                    path: "/hiatus"
                }
            },
            onEnter: ["$state", "$stateParams", function ($state, $stateParams) {
                document.getElementById('canonical-link').setAttribute('content', 'https://mineskin.org/hiatus');
            }]
        })


    $locationProvider.html5Mode(true);


    ngMetaProvider.useTitleSuffix(true);
    ngMetaProvider.setDefaultTitleSuffix(" | MineSkin");
    ngMetaProvider.setDefaultTitle("MineSkin - Custom Skin Generator");
    ngMetaProvider.setDefaultTag("image", "https://mineskin.org/img/infographic-1200x628.png");

});
mineskinApp.run(['$transitions', '$rootScope', 'ngMeta', function ($transitions, $rootScope, ngMeta) {
    // https://github.com/vinaygopinath/ngMeta/issues/36#issuecomment-311581385 -> https://github.com/vinaygopinath/ngMeta/issues/25#issuecomment-268954483
    $transitions.onFinish({}, function (trans) {
        $rootScope.$broadcast('$routeChangeSuccess', trans.to());
    });

    ngMeta.init()
}])

// window.mineskinAccount = undefined;

/*
function googleInit() {
    console.log('googleInit')
    return fetch('https://toast.api.mineskin.org/account/google/init', {
        method: 'POST'
    })
        .then(res => res.json())
        .then(data => {
            const el = document.getElementById('g_id_onload');
            el.setAttribute('data-nonce', data.nonce);
            el.setAttribute('data-login_uri', data.login_uri);

            // google.accounts.id.initialize({
            //     client_id: "352641379376-54jd29mpaorrk7bdvqh4qlll4a4n5g2b.apps.googleusercontent.com",
            //     context: "use",
            //     auto_select: "true",
            //     login_uri: data.login_uri,
            //     nonce: data.nonce,
            //     ux_mode: "popup"
            // });
            google.accounts.id.setLogLevel("debug")//TODO
        })
}

googleInit().then(()=>{
    google.accounts.id.prompt();
})
 */

function materializeBaseInit() {
    $('select').material_select();
    // https://stackoverflow.com/a/56725559/6257838
    document.querySelectorAll('.select-wrapper').forEach(t => t.addEventListener('click', e => e.stopPropagation()))
    $('.tooltipped').tooltip();
    Materialize.updateTextFields();

    setTimeout(() => {
        window.prerenderReady = true;
    }, 500);
}

$('.new-website-link').on('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    const url = new URL(location.href);
    url.hostname = "mineskin.org";
    url.port = "";
    console.log(url.toString());
    location.href = url.href;
});

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

    uuidView.setBigUint64(0, BigInt(`0x${uuid.substring(0, 16)}`));  // most significant bits (hex)
    uuidView.setBigUint64(8, BigInt(`0x${uuid.substring(16)}`));     // least significant bits (hex)

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
    return `[I;${uuidInt32[0]},${uuidInt32[1]},${uuidInt32[2]},${uuidInt32[3]}]`;
}
