function maParser(mapData)
{
    console.log(mapData);
    const data = mapData.split('\n');

    data.shift();

    const height = Number(data.shift().split(' ').pop());
    const width = Number(data.shift().split(' ').pop());
    data.shift();
    const mData = data.slice(0,100).reduce((f,e)=>f+e,'');

    return {height:height, width:width, mapData:mData};
}