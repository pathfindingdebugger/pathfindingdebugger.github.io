typesOfVisualisers = {
    Grid:"Grid",
    Graph:"Graph",
    SearchTree:"SearchTree"
};

// This class is responsible for interfacing the debug command, which deals with events, to the visualisers which deal in specific terms such as xy coordinates or ids
class visualiserControl
{
    constructor(type,mapData,eventList)
    {
       switch(type)
       {
           case "Grid":
               this.visualiserType = typesOfVisualisers.Grid;
               this.visualiser = new gridVisulizer();
               this.visualiser.loadMap(mapData.mWidth,mapData.mHeight,10,mapData.mapData);
               break;
           case "Tree": //A tree is specified to the Gridvisualiser then is treated as just another graph by the debugger
               this.visualiserType = typesOfVisualisers.Graph;

               this.visualiser = new GraphVisualizer(true,mapData,eventList);
               break;
           case "Graph":
               this.visualiserType = typesOfVisualisers.Graph;
               console.log(mapData);
               this.visualiser = new GraphVisualizer(false,mapData,eventList);
       }

    }
    setLog(outputFunction)
    {
        this.visualiser.setLogChanger(outputFunction);
    }
    showStart(event)
    {
        switch(this.visualiserType) {
            case typesOfVisualisers.Grid:
                this.visualiser.setNodeState(event.startX, event.startY, states.start);
                break;
            case typesOfVisualisers.Graph:
                this.visualiser.setNodeState(event.id,states.start);
        }
    }
    showGoal(event)
    {
        switch(this.visualiserType) {
            case typesOfVisualisers.Grid:
                if(e.x !== undefined)
                this.visualiser.setNodeState(event.endX, event.endY, states.goal);
                break;
            case typesOfVisualisers.Graph:
                this.visualiser.setNodeState(event.id,states.goal);
        }
    }
    generateNode(event)
    {
        switch(this.visualiserType)
        {
            case typesOfVisualisers.Graph:
                if(this.visualiser.selfDrawn === true)
                {
                    this.visualiser.addNode(event.id,event.data,event.pId,event.g,event.f,event.h);
                }
                else
                {
                    this.setNodeState(event);
                    this.setNodeValues(event);
                }

        }
    }
    setNodeState(event,state)
    {
        switch(this.visualiserType) {
            case typesOfVisualisers.Grid:
                this.visualiser.setNodeState(event.x, event.y, state);
                break;
            case typesOfVisualisers.Graph:
                this.visualiser.setNodeState(event.id,state)
        }
    }

    setNodeValues(event)
    {
        switch(this.visualiserType) {
            case typesOfVisualisers.Grid:
                this.visualiser.setNodeValues(event.x, event.y, event.g, event.f, event.pX, event.pY);
                break;
            case typesOfVisualisers.Graph:
                this.visualiser.setNodeValues(event.id,event.data,event.g,event.f,event.pId);
                break;

        }
    }

    drawPath(index,event)
    {
        switch(this.visualiserType) {
            case typesOfVisualisers.Grid:
                this.visualiser.drawLine(index,event.x,event.y);
                break;
            case typesOfVisualisers.Graph:
                this.visualiser.drawLine(index,event.id);
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
            case typesOfVisualisers.Graph:
                return this.visualiser.isBreakPoint(event.id);
        }
    }
    removeBreakPoint(event)
    {
        switch(this.visualiserType)
        {
            case typesOfVisualisers.Grid:
                return this.visualiser.removeBreakPoint(event.x,event.y);
            case typesOfVisualisers.Graph:
                return this.visualiser.removeBreakPoint(event.id);
        }
    }
    getNodeData(event)
    {
        switch(this.visualiserType) {
            case typesOfVisualisers.Grid:
                return this.visualiser.getNodeData(event.x, event.y);
            case typesOfVisualisers.Graph:
                return this.visualiser.getNodeData(event.id);
        }
    }
    getParentData(event)
    {
        switch(this.visualiserType)
        {
            case typesOfVisualisers.Grid:
                const nodeData = this.visualiser.getNodeData(event.x,event.y);
                console.log("Null?"+nodeData.px !== -1 ? this.visualiser.getNodeData(nodeData.px,nodeData.py): null);
                return nodeData.px !== -1 ? this.visualiser.getNodeData(nodeData.px,nodeData.py): null;
            case typesOfVisualisers.Graph:
                const current = this.visualiser.getNodeData(event.id);
                return current.pId !== null ? this.visualiser.getNodeData(current.pId) : null;

        }
    }
    reset()
    {
        this.visualiser.deleteLine(0);
        this.visualiser.deleteLine(1);
        switch(this.visualiserType)
        {
            case typesOfVisualisers.Grid:
                this.visualiser.deleteFloatBox();
                this.visualiser.reset();
                break;
            case typesOfVisualisers.Graph:
                this.visualiser.clearTree();
                break;
        }

    }
    reload()
    {
        switch(this.visualiserType)
        {
            case typesOfVisualisers.Grid:
                this.visualiser.deleteFloatBox();
                this.visualiser.reloadMap();
                break;
            case typesOfVisualisers.Graph:
                this.visualiser.clearTree();
                break;
        }
    }

}