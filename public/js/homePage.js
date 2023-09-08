function toggleMenu(x) 
{
    x.classList.toggle("change");

    $(".sidebar").css({
        width: "20vw"
    });

    $(".sidebarBackground").css({
        opacity: "40%"
    });

    $(".sidebarBackground").show();
}

$(document).ready(function() {
    // $(".sidebarBackground").hide();
});