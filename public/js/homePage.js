let openStatus = false;

$(document).ready(function() {
    $(".mIconContainer").click(function() {
        openStatus ? closeSidebar() : openSidebar(); 
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

    $(".mIconContainer").addClass("change");
    openStatus = true;
}

function closeSidebar() {
    $(".sidebar").css({ width: "0vw" });
    
    $(".sidebarBackground").stop(); //stop fade in
    $(".sidebarBackground").fadeOut(500);

    $(".mIconContainer").removeClass("change");
    openStatus = false;
}