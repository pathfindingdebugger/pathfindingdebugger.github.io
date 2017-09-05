//Created by surayezrahman on 23/8/17.

var currentEventNum = 0;
var eventItems;
var openList = [];
var closedList = [];
var dataReceived;

states = {
    NotSearched:0,
    inFrontier:1,
    expanded:2
};

console.log("GOD DAMN IT WORK!");
$(document).ready(function () {


    $('.buildbtn').click(function () {
        if (dataReceived !== null) {
            for (i = currentEventNum; i <= dataReceived.length - 1; i++) {
                var eventli = document.createElement("LI");
                eventli.setAttribute("id", i);
                var newMainItem = document.createTextNode(dataReceived[i].type + ", x= " + dataReceived[i].x + ", y= " + dataReceived[i].y + ", g= " + dataReceived[i].g + ", h= " + dataReceived[i].h);
                currentEventNum += 1;
                //
                // if (dataReceived[i].type == 'expanding') {
                //     var openListli = document.createElement("LI");
                //     openList.push(dataReceived[i].x);
                //     var openListItem = document.createTextNode("[" + openList + "]");
                //     openListli.appendChild(openListItem)
                // }
                //
                // if (dataReceived[i].type == 'closing') {
                //     openList.pop(dataReceived[i].x);
                //     var closedListli = document.createElement("LI");
                //     closedList.push(dataReceived[i].x);
                //     var closedListItem = document.createTextNode("[" + closedList + "]");
                //     closedListli.appendChild(closedListItem)
                // }

                eventli.appendChild(newMainItem);
                // $('#openListConsole').append(openListli);
                // $('#closedListConsole').append(closedListli);
                $('#eventList').append(eventli);
            }
            var mydiv = $(".eventLog");
            mydiv.scrollTop(mydiv.prop("scrollHeight"));


            $('.graph').load('tiger.svg');

        } else {
            window.alert("No data loaded. Please select file and load data.")
        }

    });

    $('#eventList').on('click', 'li', function(ev) {
        var id = this.id;
        thisList = document.getElementById(id).innerHTML;
        console.log("I was clicked! My ID is:"+id);
        document.getElementById('openList').innerHTML = thisList;
        document.getElementById('closedList').innerHTML = thisList;

    });


    $('.playbtn').click(function(){
        console.log("Play button");
        visual.loadMap(3,3,100,"@.@.@.@.@");
    });

    $('.stepbtn').click(function () {
        console.log("Step button");
        visual.loadMap(5,5,100,".@.@....@..@.@..@.@......");
    });

    $('.pausebtn').click(function () {
        console.log("Pause button");

    });

    $(document).ready(function(){
        $('.modal').modal();
    });


    $("#submit1btn").click(function () {
        var getText = document.getElementById('JSONinput').value;
        var currentJSON = JSON.parse(getText);
        dataReceived = currentJSON.eventList;
        if (dataReceived != null) {
            window.alert("Data is loaded. Build to show data");
            }
    });

});