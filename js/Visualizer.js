function drawRectsEvents()
{
    const svg = document.getElementById("viewport");
    left = svg.getBoundingClientRect().left;
    top = svg.getBoundingClientRect().top;
    console.log("THIS IS REGISTERING");
    console.log("Test");

    let rect = new Elem(svg, 'rect')
        .attr('x', 100).attr('y', 70)
        .attr('width', 120).attr('height', 80)
        .attr('fill', '#95B3D7');
    const animate = setInterval(()=> {rect.attr('x', 1 + Number(rect.attr('x')))}, 10);
    const timer = setInterval(()=>{
        clearInterval(animate);
        clearInterval(timer);
        }, 1000);
}
class gridVisulizer
{


    constructor(mapWidth,mapHeight,mapString)
    {
        this.svg = document.getElementById("viewport");
        this.tileArray = new Array(mapWidth*mapHeight);

        for(let i = 0; i < mapHeight;i++)
        {
            for(let j = 0; j < mapWidth;j++)
            {
                console.log(10*j + ":" + 10*i);
                this.tileArray[i*mapWidth+j] = new Elem(this.svg, 'rect')
                    .attr('x', 10*j).attr('y', 10*i)
                    .attr('width', 10).attr('height', 10)
                    .attr('fill', 'white')
                    .attr('stroke','black');
            }
        }
    }
}




if (typeof window != 'undefined')
    window.onload = function(){
    visual = new gridVisulizer(10,10,"")

};