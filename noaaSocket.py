from threading import Thread
from databaseManager import DBManager
from datetime import datetime, timezone, timedelta
from time import strptime
import kml2geojson
import zipfile
import time
import requests
import json
import geojson
import sys
import os
import shutil
import gc

class NoaaSocket(Thread):

    def __init__(self):
        super(NoaaSocket, self).__init__()
        self._cycloneManager = DBManager()
        self._url = "https://www.nhc.noaa.gov/CurrentStorms.json"
        self._json_history = {}
        self._json_data = []
        self._delay = 2
        print("Monitoring NOAA inicializated...")

    def run(self, socketio):
        time.sleep(30)
        while True:
            try:
                response = requests.get(self._url,headers={"Content-type":"application/json"})                
                if response.status_code == 200:

                    #Parse response to JSON
                    self._json_dataTemp = json.loads(response.content)

                    #New data differ from old
                    if(self._json_history != self._json_dataTemp):      

                        for alert in self._json_dataTemp["activeStorms"]:
                            category = ""
                            speed = float(alert["movementSpeed"]) * 1.60934    #mph to km/h
                            pressure = alert["pressure"]   #mB

                            if speed < 62:
                                category = "DT"  #Tropical Depression
                            elif speed < 118:
                                category = "TT"  #Tropical Storm
                            elif speed < 153:
                                category = "H1"  #Hurricaine 1
                            elif speed < 177:
                                category = "H2"  #Hurricaine 2
                            elif speed < 210:
                                category = "H3"  #Hurricaine 3
                            elif speed < 250:
                                category = "H4"  #Hurricaine 4
                            else:
                                category = "H5"  #Hurricaine 5

                            predictedTrack = []

                            #Download KMZ file from NOAA and change to ZIP
                            kmlURL = alert["forecastTrack"]["kmzFile"]
                            file =  requests.get(kmlURL)
                            path = os.path.join(os.path.dirname(os.path.abspath(__file__)).replace("""\\""", "/") + "/kml/"+alert["id"]+".zip")
                            pathExtracted = os.path.join(os.path.dirname(os.path.abspath(__file__)).replace("""\\""", "/") + "/kml/"+alert["id"])

                            #Write file downloaded
                            with open(path, "wb") as f:
                                f.write(file.content)
                            
                            #Extract ZIP file
                            with zipfile.ZipFile(path, 'r') as unzip:
                                unzip.extractall(pathExtracted)

                            #Read and convert KML to GEOJSON
                            kml2geojson.main.convert(pathExtracted + "/"+ kmlURL.split("/")[5].split(".")[0] + ".kml", pathExtracted)

                            #Read GEOJSON
                            with open(pathExtracted + "/"+ kmlURL.split("/")[5].split(".")[0] +".geojson") as file:
                                data = geojson.load(file)
                                trajectory = data["features"]

                                #Drop indexes without date (has all coordinates and is not util)
                                trajectory.pop(0) 
                                trajectory.pop(0) 

                                #Put in an array each point predicted by NOAA
                                for point in trajectory:
                                    predictedTrack.append({
                                        "center": {
                                            "lat": point["geometry"]["coordinates"][1],
                                            "lng": point["geometry"]["coordinates"][0]
                                        },
                                        "date": self.dateConvert(point["properties"]["description"].split("<td>")[3].split("<td nowrap>")[2].replace("Valid at:", "").split("</td>")[0].strip())
                                    })
                                
                            #Add storm to storm's array
                            self._json_data.append(
                                {
                                    "id": alert["id"],
                                    "name": alert["name"],
                                    "category": category,
                                    "data": {
                                        "hurrSpeed": speed,
                                    },
                                    "center":{
                                        "lat": alert["latitudeNumeric"],
                                        "lng": alert["longitudeNumeric"]
                                    },
                                    "date": alert["lastUpdate"],
                                    "predicted": predictedTrack
                                }
                            )
                        
                        print("New data detected")

                        #Emit alert
                        socketio.emit('/alert', { "data": self._json_data } , namespace='/api')

                        print("Alert emited")

                        #Use the storms
                        self._cycloneManager.compare(self._json_data)

                        #Clean storms
                        self._json_data = []

                        #Clear folder 
                        folder = os.path.join(os.path.dirname(os.path.abspath(__file__)).replace("""\\""", "/") + "/kml/")

                        for filename in os.listdir(folder):
                            file_path = os.path.join(folder, filename)
                            try:
                                if os.path.isfile(file_path) or os.path.islink(file_path):
                                    os.unlink(file_path)
                                elif os.path.isdir(file_path):
                                    shutil.rmtree(file_path)
                            except Exception as e:
                                print('Failed to delete %s. Reason: %s' % (file_path, e))

                    #Save the history state 
                    self._json_history = self._json_dataTemp

                else:
                    print("Conection refused")
                    sys.exit()

            except ZeroDivisionError as err:
                print(err)
                print("REFUSED with error: {0}".format(err))
            
            gc.collect()
            time.sleep(self._delay)

    #Convert date given from NOAA to UTC ISO string
    def dateConvert(self, date):

        split = date.split(" ")

        date = split[0] + " " + split[1] + " " + split[3] + " " + split[4] + " " + split[5]

        full_date = datetime.strptime(date, '%I:%M %p %B %d, %Y')

        delta = timedelta()

        if split[2] == "CDT":
            delta = timedelta(hours = 5)
        elif split[2] == "MDT":
            delta = timedelta(hours = 6)

        dateUTC = full_date + delta

        return str(dateUTC)