function centerCamera(currentSvg,position,scale)
{
    setCamera(currentSvg,position,scale+12)
}

function setCamera(currentSvg,position,scale)
{
    currentSvg.setAttribute('transform','scale('+scale+')'); //Zoom so the graph isn't super small, is based off of scale
    //Center camera on node
    const nodeVector = vector3(position);
    const bounds = {x:document.getElementById("svg").getBoundingClientRect().width,y:document.getElementById("svg").getBoundingClientRect().height};

    //const view = add(multiply(nodeVector)(-1))(multiply(bounds)(0.5));
    const view = sub(nodeVector)(multiply(multiply(bounds)(1/scale))(0.5)); //Need to take into account scale

    console.log(currentSvg.getAttribute('transform'));

    currentSvg.setAttribute('transform',currentSvg.getAttribute('transform')+'translate('+view.x +','+ view.y+') ');

    console.log(currentSvg.getAttribute('transform'));
}
function centerMap(currentSvg,scale)
{
    //Scale the map
    currentSvg.setAttribute('transform','scale('+scale+')'); //Zoom so the graph isn't super small, is based off of scale
    //Move to center
    const svgBound = currentSvg.getBoundingClientRect();



    const finalPosition = {x:svgBound.left+(svgBound.width/2),y:-svgBound.top+(svgBound.height/2),z:0};

    const bounds = {x:document.getElementById("svg").getBoundingClientRect().width,y:document.getElementById("svg").getBoundingClientRect().height};

    //const view = add(multiply(nodeVector)(-1))(multiply(bounds)(0.5));
    const view = sub(finalPosition)(multiply(bounds)(0.5)); //Need to take into account scale
    console.log(view);
    currentSvg.setAttribute('transform',currentSvg.getAttribute('transform')+'translate('+view.x +','+ view.y+')');
}