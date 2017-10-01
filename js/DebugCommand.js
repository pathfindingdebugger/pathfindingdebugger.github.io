class DebugCommand
{
    constructor(events,visual,playing)
    {
        this.visulizer = visual;

        this.eventCounter = 0;
        this.eventList = events;
        this.currentId = null;
        this.currentNode = null;
        this.closedList = [];
        this.openList = [];
        this.showEvent = false;
    }
    complete()
    {
        return this.eventCounter >= this.eventList.length
    }

    play(speed)
    {
        this.currentId = setInterval(
            () => {
                if(!this.complete())
                {
                    this.runEvent(this.eventList[this.eventCounter]);

                }
                else
                {
                    clearInterval(this.currentId);
                }
                this.eventCounter++;
            },speed);
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
        var breakPointIndex = this.visulizer.breakPoints.indexOf(this.eventList[this.eventCounter].x + ":" + (this.eventList[this.eventCounter].y - 4));
        if (breakPointIndex === -1) {
            return true
        }
        else {
            this.stop();
            console.log("Stopped at: ", this.eventList[this.eventCounter].x + ":" + (this.eventList[this.eventCounter].y - 4));
            this.visulizer.breakPoints.splice(breakPointIndex);
            playing = false
        }
    }

    runEvent(event) // NEED TO REFACTOR TO ALLOW FOR ALL NON EXPANSIONS TO OCCUR IN ONE ROUND
    {
        var eventli = document.createElement("LI");
        eventli.setAttribute("id", (String(event.x) + "." + String(event.y)));
        var newMainItem = document.createTextNode(event.type + ", x= " + event.x + ", y= " + event.y + ", g= " + event.g + ", h= " + (event.f - event.g ) + ", f= " + event.f);
        eventli.appendChild(newMainItem);
        $('#eventList').append(eventli);

        var mydiv = $(".eventLog");
        mydiv.scrollTop(mydiv.prop("scrollHeight"));

        console.log("current = ", event.x, event.y);

        switch (event.type) {
            case "expanding":
                this.currentNode = {x: event.x, y: event.y}; //If expanding then just set current node and return
                this.openList.push(" " + String(event.x) + " " + String(event.y));
                break;

            case "generating":
                this.breakPointCheck();
                this.visulizer.setNodeState(event.x, event.y, states.inFrontier);
                this.visulizer.setNodeValues(event.x, event.y, event.g, event.f, this.currentNode);
                this.openList.push(" " + String(event.x) + " " + String(event.y));
                break;

            case "updating":
                this.visulizer.setNodeState(event.x, event.y, states.inFrontier);
                if (event.f < this.visulizer.getNodeData(event.x, event.y).f || (event.f === this.visulizer.getNodeData(event.x, event.y).f
                    && event.g < this.visulizer.getNodeData(event.x, event.y).g)) {
                    this.visulizer.setNodeValues(event.x, event.y, event.g, event.f, this.currentNode);
                }
                break;

            case "closing":
                // this.breakPointCheck();
                this.visulizer.setNodeState(event.x, event.y, states.expanded);
                this.closedList.push(" " + String(event.x) + " " + String(event.y));
                var openListItemIndex = this.openList.indexOf(" " + String(event.x) + " " + String(event.y));
                this.openList.splice(openListItemIndex, 1);
                break;

        }
        document.getElementById('closedList').innerHTML = String(this.closedList);
        document.getElementById('openList').innerHTML = String(this.openList);
        }


    eventClick(id)
    {
        id = id.split(".");
        var getX = parseInt(id[0]);
        var getY = parseInt(id[1]);
        console.log("Event clicked = ", getX, getY);

        if(this.showEvent == false){
            this.visulizer.drawLine(getX,getY);
            this.showEvent = true
        }
        else{
            this.visulizer.deleteLine();
            this.visulizer.drawLine(getX,getY);
        }

    }
}