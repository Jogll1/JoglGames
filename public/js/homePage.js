function toggleMenu(x) 
{
    toggleSidebar();
}

$(document).ready(function() {
    $(".sidebarBackground").click(function() { toggleSidebar() });
});

function toggleSidebar() {
    let sidebarWidth = $(".sidebar").css("width");
    $(".sidebar").css({ width: (sidebarWidth === "0px") ? "25vw" : "0px" });
    
    $(".sidebarBackground").show();

    let sidebarBgOpacity = $(".sidebarBackground").css("opacity");
    $(".sidebarBackground").css({ opacity: (sidebarBgOpacity == "0") ? "40%" : "0" });

    x.classList.toggle("change");
}