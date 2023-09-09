function toggleMenu(x) 
{
    toggleSidebar();
}

$(document).ready(function() {
    $(".mIconContainer").click(function() {
        openSidebar(); 
    });

    $(".sidebarBackground").click(function() {
        if($(".sidebarBackground").css("opacity") != "0") {
            closeSidebar();
        }
    });
});

function openSidebar() {
    $(".sidebar").css({ width: "25vw" });
    
    $(".sidebarBackground").stop(); //stop fade out
    $(".sidebarBackground").fadeIn(500);
}

function closeSidebar() {
    $(".sidebar").css({ width: "0vw" });
    
    $(".sidebarBackground").stop(); //stop fade in
    $(".sidebarBackground").fadeOut(500);
}