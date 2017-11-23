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
    constructor(type,mapData,events)
    {
        this.playing = false; // Used to tell other scripts if it is currently running
        this.visualControl = new visualiserControl(type,mapData,events); // The visualControl allows for the debug
        //command to be separated from weather the incoming json is for a grid, graph or any other visualisation
        this.listControl = new ListControl(type); // In a similar vein to visualControl (which controls, how did you guess it
        //the visualiser :O ) The list control abstracts away the detail for the lists.
        this.eventCounter = 0; //Is the current event number we are on
        this.eventList = events; // This is the event list from the Json file

        this.currentId = null;  // This is the interval Id, it is needed to stop it
        this.currentNode = null; //Current searched node
        this.currentNodes = []; //

        this.showEvent = false;
        this.stepForward();
        //this.visualControl.setLog();

        this.testStaus = [true];
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
                this.visualControl.showStart(event);
                this.visualControl.showGoal(event);
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

                this.currentNodes.push(event);
                this.visualControl.setNodeState(event, states.CurrentFrontier);
                this.listControl.updateList(lists.open,event);
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
                this.visualControl.showGoal(event);
                if(this.eventCounter+1 < this.eventList.length) {
                    this.visualControl.reload();
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
        this.testStaus[test] = !this.testStaus[test];
        console.log(this.testStaus[test]);
    }
    heuristicCheck(nodeData)
    {
        const marginError = 0.0005;
        const parentData = this.visualControl.getParentData(nodeData);
        if(parentData === null)
        {
            return true;
        }

        //Checks
        const isMonotonic = (p,n) =>  (n.h <= ((p.g - n.g) + p.h) - marginError || (n.h <= ((p.g - n.g) + p.h)+marginError));
        const isAdmissible = (n) => (n.h <= this.costToGoal - n.g);


        if(this.testStaus[tests.monotonicity] && !isMonotonic(nodeData,parentData))
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

    reset()
    {
        this.eventCounter = 0;
        this.stop();
        this.visualControl.reset();
        this.listControl.reset();
    }

}