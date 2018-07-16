package pgraph;
import java.util.HashMap;
import pgraph.EventType;
import java.io.*;

public class Debug
{
    String outputString;
    HashMap<String,SvgObject> svgObjects;

    public String eventString;

    public Debug()
    {
        outputString = "{ \"type\":\"Custom\",";
        eventString = "\"eventList\":[";
        svgObjects = new HashMap<String,SvgObject>();
        //Read map and add to output string
    }
    public void addSvgObject(String id,HashMap<String,String>[] objects, String[] variableNames)
    {
        svgObjects.put(id,new SvgObject(objects,variableNames));
    }
    public void startEvent(String startId,String endId)
    {
        if(eventString.length() > 15)
        {
            eventString += ",\n";
        }
        eventString += "{ \"startId\":\""+startId+"\",\"endId\":\""+endId+"\",\"type\":\""+EventType.START.toString()+"\"}";
    }
    public void endEvent()
    {
        if(eventString.length() > 15)
        {
            eventString += ",\n";
        }
        eventString += "{\"type\":\""+EventType.END.toString()+"\"}";
    }
    //Generating
    public void generateEvent(String id,String parentId,double x, double y,String node,String[] variables,double g, double f)
    {
        if(eventString.length() > 15)
        {
            eventString += ",\n";
        }
        if(svgObjects.get(node) == null)
        {
            throw new IllegalArgumentException("No SVG MATCHES");
        }
        else if( variables.length != svgObjects.get(node).getArgumentLength())
        {
            throw new IllegalArgumentException("PARAMENTER MIS MATCH");
        }
        String pId = parentId != null ? "\""+parentId+"\"" : null;
        eventString += "{ \"id\":\"" + id + "\", \"pId\":"+pId+",\"x\":"+x+",\"y\":"+y+",\"type\":\"" + EventType.GENERATING.toString() + "\", \"svgType\":\"" + node + "\", \"variables\": [\"";
        for (int i = 0; i < variables.length; i++) {
            eventString += variables[i];
            if (i != variables.length - 1) {
                eventString += "\",\"";
            }
        }
        eventString += "\"], \"g\":" + g + ",\"f\":" + f + "}";

    }

    //Updating TODO If updating shape is needed during search then update this to be like generating
    public void updateEvent(String id,String pId,double g, double f)
    {
        if(eventString.length() > 15)
        {
            eventString += ",\n";
        }
        eventString += "{ \"id\":\""+id+"\", \"pId\":\""+pId+"\",\"type\":\""+EventType.UPDATING.toString()+"\",\"g\":"+g+",\"f\":"+f+"}";
    }
    public void expandNode(String id)
    {
        addSmallEvent(id,EventType.EXPANDING);
    }
    public void closeNode(String id)
    {
        addSmallEvent(id,EventType.CLOSING);
    }
    void addSmallEvent(String id, EventType type)
    {
        if(eventString.length() > 15)
        {
            eventString += ",\n";
        }
        eventString += "{ \"id\":\""+id+"\",\"type\":\""+type.toString() + "\"}";
    }

    public void outputDebugFile()
    {

        String objectString = "\"svgObjects\": [";
        for (String key : svgObjects.keySet()) {
            if(objectString.length() > 20){objectString += ",";}
            objectString += "{ \"key\":\""+key+"\", \"object\":"+svgObjects.get(key).getOutputString()+"}";
        }
        outputString += objectString+"],"+eventString+"]}";

        try{
        //print to document
        File file = new File("Test.json");

        FileWriter writer = new FileWriter(file);

        writer.write(outputString);
        writer.flush();
        writer.close();
        }
        catch (IOException e)
        {
            System.out.println("Write error");
        }
    }


}
