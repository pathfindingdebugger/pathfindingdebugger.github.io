class TreeVisualizer extends Visualiser
{
    constructor() {
        super();
        this.treeNodes = {};
        //Set background


    }

    addNode(id,pId,g,f,h)
    {

        if(pId)
        {
            this.treeNodes[pId].children.push(id);

        }
        else
        {
            this.root = id;
        }
        const depth = pId ? (this.treeNodes[pId].depth+1) : 0;
        const node = {
            pId:pId,
            childIndex:pId? this.treeNodes[pId].children.length:0,
            state:states.inFrontier,
            g:g,
            f:f,
            h:h,
            depth:depth,
            children:[],
            svgElem: new Elem(this.svg,'circle').attr('cx',0).attr('cy',depth*150).attr('fill','white').attr('r',25),
            svgIncomingEdges:[],
            svgOutgoingEdges:[]
        };
        this.treeNodes[id] = node;


        const nodeText = new Elem(this.treeNodes[id].svgElem.elem,'text')
            .attr('x',30)
            .attr('y',0)
            .attr('font-size',20)
            .attr('fill','white');
        nodeText.elem.append(document.createTextNode("HELLO WORLD"));

        if(pId) {
            parent = this.treeNodes[pId];
            const levels = this.reOrderLevels();
            this.reAdjustNodes(pId,levels);
            this.addLine(node,parent)

        }

    }
    addLine(node,parent)
    {
        const elem = new Elem(this.svg,'line',false).attr('x1',parent.svgElem.attr('cx')).attr('y1',parent.svgElem.attr('cy')).attr('x2',node.svgElem.attr('cx')).attr('y2',node.svgElem.attr('cy')).attr('style','stroke:rgb(255,0,0);stroke-width:2');
        //Add line to parent
        node.svgIncomingEdges.push(elem);
        parent.svgOutgoingEdges.push(elem);
    }

    leafCount(id){ return (this.treeNodes[id].children.length === 0)? 1 : this.treeNodes[id].chidren.map((c)=>reAdjustNode(c)).reduce((a,r)=>a+r,0) }
    /*reAdjustNodes(id){
        //Realigns tree for visual clarity
        const node = this.treeNodes[id];
        console.log(node);
        if(node.children.length === 0)
        {
            if(node.pId !== null) {
                const parent = this.treeNodes[node.pId];
                const childIndex = parent.children.indexOf(id);
                const newX = Number(parent.svgElem.attr('x')) + ((childIndex * 150) - ((parent.children.length*150)/2));
                console.log(parent);
                console.log(Number(parent.svgElem.attr('x')) + " + " + (((childIndex * 150 )/node.depth) - (((parent.children.length*150)/node.depth)/2)) +" = "+ newX);

                node.svgElem.attr("cx", newX);
            }
        }
        else
        {
            // Adjust children position then call this function on them
            // Can be optimised by including leaf count in this recursion

            this.treeNodes[id].children.forEach(c => this.reAdjustNodes(c));


        }
    }*/
    reOrderLevels()
    {
        //Builds the tree in terms of levels through inorder traversal
        return this.reOrderLevelsAux("N1",[]);
        //console.log(this.levels)
    }
    reOrderLevelsAux(id,levels)
    {
        console.log(this.treeNodes[id].depth + " " + levels.length);
        if(this.treeNodes[id].depth === levels.length)
        {
            levels[this.treeNodes[id].depth] = [];
        }
        levels[this.treeNodes[id].depth].push(id);

        if(this.treeNodes[id].children.length !== 0)
        {
            this.treeNodes[id].children.forEach(x=>this.reOrderLevelsAux(x,levels));
        }
        return levels;
    }
    reAdjustNodes(id,levels){
        for(let i = (levels.length-1); i > this.treeNodes[id].depth; i--)
        {
            console.log(levels[i]);
            for(let j = 0; j < levels[i].length; j++)
            {
                const node = this.treeNodes[levels[i][j]];
                const newX = Number(this.treeNodes[this.root].svgElem.attr('cx')) + ((j * 150) - ((levels[i].length*150)/2));
                node.svgElem.attr("cx", newX);
                node.svgIncomingEdges.forEach(x=> x.attr('x2',newX));
                node.svgOutgoingEdges.forEach(x=> x.attr('x1',newX));
            }


        }

    }

    setNodeValues(id,g,f)
    {
        this.treeNodes[id].f = f;
        this.treeNodes[id].g = g;
        this.treeNodes[id].h = f - g;
    }
    setNodeState(id,state)
    {
        this.treeNodes[id].state = state;
        this.setElemState(this.treeNodes[id].svgElem,state)
    }
    getNodeData(id)
    {
        return{
            id:id,
            h:this.treeNodes[id].h,
            g:this.treeNodes[id].g,
            f:this.treeNodes[id].f,
            pId:this.treeNodes[id].pId
        }
    }

    isBreakPoint()
    {
        throw new Error("This is abstract")
    }


}