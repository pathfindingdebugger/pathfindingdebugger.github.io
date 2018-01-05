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

const states = {
    NotSearched:"NotSearched",
    inFrontier:"inFrontier",
    expanded:"expanded",
    start:"start",
    goal:"goal",
    Current:"Current",
    CurrentFrontier:"CurrentFrontier"
};

class DebugCommand {
    // The debug control has domain over the control flow of the debug
    //It is initiated when the user uploads a file
    constructor() {
        this.testStatus = [true];
        // this.visualControl = new CustomVisualiser(data);
        this.listControl = new ListControl(); // In a similar vein to visualControl (which controls, how did you guess it

        this.path = undefined;
        this.map = null;
        this.legend = new Legend(states);

        this.resetMap = type => newMap => {
            console.log("NG", this);
            //Reset the debugger
            if (this.map != undefined) {
                this.map.reset();
            }
            this.map = new Map(type, newMap, 1);
            this.reset()
        };


    }

    complete() {
        return this.eventCounter >= this.eventList.length
    }

    play(speed) {
        this.playing = true;
        this.currentId = setInterval(
            () => {
                if (!this.complete()) {
                    let result = true;/// = this.eventList[this.eventCounter].type;
                    while (result !== "expanding" || result === false) {
                        result = this.runEvent(this.eventList[this.eventCounter]);
                        //if(result !== "expanding")
                           this.eventCounter++;

                        console.log(result);
                        if (result === false) {
                            this.stop();
                            console.log("Should've stopped");
                            return;
                        }
                    }

                    if(this.defaultSpeed !== this.currentSpeed)
                    {
                       this.changeSpeed(this.defaultSpeed);
                    }
                }
                else {
                    clearInterval(this.currentId);
                }


            }, speed);

    }


    stop() {
        this.playing = false;
        clearInterval(this.currentId);
    }

    setDefaultSpeed(speed)
    {
        this.defaultSpeed = speed;
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
        this.currentSpeed = speed;
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
        let result;
        if(event.type !== "start" && event.type !== "end")
        {
            this.listControl.addToList(lists.events,event)
        }
        if(event.comment !== undefined && event.waitTime !== undefined)
        {
            this.visualControl.showMessage(event.comment,event.waitTime);

        }
        if(event.waitTime !== undefined)
        {
            console.log("established");
            result = false;

            setTimeout(()=>{this.play(this.defaultSpeed)},event.waitTime);
        }
        switch (event.type) {
            case "start":
                this.visualControl.showStart(event);
                this.visualControl.showGoal(event);
                this.setPathSaveButton(false);
                this.costToGoal = this.getCostOfSearch(this.eventCounter);
                console.log(this.costToGoal);
                break;
            case "expanding":
                this.current = event.id;
                this.listControl.removeFromList(lists.open,event);
                this.visualControl.deleteLine(1);
                this.visualControl.drawLine(1,event.id);
                this.visualControl.setNodeState(event.id,states.Current);

                if(this.visualControl.isBreakPoint(event.id))
                {
                    this.visualControl.removeBreakPoint(event.id);
                    result = false;
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
                    result = false;
                }if(this.visualControl.isBreakPoint(event))
                {
                    this.visualControl.removeBreakPoint(event);
                    result = false;
                }
                break;

            case "updating":

                this.currentNodes.push(event);
                this.visualControl.setNodeState(event.id, states.CurrentFrontier);
                this.listControl.updateList(lists.open,event);
                nodeData = this.visualControl.getNodeData(event);



                this.visualControl.setNodeValues(event);


                this.visualControl.deleteLine(1);
                this.visualControl.drawLine(1,event.id);
                nodeData =  this.visualControl.getNodeData(event);
                if(!this.heuristicCheck(nodeData))
                {
                    result = false;
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
                this.path = this.visualControl.lineVisual[1];

                this.setPathSaveButton(true);

                if(this.eventCounter+1 < this.eventList.length) {
                    this.visualControl.clearVisual();
                    this.listControl.reset();
                }else{
                    this.stop();
                    result = false;
                }

                break;
        }
        return result !== false ? event.type : false;
    }
    showSavedPath(index)
    {
        console.log(this,"CAKE!");
        this.visualControl.lineVisual[2] = this.completedLists[index];
        this.visualControl.renderLine(2);
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
    clearMap()
    {
        this.map.reset();
    }
    reset(data)
    {
        this.eventCounter = 0;
        this.stop();
        if(this.visualControl !== undefined)
        {
            this.visualControl.clearVisual();
        }

        this.listControl.reset();

        if(data !== undefined)
            this.loadData(data);

    }
    loadData(data)
    {
        this.visualControl = new CustomVisualiser(data,this.map);

        const events = data.eventList;
        this.playing = false;
        this.eventList = events;
        this.currentId = null;
        this.currentNodes = [];
        this.stepForward();
    }
    centerCameraOnCurrent()
    {
        centerCamera(this.visualControl.svg,this.visualControl.getNodePosition(this.current),this.visualControl.scale)
    }

    setPathSaveButton(value)
    {
        document.getElementById("pathCompareTabBtn").disabled = !value;
        document.getElementById("loadPathBtn").disabled = !value;
        document.getElementById("savePathBtn").disabled = !value;
    }
}