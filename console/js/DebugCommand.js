class DebugCommand
{
    constructor(events,visual)
    {
        this.visualControl = visual;
        this.visualControl.setLog();
        this.eventCounter = 0;
        this.eventList = events;

        this.currentId = null;
        this.currentNode = null;
        this.currentNodes = [];

        this.closedList = [];
        this.openList = [];

        this.showEvent = false;
        this.stepForward();
    }
    complete()
    {
        return this.eventCounter >= this.eventList.length
    }

    play(speed) {
        this.currentId = setInterval(
            () => {
                if (!this.complete()) {
                    const error = !this.runEvent(this.eventList[this.eventCounter]);
                    if (error) {
                        this.stop();
                    }
                }
                else {
                    clearInterval(this.currentId);
                }
                this.eventCounter++;
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
            this.runEvent(this.eventList[this.eventCounter]);
            this.eventCounter++;
            console.log(this.costToGoal);
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

    runEvent(event) // NEED TO REFACTOR TO ALLOW FOR ALL NON EXPANSIONS TO OCCUR IN ONE ROUND
    {
        let nodeData = null;

        if(event.type !== "start" && event.type !== "end")
        {
            var eventli = document.createElement("LI");
            eventli.setAttribute("id", (String(event.x) + "." + String(event.y)));
            var newMainItem = document.createTextNode(event.type + ", x= " + event.x + ", y= " + event.y);// + ", g= " + event.g + ", h= " + (event.f - event.g ) + ", f= " + event.f);
            eventli.appendChild(newMainItem);
            $('#eventList').append(eventli);

            var mydiv = $(".eventLog");
            mydiv.scrollTop(mydiv.prop("scrollHeight"));
        }

        switch (event.type) {
            case "start":
                this.visualControl.showStartAndGoal(event);
                this.costToGoal = this.getCostOfSearch(this.eventCounter);
                console.log(this.costToGoal);
                break;
            case "expanding":
                this.visualControl.clearPath(1);
                this.visualControl.drawPath(1,event);
                this.visualControl.setNodeState(event,states.Current);
                // TODO Figure out how to abstract the output messages
                this.openList.push(" " + String(event.x) + " " + String(event.y));
                break;

            case "generating":

                this.currentNodes.push(event);
                this.visualControl.setNodeState(event,states.CurrentFrontier);
                this.visualControl.setNodeValues(event);
                this.openList.push(" (" + String(event.x) + " , " + String(event.y)+")");

                nodeData =  this.visualControl.getNodeData(event);
                console.log("Generated");
                if(!this.heuristicCheck(nodeData) || this.visualControl.breakPointCheck(event))
                {
                    return false;
                }
                break;

            case "updating":
                this.currentNodes.push(event);
                this.visualControl.setNodeState(event, states.CurrentFrontier);

                nodeData = this.visualControl.getNodeData(event);

                //TODO See what taking this out does...
                if (event.f < nodeData.f || (event.f === nodeData.f && event.g < nodeData.g)) {
                    this.visualControl.setNodeValues(event);

                    nodeData =  this.visualControl.getNodeData(event);
                    if(!this.heuristicCheck(nodeData))
                    {
                        return false;
                        console.log("FAILED TEST");
                    }
                }
                break;

            case "closing":
                // this.breakPointCheck();
                this.currentNodes.forEach((e)=>this.visualControl.setNodeState(e, states.inFrontier));
                this.currentNodes = [];

                this.visualControl.setNodeState(event , states.expanded);

                //TODO That list command or just... something
                this.closedList.push(" " + String(event.x) + " " + String(event.y));


                var openListItemIndex = this.openList.indexOf(" " + String(event.x) + " " + String(event.y));
                this.openList.splice(openListItemIndex, 1);
                break;

            case "end":
                this.visulizer.deleteFloatBox();
                if(!(this.eventCounter+2 >= this.eventList.length))
                    this.emptyEventList();
                    this.visualControl.reloadMap();
                    this.visualControl.deleteFloatBox();
                    mydiv = "";
                break;
        }
        document.getElementById('closedList').innerHTML = String(this.closedList);
        document.getElementById('openList').innerHTML = String(this.openList);
        return true;
    }

    heuristicCheck(nodeData)
    {
        const marginError = 0.0005;
        const parentData = this.visualControl.getNodeData({x:nodeData.px,y:nodeData.py});
        const isMonotonic = (p,n) =>  (n.h <= ((p.g - n.g) + p.h) - marginError || (n.h <= ((p.g - n.g) + p.h)+marginError));
        const isAdmissible = (n) => (n.h <= this.costToGoal - n.g);
        console.log(this.costToGoal);
        console.log("H: "+nodeData.h);
        console.log("G: "+nodeData.g);
        console.log(this.costToGoal - nodeData.g);
        if(!isMonotonic(nodeData,parentData))
        {
            this.addErrorAt(nodeData.x,nodeData.y,"Not Monotonic");
            return false;
        }

        if(!isAdmissible(nodeData))
        {
            this.addErrorAt(nodeData.x,nodeData.y,"Might not be admissible");
            //return false;
        }
        return true;

    }

    addErrorAt(x,y,errorText)
    {
        var eventli = document.createElement("LI");
        eventli.setAttribute("id", (String(x) + "." + String(y)+"E"));
        var newMainItem = document.createTextNode(errorText);
        eventli.appendChild(newMainItem);
        $('#eventList').append(eventli);
    }

}