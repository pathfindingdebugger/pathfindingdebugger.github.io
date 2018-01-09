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

function setCTM(element, matrix)
{
    var s = "matrix(" + matrix.a + "," + matrix.b + "," + matrix.c + "," + matrix.d + "," + matrix.e + "," + matrix.f + ")";

    element.setAttribute("transform", s);
}

function scaleSVGGroupToView(svgId, svgGroupId, padding)
{
    var svg = document.getElementById(svgId);
    var svgW = parseInt(document.defaultView.getComputedStyle(svg, "").getPropertyValue("width"));
    var svgH = parseInt(document.defaultView.getComputedStyle(svg, "").getPropertyValue("height"));

    // Get group within SVG document that we want to scale to fit.
    var doc = svg.contentDocument;
    var group = document.getElementById(svgGroupId);

    // Width and height of group.
    var groupW = group.getBoundingClientRect().width;
    var groupH = group.getBoundingClientRect().height;

    // Center positions of group.
    var groupCX = group.getBoundingClientRect().x + (groupW / 2);
    var groupCY = group.getBoundingClientRect().y + (groupH / 2);

    // Work out how much we need to scale to fit in X and Y,
    // then use the smaller of the two.
    var scaleX = (svgW - padding) / groupW;
    var scaleY = (svgH - padding) / groupH;
    var scale = Math.min(scaleY, scaleX);

    // Centre the scaled group in the view.
    var desiredX = (svgW / 2) - (groupCX * scale);
    var desiredY = (svgH / 2) - (groupCY * scale);

    var matrix = group.getCTM();
    matrix.a = 1;
    matrix.b = 0;
    matrix.c = 0;
    matrix.d = 1;
    matrix.e = 0;
    matrix.f = 0;

    matrix = matrix.translate(desiredX, desiredY);
    matrix = matrix.scale(scale);

    setCTM(group, matrix);
}