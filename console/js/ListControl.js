class ListControl
{
    constructor(type)
    {
        this.type = type;
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
                switch(this.type)
                {
                    case typesOfVisualisers.Grid:
                        eventli.setAttribute("id", (String(event.x) + "." + String(event.y)));
                        newMainItem = document.createTextNode(event.type + ", x= " + event.x + ", y= " + event.y);// + ", g= " + event.g + ", h= " + (event.f - event.g ) + ", f= " + event.f);
                        break;
                    case typesOfVisualisers.Graph:
                        eventli.setAttribute("id", event.type+event.id);
                        newMainItem = document.createTextNode(event.type + ", ID = " + event.id);// + ", g= " + event.g + ", h= " + (event.f - event.g ) + ", f= " + event.f);
                        break;

                }
                eventli.appendChild(newMainItem);
                $('#eventList').append(eventli);

                var mydiv = $(".eventLog");
                mydiv.scrollTop(mydiv.prop("scrollHeight"));
                break;

            case lists.open:
                var eventli = document.createElement("LI");
                let newOpenItem;
                switch(this.type)
                {
                    case typesOfVisualisers.Grid:
                        this.openList.push("id: (x:"+event.x+" , y:"+event.y+") h:" + (event.f-event.g).toPrecision(5) +" g:"+event.g+" f:"+event.f);
                        break;
                    case typesOfVisualisers.Graph:
                        this.openList.push(event.id);
                        break;

                }
                document.getElementById('openList').innerHTML = String(this.openList.join('<br>'));
                break;

            case lists.closed:
                switch(this.type)
                {
                    case typesOfVisualisers.Grid:
                        this.closedList.push("( x: "+event.x+" ,y: "+event.y+") \n");
                        break;
                    case typesOfVisualisers.Graph:
                        this.closedList.push(event.id);
                        break;

                }
                document.getElementById('closedList').innerHTML = String(this.closedList);

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
        switch(typesOfVisualisers)
        {
            case typesOfVisualisers.Grid:
                listIndex = list.indexOf(" " + String(event.x) + " " + String(event.y));
                break;

            case typesOfVisualisers.Graph:
                listIndex = list.indexOf(event.id);

        }
        list.splice(listIndex, 1);
    }

    addErrorAt(nodeData,errorText)
    {
        var eventli = document.createElement("LI");
        switch(this.type)
        {
            case typesOfVisualisers.Grid:
                eventli.setAttribute("id", (String(nodeData.x) + "." + String(nodeData.y)+"E"));
                errorText += " at ("+String(nodeData.x) + "." + String(nodeData.y)+")";
                break;
            case typesOfVisualisers.Graph:
                eventli.setAttribute("id", nodeData.id);
                errorText += " at "+nodeData.id;
        }
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