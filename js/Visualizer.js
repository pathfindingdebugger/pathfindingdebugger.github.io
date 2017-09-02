function drawRectsEvents()
{
    const svg = document.getElementById("animatedRect");
    left = svg.getBoundingClientRect().left;
    top = svg.getBoundingClientRect().top;
    console.log("THIS IS REGISTERING");
    console.log("Test");

}

if (typeof window != 'undefined')
    window.onload = function(){
    drawRectsEvents();
};