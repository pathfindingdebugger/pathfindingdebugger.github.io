class DebugCommand
{
    constructor(events,visual)
    {
        console.log(typeof events);
        this.visulizer = visual;

        this.eventCounter = 0;
        this.eventList = events;
        this.currentId = null;
        this.currentNode = null;
    }
    complete()
    {
        return this.eventCounter >= this.eventList.length
    }

    // play(speed)
    // {
    //     this.currentId = setInterval(
    //         () => {
    //             if(!this.complete())
    //             {
    //                 this.runEvent(this.eventList[this.eventCounter]);
    //             }
    //             else
    //             {
    //                 console.log("Cleared");
    //                 clearInterval(this.currentId);
    //             }
    //             this.eventCounter++;
    //         },speed);
    // }

    // Testing
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

    runEvent(event) // NEED TO REFACTOR TO ALLOW FOR ALL NON EXPANSIONS TO OCCUR IN ONE ROUND
    {
        var eventli = document.createElement("LI");
        eventli.setAttribute("id", this.eventCounter);
        var newMainItem = document.createTextNode(dataReceived[this.eventCounter].type + ", x= " + dataReceived[this.eventCounter].x + ", y= " + dataReceived[this.eventCounter].y + ", g= " + dataReceived[this.eventCounter].g + ", h= " + (dataReceived[this.eventCounter].f - dataReceived[this.eventCounter].g ) +", f= " + dataReceived[this.eventCounter].f);
        eventli.appendChild(newMainItem);
        $('#eventList').append(eventli);

        var mydiv = $(".eventLog");
        mydiv.scrollTop(mydiv.prop("scrollHeight"));

        switch (event.type) {
            case "expanding":
                this.currentNode = {x:event.x, y:event.y}; //If expanding then just set current node and return
                return;

            case "generating":
                this.visulizer.setNodeState(event.x, event.y, states.inFrontier);
                break;
            case "updating":
                this.visulizer.setNodeState(event.x, event.y, states.inFrontier);
                break;
            case "closing":
                this.visulizer.setNodeState(event.x, event.y, states.expanded);
                break;

        }
        this.visulizer.setNodeValues(event.x,event.y,event.g,event.f,this.currentNode)
    }

}