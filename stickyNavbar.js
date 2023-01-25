$(document).ready(function () {
    var navbar = $("header");
    $(window).scroll(function () {
        if ($(this).scrollTop() > 50) {
            navbar.addClass("sticky");
        } else {
            navbar.removeClass("sticky");
        }
    });
});
