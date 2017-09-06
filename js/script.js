//Created by surayezrahman on 23/8/17.

var currentEventNum = 0;
var eventItems;
var openList = [];
var closedList = [];
var dataReceived;

const states = {
    NotSearched:0,
    inFrontier:1,
    expanded:2,
    start:3,
    goal:4,
};

console.log("GOD DAMN IT WORK!");
console.log("AHAHAHAHAA");
$(document).ready(function () {


    $('.buildbtn').click(function () {
        // if (dataReceived !== null) {
        //     for (i = currentEventNum; i <= dataReceived.length - 1; i++) {
        //         var eventli = document.createElement("LI");
        //         eventli.setAttribute("id", i);
        //         var newMainItem = document.createTextNode(dataReceived[i].type + ", x= " + dataReceived[i].x + ", y= " + dataReceived[i].y + ", g= " + dataReceived[i].g + ", h= " + dataReceived[i].h);
        //         currentEventNum += 1;
        //
        //         eventli.appendChild(newMainItem);
        //         $('#eventList').append(eventli);
        //     }
        //
        //
        //     var mydiv = $(".eventLog");
        //     mydiv.scrollTop(mydiv.prop("scrollHeight"));
        //
        // } else {
        //     window.alert("No data loaded. Please select file and load data.")
        // }

    });

    $('#eventList').on('click', 'li', function(ev) {
        var id = this.id;
        thisList = document.getElementById(id).innerHTML;
        console.log("I was clicked! My ID is:"+id);
        document.getElementById('openList').innerHTML = thisList;
        document.getElementById('closedList').innerHTML = thisList;

    });

    $('.playbtn').click(function() {
        if(dataReceived!= null) {
            $('.eventList li').each(function () {
                // console.log($(this).text);
                console.log("Done")
            })

        }

    });

        // listItems = $('.eventOl').find('li');
        // for (var li in listItems){
        //     var item = $(li);
        //     var id = item.id;
        //     console.log(id)
        // }

        // var eventList = document.getElementById(eventList);
        // var eventOl = eventList.getElementById(eventOl);
        // var eventLi = eventOl.getElementsByTagName("li");
        // for (var i = 0; i< eventLi.length; i++){
        //     console.log(eventLi)
        // }
    // });

    $('.stepbtn').click(function () {
        console.log("Step button");
        visual.loadMap(5,5,100,".@.@....@..@.@..@.@..........");
    });

    $('.pausebtn').click(function () {
        console.log("Pause button");
        visual.loadMap(3,3,100,"@.@.@.@.@");
    });

    $(document).ready(function(){
        $('.modal').modal();
    });

    $("#submit1btn").click(function () {
        var getText = document.getElementById('JSONinput').value;
        var currentJSON = JSON.parse(getText);
        dataReceived = currentJSON.eventList;
        var mapData = currentJSON.Map;

        console.log(mapData);
        visual.loadMap(mapData.mWidth,mapData.mHeight,10,mapData.mapData);

            for (i = currentEventNum; i <= dataReceived.length - 1; i++) {
                var eventli = document.createElement("LI");
                eventli.setAttribute("id", i);
                var newMainItem = document.createTextNode(dataReceived[i].type + ", x= " + dataReceived[i].x + ", y= " + dataReceived[i].y + ", g= " + dataReceived[i].g + ", h= " + dataReceived[i].h);
                currentEventNum += 1;

                eventli.appendChild(newMainItem);
                $('#eventList').append(eventli);
            }


            var mydiv = $(".eventLog");
            mydiv.scrollTop(mydiv.prop("scrollHeight"));

    });

});