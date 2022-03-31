mineskinApp.controller("bulkController", ["$scope", "Upload", "$state", "$http", "$timeout", "$interval", "$stateParams", "$localStorage", function ($scope, Upload, $state, $http, $timeout, $interval, $stateParams, $localStorage) {
    console.info("bulkController")

    $scope.apiKey = $localStorage.apiKey || "d175f64d0601005779e4fc3497ffb7c8fbbc00b90610052939a7ac173ccf3317";

    let skinObjTemplate = {
        upload: undefined,
        url: undefined,
        user: undefined,
        privateUpload: false,
        skinName: "",
        skinModel: "steve",
        skinVariant: ""
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
            toAdd.skinVariant = last.skinVariant;
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
                        recentSkins.unshift(data.uuid);
                        if (recentSkins.length > 100) recentSkins.pop();
                        $scope.$storage.recentSkins = recentSkins;

                        $scope.tryGenerateNext(nextIndex + 1);

                        if ($scope.mineskinAccount) {
                            $http({
                                method: 'POST',
                                url: apiBaseUrl + '/account/skins',
                                withCredentials: true,
                                data: {
                                    uuid: data.uuid
                                }
                            })
                        }
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
                    headers: {
                        "Authorization": "Bearer " + $scope.apiKey
                    },
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
                    headers: {
                        "Authorization": "Bearer " + $scope.apiKey
                    },
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
                        headers: {
                            "Authorization": "Bearer " + $scope.apiKey
                        },
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
                    url: apiBaseUrl + "/validate/name/" + skin.user,
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
            url: apiBaseUrl + "/get/delay?t=" + Math.floor(Date.now() / 1000),
            headers: {
                "Authorization": "Bearer " + $scope.apiKey
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
