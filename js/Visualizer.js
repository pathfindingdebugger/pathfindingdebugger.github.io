function drawRectsEvents()
{
    const svg = document.getElementById("animatedRect");
    left = svg.getBoundingClientRect().left;
    top = svg.getBoundingClientRect().top;
    console.log("THIS IS REGISTERING");
    console.log("Test");

    let rect = new Elem(svg, 'rect')
        .attr('x', 100).attr('y', 70)
        .attr('width', 120).attr('height', 80)
        .attr('fill', '#95B3D7');
    const animate = setInterval(function() {rect.attr('x', 1 + Number(rect.attr('x')))}, 10);
    const timer = setInterval(function(){
        clearInterval(animate);
        clearInterval(timer);
        }, 1000);
}

if (typeof window != 'undefined')
    window.onload = function(){
    drawRectsEvents();
};