//Created by surayezrahman on 23/8/17.

var currentEventNum = 0;
var eventItems = [];
var openList = [];
var closedList = [];
var dataReceived;
let i = 0;
var j = 0;
var speed = 1;
let control;
var playing = false;
const states = {
    NotSearched:0,
    inFrontier:1,
    expanded:2,
    start:3,
    goal:4,
    eventCheck:5,
};

function changeSpeed(num) {
    if(playing == true){
        control.changeSpeed(speed);
    }
    else{
        speed = num;
    }
}

$(document).ready(function () {

    $("#defaultSubmit").click(function(event){
        console.log(speed);
        $.getJSON('temp2.json', function(currentJSON) {
            eventItems = currentJSON.eventList;
            dataReceived = currentJSON.eventList;
            var mapData = currentJSON.Map;

            visual.loadMap(mapData.mWidth,mapData.mHeight,10,mapData.mapData);


            control = new DebugCommand(currentJSON.eventList,visual, playing);
            playing = false;

        });

    });


    $('#eventList').on('click', 'li', function(ev) {
        var id = this.id;
        control.eventClick(id)
    });


    $('.playbtn').click(function() {
        if(control!== null) {
            if(playing == false){
                control.play(speed);
                playing = true
            }

        }else{
            window.alert("No data loaded!")
        }
    });

    $('.stepbtn').click(function () {
        if(control!== null) {
            control.stepForward();

        }else{
            window.alert("No data loaded!")
        }
    });

    $('.pausebtn').click(function () {
        if(control!== null) {
            control.stop();
            playing = false

        }else{
            window.alert("No data loaded!")
        }
    });

    $(document).ready(function(){
        $('.modal').modal();
    });


    // Full Screen Mode

    $('.fullScreenbtn').click(function(e){
        $("#debugger").fullScreen(true);
    });


    $("#submit1btn").click(function () {

        var getText = document.getElementById('JSONinput').value;
        var currentJSON = JSON.parse(getText);
        dataReceived = currentJSON.eventList;
        var mapData = currentJSON.Map;

        visual.loadMap(mapData.mWidth,mapData.mHeight,10,mapData.mapData);

        control = new DebugCommand(currentJSON.eventList,visual, playing);
        playing = false;
    });



});