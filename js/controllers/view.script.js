mineskinApp.controller("viewController", ["$scope", "$http", "$cookies", "$timeout", "$stateParams", "$sce", "ngMeta", function ($scope, $http, $cookies, $timeout, $stateParams, $sce, ngMeta) {
    console.info("viewController")

    console.log($stateParams);

    materializeBaseInit();

    //TODO: remember these preferences
    $scope.giveCommandVersion = "1_16";
    $scope.javaCodeAPI = "paper";
    $scope.modCommand = "citizens";

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
    let url;
    if ($stateParams.id.length > 10) {
        url = "/get/uuid/" + $stateParams.id;
    } else {
        url = "/get/id/" + $stateParams.id;
    }
    $http({
        url: apiBaseUrl + url,
        method: "GET"
    }).then(function (response) {
        $scope.skin = response.data;

        // 1.16 UUID format support
        $scope.skin.data.uuidAsArray = formatInt32UUID(getInt32ForUUID($scope.skin.data.uuid));

        ngMeta.setTitle($scope.skin.name || $scope.skin.uuid.substr(0, 8));
        ngMeta.setTag("image", $sce.trustAsResourceUrl(apiBaseUrl + "/render/" + $scope.skin.uuid + "/head"));

        $timeout(function () {
            materializeBaseInit();
            $("#giveCommand").trigger("autoresize");
            $("#javaGameProfile").trigger("autoresize");
            $("#javaPlayerProfile").trigger("autoresize");
        }, 100);
    });
}])
