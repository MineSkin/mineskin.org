$(document).ready(function () {
    $("#skinImage").on("load", function () {
        if (/bot|googlebot|crawler|spider|robot|crawling/i.test(navigator.userAgent)) return;// disable for crawlers
        $("#skinRender").attr("src", "https://minerender.org/embed/skin/?skin=https://api.mineskin.org/render/texture/" + $("#skinRenderId").text() + "&autoResize=true&shadow=true&camera.position=-15,35,20&controls.pan=false&utm_source=mineskin&utm_medium=website&utm_campaign=skin_preview");
        $("#skinRender").on("load", function () {
            $("#skinImageContainer").hide();
            $("#skinRenderContainer").show();
        })
    })
});
