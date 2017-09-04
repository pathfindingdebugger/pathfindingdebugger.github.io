//Created 2/9/17 by Jay

function drawRectsEvents()
{
    const svg = document.getElementById("viewport");
    left = svg.getBoundingClientRect().left;
    top = svg.getBoundingClientRect().top;


    let rect = new Elem(svg, 'rect')
        .attr('x', 100).attr('y', 70)
        .attr('width', 120).attr('height', 80)
        .attr('fill', '#0100d7');
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

        this.tileArray = null;
        this.breakPoints = new Array(0);
        this.breakPointVisual = new Array(0);
    }
    generateBreakPoint(xInput,yInput)
    {
        if(this.breakPoints.indexOf(xInput+":"+yInput) === -1 )
        {
            this.breakPoints.push(xInput+":"+yInput);
            console.log("Still making");
            const breakPoint = new Elem(this.svg,'rect')
                .attr("height",this.tileSize*0.5)
                .attr("width",this.tileSize*0.5)
                .attr("x",xInput*this.tileSize+0.25*this.tileSize)
                .attr("y",yInput*this.tileSize+0.25*this.tileSize)
                .attr("stroke","black")
                .attr("fill","red");

            breakPoint.observeEvent('mousedown')
                .filter((e)=>e.which === 3)
                .subscribe( _ => {this.breakPoints.splice(this.breakPoints.indexOf(xInput+":"+yInput),1);breakPoint.elem.remove()});

            this.breakPointVisual.push(breakPoint);
        }
    }
    loadMap(mapWidth,mapHeight,tileSize,mapString)
    {
        //Destroy old map
        this.tileSize = tileSize;
        console.log(this.mapWidth + " : " + this.mapHeight);
        if(this.tileArray !== null)
        {
            for(let i = 0; i < this.mapHeight;i++ )
            {
                for(let j = 0; j < this.mapWidth;j++)
                {
                    this.tileArray[i*this.mapWidth+j].removeElement();
                }
            }
            for(let i = 0; i < this.breakPoints.length;i++)
            {
                console.log("Should get them all");
                this.breakPointVisual[i].removeElement();
            }
        }

        // build a new one
        this.mapWidth = mapWidth;
        this.mapHeight = mapHeight;
        this.breakPoints = new Array(0);
        this.tileArray = new Array(mapWidth*mapHeight);

        for(let i = 0; i < mapHeight;i++)
        {
            for(let j = 0; j < mapWidth;j++)
            {
                const stringIndex = i*mapWidth+j;
                this.tileArray[i*mapWidth+j] = new Elem(this.svg, 'rect')
                    .attr('x', tileSize*j).attr('y', tileSize*i)
                    .attr('width', tileSize).attr('height', tileSize)
                    .attr('fill', (mapString[stringIndex] === ".")? 'white':'black' )
                    .attr('stroke','black');

                this.tileArray[i*mapWidth+j].observeEvent('mousedown')
                    .filter(e=>e.shiftKey)
                    .map(e=>{return {i,j}})
                    .subscribe(data=>this.generateBreakPoint(j,i));


            }
        }
    }


}




if (typeof window !== 'undefined')
    window.onload = function(){
    visual = new gridVisulizer()

};

