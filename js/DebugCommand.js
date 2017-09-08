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
    play(speed)
    {
        this.currentId = setInterval(
            () => {
                console.log(this.eventCounter,this.eventList[this.eventCounter]);
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
    stepForward()
    {
        if(!this.complete())
        {
            this.runEvent(this.eventList[this.eventCounter]);

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