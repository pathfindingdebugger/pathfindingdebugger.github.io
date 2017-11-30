class Map
{
    constructor(mapData)
    {
        if(mapData.type === "Grid")
        {
            this.map = this.drawGrid(mapData);
        }
        else
        {
            this.map = this.drawGraph();
        }
    }

    drawGrid(mapData)
    {

    }
}