class Legend
{
    constructor(stateList)
    {
        this.hidden = false;
        this.states = stateList;
        this.svg = document.getElementById("svg");
        console.log("?",this.svg);
        this.Legend = new Elem(this.svg,'g');
        this.elements = [];
        const fontSize = 10;
        const startPosition = 40;
        const buttonHeight = 20;
        const stateCount = 7;
        this.legendHeight = stateCount*(fontSize+5)+startPosition+buttonHeight+10;
        this.hiddenY = stateCount*(fontSize+5)+startPosition;
        //Add background
        const bg = new Elem(this.Legend.elem,'rect')
            .attr('x',0).attr('y',0)
            .attr('width',100)
            .attr('height',this.legendHeight)
            .attr('stroke','black')
            .attr('fill-opacity',0.8)
            .attr('fill','white');
        //Add title
        const text = new Elem(this.Legend.elem,'text')
            .attr('x',10)
            .attr('y',20)
            .attr('font-size',20)
            .attr('fill','black');
        text.elem.append(document.createTextNode("Legend"));

        //Add eachState
        Object.keys(this.states).forEach((s,i)=>{
            //Add a rect
            const newRect = new Elem(this.Legend.elem,'rect')
                .attr('x',10)
                .attr('y',i*(fontSize+5)+startPosition-fontSize)
                .attr('width',fontSize)
                .attr('height',fontSize)
                .attr('stroke','black')
                .elem.classList.add(s);
            //and add text
            const text = new Elem(this.Legend.elem,'text')
                .attr('x',25)
                .attr('y',i*(fontSize+5)+startPosition)
                .attr('font-size',fontSize)
                .attr('fill','black');
            text.elem.append(document.createTextNode(s));

            this.elements.push(newRect);
            this.elements.push(text);

        });
        //Add button
        const buttonY = stateCount*(fontSize+5)+startPosition;
        const button = new Elem(this.Legend.elem,'rect')
            .attr('x',10)
            .attr('y',buttonY)
            .attr('width',80)
            .attr('height',buttonHeight)
            .attr('fill','white')
            .attr('stroke','black')
            .observeEvent('mousedown')
            .subscribe(e=>this.toggleHidden());

        //Add upward and downward triangles
        this.upArrow = new Elem(this.Legend.elem,'path')
            .attr('d','M'+20+","+(buttonY+15)+" h"+60+" L"+50+","+(buttonY+5)+"Z")
            .attr('fill','black')
            .attr('stroke','black');
        this.upArrow.observeEvent('mousedown')
            .subscribe(a=>this.toggleHidden());

        this.downArrow = new Elem(this.Legend.elem,'path')
            .attr('d','M'+20+","+(buttonY+5)+" h"+60+" L"+50+","+(buttonY+15)+"Z")
            .attr('fill','black')
            .attr('stroke','black')
            .attr('visibility','hidden');
        this.downArrow.observeEvent('mousedown')
            .subscribe(c=>this.toggleHidden());

    }

    toggleHidden()
    {
        //this.MakeStartBlack();

        if(this.hidden)
        {
            //Show
            const showInterval = setInterval(() =>
            {
                if(this.Legend.getTransform().y <= 0)
                {
                    this.Legend.translate(0,15);
                }
                else
                {
                    this.upArrow.attr('visibility','visible');
                    this.downArrow.attr('visibility','hidden');
                    clearInterval(showInterval);
                    this.hidden = !this.hidden;
                }
            })
        }
        else
        {
            //hide
            const hideInterval = setInterval(() =>
            {
                if(this.Legend.getTransform().y >= -this.hiddenY)
                {
                    this.Legend.translate(0,-15);
                }
                else
                {
                    this.downArrow.attr('visibility','visible');
                    this.upArrow.attr('visibility','hidden');
                    clearInterval(hideInterval);
                    this.hidden = !this.hidden;

                }
            })
        }

    }
    MakeStartBlack()
    {
        //console.log(Object.values(document.styleSheets).find(ss=>ss.href.split('/').pop() === "style.css"));
        const cssSheet = Object.values(document.styleSheets).find(ss=>ss.href.split('/').pop() === "style.css");
        const rule = Object.values(cssSheet.cssRules).find(r => r.selectorText === ".inFrontier");
        rule.fill = "rgb(0,0,0)";
        rule.cssText = ".start { fill: rgb(0, 0, 0); }";
        console.log(rule);
    }

}