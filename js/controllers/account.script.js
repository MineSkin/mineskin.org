mineskinApp.controller("accountController", ["$scope", "$http", "$cookies", "$timeout", "$stateParams", "$sce", "ngMeta", "$window", function ($scope, $http, $cookies, $timeout, $stateParams, $sce, ngMeta, $window) {
    console.info("accountController")

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

    $scope.logout = function () {
        $scope.mineskinAccount = undefined;
        $http({
            method: 'GET',
            url: apiBaseUrl + '/account/logout',
            withCredentials: true
        }).then(function (res) {
            setTimeout(() => {
                location.reload();
            }, 100);
        })
    };

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

    $scope.minecraftAccounts = [];
    $scope.loadMinecraftAccounts = function () {
        $http({
            method: 'GET',
            url: apiBaseUrl + '/account/minecraftAccounts',
            withCredentials: true
        }).then(function (res) {
            $scope.minecraftAccounts = res.data;
        })
    }

    $scope.apiKeys = [];
    $scope.loadApiKeys = function () {
        $http({
            method: 'GET',
            url: apiBaseUrl + '/account/apiKeys',
            withCredentials: true
        }).then(function (res) {
            $scope.apiKeys = res.data;
            for (let k of $scope.apiKeys) {
                if (!k.lastUsed) continue;
                k.lastUsed = new Date(Date.parse(k.lastUsed)).toLocaleString();
            }
        })
    }

    /// UTIL

    $scope.handleResponseError = function (response) {
        if (response.data) {
            console.warn(response.data);
            Materialize.toast("Error: " + (response.data.msg || response.data.error));
            if ((response.data.msg || response.data.error)?.includes("invalid session")) {
                $timeout(function () {
                    $scope.logout();
                }, 5000);
            }
        } else {
            console.warn(response.data);
        }
    }

}])

