class FloatBoxControl
{
    constructor(data)
    {
        this.svg = document.getElementById("svg");
        const svgObj = data.svgObj;
        this.hiddenArray = [];
        //For x y g h and f
        const constants = ['id','x','y','g','h','f'];
        this.elements = [];
        constants.forEach(e=>{
            var checkbox = document.createElement('input');
            checkbox.type = "checkbox";
            checkbox.name = e;
            checkbox.value = "value";
            checkbox.id = e;

            if(e === "id")
                checkbox.checked = true;
            var label = document.createElement('label');
            label.htmlFor = e ;
            label.appendChild(document.createTextNode(e));

            const nl = document.createElement("br");

            document.getElementById("floatbox").appendChild(nl);
            document.getElementById("floatbox").appendChild(checkbox);
            document.getElementById("floatbox").appendChild(label);

            this.hiddenArray.push({"key":e, "getValue":()=>checkbox.checked});

            this.elements.push(checkbox);
            this.elements.push(nl);
            this.elements.push(label);
        });


        //For each variable in svg structures

        //For any other data

        this.floatBox = null;
    }
    deleteSideBar()
    {
        this.elements.forEach(e=>e.remove())
    }
    getShown(){return this.hiddenArray.filter(e=>e.getValue())}
    getFloatBoxHieght()
    {
        return this.getShown().length;
    }

    generateFloatBox(x,y,node)
    {
        //Delete current floatbox
        this.deleteFloatBox();

        //get the non hidden keys
        const shownValues = this.getShown();

        const textFont = 20;
        // Make the floatbox group
        this.floatBox = new Elem(this.svg,'g');

        //if shownValues is empty then do nothing else
        if(shownValues.length === 0)
            return this.floatBox;

        // Get height of box by length of shownValues
        const height = (textFont+5)*(shownValues.length+1);

        const elements = [];
        // Draw the box
        const box = new Elem(this.floatBox.elem,'rect')
            .attr('x',-50)
            .attr('y',-(textFont+5))
            .attr('width',"30ex")
            .attr('height',height)
            .attr("fill","white")
            .attr("stroke-width",3)
            .attr("stroke",node.svg.attr("fill"))
            .attr('fill-opacity',0.8);


        //For each shown value
        shownValues.forEach((v,i)=>{
            //Show the value
            const text = new Elem(this.floatBox.elem,'text')
                .attr('x',-45)
                .attr('y',i*(textFont+5))

                .attr('font-size',textFont)
                .attr('fill','black');

            text.elem.append(document.createTextNode(v.key+" : "+node[v.key]));
            elements.push(text);
        });
        //move box to given x and y
        const maxSize = elements.map(e=>e.elem.getBoundingClientRect().right - e.elem.getBoundingClientRect().left).reduce((i,j)=> i > j ? i : j);
        box.attr('width',maxSize+8);
        this.floatBox.attr('transform','translate('+x+','+y+')');

        return this.floatBox;
    }

    deleteFloatBox()
    {
        if(this.floatBox !== null)
        {
            this.floatBox.elem.remove();
            this.floatBox = null
        }
    }
}