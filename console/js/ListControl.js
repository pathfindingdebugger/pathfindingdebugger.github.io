class ListControl
{
    constructor(type)
    {
        this.type = "typesOfVisualiser.Graph";


        this.closedList = [];
        this.openList = [];
    }

    addToList(list,event)
    {
        switch(list)
        {
            case lists.events:
                var eventli = document.createElement("LI");
                let newMainItem;

                eventli.setAttribute("id", event.type+event.id);
                newMainItem = document.createTextNode(event.type + ", ID = " + event.id);// + ", g= " + event.g + ", h= " + (event.f - event.g ) + ", f= " + event.f);

                eventli.appendChild(newMainItem);
                $('#eventList').append(eventli);

                var mydiv = $(".eventLog");
                mydiv.scrollTop(mydiv.prop("scrollHeight"));
                break;

            case lists.open:
                console.log("this.type");

                this.openList.push({id:event.id,data:"id: "+event.id +" data: "+event.data+ " h:" + (event.f-event.g).toPrecision(5) +" g:"+event.g+" f:"+event.f});

                document.getElementById('openList').innerHTML = String(this.openList.map(e=>e.data).join('<br>'));
                break;

            case lists.closed:
                switch(this.type)
                {
                    case "typesOfVisualisers.Graph":
                        this.closedList.push({id:event.id, data:event.id});
                        break;

                }
                document.getElementById('closedList').innerHTML = String(this.closedList.map(e=>e.data).join('<br>'));

        }

    }
    updateList(listType,event)
    {
        let list = undefined;
        let listIndex = undefined;
        let newData = undefined;
        switch(listType)
        {
            case lists.open:
                list = this.openList;
                newData = "id:"+event.id+" h:" + (event.f-event.g).toPrecision(5) +" g:"+event.g+" f:"+event.f;
                break;
            case lists.closed:
                list = this.closedList;
                newData = event.data+ " h:" + (event.f-event.g).toPrecision(5) +" g:"+event.g+" f:"+event.f;
                break;
        }
        listIndex = list.map((e)=>e.id === event.id).indexOf(true);

        if(listIndex != -1)
        {
            list[listIndex].data = newData;
        }

    }
    removeFromList(listType,event)
    {
        let list = undefined;
        let listIndex = undefined;
        switch(listType)
        {
            case lists.open:
                list = this.openList;
                break;
            case lists.closed:
                list = this.closedList;
                break
        }
        listIndex = list.map((e)=>e.id === event.id).indexOf(true);

        list.splice(listIndex, 1);
    }

    addErrorAt(nodeData,errorText)
    {
        var eventli = document.createElement("LI");

        eventli.setAttribute("id", nodeData.id);
        errorText += " at "+nodeData.id;

        var newMainItem = document.createTextNode(errorText);
        eventli.appendChild(newMainItem);
        $('#eventList').append(eventli);
    }

    reset()
    {

        this.openList = [];
        this.closedList = [];
    }
}