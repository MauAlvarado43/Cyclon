import time
import requests
import json
import sys
import os
import gc
from threading import Thread

url = "https://www.nhc.noaa.gov/CurrentStorms.json"

def run():
    json_history = {}
    json_data = []
    print("COMENZANDO")
    while (True):
        try:
            response = requests.get(url,headers={"Content-type":"application/json"})
            if(response.status_code==200):
                json_dataTemp = json.loads(response.content)
                if(json_history != json_dataTemp):

                    json_history = json_dataTemp

                    for alert in json_dataTemp["activeStorms"]:

                        category = ""
                        speed = alert["movementSpeed"]*1.60934    #Millas por hora a kilometros por hora
                        pressure = alert["pressure"]   #mB

                        if speed < 62:
                            category = "TD"  #Depresion Tropical
                        elif speed < 118:
                            category = "TT"  #Tormenta Tropical
                        elif speed < 153:
                            category = "S1"  #Huracan Categoria 1
                        elif speed < 177:
                            category = "S2"  #Huracan Categoria 2
                        elif speed < 210:
                            category = "S3"  #Huracan Categoria 3
                        elif speed < 250:
                            category = "S4"  #Huracan Categoria 4
                        else:
                            category = "S5"  #Huracan Categoria 5

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
                        
                    path = os.path.join(os.path.dirname(os.path.abspath(__file__)).replace("""\\""","/").replace("jobs/Python","db/alerts.json"))
                    text_file = open(path, "w")
                    text_file.write(str(json_data).replace("'",'"'))
                    text_file.close()

                    print("NUEVO JSON")

                    json_data = []

            else:
                print("ERROR AL CONECTAR")
                sys.exit()
        except Exception as err:
            print("REFUSED with error: {0}".format(err))
        
        gc.collect()
        time.sleep(2)

run()

# url = "https://eonet.sci.gsfc.nasa.gov/api/v3/categories/severeStorms?status=open"

# def run():

#     json_history = []
#     json_data = []
#     print("COMENZANDO")

#     while (True):

#         try:

#             response = requests.get(url,headers={"Content-type":"application/json"})

#             if(response.status_code==200):
#                 json_dataTemp = json.loads(response.content)

#                 for event in json_dataTemp["events"]:

#                     if event["title"].split(" ")[0] == "Tropical":

#                         lat = event["geometry"][len(event["geometry"])-1]["coordinates"][0]
#                         lng = event["geometry"][len(event["geometry"])-1]["coordinates"][1]

#                         eventData = requests.post("https://api.openweathermap.org/data/2.5/weather?lat="+str(lat)+"&lon="+str(lng)+"&units=metric&lang=es&type=like&appid=6999fec6dfa28058cc994d243a3414e2")
#                         eventJSON = json.loads(eventData.content)

#                         speed = eventJSON["wind"]["speed"]
#                         category = ""

#                         if speed < 62:
#                             category = "TD"  #Depresion Tropical
#                         elif speed < 118:
#                             category = "TT"  #Tormenta Tropical
#                         elif speed < 153:
#                             category = "S1"  #Huracan Categoria 1
#                         elif speed < 177:
#                             category = "S2"  #Huracan Categoria 2
#                         elif speed < 210:
#                             category = "S3"  #Huracan Categoria 3
#                         elif speed < 250:
#                             category = "S4"  #Huracan Categoria 4
#                         else:
#                             category = "S5"  #Huracan Categoria 5

#                         json_history.append({
#                             "id":event["id"],
#                             "name":event["title"].split(" ")[2],
#                             "category":category,
#                             "speed":speed,
#                             "pressure":eventJSON["main"]["pressure"],
#                             "temp": eventJSON["main"]["temp"],
#                             "center":{
#                                 "lat":lat,
#                                 "long":lng
#                             },
#                             "direction":eventJSON["wind"]["deg"],
#                             "date":event["geometry"][len(event["geometry"])-1]["date"]
#                         })

#                     if json_data != json_dataTemp:

#                         json_save = []

#                         for cyclone in json_data:

#                             flag = False

#                             for pastCyclone in json_data:
#                                 if pastCyclone == cyclone:
#                                     flag = True
                            
#                             if flag:
#                                 json_save.append(cyclone)     
                        
#                         path = os.path.join(os.path.dirname(os.path.abspath(__file__)).replace("""\\""","/").replace("jobs/Python","db/alerts.json"))

#                         text_file = open(path, "w")
#                         text_file.write(str(json_save).replace("'",'"'))
#                         text_file.close()

#                         json_dataTemp = []
#                         json_data = json_save

#                         print("NUEVO JSON")
#             else:
#                 print("ERROR AL CONECTAR")
#                 sys.exit()
#         except Exception as err:
#             print("REFUSED with error: {0}".format(err))
        
#         gc.collect()
#         time.sleep(2)

# run()