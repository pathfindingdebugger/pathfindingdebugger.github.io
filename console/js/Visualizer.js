//Created 2/9/17 by Jay

function drawRectsEvents()
{
    const svg = document.getElementById("viewport");
    left = svg.getBoundingClientRect().left;
    top = svg.getBoundingClientRect().top;


    let rect = new Elem(svg, 'rect')
        .attr('x', 100).attr('y', 70)
        .attr('width', 120).attr('height', 80)
        .attr('fill', '#0100d7');
    const animate = setInterval(()=> {rect.attr('x', 1 + Number(rect.attr('x')))}, 10);
    const timer = setInterval(()=>{
        clearInterval(animate);
        clearInterval(timer);
        }, 1000);
}

class gridVisulizer {
    constructor() {
        this.svg = document.getElementById("viewport");
        this.bgObject = null;
        this.tileArray = null;
        this.breakPoints = new Array(0);
        this.breakPointVisual = new Array(0);
        this.floatBox = null;
        this.lineVisual = [null,null];

    }
    setLogChanger(debugFunction)
    {
        this.changeLog = debugFunction;
    }
    generateBreakPoint(xInput, yInput) {
        if (this.breakPoints.indexOf(xInput + ":" + (yInput)) === -1) {
            this.breakPoints.push(xInput + ":" + (yInput));
            console.log("BreakPoints: ", this.breakPoints);
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


    generateFloatBox(mouseX,mouseY,gridX,gridY,gridElem)
    {
        if(this.floatBox !== null )
        {
            this.deleteFloatBox();
            this.floatBox = null;
        }

        const svg = document.getElementById("svg");
        //console.log(gridX,gridY,gridElem.attr("g"),gridElem.attr("f"));
        console.log(mouseX,mouseY);
        const xDir = Math.sign(gridX - gridElem.attr("px"));
        const yDir = Math.sign(gridY - gridElem.attr("py"));

        const xOffset = 70*xDir;
        const yOffset = xDir === 0 ? yDir*70 : 0; //Just to move it away from mouse
        console.log("CAKE "+ xOffset);
        const newX = mouseX + xOffset;//These offsets correspond to the svg
        const newY = mouseY + yOffset;
        console.log("Offset"+newX+","+newY);
        const textFont = 20;
        this.floatBox = new Elem(svg,'g')
            .attr('transform','translate('+newX+','+newY+')');

        /*new Elem(this.floatBox.elem,'polygon')
            .attr("points","0,0 10,-10 50,-10 50,-150 -50,-150 -50,-10 -10,-10")
            .attr("fill","white")
            .attr("stroke-width",3)
            .attr("stroke",gridElem.attr("fill"));*/
        new Elem(this.floatBox.elem,'rect')
            .attr('x',-50)
            .attr('y',-50)
            .attr('width',100)
            .attr('height',100)
            .attr("fill","white")
            .attr("stroke-width",3)
            .attr("stroke",gridElem.attr("fill"));


        const positionText = new Elem(this.floatBox.elem,'text')
            .attr('x',-45)
            .attr('y',-30)
            .attr('font-size',textFont)
            .attr('fill','black');



        positionText.elem.append(document.createTextNode("x:"+gridX+"\t y:"+(gridY)));

        const gText = new Elem(this.floatBox.elem,'text')
            .attr('x',-45)
            .attr('y',-10)
            .attr('font-size',textFont)
            .attr('fill','black');
        const g = Number(gridElem.attr("g")).toPrecision(3);
        gText.elem.append(document.createTextNode("g:"+g));

        const hText = new Elem(this.floatBox.elem,'text')
            .attr('x',-45)
            .attr('y',10)
            .attr('font-size',textFont)
            .attr('fill','black');
        const h = Number(gridElem.attr("h")).toPrecision(3);
        hText.elem.append(document.createTextNode("h:"+h));

        const fText = new Elem(this.floatBox.elem,'text')
            .attr('x',-45)
            .attr('y',30)
            .attr('font-size',textFont)
            .attr('fill','black');
        const f = Number(gridElem.attr("f")).toPrecision(5);
        fText.elem.append(document.createTextNode(" f:"+f));


        gridElem.observeEvent('mouseout')
            .subscribe(e=>{this.deleteFloatBox(); this.deleteLine(0)});

        Observable.fromEvent(this.svg,'mousemove')
            .map(({clientX,clientY}) =>(
                ({
                    clientX:clientX - svg.getBoundingClientRect().left,
                    clientY:clientY - svg.getBoundingClientRect().top-10
                })
            ))
            .subscribe(e=>this.floatBox.attr('transform','translate('+(e.clientX+xOffset)+','+(e.clientY+yOffset)+')'));

    }
    deleteFloatBox()
    {
        this.floatBox.elem.remove();
    }

    drawLine(index,i,j)
    {   this.lineVisual[index] = new Elem(this.svg,'polyline');

        const pointList = (x,y)=> ( x !== -1) ? (x*this.tileSize+this.tileSize/2)+','+(y*this.tileSize+this.tileSize/2)+" "+pointList(Number(this.tileArray[y*this.mapWidth+x].attr('px')), Number(this.tileArray[y*this.mapWidth+x].attr('py'))) : '';

        //const pointList = (x,y)=> x !== -1 ? pointList(this.tileArray[y*this.mapWidth+x].attr('px'), this.tileArray[y*this.mapWidth+x].attr('py'))+" "+x+','+y : "";
        this.lineVisual[index].attr('points',pointList(i,j))
            .attr('stroke',index === 0 ? "red" : "#ffb000")
            .attr('fill','none')
            .attr('stroke-width',3)
    }

    deleteLine(index)
    {
        if(this.lineVisual[index] !== null )
        {
            this.lineVisual[index].removeElement();
            this.lineVisual[index] = null;
        }

    }

    setNodeValues(x,y,g,f,px,py)
    {
        this.tileArray[y * this.mapWidth + x]
            .attr('g',g)
            .attr('h',f-g)
            .attr('f',f)
            .attr('px',px)
            .attr('py',py);
    }
    //This function sets the node colour the states are given in the states enum
    setNodeState(x, y, state) {
        if(this.tileArray[y*this.mapWidth+x].attr("fill") === "#09ff00" || this.tileArray[y*this.mapWidth+x].attr("fill") === "#ff7700")
            return ;
        if (0 <= x && x < this.mapWidth && 0 <= y && y < this.mapHeight) {
            switch (state) {
                case states.NotSearched:
                    this.tileArray[y * this.mapWidth + x].attr("fill", "#ffffff");
                    break;
                case states.Current:
                    this.tileArray[y * this.mapWidth + x].attr("fill", "#ff0016");
                    break;
                case states.CurrentFrontier:
                    this.tileArray[y*this.mapWidth+x].attr("fill","#b021ff");
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
                    this.tileArray[y * this.mapWidth + x].attr("fill", "#ff7700");
                    break;

            }
        }

    }

    loadMap(mapWidth, mapHeight, tileSize, mapString) {
        this.mapData = mapString;
        this.svg.setAttribute("viewBox", "0 0 500 500");
        //Destroy old map
        this.tileSize = tileSize;
        if(this.bgObject !== null)
            this.bgObject = null;
        // console.log(this.mapWidth + " : " + this.mapHeight);
        if (this.tileArray !== null) {
            for (let i = 0; i < this.mapHeight; i++) {
                for (let j = 0; j < this.mapWidth; j++) {
                    if(this.tileArray[i * this.mapWidth + j] !== undefined )
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
        this.bgObject = new Elem(this.svg,'rect')
            .attr("x",0)
            .attr("y",0)
            .attr("width",this.mapWidth*this.tileSize)
            .attr("height",this.mapHeight*this.tileSize)
            .attr("fill","black");
        this.breakPoints = new Array(0);
        const size = parseInt(mapWidth) * parseInt(mapHeight);
        this.tileArray = new Array(size);
        //mapString = mapString.replace('\n','');
        for (let i = 0; i < this.mapHeight; i++) {
            for (let j = 0; j < this.mapWidth; j++) {


                const stringIndex = i * this.mapWidth + j;
                if (mapString[stringIndex] === "@")
                    continue;
                this.tileArray[i * this.mapWidth + j] = new Elem(this.svg, 'rect')
                    .attr('x', this.tileSize * j).attr('y', this.tileSize * i)
                    .attr('width', this.tileSize).attr('height', this.tileSize)
                    .attr('fill', (mapString[stringIndex] === ".") ? 'white' : (mapString[stringIndex] === "@") ? 'black' : "#777679")
                    .attr('stroke', 'black')
                    .attr('g',0)
                    .attr('f',0)
                    .attr('h',0)
                    .attr('px',-1)
                    .attr('py',-1)
                    .attr('last','')

                this.tileArray[i * this.mapWidth+j].observeEvent('mouseover')
                    .filter(e => this.tileArray[i * this.mapWidth+j].attr("fill") === '#0032ff'||this.tileArray[i * this.mapWidth+j].attr("fill") === '#00f6ff')
                    .subscribe(e=> {
                        this.generateFloatBox(e.clientX,e.clientY,j,i,this.tileArray[i * this.mapWidth + j]);
                        this.drawLine(0,j,i)
                    });

                this.tileArray[i * this.mapWidth + j].observeEvent('mousedown')
                    .filter(e => e.shiftKey)
                    .map(e => {
                        return {i, j}
                    })
                    .subscribe(data => {
                        this.generateBreakPoint(j, i);
                        if(this.tileArray[i * this.mapWidth + j].attr("fill") !== "white")
                        {
                            this.alterEventList(j, i);
                        }

                    });

            }
        }
    }

    alterEventList(events){
        this.changeLog(xInput, yInput)

    }

    reloadMap()
    {
        this.loadMap(this.mapWidth,this.mapHeight,10,this.mapData)
    }
    getNodeData(x,y)
    {
        return {g:Number(this.tileArray[y*this.mapWidth+x].attr('g')),f:Number(this.tileArray[y*this.mapWidth+x].attr('f'))};
    }
}

if (typeof window !== 'undefined')
    window.onload = function(){
    visual = new gridVisulizer()

};

