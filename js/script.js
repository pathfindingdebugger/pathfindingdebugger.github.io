//Created by surayezrahman on 23/8/17.

var currentEventNum = 0;
var eventItems = [];
var openList = [];
var closedList = [];
var dataReceived;
let i = 0;

const states = {
    NotSearched:0,
    inFrontier:1,
    expanded:2,
    start:3,
    goal:4,
};


$(document).ready(function () {
    console.log("new1");

    $('#eventList').on('click', 'li', function(ev) {
        var id = this.id;
        thisList = document.getElementById(id).innerHTML;
        console.log("I was clicked! My ID is:"+id);
        document.getElementById('openList').innerHTML = thisList;
        document.getElementById('closedList').innerHTML = thisList;

    });

    function run(event) {
        console.log(event.x, event.y);

        switch (event.type) {
            case "generating":
                visual.setNodeState(event.x, event.y, states.inFrontier);
                break;
            case "updating":
                visual.setNodeState(event.x, event.y, states.inFrontier);
                break;
            case "closing":
                visual.setNodeState(event.x, event.y, states.expanded);
                break;

        }
    }

    $('.playbtn').click(function() {
        if(dataReceived!= null) {
        const timerId = setInterval(
            function () {
                console.log(i,eventItems[i]);
                if(i < eventItems.length)
                {
                    run(eventItems[i]);
                }
                else
                {
                    clearInterval(timerId);
                }
                i++;
        },1);


        }else{
            window.alert("No data loaded!")
        }
    });

    $('.stepbtn').click(function () {

        if(dataReceived!= null) {
                    console.log(i,eventItems[i]);
                    if(i < eventItems.length) {
                        run(eventItems[i]);
                    }
                    i++;
        }else{
            window.alert("No data loaded!")
        }
    });

    $('.pausebtn').click(function () {
        // console.log("Pause button");
        // visual.loadMap(3,3,100,"@.@.@.@.@");


    });

    $(document).ready(function(){
        $('.modal').modal();
    });

    $("#submit1btn").click(function () {
        var getText = document.getElementById('JSONinput').value;
        var currentJSON = JSON.parse(getText);
        dataReceived = currentJSON.eventList;
        var mapData = currentJSON.Map;

        visual.loadMap(mapData.mWidth,mapData.mHeight,10,mapData.mapData);

        eventItems = currentJSON.eventList;

        /*for (i = currentEventNum; i <= dataReceived.length - 1; i++) {
            var eventli = document.createElement("LI");
            eventli.setAttribute("id", i);
            var newMainItem = document.createTextNode(dataReceived[i].type + ", x= " + dataReceived[i].x + ", y= " + dataReceived[i].y + ", g= " + dataReceived[i].g + ", h= " + dataReceived[i].h);
            currentEventNum += 1;

            eventItems.push([dataReceived[i].x,dataReceived[i].y,dataReceived[i].type]);

            eventli.appendChild(newMainItem);
            $('#eventList').append(eventli);
        }
        */
        var mydiv = $(".eventLog");
        mydiv.scrollTop(mydiv.prop("scrollHeight"));

    });

});