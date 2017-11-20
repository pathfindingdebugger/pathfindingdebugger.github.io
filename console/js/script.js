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
let vControl;
var playing = false;
const states = {
    NotSearched:0,
    inFrontier:1,
    expanded:2,
    start:3,
    goal:4,
    eventCheck:5,
    Current:6,
    CurrentFrontier:7
};

function showList(evt, listName) {
    // Declare all variables
    var i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide theem
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(listName).style.display = "block";
    evt.currentTarget.className += " active";
}


function changeSpeed(num) {

    control.changeSpeed(num);
}

$(document).ready(function () {

    $("#defaultSubmit").click(function(event){
        $.getJSON('temp2.json', function(currentJSON) {
            eventItems = currentJSON.eventList;
            dataReceived = currentJSON.eventList;
            var mapData = currentJSON.Map;


            if (control !== undefined)
            {
                control.stop();
                playing = false;
                control.visualControl.reset();
            }
            control = new DebugCommand(currentJSON.type,mapData,eventItems);
        });

    });

    $("#defaultSubmitTree").click(function(event){
        $.getJSON('DebugFiles/tree.json', function(currentJSON) {
            eventItems = currentJSON.eventList;
            dataReceived = currentJSON.eventList;
            var mapData = currentJSON.Map;

            if (control !== undefined)
            {
                control.stop();
                playing = false;
                control.visualControl.reset();
            }
            control = new DebugCommand(currentJSON.type,mapData,eventItems);
        });

    });
    $("#defaultSubmitGraph").click(function(event){
        $.getJSON('DebugFiles/Graph.json', function(currentJSON) {
            eventItems = currentJSON.eventList;
            dataReceived = currentJSON.eventList;
            var mapData = currentJSON.Map;

            if (control !== undefined)
            {
                control.stop();
                playing = false;
                control.visualControl.reset();
            }
            control = new DebugCommand(currentJSON.type,mapData,eventItems);
        });

    });
    $('.playbtn').click(function() {
        if(control!== null) {
            if(playing == false){
                control.play(speed);
                playing = true;
                console.log("play")
            }
            else{
                control.stop();
                playing = false;
                console.log("stop")
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

        if (control !== undefined)
        {
            control.stop();
            playing = false;
            control.visualControl.reset();
        }
        control = new DebugCommand(currentJSON.type,mapData,dataReceived);

    });



});