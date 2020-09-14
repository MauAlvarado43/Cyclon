from queryOpenWeather import QueryOpenWeather
from datetime import datetime
from dateutil import parser
import pymongo
import requests
import json

class DBManager:

    def __init__(self):
        super(DBManager, self).__init__()
        self._mongoClient = pymongo.MongoClient("mongodb+srv://CyC1:kybmim-hoqhob-2Doswo@cyc1-p6vhd.mongodb.net/cyclon?retryWrites=true&w=majority")
        self._database = self._mongoClient["cyclon"]
        self._model = self._database["hurricaines"]
        self._openWeather = QueryOpenWeather()

    def getCategory(speed):
        if speed < 62:
            return "DT"  #Tropical Depression
        elif speed < 118:
            return "TT"  #Tropical Storm
        elif speed < 153:
            return "H1"  #Hurricaine 1
        elif speed < 177:
            return "H2"  #Hurricaine 2
        elif speed < 210:
            return "H3"  #Hurricaine 3
        elif speed < 250:
            return "H4"  #Hurricaine 4
        else:
            return "H5"  #Hurricaine 5


    def formatPoint(self, storm):

        dataReal = self._openWeather.getRealPoint(storm["center"])
        dataReal = [{
            "position": {
                "lat": storm["center"]["lat"],
                "lng": storm["center"]["lng"]
            },
            "windSpeed": dataReal["wind"]["speed"] * 3.6, #m/s to km/h
            "hurrSpeed": storm["data"]["hurrSpeed"],
            "temperature": dataReal["main"]["temp"],
            "pressure": dataReal["main"]["pressure"],
            "date": storm["date"]
        }]

        dataPredicted = [dataReal[0]]

        for point in storm["predicted"]:

            for forecast in self._openWeather.getForecastPoint(point["center"])["list"]:

                if(forecast["dt_txt"] == str(point["date"])):

                    dataPredicted.append({
                        "position": {
                            "lat": point["center"]["lat"],
                            "lng": point["center"]["lng"]
                        },
                        "windSpeed": forecast["wind"]["speed"] * 3.6,
                        "hurrSpeed": storm["data"]["hurrSpeed"],
                        "temperature": forecast["main"]["temp"],
                        "pressure": forecast["main"]["pressure"],
                        "date": point["date"]
                    })

                    break

        return [dataReal, dataPredicted]

    def compare(self, activeStorms, socketio):
    
        docs = self._model.find({ "active" : True })
        alertsToReturn = []

        #Search old storms in new storms and stopping not actives
        for doc in docs:

            exist = False
            stormData = {}

            for storm in activeStorms:
                
                if storm["id"] == doc["id"]:

                    exist = True
                    stormData = storm

                    break
            
            #Close inactive cyclone
            if not exist:
                self._model.update_one( { "id" : doc["id"]}, { "$set": { "active" : False } })
                print("Cyclone closed")
            else:
                realTrajectory = doc["realTrajectory"]
                
                #Check repeated data
                if (str(doc["lastUpdate"].isoformat()) + ".000Z") != str(storm["date"]):
                    data = self.formatPoint(storm)

                    category = getCategory(data[0][0]["windSpeed"])

                    realTrajectory = doc["realTrajectory"]
                    realTrajectory.append(data[0][0])

                    self._model.update_one( { "id" : doc["id"]}, { "$set": { "name": stormData["name"], "realTrajectory" : realTrajectory, "predictedTrajectory": data[1], "lastUpdate":  parser.parse(storm["date"]) } })

                    print("Cyclone updated")

                    alertsToReturn.append({ 
                        "data": { 
                            "id": doc["id"],
                            "lastPoint": data[0][0],
                            "name": doc["name"],
                            "category": category
                        }, 
                        "update": True 
                    })

                    #Emit alert
                    socketio.emit('/alert', { 
                        "data": { 
                            "id": doc["id"],
                            "lastPoint": data[0][0],
                            "name": doc["name"],
                            "category": category
                        }, 
                        "update": True 
                    } , namespace='/api')

                    print("Alert emited")

        #Search new storms in olds and created
        for storm in activeStorms:
            exist = False
            doc = self._model.find({ "id" : storm["id"] }) 

            if doc.count() == 0:

                data = self.formatPoint(storm)

                category = getCategory(data[0][0]["windSpeed"])

                cyclone = {
                    "id": storm["id"],
                    "origin": storm["center"],
                    "name": storm["name"],
                    "appearance": parser.parse(storm["date"]),
                    "lastUpdate": parser.parse(storm["date"]),
                    "active": True,
                    "category": category,
                    "predictedTrajectory": data[1],
                    "realTrajectory": data[0]
                }

                self._model.insert_one(cyclone)

                print("New cyclone saved")

                alertsToReturn.append({ 
                    "data": { 
                        "id": storm["id"],
                        "lastPoint": data[0][0],
                        "name": storm["name"],
                        "category": category
                    }, 
                    "update": False 
                })

                #Emit alert
                socketio.emit('/alert', { 
                    "data": { 
                        "id": storm["id"],
                        "lastPoint": data[0][0],
                        "name": storm["name"],
                        "category": category
                    }, 
                    "update": False 
                } , namespace='/api')

        return alertsToReturn          