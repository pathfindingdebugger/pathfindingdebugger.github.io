function maParser(mapData)
{
    const data = mapData.split('\r').split('\n');

    data.shift();

    const height = Number(data.shift().split(' ').pop());
    const width = Number(data.shift().split(' ').pop());
    data.shift();
    const mData = data.reduce((f,e)=>f+e,'');
    console.log("MapData",width,height,mData);
    
    return {height:height, width:width, mapData:mData};
}