$(document).ready(function () {
    $("#skinUrl,#skinUser").on("change", function () {
        var url = $("#skinUrl").val();
        var user = $("#skinUser").val();
        if (url && $("#skinUrl").is(":visible")) {
            $("#skinRender").attr("src", "https://minerender.org/embed/skin/?skin.url=" + url + "&autoResize=true&shadow=true&camera.position=-15,35,20&controls.pan=false&utm_source=mineskin&utm_medium=website&utm_campaign=skin_gen_url");
        } else if (user && $("#skinUser").is(":visible")) {
            $("#skinRender").attr("src", "https://minerender.org/embed/skin/?skin.name=" + user + "&autoResize=true&shadow=true&camera.position=-15,35,20&controls.pan=false&utm_source=mineskin&utm_medium=website&utm_campaign=skin_gen_name");
        }
    });
    $("#skinRender").on("load", function () {
        $("#skinRender").show();
    })
    $("#skinRender").on("error", function () {
        $("#skinRender").hide();
    })
});
