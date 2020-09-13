from threading import Thread
from databaseManager import DBManager
from datetime import datetime, timedelta
from time import strptime
from io import BytesIO
from zipfile import ZipFile
import kmlConverter
import xml.dom.minidom as md
import urllib.request
import time
import requests
import json
import sys
import os
import shutil
import gc
import logging

class NoaaSocket(Thread):

    def __init__(self):
        super(NoaaSocket, self).__init__()
        self._cycloneManager = DBManager()
        self._url = "https://www.nhc.noaa.gov/CurrentStorms.json"
        self._json_history = {}
        self._json_data = []
        self._delay = 2
        self._alertsGenerated = []
        print("Monitoring NOAA inicializated...")

    def getAlertsGenerated(self):
        return json.dumps(self._alertsGenerated)

    def run(self, socketio):
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

                            url = urllib.request.urlopen(kmlURL)

                            with ZipFile(BytesIO(url.read())) as my_zip_file:
                                for contained_file in my_zip_file.namelist():
                                    if contained_file.lower() == (kmlURL.split("/")[5].split(".")[0] + ".kml").lower():

                                        root = md.parseString(str(my_zip_file.open(contained_file).read().decode('utf8')))

                                        data = kmlConverter.build_layers(root)
                                    
                                        trajectory = data[0]["features"]

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

                        #Use the storms
                        self._alertsGenerated = self._cycloneManager.compare(self._json_data, socketio)

                        #Clean storms
                        self._json_data = []

                    #Save the history state 
                    self._json_history = self._json_dataTemp

                else:
                    print("Conection refused")
                    sys.exit()

            except Exception as e:
                logging.exception(e)
            
            gc.collect()
            time.sleep(self._delay)

    #Convert date given from NOAA to UTC ISO string
    def dateConvert(self, date):

        split = date.split(" ")

        date = split[0] + " " + split[1] + " " + split[3] + " " + split[4] + " " + split[5]

        full_date = datetime.strptime(date, '%I:%M %p %B %d, %Y')

        with open(os.path.join(os.path.dirname(os.path.abspath(__file__)).replace("""\\""", "/") + "/files/timezones.json")) as timezones:
                        
            delta = timedelta(hours = - int(json.load(timezones)[split[2]]))
            dateUTC = full_date + delta

            return str(dateUTC)