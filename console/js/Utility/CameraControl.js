function centerCamera(currentSvg,position,scale)
{
    const scaleFactor = scale + 12;
    currentSvg.setAttribute('transform','scale('+scaleFactor+')'); //Zoom so the graph isn't super small, is based off of scale
    //Center camera on node
    const nodeVector = vector3(position);
    const bounds = {x:document.getElementById("svg").getBoundingClientRect().width,y:document.getElementById("svg").getBoundingClientRect().height};

    //const view = add(multiply(nodeVector)(-1))(multiply(bounds)(0.5));
    const view = sub(nodeVector)(multiply(multiply(bounds)(1/scaleFactor))(0.5)); //Need to take into account scale

    console.log(currentSvg.getAttribute('transform'));

    currentSvg.setAttribute('transform',currentSvg.getAttribute('transform')+'translate('+view.x +','+ view.y+') ');

    console.log(currentSvg.getAttribute('transform'));
}