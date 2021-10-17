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
            $state.transitionTo('gallery', {page: 1, query: $scope.searchQuery}, {notify: false});
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
    $scope.loadMore = function () {
        $scope.pagination.page++;
        console.log("load more " + $scope.pagination.page);
        $http({
            url: apiBaseUrl + "/get/" + $scope.resultType + "/" + $scope.pagination.page + "?size=" + $scope.pagination.itemsPerPage + ($scope.searchQuery ? "&filter=" + $scope.searchQuery : ""),
            method: "GET"
        }).then(function (response) {
            console.log(response);
            $timeout(function () {
                $scope.skins = $scope.skins.concat($scope.skins, response.data.skins);
                if ($scope.skins.length === 0) {
                    $scope.skins.push({
                        id: 404,
                        uuid: "40404040404040404040404040404040",
                        time: 1081051444,
                        url: "http://textures.minecraft.net/texture/7c37db4dfa8d891d26624ec9b2ec23cea0cdaccac1123b502f6a6737f3cf7"
                    })
                }
                $scope.pagination.page = response.data.page.index;
                $scope.pagination.pages = response.data.page.amount;
                $scope.pagination.totalItems = response.data.page.total;
                newLoad = false;
            });
        });
    };
    $scope.reloadGallery = function () {
        console.log("reload gallery");
        $scope.skins = [];
        $scope.pagination.page = 0;
        $scope.loadMore();
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