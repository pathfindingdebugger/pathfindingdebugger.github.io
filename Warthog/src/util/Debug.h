#ifndef WARTHOG_DEBUG
#define WARTHOG_DEBUG
#include <iostream>
#include <sstream>
#include <fstream>
#include "gridmap.h"
#include "weighted_gridmap.h"
#include "search_node.h"
enum EventType
{
	expanding,
	generating,
	updating,
	closing
};
using namespace std;
class Debugger
{
private:
	int eventCount = 0;
	string typeStrings[4] = {"expanding","generating","updating","closing"};
	stringstream saveData;
public:
    Debugger()
    {
		saveData << "{ \"map\" : \"Null " ; 
		saveData << "\"eventList\" : [ \n";
		
    }
	Debugger(uint32_t start, uint32_t end,uint32_t mapWidth)
    {
		saveData << "{ \"map\" : \"Null " ; 
		saveData << "\"startId\" : { \"x\":"<< start % mapWidth 
				 << ", \"y\" :"<<(start / mapWidth) << "}, "
				 << "\"endId\" : { \"x\":"<< end % mapWidth
				 << ", \"y\" :"<<(end / mapWidth) << "}, \n";
		saveData << "\"eventList\" : [ \n";
		
    }
	Debugger(uint32_t start, uint32_t end, warthog::gridmap* grid)
    {
		
        saveData << "{ \"Map\" : " << getMapString(grid->filename()) << ", \n";
		saveData << "\"startId\" : { \"x\":"<< start % grid->width() 
				 << ", \"y\" :"<<(start / grid->width()) << "}, "
				 << "\"endId\" : { \"x\":"<< end % grid->width()
				 << ", \"y\" :"<<(end / grid->width()) << "}, \n";
		saveData << " \"eventList\" : [ \n";

		cerr << grid->height() << " : " << grid ->width() << endl;
    }

	Debugger(uint32_t start, uint32_t end,warthog::weighted_gridmap* grid)
    {
        saveData << "{ \"Map\" : " << getMapString(grid->filename()) << ", \n";
		saveData << "\"startId\" : "<<start << ", \"endId\" : "<<end << ", \n";
		saveData << " \"eventList\" : [ \n";
    }
	void AddEvent(EventType type, int id, uint32_t g, uint32_t h)
	{
		if(eventCount != 0)
			saveData<<", \n";
		saveData << "\t { \"type\" : \"" + typeStrings[type] + "\","
					 << "\"id\" : " << id << ","
					 << "\"g\" : " << g << ","
					 << "\"f\" : " << h
					 << " }";
			eventCount++;
	}
	void AddEvent(EventType type, int x,int y, uint32_t g, uint32_t h)
	{
		if(eventCount != 0)
			saveData<<", \n";
		saveData << "\t { \"type\" : \"" + typeStrings[type] + "\","
				 << "\"x\" : " << x << ","
				 << "\"y\" : " << y << ","
				 << "\"g\" : " << g << ","
				 << "\"f\" : " << h << ""
				 << " }";
		eventCount++;
	}
	void AddEvent(EventType type, int x, int y, warthog::search_node* node)
	{
		if(eventCount != 0)
			saveData<<", \n";
		saveData << "\t { \"type\" : \"" + typeStrings[type] + "\","
				 << "\"x\" : " << x << ","
				 << "\"y\" : " << y << ","
				 << "\"g\" : " << node->get_g() / (double)warthog::ONE<< ","
				 << "\"f\" : " << node->get_f() / (double)warthog::ONE << ""
				 << " }";
		eventCount++;
	}
	//void AddEvent(EventType type, search_node node){}
    void printToDebugFile()
	{
		std::ofstream outputfile; //open and save the file
		outputfile.open("temp.json");
		saveData << "\n ] }"; //Add terminating curley bracket for Json		
		
		string data = saveData.str();
		outputfile << data.substr(0,data.length()-3);
		outputfile.close();
	}
	string getMapString(const char* fileName)
	{
		string line;
		std::ifstream file;
		stringstream mapString;		
		file.open(fileName);
		for(int i = 0 ; i < 4; i++)
		{
			getline(file,line);
			if(i == 1)
				mapString << "{ \"mHeight\" : "<<line.substr(7,line.size()) <<" , ";
			if(i == 2)
				mapString << " \"mWidth\" : " << line.substr(6,line.size()) << " , "; 			
		}
		mapString << " \"mapData\" : \"";
		while( getline( file, line))
		{
			if(line[line.size()-1] == '\n')
				mapString << line.substr(0,line.size());	
			else
				mapString << line;		
		}
		mapString << "\" }";
		file.close();
		return mapString.str();
	}
};
#endif
