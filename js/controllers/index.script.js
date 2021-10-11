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
                    headers: {
                        "Authorization": "Bearer d175f64d0601005779e4fc3497ffb7c8fbbc00b90610052939a7ac173ccf3317"
                    },
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
                    headers: {
                        "Authorization": "Bearer d175f64d0601005779e4fc3497ffb7c8fbbc00b90610052939a7ac173ccf3317"
                    },
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
                        headers: {
                            "Authorization": "Bearer d175f64d0601005779e4fc3497ffb7c8fbbc00b90610052939a7ac173ccf3317"
                        },
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
                    url: apiBaseUrl + "/validate/name/" + $scope.skinUser,
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
            recentSkins.unshift(data.uuid);
            if (recentSkins.length > 20) recentSkins.pop();
            $scope.$storage.recentSkins = recentSkins;

            if ($stateParams.generateCallback) {
                window.location = $stateParams.generateCallback.replace(":id", data.id).replace(":uuid", data.uuid);
            } else {
                $state.go("gallery.view", {id: data.uuid})
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
            url: apiBaseUrl + "/get/delay?t=" + Math.floor(Date.now() / 1000),
            headers: {
                "Authorization": "Bearer d175f64d0601005779e4fc3497ffb7c8fbbc00b90610052939a7ac173ccf3317"
            },
            success: function (data) {
                $scope.generatorDelay = data.delay;
                $scope.generatorTimeout = Math.round(data.nextRelative);

                if ($scope.generatorTimeout >= 0.1) {
                    $timeout(() => $scope.refreshTimeout(), $scope.generatorTimeout * 1000);
                }
            }
        });
    };
    $scope.refreshTimeout();
}]);
