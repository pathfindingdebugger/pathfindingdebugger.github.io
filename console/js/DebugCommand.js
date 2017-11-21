lists =
{
    events:0,
    open:1,
    closed:2
};


class DebugCommand
{
    constructor(type,mapData,events)
    {
        this.visualControl = new visualiserControl(type,mapData,events);
        this.listControl = new ListControl(type);
        this.eventCounter = 0;
        this.eventList = events;

        this.currentId = null;
        this.currentNode = null;
        this.currentNodes = [];



        this.showEvent = false;
        this.stepForward();
        //this.visualControl.setLog();
    }
    complete()
    {
        return this.eventCounter >= this.eventList.length
    }

    play(speed) {
        this.currentId = setInterval(
            () => {
                if (!this.complete()) {
                    let result = "generating";
                    while(result !== "expanding")
                    {

                        result = this.runEvent(this.eventList[this.eventCounter]);
                        this.eventCounter++;
                        if (result === false) {
                            this.stop();
                            result = "expanding";
                        }
                    }

                }
                else {
                    clearInterval(this.currentId);
                }

            }, speed);

    }


    stop()
    {
        clearInterval(this.currentId);
    }
    changeSpeed(speed)
    {
        this.stop();
        if(speed <= 0)
        {
            this.play(0);
        }
        else
        {
            this.play(speed);

        }

    }
    //
    stepForward()
    {
        if(!this.complete())
        {
            console.log(this.eventList.length);
            this.runEvent(this.eventList[this.eventCounter]);
            this.eventCounter++;
        }
    }

    stepBack()
    {

    }

    emptyEventList(){
        this.openList = [];
        this.closedList = [];
        var eventLi = $('#eventList');
        eventLi.empty();
        console.log("Reached here!")
    }

    getCostOfSearch(startIndex)
    {
        for(i = startIndex; i < this.eventList.length; i++)
        {
            if(this.eventList[i].type === "end")
            {
                console.log("End is at"+i);
                for(j = i ; j > 0 ; j--)
                {
                    if(this.eventList[j].x === this.eventList[startIndex].endX && this.eventList[j].y === this.eventList[startIndex].endY)
                    {
                        console.log("Last generated is at" +j + "With g of" + this.eventList[j].g);
                        return this.eventList[j].g;

                    }
                }
            }
        }
    }

    runEvent(event)
    {
        let nodeData = null;

        if(event.type !== "start" && event.type !== "end")
        {
            this.listControl.addToList(lists.events,event)
        }

        switch (event.type) {
            case "start":
                this.visualControl.showStartAndGoal(event);
                this.costToGoal = this.getCostOfSearch(this.eventCounter);
                console.log(this.costToGoal);
                break;
            case "expanding":
                this.listControl.removeFromList(lists.open,event);
                this.visualControl.clearPath(1);
                this.visualControl.drawPath(1,event);
                this.visualControl.setNodeState(event,states.Current);

                if(this.visualControl.breakPointCheck(event))
                {
                    this.visualControl.removeBreakPoint(event);
                    return false;
                }

                break;

            case "generating":

                this.currentNodes.push(event);
                this.visualControl.generateNode(event);
                this.visualControl.setNodeState(event,states.CurrentFrontier);
                this.visualControl.setNodeValues(event);

                this.listControl.addToList(lists.open,event);

                nodeData =  this.visualControl.getNodeData(event);

                if(!this.heuristicCheck(nodeData))
                {
                    return false;
                }
                if(this.visualControl.breakPointCheck(event))
                {
                    this.visualControl.removeBreakPoint(event);
                    return false;
                }
                break;

            case "updating":
                //TODO update value on open
                this.currentNodes.push(event);
                this.visualControl.setNodeState(event, states.CurrentFrontier);

                nodeData = this.visualControl.getNodeData(event);

                    this.visualControl.setNodeValues(event);

                    nodeData =  this.visualControl.getNodeData(event);
                    if(!this.heuristicCheck(nodeData))
                    {
                        return false;
                    }
                break;

            case "closing":

                //Set colors of all current search nodes to the frontier color and set the current node to expanded
                this.currentNodes.forEach((e)=>this.visualControl.setNodeState(e, states.inFrontier));
                this.currentNodes = [];
                this.visualControl.setNodeState(event , states.expanded);

                //Update the list values
                this.listControl.addToList(lists.closed,event);
                break;

            case "end":

                if(!(this.eventCounter+2 >= this.eventList.length))
                    this.emptyEventList();
                    this.visualControl.reload();
                    mydiv = "";
                break;
        }
        return event.type;
    }

    heuristicCheck(nodeData)
    {
        const marginError = 0.0005;
        console.log("weird...");
        const parentData = this.visualControl.getParentData(nodeData);
        if(parentData === null)
        {
            console.log("No parent");
            return true;
        }

        //Checks
        const isMonotonic = (p,n) =>  (n.h <= ((p.g - n.g) + p.h) - marginError || (n.h <= ((p.g - n.g) + p.h)+marginError));
        const isAdmissible = (n) => (n.h <= this.costToGoal - n.g);


        if(!isMonotonic(nodeData,parentData))
        {
            this.listControl.addErrorAt(nodeData,"Not Monotonic");
            console.log("THIS IS MEANT TO STOP");
            return false;
        }

        if(!isAdmissible(nodeData))
        {
            this.listControl.addErrorAt(nodeData,"Might not be admissible");
            //return false;
        }
        return true;

    }

    reset()
    {
        this.eventCounter = 0;
        this.stop();
        this.visualControl.reset();
        this.listControl.reset();
    }

}