mineskinApp.controller("accountController", ["$scope", "$http", "$cookies", "$timeout", "$stateParams", "$sce", "ngMeta", "$window", function ($scope, $http, $cookies, $timeout, $stateParams, $sce, ngMeta, $window) {
    console.info("accountController")

    // Login

    $scope.email = $stateParams.email || "";
    $scope.password = "";

    $scope.accountServer = "";
    $scope.accountType = undefined;

    $scope.gamePass = false;

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
    $scope.loginWithMojang = false;

    $scope.checkUnderstoodLogin = false;
    $scope.checkReadTerms = false;
    $scope.checkAcceptSkins = false;
    $scope.checkAcceptPassword = false;

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
        $scope.accountType = "mojang";
        $scope.loginWithMojang = true;

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
                if (loginResponse.data["switchToServer"]) {
                    console.log("Switching account server to", loginResponse.data["switchToServer"]);
                    $scope.accountServer = loginResponse.data["switchToServer"];
                    $scope.loginMojang();
                    return;
                }

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

    $scope.startMicrosoftFlow = function () {
        $scope.loggingIn = true;
        Materialize.toast("Logging in via Microsoft...");
        $scope.accountType = "microsoft";
        $scope.loginWithMicrosoft = true;

        $scope.getPreferredAccountServer(accountServer => {
            let url = `https://${ accountServer.host }/accountManager/microsoft/oauth/start`;
            if ($scope.email) {
                url += `?email=${ $scope.email }`;
            }
            url += `&gamePass=${ $scope.gamePass }`;
            const oauthWindow = window.open(url, "", "width=1000,height=620,left=500,top=200,scrollbars=no,resizable=yes,toolbar=no,menubar=no,location=no");

            let oauthCloseTimer;

            function oauthWindowClosed() {
                console.log("auth window closed")

                $scope.finalizeMicrosoftLogin();
            }

            oauthCloseTimer = setInterval(function () {
                if (oauthWindow.closed) {
                    oauthWindowClosed();
                    clearInterval(oauthCloseTimer);
                }
            }, 500);
        });
    }

    // @deprecated (non-oauth version)
    $scope.loginMicrosoft = function () {
        if (!$scope.email || !$scope.password) return;

        $scope.loggingIn = true;
        Materialize.toast("Logging in via Microsoft...");
        $scope.accountType = "microsoft";
        $scope.loginWithMicrosoft = true;

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
                if (loginResponse.data["switchToServer"]) {
                    console.log("Switching account server to", loginResponse.data["switchToServer"]);
                    $scope.accountServer = loginResponse.data["switchToServer"];
                    $scope.loginMicrosoft();
                    return;
                }

                if (loginResponse.data["error"] || !loginResponse.data["success"]) {
                    $scope.handleResponseError(loginResponse);
                    return;
                }

                $scope.finalizeMicrosoftLogin();
            }).catch(response => $scope.handleResponseError(response));
        });
    };

    $scope.finalizeMicrosoftLogin = function () {
        $scope.getPreferredAccountServer(accountServer => {
            $http({
                method: "POST",
                url: `https://${ accountServer.host }/accountManager/microsoft/login/finalize?t=${ Date.now() }`,
                withCredentials: true
            }).then(finalLoginResponse => {
                if (finalLoginResponse.data["error"] || !finalLoginResponse.data["success"]) {
                    $scope.handleResponseError(finalLoginResponse);
                    return;
                }

                $scope.token = finalLoginResponse.data["token"];
                if (!$scope.email && finalLoginResponse.data["email"]) {
                    $scope.email = finalLoginResponse.data["email"];
                }
                $scope.loggedIn = true;
                $scope.loggingIn = false;

                $scope.getUserProfile();
            }).catch(response => $scope.handleResponseError(response));
        });
    }

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
            url: apiBaseUrl + "/accountManager/preferredAccountServer?type=" + $scope.accountServer
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
                uuid: $scope.uuid
            };
            if ($scope.email) {
                data.email = $scope.email;
            }
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

                $timeout(function () {
                    if ($scope.myAccount.hadErrors) {
                        Materialize.toast("Account Errors Cleared");
                    }
                }, 800);
                $timeout(function () {
                    if ($scope.myAccount.hadSentMessage) {
                        Materialize.toast("Account Info Updated! Thank You!");
                    }
                }, 1200);
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
        if (!$scope.loggedIn || !$scope.token || !$scope.uuid) return;

        $scope.getPreferredAccountServer(accountServer => {
            let data = {
                uuid: $scope.uuid,

                checks: {
                    readTerms: $scope.checkReadTerms,
                    acceptSkins: $scope.checkAcceptSkins,
                    acceptPassword: $scope.checkAcceptPassword
                }
            };
            if ($scope.email) {
                data.email = $scope.email;
            }
            if ($scope.password) {
                data.password = btoa($scope.password);
            }
            if ($scope.securityAnswers) {
                data.securityAnswers = $scope.securityAnswers;
            }
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
        if (!$scope.loggedIn || !$scope.token || !$scope.uuid) return;
        let data = {
            uuid: $scope.uuid
        };
        if ($scope.email) {
            data.email = $scope.email;
        }
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

    $scope.updateEmailSetting = function () {
        $scope.updateAccountSetting('emails', 'emails', $scope.sendAccountEmails, (v, u) => {
            $scope.sendAccountEmails = typeof v !== "undefined" ? v : $scope.sendAccountEmails;
            // ask for email if it's not set and sending emails is enabled
            if(!$scope.email && $scope.sendAccountEmails) {
                $scope.email = prompt("Email Address");
                if ($scope.email) {
                    $scope.updateAccountSetting('email', 'email', $scope.email, (v, u) => {
                        Materialize.toast("Email updated");
                    });
                }
            }
        });
    };

    $scope.linkDiscord = function () {
        if (!$scope.loggedIn || !$scope.token || !$scope.uuid) return;
        $window.open(`https://${ $scope.accountServer ? $scope.accountServer.host : 'api.mineskin.org' }/accountManager/discord/oauth/start?email=${ $scope.email }&uuid=${ $scope.uuid }`, "_blank");
    };

    $scope.deleteAccount = function () {
        if (!$scope.loggedIn || !$scope.token || !$scope.uuid || !$scope.accountExists || $scope.accountEnabled) return;

        let data = {
            uuid: $scope.uuid
        }
        if ($scope.email) {
            data.email = $scope.email;
        }
        $http({
            method: "DELETE",
            url: `https://${ $scope.accountServer ? $scope.accountServer.host : 'api.mineskin.org' }/accountManager/deleteAccount`,
            withCredentials: true,
            headers: {
                "Content-Type": "application/json;charset=utf-8",
                "Authorization": `Bearer ${ $scope.token }`
            },
            data: data
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
