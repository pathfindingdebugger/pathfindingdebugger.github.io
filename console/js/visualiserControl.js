typesOfVisualisers = {
    Grid:0,
    Graph:1,
    SearchTree:2
};
class visualiserControl
{
    constructor(mapData)
    {
        this.visualiserType = typesOfVisualisers.Grid;
        this.visualiser = new gridVisulizer();
        this.visualiser.loadMap(mapData.mWidth,mapData.mHeight,10,mapData.mapData)
    }
    setLog(outputFunction)
    {
        this.visualiser.setLogChanger(outputFunction);
    }
    showStartAndGoal(event)
    {
        switch(this.visualiserType) {
            case typesOfVisualisers.Grid:
                this.visualiser.setNodeState(event.startX, event.startY, states.start);
                this.visualiser.setNodeState(event.endX, event.endY, states.goal);
                break;
        }
    }
    setNodeState(event,state)
    {
        switch(this.visualiserType) {
            case typesOfVisualisers.Grid:
                this.visualiser.setNodeState(event.x, event.y, state);
        }
    }

    setNodeValues(event)
    {
        switch(this.visualiserType) {
            case typesOfVisualisers.Grid:
                this.visualiser.setNodeValues(event.x, event.y, event.g, event.f, event.pX, event.pY);
        }
    }

    drawPath(index,event)
    {
        switch(this.visualiserType) {
            case typesOfVisualisers.Grid:
                console.log(event.x+" "+event.y);
                this.visualiser.drawLine(index,event.x,event.y);
                break;
        }
    }
    clearPath(index)
    {
        this.visualiser.deleteLine(index);
    }
    breakPointCheck(event)
    {
        switch(this.visualiserType)
        {
            case typesOfVisualisers.Grid:
                return this.visualiser.isBreakPoint(event.x,event.y);
        }
    }

    getNodeData(event)
    {
        switch(this.visualiserType) {
            case typesOfVisualisers.Grid:
                return this.visualiser.getNodeData(event.x, event.y);
        }
    }
}