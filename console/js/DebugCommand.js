class DebugCommand
{
    constructor(events,visual,playing)
    {
        this.visulizer = visual;
        this.visulizer.setLogChanger();
        this.eventCounter = 0;
        this.eventList = events;
        this.currentId = null;
        this.currentNode = null;
        this.closedList = [];
        this.openList = [];
        this.currentNodes = [];
        this.showEvent = false;
        this.playing = playing;
        this.stepForward();
    }
    complete()
    {
        return this.eventCounter >= this.eventList.length
    }

    play(speed)
    {
        this.currentId = setInterval(
            () => {
                if (!this.complete()) {
                    this.runEvent(this.eventList[this.eventCounter]);

                }
                else {
                    clearInterval(this.currentId);
                }
                this.eventCounter++;
            }, speed);

    }


    // Testing
    // play(speed)
    // {
    //     this.currentId = setInterval(
    //         () => {
    //             if(!this.complete())
    //             {
    //                 var breakPointIndex = this.visulizer.breakPoints.indexOf(this.eventList[this.eventCounter].x+":"+(this.eventList[this.eventCounter].y-4));
    //                 if (breakPointIndex === -1){
    //                     this.runEvent(this.eventList[this.eventCounter]);
    //                 }else{
    //                     this.stop();
    //                     console.log("Stopped at: ",this.eventList[this.eventCounter].x+":"+(this.eventList[this.eventCounter].y-4));
    //                     this.visulizer.breakPoints.splice(breakPointIndex);
    //                     playing = false
    //                 }
    //             }
    //             else
    //             {
    //                 clearInterval(this.currentId);
    //             }
    //             this.eventCounter++;
    //         },speed);
    // }


    stop()
    {
        clearInterval(this.currentId);
    }
    changeSpeed(speed)
    {
        this.stop();
        this.play(speed);

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

    // Testing
    // stepForward()
    // {
    //     if(!this.complete())
    //     {
    //         this.runEvent(this.eventList[this.eventCounter]);
    //         this.eventCounter++;
    //
    //         var eventli = document.createElement("LI");
    //         eventli.setAttribute("id", i);
    //         i++;
    //         var newMainItem = document.createTextNode(dataReceived[i].type + ", x= " + dataReceived[i].x + ", y= " + dataReceived[i].y + ", g= " + dataReceived[i].g + ", h= " + dataReceived[i].h);
    //         currentEventNum += 1;
    //         eventli.appendChild(newMainItem);
    //         $('#eventList').append(eventli);
    //
    //         var mydiv = $(".eventLog");
    //         mydiv.scrollTop(mydiv.prop("scrollHeight"));
    //     }
    // }

    stepBack()
    {

    }

    breakPointCheck() {
        var breakPointIndex = this.visulizer.breakPoints.indexOf(this.eventList[this.eventCounter].x + ":" + (this.eventList[this.eventCounter].y));
        if (breakPointIndex === -1) {
            return true
        }
        else {
            this.stop();
            console.log("Stopped at: ", this.eventList[this.eventCounter].x + ":" + (this.eventList[this.eventCounter].y));
            // this.visulizer.breakPoints.splice(breakPointIndex);
            playing = false
        }
    }

    emptyEventList(){
        this.openList = [];
        this.closedList = [];
        var eventLi = $('#eventList');
        eventLi.empty();
        console.log("Reached here!")
    }

    runEvent(event) // NEED TO REFACTOR TO ALLOW FOR ALL NON EXPANSIONS TO OCCUR IN ONE ROUND
    {
        let nodeData = null;

        if(event.type != "start" && event.type != "end")
        {
            var eventli = document.createElement("LI");
            eventli.setAttribute("id", (String(event.x) + "." + String(event.y)));
            var newMainItem = document.createTextNode(event.type + ", x= " + event.x + ", y= " + event.y);// + ", g= " + event.g + ", h= " + (event.f - event.g ) + ", f= " + event.f);
            eventli.appendChild(newMainItem);
            $('#eventList').append(eventli);

            var mydiv = $(".eventLog");
            mydiv.scrollTop(mydiv.prop("scrollHeight"));
        }
        //console.log("current = ", event.x, event.y);
        switch (event.type) {
            case "start":
                this.visulizer.setNodeState(event.startX,event.startY,states.start);
                this.visulizer.setNodeState(event.endX,event.endY,states.goal);

                break;
            case "expanding":
                this.visulizer.deleteLine(1);
                this.visulizer.drawLine(1,event.x,event.y);
                this.visulizer.setNodeState(event.x, event.y, states.Current);
                this.openList.push(" " + String(event.x) + " " + String(event.y));
                break;

            case "generating":
                this.breakPointCheck();
                this.currentNodes.push(event);
                this.visulizer.setNodeState(event.x, event.y, states.CurrentFrontier);
                this.visulizer.setNodeValues(event.x, event.y, event.g, event.f, event.pX, event.pY);
                this.openList.push(" " + String(event.x) + " " + String(event.y));

                nodeData =  this.visulizer.getNodeData(event.x, event.y);
                if(!this.heuristicCheck(nodeData))
                {
                    this.stop();
                    console.log("FAILED TEST");
                }
                break;

            case "updating":
                this.currentNodes.push(event);
                this.visulizer.setNodeState(event.x, event.y, states.CurrentFrontier);

                console.log("FIRST",event.x,event.y);
                nodeData =  this.visulizer.getNodeData(event.x, event.y);

                if (event.f < nodeData.f || (event.f === nodeData.f
                    && event.g < nodeData.g)) {
                    this.visulizer.setNodeValues(event.x, event.y, event.g, event.f, event.pX, event.pY);

                    console.log("Not first");
                    nodeData =  this.visulizer.getNodeData(event.x, event.y);
                    if(!this.heuristicCheck(nodeData))
                    {
                        this.stop();
                        console.log("FAILED TEST");
                    }
                }
                break;

            case "closing":
                // this.breakPointCheck();
                this.currentNodes.forEach((e)=>this.visulizer.setNodeState(e.x, e.y, states.inFrontier));
                this.currentNodes = [];

                this.visulizer.setNodeState(event.x, event.y, states.expanded);
                this.closedList.push(" " + String(event.x) + " " + String(event.y));


                var openListItemIndex = this.openList.indexOf(" " + String(event.x) + " " + String(event.y));
                this.openList.splice(openListItemIndex, 1);
                break;

            case "end":
                this.visulizer.deleteFloatBox();
                if(!(this.eventCounter+2 >= this.eventList.length))
                    this.emptyEventList();
                    this.visulizer.reloadMap();
                    mydiv = "";
                break;
        }
        document.getElementById('closedList').innerHTML = String(this.closedList);
        document.getElementById('openList').innerHTML = String(this.openList);
        }

    heuristicCheck(nodeData)
    {
        const marginError = 0.0005;
        const parentData = this.visulizer.getNodeData(nodeData.px,nodeData.py);
        const isMonotonic = (p,n) =>  (n.h <= ((p.g - n.g) + p.h) - marginError|| (n.h <= ((p.g - n.g) + p.h)+marginError ));

        return isMonotonic(nodeData,parentData)

    }


    svgItemClicked()
    {

        }

}