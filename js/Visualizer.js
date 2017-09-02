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


    constructor(mapWidth,mapHeight,tileSize,mapString)
    {
        this.svg = document.getElementById("viewport");
        this.tileArray = new Array(mapWidth*mapHeight);

        for(let i = 0; i < mapHeight;i++)
        {
            for(let j = 0; j < mapWidth;j++)
            {
                const stringIndex = i*mapWidth+j;
                console.log(tileSize*j + ":" + tileSize*i + " String pos: "+ stringIndex);
                this.tileArray[i*mapWidth+j] = new Elem(this.svg, 'rect')
                    .attr('x', tileSize*j).attr('y', tileSize*i)
                    .attr('width', tileSize).attr('height', tileSize)
                    .attr('fill', (mapString[stringIndex] == "@")? 'white':'black' )
                    .attr('stroke','black');

            }
        }
    }
}




if (typeof window != 'undefined')
    window.onload = function(){
    visual = new gridVisulizer(3,3,100,"@@@@.@@@@")

};