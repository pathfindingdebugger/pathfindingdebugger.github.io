//NOTE PLY SHOULD HAVE A X AND Y FOR VERTEX AND A VERTICES_LIST AND TRAVERSABLE FOR FACES

function parsePLY(plyString)
{
    const data = plyString.split('\r').length > 0 ? plyString.split('\r'):plyString.split('\n') ;
    console.log("TEST",data);
    if (data[0] !== "ply")
        throw Error;

    const returnObj = {vertex:[],faces:[]};

    let vert = false,
        face = false,
        headerLength = -1,
        vertexCount,
        faceCount;
    const vertProperties = [];
    const faceProperties = [];

    data.forEach((line,i)=>{
        const lineData = line.split(' ');

        if(headerLength === -1)
        {
            if(lineData[0] === "element")
            {
                if(lineData[1] === "vertex")
                {
                    vertexCount = Number(lineData[2]);
                    vert = true;
                    face = false;
                }
                else if(lineData[1]  === "face")
                {
                    faceCount = Number(lineData[2]);
                    vert = false;
                    face = true;
                }
            }
            if(lineData[0] === "property")
            {
                if(vert === true)
                    vertProperties.push(lineData[lineData.length-1]);
                else if(face === true)
                faceProperties.push(lineData[lineData.length-1]);
            }
            if(lineData[0] === "end_header")
            {
                headerLength = i;
                face = false;
            }
        }
        else
        {
            //If our position on the list is less than headerPosition + vertexCount then we are processing vertex still
            if(i <= headerLength+vertexCount)
            {
                //we are processing a vertex
                const v = {};
                vertProperties.forEach((prop,index)=>v[prop]=Number(lineData[index]));
                console.log(i,v);
                returnObj.vertex.push(v);
            }
            else if(i <= headerLength+vertexCount+faceCount)
            {
                f = {};
                let currentProperty  = 0;
                let nextIndex;
                lineData.forEach((d,i)=>{
                    if(i < nextIndex)
                        return;

                    if(faceProperties[currentProperty] === "vertex_indices")
                    {
                        f.vertex_indices = lineData.slice(i+1,Number(lineData[i])+1).map(e=>Number(e));
                        nextIndex = i+Number(lineData[i])+1;

                    }
                    else
                    {
                        f[faceProperties[currentProperty]] = Number(d);
                    }
                    currentProperty ++;
                }) ;


                // we are processing a face
                returnObj.faces.push(f);
            }
        }


    });
    console.log(vertexCount,faceCount,vertProperties,faceProperties,returnObj);
    return returnObj;
}
