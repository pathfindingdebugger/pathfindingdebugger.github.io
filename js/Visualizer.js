//Created 2/9/17 by Jay

class gridVisulizer {
    constructor(mapWidth, mapHeight, tileSize, mapString) {
        this.svg = document.getElementById("viewport");
        this.svg.setAttribute("viewBox", "0 0 900 600");
        //setSVGZoom(this.svg,this.svg.getBBox().width,this.svg.getBBox().height);
        this.tileArray = null;
        this.breakPoints = new Array(0);
        this.breakPointVisual = new Array(0);
        addZoomObserver(this.svg);
        addPanObserver(this.svg)
    }

    generateBreakPoint(xInput, yInput) {

        if (this.breakPoints.indexOf(xInput + ":" + yInput) === -1) {
            this.breakPoints.push(xInput + ":" + yInput);
            // console.log("Still making");
            const breakPoint = new Elem(this.svg, 'circle')
                .attr("r", this.tileSize * 0.25)
                .attr("cx", xInput * this.tileSize + 0.5 * this.tileSize)
                .attr("cy", yInput * this.tileSize + 0.5 * this.tileSize)
                .attr("stroke", "black")
                .attr("fill", "red");
            this.breakPointVisual.push(breakPoint);

            breakPoint.observeEvent('mousedown')
                .filter(e => e.shiftKey)
                .subscribe(_ => {
                    this.breakPoints.splice(this.breakPoints.indexOf(xInput + ":" + yInput), 1);
                    breakPoint.elem.remove()
                });


        }
    }

    //This function sets the node colour the states are given in the states enum
    setNodeState(x, y, state) {
        y = y - 3;
        // console.log("CAKE");
        if (0 <= x && x < this.mapWidth && 0 <= y && y < this.mapHeight) {
            // console.log(x,this.mapWidth,y,this.mapHeight);
            switch (state) {
                case states.NotSearched:
                    this.tileArray[y * this.mapWidth + x].attr("fill", "#ffffff");
                    break;
                case states.expanded:
                    this.tileArray[y * this.mapWidth + x].attr("fill", "#00f6ff");
                    break;
                case states.inFrontier:
                    this.tileArray[y * this.mapWidth + x].attr("fill", "#0032ff");
                    break;
                case states.start:
                    this.tileArray[y * this.mapWidth + x].attr("fill", "#09ff00");
                    break;
                case states.goal:
                    this.tileArray[y * this.mapWidth + x].attr("fill", "#fff220");
                    break;

            }
        }

    }

    loadMap(mapWidth, mapHeight, tileSize, mapString) {
        this.svg.setAttribute("viewBox", "0 0 500 500");
        //Destroy old map
        this.tileSize = tileSize;
        // console.log(this.mapWidth + " : " + this.mapHeight);
        if (this.tileArray !== null) {
            for (let i = 0; i < this.mapHeight; i++) {
                for (let j = 0; j < this.mapWidth; j++) {
                    this.tileArray[i * this.mapWidth + j].removeElement();
                }
            }
            for (let i = 0; i < this.breakPoints.length; i++) {
                // console.log(i+" Should get them all");
                this.breakPointVisual[i].elem.remove();
            }
        }

        // build a new one
        // console.log(mapWidth + " tse " + mapHeight + " " + mapString);
        this.mapWidth = parseInt(mapWidth);
        this.mapHeight = parseInt(mapHeight);
        this.breakPoints = new Array(0);
        const size = parseInt(mapWidth) * parseInt(mapHeight);
        this.tileArray = new Array(size);
        //mapString = mapString.replace('\n','');
        for (let i = 0; i < this.mapHeight; i++) {
            for (let j = 0; j < this.mapWidth; j++) {

                const stringIndex = i * this.mapWidth + j;
                this.tileArray[i * this.mapWidth + j] = new Elem(this.svg, 'rect')
                    .attr('x', this.tileSize * j).attr('y', this.tileSize * i)
                    .attr('width', this.tileSize).attr('height', this.tileSize)
                    .attr('fill', (mapString[stringIndex] === ".") ? 'white' : (mapString[stringIndex] === "@") ? 'black' : "#777679")
                    .attr('stroke', 'black');
                this.tileArray[i * this.mapWidth + j].observeEvent('mousedown')
                    .filter(e => e.shiftKey)
                    .map(e => {
                        return {i, j}
                    })
                    .subscribe(data => this.generateBreakPoint(j, i));


            }
        }

    }

