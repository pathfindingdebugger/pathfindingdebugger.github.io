class DebugCommand
{
    constructor(events,visual)
    {
        this.visulizer = visual;
        this.eventCounter = 0;
        this.eventList = events;
        this.currentId = null;
    }
    complete()
    {
        return this.eventCounter >= this.eventList.size
    }

    // play(speed)
    // {
    //     this.currentId = setInterval(
    //         () => {
    //             console.log(this.eventCounter,this.eventList[this.eventCounter]);
    //             if(!this.complete())
    //             {
    //                 this.runEvent(this.eventList[this.eventCounter]);
    //             }
    //             else
    //             {
    //                 clearInterval(this.currentId);
    //             }
    //             this.eventCounter++;
    //         },speed);
    // }

    // Testing
    play(speed, i,dataReceived, currentEventNum)
    {
        this.currentId = setInterval(
            () => {
                console.log(this.eventCounter,this.eventList[this.eventCounter]);
                if(!this.complete())
                {
                    this.runEvent(this.eventList[this.eventCounter]);

                    var eventli = document.createElement("LI");
                    eventli.setAttribute("id", i);
                    i++;
                    var newMainItem = document.createTextNode(dataReceived[i].type + ", x= " + dataReceived[i].x + ", y= " + dataReceived[i].y + ", g= " + dataReceived[i].g + ", h= " + dataReceived[i].h);
                    currentEventNum += 1;
                    eventli.appendChild(newMainItem);
                    $('#eventList').append(eventli);

                    var mydiv = $(".eventLog");
                    mydiv.scrollTop(mydiv.prop("scrollHeight"));
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
    // stepForward()
    // {
    //     if(!this.complete())
    //     {
    //         this.runEvent(this.eventList[this.eventCounter]);
    //         this.eventCounter++;
    //     }
    // }

    // Testing
    stepForward()
    {
        if(!this.complete())
        {
            this.runEvent(this.eventList[this.eventCounter]);
            this.eventCounter++;

            var eventli = document.createElement("LI");
            eventli.setAttribute("id", i);
            i++;
            var newMainItem = document.createTextNode(dataReceived[i].type + ", x= " + dataReceived[i].x + ", y= " + dataReceived[i].y + ", g= " + dataReceived[i].g + ", h= " + dataReceived[i].h);
            currentEventNum += 1;
            eventli.appendChild(newMainItem);
            $('#eventList').append(eventli);

            var mydiv = $(".eventLog");
            mydiv.scrollTop(mydiv.prop("scrollHeight"));
        }
    }
    stepBack()
    {

    }

    runEvent(event)
    {
        console.log(event.x, event.y);

        switch (event.type) {
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
    }

}