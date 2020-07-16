from Models.ModelTrajectory import TrajectoriesModel as TM
import time
import requests
import json
import sys
import os
import gc
import asyncio
import pymongo

class NoaaSocket: 

    TrajectoriesModel = TM.TrajectoriesModel()

    url = "https://www.nhc.noaa.gov/CurrentStorms.json"
    mongoURL = "mongodb+srv://CyC1:kybmim-hoqhob-2Doswo@cyc1-p6vhd.mongodb.net/cyclon?retryWrites=true&w=majority"

    async def emitAlert(self, json):
        await self.sio.emit("/alert", json)

    def closeCyclone(self, id):
        client = pymongo.MongoClient(self.mongoURL)
        db = client["cyclon"]
        cyclone = mydb["Hurricaine"]

        cyclone.update_one({"id": id}, { "$set": { "active": False } })

    def insertData(self, json):

        try: 
            #TODO Request to OpenWeather for getting this moment cyclone's information
            #response = requests.get(self.url,headers={"Content-type":"application/json"})
        
            #TODO Use the model to save or update the cyclone
            client = pymongo.MongoClient(self.mongoURL)
            db = client["cyclon"]
            cyclone = mydb["Hurricaine"]

            x = cyclone.insert_one("""INFORMATION""")     
        except Exception as err:
            print("REFUSED with error: {0}".format(err))

    def run(self, sio):

        self.sio = sio

        json_history = {}
        json_data = []

        print("Monitoring NOAA")
        while (True):
            try:
                response = requests.get(self.url,headers={"Content-type":"application/json"})
                if(response.status_code==200):

                    json_dataTemp = json.loads(response.content)

                    if(json_history != json_dataTemp):

                        if len(json_history["activeStorms"]) > len(json_data):
                            
                            for lastCyclone in json_history["activeStorms"]:
                                
                                exist = False

                                for actualCyclone in json_data:
                                    if lastCyclone["id"] == actualCyclone["id"]
                                        exist = True

                                if not exist:
                                    closeCyclone(lastCyclone["id"])

                        json_history = json_dataTemp

                        for alert in json_dataTemp["activeStorms"]:

                            category = ""
                            speed = alert["movementSpeed"]*1.60934    #Millas por hora a kilometros por hora
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

                            json_data.append(
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

                            insertData(
                                {
                                    "id":alert["id"],
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
                        
                        asyncio.run(self.emitAlert(json_data))     

                        print("New data")

                        json_data = []

                else:
                    print("Conection refused")
                    sys.exit()
            except Exception as err:
                print("REFUSED with error: {0}".format(err))
            
            gc.collect()
            time.sleep(2)