    scroll(svg) {
        const mousedrag = Observable.fromEvent(svg, 'mousedown')
            .filter(e => e.which === 1)
            .map(e => ({event: e, svgBounds: svg.getBoundingClientRect()}))
            .map(({event, svgBounds}) => {
                const ob = {
                    sx: event.clientX - svgBounds.left,
                    sy: event.clientY - svgBounds.top,
                    svgBounds: svgBounds
                };

                return ob;
            })

            .subscribe(({sx, sy, svgBounds}) => {

                const ox = sx, oy = sy;
                Observable.fromEvent(svg, 'mousemove')
                    .takeUntil(Observable.fromEvent(svg, 'mouseup'))
                    .takeUntil(Observable.fromEvent(svg, 'onmouseout'))
                    .map(({clientX, clientY}) => ({
                        ox, oy,
                        x: clientX - svgBounds.left,
                        y: clientY - svgBounds.top
                    }))
                    .subscribe((input) => {
                            const viewBoxData = svg.getAttribute("viewBox");
                            if (viewBoxData === null) {
                                svg.setAttribute("viewBox", 0 + " " + 0 + " 50 50")

                            }
                            else {
                                //console.log(viewBoxData);
                                const data = viewBoxData.split(/\s+|,/);
                                //console.log(data);
                                const x = Math.min(Math.max(parseFloat(data[0]) + (input.x - input.ox) / 2, 0), this.mapWidth * this.tileSize);
                                const y = Math.min(Math.max(parseFloat(data[1]) + (input.y - input.oy) / 2, 0), this.mapHeight * this.tileSize);
                                svg.setAttribute("viewBox", x + " " + y + " 500 500")

                            }
                        }
                    );
            });
    }
}



function addPanObserver(svg) {
    const mousemove = Observable.fromEvent(svg, 'mousemove').map(e => { return { x: e.clientX, y: e.clientY }; });
    const mouseup = Observable.fromEvent(svg, 'mouseup');
    const mouseout = Observable.fromEvent(svg, 'mouseleave');
    Observable.fromEvent(svg,'mousedown')
        .filter(e => e.which === 1)
        .map(e => { return { ox: e.clientX, oy: e.clientY }; })
        .subscribe((o) => {
        Observable.interval(10)
            .takeUntil(mouseup)
            .takeUntil(mouseout)
            .map(e => ({ x: null, y: null }))
            .takeLast(mousemove)
            .subscribe((e) => {


                    const data = getSVGPos(svg);

                    console.log(data,e,o);
                    if(e != null)
                    {
                        const x = Math.min(Math.max(data.x + (e.x - o.x) / 2, 0), this.mapWidth * this.tileSize);
                        const y = Math.min(Math.max(data.y + (e.y - o.y) / 2, 0), this.mapHeight * this.tileSize);
                        console.log(x,y,data);
                        setSVGPos(svg,x,y);
                    }


            });
    });
}

function addZoomObserver(svg) {

    const mouseup = Observable.fromEvent(svg, 'mouseup');
    const mouseout = Observable.fromEvent(svg, 'mouseleave');
    Observable.fromEvent(svg, 'mousedown')
        .filter(e => e.which === 3)
        .map(e => { return { ox: e.clientX, oy: e.clientY }; })
        .subscribe((o) => {
        Observable.fromEvent(svg, 'mousemove')
            .takeUntil(mouseup)
            .takeUntil(mouseout)
            .map(e => { return { nx: e.clientX, ny: e.clientY }; })
            .subscribe(e => {
            const viewBoxData = svg.getAttribute("viewBox");
            const data = viewBoxData.split(/\s+|,/);
            const newX = Math.max(0, (data.x - (o.oy - e.ny)));
            const newY = Math.max(0, (data.y - (o.oy - e.ny)));
            if (newY / 600 >= 1) {
                svg.setAttribute("viewBox", -newX / 2 + " " + -newY / 2 + " " + newX + " " + newY);
            }
        });
    });
}

function getZoomScale(svg) {
    return { x: getSVGZoom(svg).x / svg.width, y: getSVGZoom(svg).y / svg.height };
}
function getSVGZoom(svg) {
    const viewBoxData = svg.getAttribute("viewBox");
    const data = viewBoxData.split(/\s+|,/);
    return { x: Number(data[2]), y: Number(data[3]) };
}
function getSVGPos(svg) {
    const viewBoxData = svg.getAttribute("viewBox");
    const data = viewBoxData.split(/\s+|,/);
    return { x: Number(data[0]), y: Number(data[1]) };
}
function setSVGZoom(svg,newX,newY)
{
    pos = getSVGPos(svg);
    svg.setAttribute("viewBox", pos.x + " " +  pos.y  + " " + newX + " " + newY);
}
function setSVGPos(svg,newX,newY)
{
    zoom = getSVGZoom(svg);
    svg.setAttribute("viewBox", newX + " " +  newY  + " " + zoom.x + " " + zoom.y);
}
if (typeof window !== 'undefined')
    window.onload = function(){
    visual = new gridVisulizer()

};

