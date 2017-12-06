lists =
{
    events:0,
    open:1,
    closed:2
};
tests =
    {
        monotonicity:0
    };

class DebugCommand
{
    // The debug control has domain over the control flow of the debug
    //It is initiated when the user uploads a file
    constructor(data)
    {
        this.testStatus = [true];
        this.visualControl = new CustomVisualiser(data); // The visualControl allows for the debug

        //command to be separated from weather the incoming json is for a grid, graph or any other visualisation
        this.listControl = new ListControl(); // In a similar vein to visualControl (which controls, how did you guess it

        const events = data.eventList;
        this.playing = false; // Used to tell other scripts if it is currently running

        //the visualiser :O ) The list control abstracts away the detail for the lists.
        this.eventCounter = 0; //Is the current event number we are on
        this.eventList = events; // This is the event list from the Json file
        this.currentId = null;  // This is the interval Id, it is needed to stop it
        this.currentNodes = []; //
        this.stepForward();
        this.completedLists = [];
    }
    complete()
    {
        return this.eventCounter >= this.eventList.length
    }

    play(speed) {
        this.playing = true;
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
        this.playing = false;
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
                this.visualControl.showStart(event);
                this.visualControl.showGoal(event);
                this.costToGoal = this.getCostOfSearch(this.eventCounter);
                console.log(this.costToGoal);
                break;
            case "expanding":
                this.listControl.removeFromList(lists.open,event);
                this.visualControl.deleteLine(1);
                this.visualControl.drawLine(1,event.id);
                this.visualControl.setNodeState(event.id,states.Current);

                if(this.visualControl.isBreakPoint(event.id))
                {
                    this.visualControl.removeBreakPoint(event.id);
                    return false;
                }

                break;

            case "generating":

                this.currentNodes.push(event);
                this.visualControl.addNodeFromEvent(event);
                this.visualControl.setNodeState(event.id,states.CurrentFrontier);
                this.visualControl.setNodeValues(event);

                this.listControl.addToList(lists.open,event);


                this.visualControl.drawLine(1,event.id);

                nodeData =  this.visualControl.getNodeData(event);

                if(!this.heuristicCheck(nodeData))
                {
                    return false;
                }if(this.visualControl.isBreakPoint(event))
                {
                    this.visualControl.removeBreakPoint(event);
                    return false;
                }
                break;

            case "updating":

                this.currentNodes.push(event);
                this.visualControl.setNodeState(event.id, states.CurrentFrontier);
                this.listControl.updateList(lists.open,event);
                nodeData = this.visualControl.getNodeData(event);

                this.visualControl.deleteLine(1);
                this.visualControl.drawLine(1,event.id);

                this.visualControl.setNodeValues(event);

                    nodeData =  this.visualControl.getNodeData(event);
                    if(!this.heuristicCheck(nodeData))
                    {
                        return false;
                    }
                break;

            case "closing":

                //Set colors of all current search nodes to the frontier color and set the current node to expanded
                this.currentNodes.forEach((e)=>this.visualControl.setNodeState(e.id, states.inFrontier));
                this.currentNodes = [];
                this.visualControl.setNodeState(event.id , states.expanded);

                //Update the list values
                this.listControl.addToList(lists.closed,event);
                break;

            case "end":
                this.visualControl.showGoal(event.id);
                this.visualControl.drawLine(1,event.id);
                this.completedLists.push(this.visualControl.lineVisual[1]);
                if(this.eventCounter+1 < this.eventList.length) {
                    this.visualControl.clearVisual();
                    this.listControl.reset();
                }else{
                    this.stop();
                    return false;
                }

                break;
        }
        return event.type;
    }
    toggleTest(test)
    {
        console.log("TOGGLE ",test);
        this.testStatus[test] = !this.testStatus[test];
        console.log(this.testStatus[test]);
    }
    heuristicCheck(nodeData)
    {
        const marginError = 0.0005;
        const parentData = this.visualControl.getParentData(nodeData);
        if(parentData === null || parentData === "null")
        {
            return true;
        }

        //Checks
        const isMonotonic = (p,n) =>  (n.h <= ((p.g - n.g) + p.h) - marginError || (n.h <= ((p.g - n.g) + p.h)+marginError));
        const isAdmissible = (n) => (n.h <= this.costToGoal - n.g);


        if(this.testStatus[tests.monotonicity] &&!(isMonotonic(nodeData,parentData)))
        {
            this.listControl.addErrorAt(nodeData,"Not Monotonic");
            return false;
        }

        if(!isAdmissible(nodeData))
        {
            this.listControl.addErrorAt(nodeData,"Might not be admissible");
            //return false;
        }
        return true;

    }

    reset(data)
    {
        this.eventCounter = 0;
        this.stop();
        this.visualControl.clearVisual();
        this.listControl.reset();
        this.visualControl = new CustomVisualiser(data); // The visualControl allows for the debug

        const events = data.eventList;
        this.playing = false; // Used to tell other scripts if it is currently running

        //the visualiser :O ) The list control abstracts away the detail for the lists.
        this.eventList = events; // This is the event list from the Json file
        this.currentId = null;  // This is the interval Id, it is needed to stop it
        this.currentNodes = []; //
        this.stepForward();
    }

}