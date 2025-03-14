mineskinApp.controller("accountController", ["$scope", "$http", "$cookies", "$timeout", "$stateParams", "$sce", "ngMeta", "$window", "ModalService", function ($scope, $http, $cookies, $timeout, $stateParams, $sce, ngMeta, $window, ModalService) {
    console.info("accountController")

    $scope.loadLogin = function () {
        console.log('loadLogin');
        console.log($stateParams);
        $timeout(function () {
            try {
                let b = google.accounts.id.renderButton(document.getElementById('google_button_placeholder'), {
                    locale: 'en',
                    logo_alignment: 'left',
                    shape: 'pill',
                    size: 'large',
                    text: 'continue_with',
                    theme: 'filled_blue',
                    type: 'standard'
                });
                console.log(b);
            } catch (e) {
                console.error(e);
                //window.location.reload();
            }
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

    $scope.deleteMyAccount = function () {
        let parentScope = $scope;
        ModalService.showModal({
            templateUrl: "/pages/account_delete_confirmation.html",
            controller: ["$scope", "$http", function ($scope, $http) {
                $scope.checkDeleteAccount = false;
                $scope.actuallyDeleteAccount = function () {
                    parentScope.mineskinAccount = undefined;
                    $http({
                        method: 'DELETE',
                        url: apiBaseUrl + '/account?confirm=' + $scope.checkDeleteAccount,
                        withCredentials: true
                    }).then(function (res) {
                        if (res.data.msg) {
                            Materialize.toast(res.data.msg, 4000);
                        }
                        setTimeout(() => {
                            location.reload();
                        }, 2000);
                    })
                };
            }]
        }).then(function (modal) {
            modal.element.modal({
                ready: function () {
                    console.log("ready");
                },
                complete: function () {
                    console.log("complete");
                    $(".modal").remove()
                }
            })
            modal.element.modal("open");

        })
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

    $scope.linkDiscord = function () {
        if (!$scope.mineskinAccount) return;
        $window.open(apiBaseUrl + `/account/discord/oauth/start`, "_blank");
    };

    $scope.getRateLimitFormLink = function (key) {
        return 'https://docs.google.com/forms/d/e/1FAIpQLScJnqh4d_i_yNaolGU9FZTUJiPy5OPs3OslZOuJweDdbJEPOg/viewform?usp=pp_url' +
            '&entry.2119106156=' + $scope.mineskinAccount.email +
            '&entry.1113014322=' + key.id +
            '&entry.1756732929=' + $scope.minecraftAccounts.length +
            '&entry.200041955=' + $scope.minecraftAccounts.map(a => a.uuid).join('%0A');
    };


    $scope.uaStats = {
        agent: "",
        stats: {}
    }
    $scope.checkUserAgentStats = function () {
        console.log($scope.uaStats.agent);
        if (!$scope.uaStats.agent) return;
        $http({
            method: 'GET',
            url: apiBaseUrl + '/account/agentusage?agent=' + $scope.uaStats.agent,
            withCredentials: true
        }).then(function (res) {
            $scope.uaStats.stats = res.data;
        })
    };
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

    window.__scope = $scope;

}])

