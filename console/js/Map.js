class Map
{
    constructor(mapData,scale)
    {
        this.tileSize = scale;
        this.svg  = document.getElementById("viewport");
        if(mapData.type === "Grid")
        {
            this.type = "Grid";
            this.mapWidth = mapData.mWidth;
            this.mapHeight = mapData.mHeight;
            this.map = this.drawGrid(mapData.mapData,this.mapWidth,this.mapHeight);
        }
        else if(mapData.type === "Graph")
        {
            this.map = this.drawGraph();
        }
    }

    drawGrid(mapString,mapWidth,mapHeight)
    {
        this.mapWidth = parseInt(mapWidth);
        this.mapHeight = parseInt(mapHeight);
        this.breakPoints = new Array(0);
        const size = parseInt(mapWidth) * parseInt(mapHeight);

        this.nodes = {};
        //mapString = mapString.replace('\n','');
        for (let i = 0; i < this.mapHeight; i++) {
            for (let j = 0; j < this.mapWidth; j++) {
                const stringIndex = i * this.mapWidth + j;
                if (mapString[stringIndex] === "@")
                    continue;
                this.nodes[i*this.mapWidth+j] = new Elem(this.svg, 'rect')
                    .attr('x', this.tileSize * j).attr('y', this.tileSize * i)
                    .attr('width', this.tileSize).attr('height', this.tileSize)
                    .attr('fill', 'white')
                    .attr('stroke', 'black')
                    .attr('stroke-width','0.1')
            }
        }
    }
    setGoal(id)
    {
        console.log("SHOULD FIRE");
        this.nodes[id].attr('fill','orange');
    }

    reset()
    {
        if(this.type === "Grid")
        {
            if(this.bgObject !== null)
                this.bgObject = null;
            if (this.nodes !== null) {
                for (let i = 0; i < this.mapHeight; i++) {
                    for (let j = 0; j < this.mapWidth; j++) {
                        if(this.nodes[i * this.mapWidth + j] !== undefined )
                            this.nodes[i * this.mapWidth + j].removeElement();
                    }
                }
            }
        }

    }
}