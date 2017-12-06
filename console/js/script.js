//Created by surayezrahman on 23/8/17.
/**
 * Main Script for Web page
 * ======================
 *
 * This script file loads the following when the web page loads,
 *
 *
 *
 *
 *
 *
 *
 *
 * Known issues:
 *
 *  - Zooming (while panning) on Chrome has some issues
 *
 * Releases:
 *
 * 1 Tue Oct 24, Surayez Rahman
 *	- Fixed runtime issues
 *	- Improved optimization
 */


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
        $.getJSON('DebugFiles/newGrid.json', upload);

    });
    $("#jpsSubmit").click(function(event){
        $.getJSON('DebugFiles/newJPS.json', upload);

    });
    $("#defaultSubmitTree").click(function(event){
        $.getJSON('DebugFiles/tree.json', upload);

    });
    $("#defaultSubmitGraph").click(function(event){
        $.getJSON('DebugFiles/newGraph.json', upload);
    });
    $("#defaultSubmitCustomGraph").click(function(event){
        $.getJSON('DebugFiles/nice.json', upload);
    });
    $("#defaultSubmitMapGraph").click(function(event){
        $.getJSON('DebugFiles/newMapGraph.json', upload);
    });
    $("#defaultSubmitAnya").click(function(event){
        $.getJSON('DebugFiles/custom.json', upload);
    });
    $('.playbtn').click(function() {
        if(control!== null) {
            if(control.playing === false){
                control.play(speed);
                console.log("play")
            }
            else{
                control.stop();
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
    //Test buttons
    $('#Monotonicity').click(e=>{
        //$('#Monotonicity').style = "fill:green";
        control.toggleTest(tests.monotonicity)
    });
    $('#Lines').click(e=>{
       control.visualControl.toggleLines();
    });
    // Full Screen Mode

    $('.fullScreenbtn').click(function(e){
        $("#debugger").fullScreen(true);
    });


    $("#submit1btn").click(function () {
        var getText = document.getElementById('JSONinput').value;
        var currentJSON = JSON.parse(getText);
        upload(currentJSON)
    });

    function upload(data) {
        dataReceived = data.eventList;
        if (control !== undefined)
        {
            control.reset(data);
        }
        else
        {
            control = new DebugCommand(data);
        }
        console.log(control);
    }

});