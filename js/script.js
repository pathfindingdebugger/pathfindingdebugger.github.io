//Created by surayezrahman on 23/8/17.

var currentEventNum = 0;
var eventItems = [];
var openList = [];
var closedList = [];
var dataReceived;
let i = 0;
var j = 0;
var speed = 1;

const states = {
    NotSearched:0,
    inFrontier:1,
    expanded:2,
    start:3,
    goal:4,
};

function changeSpeed(num) {
    speed = num;
    console.log(speed)
}
$(document).ready(function () {

    $("#defaultSubmit").click(function(event){
        console.log(speed)
        $.getJSON('temp2.json', function(currentJSON) {
            eventItems = currentJSON.eventList;
            dataReceived = currentJSON.eventList;
            var mapData = currentJSON.Map;

            visual.loadMap(mapData.mWidth,mapData.mHeight,10,mapData.mapData);

            for (j = currentEventNum; j <= dataReceived.length - 1; j++) {
                var eventli = document.createElement("LI");
                eventli.setAttribute("id", i);
                var newMainItem = document.createTextNode(dataReceived[j].type + ", x= " + dataReceived[j].x + ", y= " + dataReceived[j].y + ", g= " + dataReceived[j].g + ", h= " + dataReceived[j].h);
                currentEventNum += 1;
                eventli.appendChild(newMainItem);
                $('#eventList').append(eventli);
            }
            var mydiv = $(".eventLog");
            mydiv.scrollTop(mydiv.prop("scrollHeight"));

        });

    });


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
        },speed);


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

        for (j = currentEventNum; j <= dataReceived.length - 1; j++) {
            var eventli = document.createElement("LI");
            eventli.setAttribute("id", i);
            var newMainItem = document.createTextNode(dataReceived[j].type + ", x= " + dataReceived[j].x + ", y= " + dataReceived[j].y + ", g= " + dataReceived[j].g + ", h= " + dataReceived[j].h);
            currentEventNum += 1;
            eventli.appendChild(newMainItem);
            $('#eventList').append(eventli);
        }

        var mydiv = $(".eventLog");
        mydiv.scrollTop(mydiv.prop("scrollHeight"));
    });



});