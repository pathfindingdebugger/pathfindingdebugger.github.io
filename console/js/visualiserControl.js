typesOfVisualisers = {
    Grid:"Grid",
    Graph:"Graph",
    SearchTree:"SearchTree",
    Custom:"Custom"
};

// This class is responsible for interfacing the debug command, which deals with events, to the visualisers which deal in specific terms such as xy coordinates or ids
class visualiserControl
{
    constructor(data)
    {
        const type = data.type;
        const mapData = data.Map;
        const eventList = data.eventList;
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
               this.visualiser = new GraphVisualizer(false,mapData,eventList);
               break;
           case "Custom":
               console.log("Deds");
               this.visualiserType = typesOfVisualisers.Custom;
               this.visualiser = new CustomVisualiser(data);
               console.log("Reached");
               break;
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
                break;
            case typesOfVisualisers.Custom:
                this.visualiser.addNodeFromEvent(event);
                break;

        }
    }
    setNodeState(event,state)
    {
        switch(this.visualiserType) {
            case typesOfVisualisers.Grid:
                this.visualiser.setNodeState(event.x, event.y, state);
                break;
            case typesOfVisualisers.Graph:
                this.visualiser.setNodeState(event.id,state);
                break;
            case typesOfVisualisers.Custom:
                this.visualiser.setNodeState(event,state)
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
            case typesOfVisualisers.Custom:
                this.visualiser.setNodeValues(event)

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
            case typesOfVisualisers.Custom:
                this.visualiser.drawLine(index,event);
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
            case typesOfVisualisers.Custom:
                return this.visualiser.getNodeData(event);
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

            case typesOfVisualisers.Custom:
                const currentNode = this.visualiser.getNodeData(event);
                return currentNode.pId !== null && currentNode.pId !== "null" ? this.visualiser.getNodeData({id:currentNode.pId}) : null;

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