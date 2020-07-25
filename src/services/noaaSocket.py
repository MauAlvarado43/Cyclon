from ModelTrajectory.TrajectoriesModel import TrajectoriesModel
import time
from threading import Thread
import requests
import json
import sys
import os
import gc
import asyncio
import pymongo

class NoaaSocket(Thread): 

    def __init__(self, sio):
        super(NoaaSocket, self).__init__()
        self._url = "https://www.nhc.noaa.gov/CurrentStorms.json"
        # self._mongoURL = "mongodb+srv://CyC1:kybmim-hoqhob-2Doswo@cyc1-p6vhd.mongodb.net/cyclon?retryWrites=true&w=majority"
        self._mongoURL = "mongodb://localhost:27017/"
        self._connect_bd()
        self._model = TrajectoriesModel()
        self._time = 6
        self._sio = sio
        self._state = True
        self._delay = 2
        self._json_history = {}
        self._json_data = []
        print("Monitoring NOAA inicializated...")

    def stop(self):
        self._state = False

    def _connect_bd(self):
        try:
            self._client = pymongo.MongoClient(self._mongo_URL)
            self._database = self._client.cyclon
            self._cyclone = self._database.hurricaines
        except Exception as err:
            print(f"Error to connect with {self._mongo_URL}")
            self._client = pymongo.MongoClient(self._mongoLocal)
            self._database = self._client.cyclon
            self._cyclone = self._database.hurricaines
            print(f"Connect with local database in {self._mongoLocal}")

    async def _emitAlert(self, json):
        await self._sio.emit("/alert", json)

    def _closeCyclone(self, id):
        self._connect_bd()
        self._cyclone.update_one({"id": id}, {"$set": {"active": False}})

    def _train_model(self, data):
        print("entrenando modelo")
        self._model.save_cyclone(data)

    def run(self):
        while self._state:
            try:
                response = requests.get(self._url,headers={"Content-type":"application/json"})                
                if response.status_code == 200:
                    self._json_dataTemp = json.loads(response.content)
                    if(self._json_history != self._json_dataTemp):
                        print("entra al if")
                        if len(self._json_history) > 0:
                            if len(self._json_history["activeStorms"]) > len(self._json_data):
                                for lastCyclone in self._json_history["activeStorms"]:                               
                                    exist = False
                                    for actualCyclone in self._json_data: 
                                        if lastCyclone["id"] == actualCyclone["id"]:
                                            exist = True

                                    if not exist:
                                        self._closeCyclone(lastCyclone["id"])

                        self._json_history = self._json_dataTemp
                        for alert in self._json_dataTemp["activeStorms"]:
                            category = ""
                            speed = float(alert["movementSpeed"]) * 1.60934    #Millas por hora a kilometros por hora
                            pressure = alert["pressure"]   #mB

                            if speed < 62:
                                category = "DT"  #Depresion Tropical
                            elif speed < 118:
                                category = "TT"  #Tormenta Tropical
                            elif speed < 153:
                                category = "H1"  #Huracan Categoria 1
                            elif speed < 177:
                                category = "H2"  #Huracan Categoria 2
                            elif speed < 210:
                                category = "H3"  #Huracan Categoria 3
                            elif speed < 250:
                                category = "H4"  #Huracan Categoria 4
                            else:
                                category = "H5"  #Huracan Categoria 5

                            self._json_data.append(
                                {
                                    "id":alert["id"],
                                    "name":alert["name"],
                                    "category":category,
                                    "speed":speed,
                                    "pressure":pressure,
                                    "center":{
                                        "lat":alert["latitudeNumeric"],
                                        "long":alert["longitudeNumeric"]
                                    },
                                    "direction":alert["movementDir"],  #Grados
                                    "date":alert["lastUpdate"]
                                }
                            )

                            self._train_model(
                                {
                                    "id":alert["id"],
                                    "category":category,
                                    "name": alert["name"],
                                    "speed":speed,
                                    "pressure":pressure,
                                    "center":{
                                        "lat":alert["latitudeNumeric"],
                                        "long":alert["longitudeNumeric"]
                                    },
                                    "direction":alert["movementDir"],  #Grados
                                    "date":alert["lastUpdate"]
                                }

                            )
                        
                        asyncio.run(self._emitAlert(self._json_data))     
                        print("New data")
                        self._json_data = []

                else:
                    print("Conection refused")
                    sys.exit()
            except ZeroDivisionError as err:
                print(err)
                print("REFUSED with error: {0}".format(err))
            
            gc.collect()
            time.sleep(self._delay)