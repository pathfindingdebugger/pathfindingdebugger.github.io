function parseGraph(co,gr)
{
    const points = [];
    const coordData = co.split('\n');
    let firstX = null, firstY = null;
    coordData.forEach(l=>{
        if(l[0] === 'v')
        {
            const lineData = l.split(' ');
            if(firstX == null)
            {
                firstX = Number(lineData[2]);
                firstY = Number(lineData[3]);

                console.log(firstX);
            }

            points.push({id:Number(lineData[1])-1,x:Number(lineData[2]) - firstX,y:Number(lineData[3]) - firstY})
        }
    });
    const edges = [];
    const edgeData = gr.split('\n');
    edgeData.forEach(e=> {
        if (e[0] === 'a')
        {
            const edgeData = e.split(' ');
            edges.push({v1:Number(edgeData[1])-1,v2:Number(edgeData[2])-1,weight:edgeData[3]});
        }
    });

    return {vertex:points,edges:edges};
}