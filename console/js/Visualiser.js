class Visualiser {
    constructor()
    {
        this.breakPoints = new Array(0);
        this.breakPointVisual = new Array(0);
        this.floatBox = null;
        this.lineVisual = [null,null];
        this.svg  = document.getElementById("viewport");
    }
    generateFloatBox()
    {
        throw new Error('This is abstract');
    }

    deleteFloatBox()
    {
        if(this.floatBox !== null)
        {
            this.floatBox.elem.remove();
            this.floatBox = null
        }
    }

    drawLine()
    {
        throw new Error('This is abstract');
    }

    deleteLine(index)
    {
        if(this.lineVisual[index] !== null )
        {
            this.lineVisual[index].removeElement();
            this.lineVisual[index] = null;
        }

    }
    setElemState(elem,state)
    {
        switch (state) {
            case states.NotSearched:
                elem.attr("fill", "#ffffff");
                break;
            case states.Current:
                elem.attr("fill", "#ff0016");
                break;
            case states.CurrentFrontier:
                elem.attr("fill","#b021ff");
                break;
            case states.expanded:
                elem.attr("fill", "#00f6ff");
                break;
            case states.inFrontier:
                elem.attr("fill", "#0032ff");
                break;
            case states.start:
                elem.attr("fill", "#09ff00");
                break;
            case states.goal:
                elem.attr("fill", "#ff7700");
                break;

        }
        return elem;
    }
    setNodeValues()
    {
        throw new Error("This is abstract")
    }
    setNodeState()
    {
        throw new Error("This is abstract")
    }

    setLogChanger(debugFunction)
    {
        this.changeLog = debugFunction;
    }

    alterEventList(events){
        this.changeLog(xInput, yInput)

    }

    getNodeData()
    {
        throw new Error("This is abstract")
    }

    isBreakPoint()
    {
        throw new Error("This is abstract")
    }
}