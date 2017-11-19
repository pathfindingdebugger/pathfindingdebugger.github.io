typesOfVisualisers = {
    Grid:"Grid",
    Graph:"Graph",
    SearchTree:"SearchTree"
};
class visualiserControl
{
    constructor(type,mapData)
    {
       switch(type)
       {
           case "Grid":
               this.visualiserType = typesOfVisualisers.Grid;
               this.visualiser = new gridVisulizer();
               this.visualiser.loadMap(mapData.mWidth,mapData.mHeight,10,mapData.mapData);
               break;
           case "Tree":
               this.visualiserType = typesOfVisualisers.SearchTree;
               this.visualiser = new TreeVisualizer();
               break;
       }

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
    generateNode(event)
    {
        switch(this.visualiserType)
        {
            case typesOfVisualisers.SearchTree:
                this.visualiser.addNode(event.id,event.pId)
        }
    }
    setNodeState(event,state)
    {
        switch(this.visualiserType) {
            case typesOfVisualisers.Grid:
                this.visualiser.setNodeState(event.x, event.y, state);
                break;
            case typesOfVisualisers.SearchTree:
                this.visualiser.setNodeState(event.id,state)
        }
    }

    setNodeValues(event)
    {
        switch(this.visualiserType) {
            case typesOfVisualisers.Grid:
                this.visualiser.setNodeValues(event.x, event.y, event.g, event.f, event.pX, event.pY);
                break;
            case typesOfVisualisers.SearchTree:
                this.visualiser.setNodeValues(event.id,event.g,event.f);
                break;

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
            case typesOfVisualisers.SearchTree:
                return this.visualiser.getNodeData(event.id);
        }
    }
    getParentData(event)
    {
        switch(this.visualiserType)
        {
            case typesOfVisualisers.Grid:
                const nodeData = this.visualiser.getNodeData(event.x,event.y);
                return nodeData.px !== -1 ? this.visualiser.getNodeData(nodeData.px,nodeData.py): null;
            case typesOfVisualisers.SearchTree:
                const current = this.visualiser.getNodeData(event.id);
                return current.pId ? this.visualiser.getNodeData(current.pId) : null;

        }
    }
    reset()
    {
        switch(this.visualiserType)
        {
            case typesOfVisualisers.Grid:
                this.visualiser.deleteFloatBox();
                this.visualiser.reloadMap()
        }

    }
}