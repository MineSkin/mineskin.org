mineskinApp.controller("apiKeyController", ["$scope", "$http", "$cookies", "$timeout", "$stateParams", "$sce", "ngMeta", function ($scope, $http, $cookies, $timeout, $stateParams, $sce, ngMeta) {
    console.info("apiKeyController")

    console.log($stateParams);

    $scope.materializeInit('tab1');

    $scope.keyAction = "create";

    $scope.keyName = "";
    $scope.keyOrigins = "";
    $scope.keyIps = "";
    $scope.keyAgents = "";

    $scope.apiKey = "";
    $scope.apiSecret = "";

    window.__scope = $scope;

    $scope.loadLogin = function () {
        console.log('loadLogin')
        $timeout(function () {
            google.accounts.id.renderButton(document.getElementById('google_button_placeholder'), {
                locale: 'en',
                logo_alignment: 'left',
                shape: 'pill',
                size: 'large',
                text: 'continue_with',
                theme: 'filled_blue',
                type: 'standard'
            });
        }, 600);
        // google.accounts.id.prompt();
        // googleInit().then(()=>{
        //     google.accounts.id.renderButton(document.getElementById('google_button_placeholder'), {
        //         locale: 'en',
        //         logo_alignment: 'left',
        //         shape: 'pill',
        //         size: 'large',
        //         text: 'continue_with',
        //         theme: 'filled_blue',
        //         type: 'standard'
        //     });
        //     google.accounts.id.prompt();
        // })
    }

    $scope.loadAccount = function () {
        $scope.checkAccount(function (account) {
            if (!account) {
                $scope.loadLogin();
                return;
            }

            $scope.loadMinecraftAccounts();
            $scope.loadApiKeys();
        })
    };

    $scope.loadExistingKeyInfo = function () {
        if (!$scope.apiKey) return;

        $http({
            method: "GET",
            url: apiBaseUrl + `/apikey?key=${ $scope.apiKey }`,
            withCredentials: true,
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
        if (!$scope.mineskinAccount || !$scope.keyName) return;

        $http({
            method: "POST",
            url: apiBaseUrl + `/apikey`,
            withCredentials: true,
            data: {
                name: $scope.keyName,
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
            url: apiBaseUrl + `/apikey`,
            withCredentials: true,
            data: {
                key: $scope.apiKey,
                secret: $scope.apiSecret,
                name: $scope.keyName,
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
            url: apiBaseUrl + `/apikey`,
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            },
            withCredentials: true,
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
