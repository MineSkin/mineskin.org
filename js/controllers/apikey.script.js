mineskinApp.controller("apiKeyController", ["$scope", "$http", "$cookies", "$timeout", "$stateParams", "$sce", "ngMeta", function ($scope, $http, $cookies, $timeout, $stateParams, $sce, ngMeta) {
    console.info("apiKeyController")

    console.log($stateParams);

    $scope.materializeInit('tab1');

    $scope.ownerState = location.search ? atob(decodeURIComponent(location.search.substr(1))) : undefined;
    $scope.server = $scope.ownerState ? $scope.ownerState.split(":")[0] : undefined;
    $scope.owner = $scope.ownerState ? $scope.ownerState.split(":")[1] : undefined;

    $scope.keyAction = "create";

    $scope.keyName = "";
    $scope.keyOrigins = "";
    $scope.keyIps = "";
    $scope.keyAgents = "";

    $scope.apiKey = "";
    $scope.apiSecret = "";

    window.__scope = $scope;


    $scope.loadExistingKeyInfo = function () {
        if (!$scope.apiKey) return;

        $http({
            method: "GET",
            url: `https://api.mineskin.org/apikey?key=${ $scope.apiKey }`
        }).then(keyResponse => {
            $scope.server = keyResponse.data.server;
            $scope.apiKey = keyResponse.data.key;
            $scope.keyName = keyResponse.data.name;
            $scope.keyOrigins = keyResponse.data.origins.join("\n");
            $scope.keyIps = keyResponse.data.ips.join("\n");
            $scope.keyAgents = keyResponse.data.agents.join("\n");
        }).catch(response => $scope.handleResponseError(response));
    };


    $scope.create = function () {
        if ($scope.keyAction !== "create") return;
        console.log("create()");
        if (!$scope.ownerState || !$scope.owner || !$scope.keyName) return;

        $http({
            method: "POST",
            url: `https://${ $scope.server }.api.mineskin.org/apikey`,
            data: {
                name: $scope.keyName,
                owner: $scope.owner,
                origins: $scope.keyOrigins.split("\n"),
                ips: $scope.keyIps.split("\n"),
                agents: $scope.keyAgents.split("\n")
            }
        }).then(keyResponse => {
            Materialize.toast(keyResponse.data.msg);

            $scope.keyName = keyResponse.data.name;
            $scope.apiKey = keyResponse.data.key;
            $scope.apiSecret = keyResponse.data.secret;
            $scope.keyOrigins = keyResponse.data.origins.join("\n");
            $scope.keyIps = keyResponse.data.ips.join("\n");
            $scope.keyAgents = keyResponse.data.agents.join("\n");

            $("html, body").animate({scrollTop: 0}, "slow");
        }).catch(response => $scope.handleResponseError(response));
    };

    $scope.update = function () {
        if ($scope.keyAction !== "update") return;
        console.log("update()");
        if (!$scope.apiKey || !$scope.apiSecret) return;

        $http({
            method: "PUT",
            url: `https://${ $scope.server }.api.mineskin.org/apikey`,
            data: {
                key: $scope.apiKey,
                secret: $scope.apiSecret,
                name: $scope.keyName,
                owner: $scope.ownerState,
                origins: $scope.keyOrigins.split("\n"),
                ips: $scope.keyIps.split("\n"),
                agents: $scope.keyAgents.split("\n")
            }
        }).then(response => {
            Materialize.toast(response.data.msg);
        }).catch(response => $scope.handleResponseError(response));
    };

    $scope.delete = function () {
        if ($scope.keyAction !== "delete") return;
        console.log("delete()");
        if (!$scope.apiKey || !$scope.apiSecret) return;

        $http({
            method: "DELETE",
            url: `https://${ $scope.server }.api.mineskin.org/apikey`,
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            },
            data: {
                key: $scope.apiKey,
                secret: $scope.apiSecret
            }
        }).then(response => {
            Materialize.toast(response.data.msg);
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
