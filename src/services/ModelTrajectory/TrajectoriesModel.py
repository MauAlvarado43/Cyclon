from ModelTrajectory.KeysManager import KeysManager
from ModelTrajectory.EarthPoints import EarthPoints
import datetime
import math as m
import requests
import numpy as np 
import pandas as pd
import pymongo
import datetime

class TrajectoriesModel(EarthPoints):

   def __init__(self):
      super().__init__()
      self._url = 'https://api.openweathermap.org/data/2.5/onecall'
      self._manager_Keys =  KeysManager()
      self._mongo_URL = "mongodb+srv://CyC1:kybmim-hoqhob-2Doswo@cyc1-p6vhd.mongodb.net/cyclon?retryWrites=true&w=majority"
      self._mongoLocal = "mongodb://localhost:27017/"
      self._connect_bd()

   def _connect_bd(self):
      try:
         self._client = pymongo.MongoClient(self._mongo_URL)
         self._database = self._client.cyclon
         self._collection = self._database.hurricaines
      except Exception as err:
         print(f"Error to connect with {self._mongo_URL}")
         self._client = pymongo.MongoClient(self._mongoLocal)
         self._database = self._client.cyclon
         self._collection = self._database.hurricaines
         print(f"Connect with local database in {self._mongoLocal}")

   def train(self, lat: float, lng: float, category: str, time: int):
      self._inicializate_variable(lat = lat, lng = lng, category = category, time = time)
      
      lat = self._latitude_cyclon
      lng = self._longitude_cyclon

      actual_hour = datetime.datetime.utcnow()
      date_format = f"{self._formNum(actual_hour.day)}-{self._formNum(actual_hour.month)}-{actual_hour.year} {self._formNum(actual_hour.hour)}:00:00"
      date = datetime.datetime.strptime(date_format, '%d-%m-%Y %H:%M:%S')
      response = []

      for i in range(0, self._time_cyclon + 1, 3):
         print(f"Starting time {i}...")
         petition = self._get_Petition(lat, lng, i)
         weather = petition[1]
         coordinates = self._get_Coordinates(lat, lng, i)
         #Se da el orden de lat,lon,hora de llegada,velocidad del huracán,viento,presión,temperatura
         response.append([lat, lng, str(date + datetime.timedelta(hours=i)), coordinates[2], weather[0]['v_res'], weather[0]['press'], weather[0]['temp']])
         lat = coordinates[0]
         lng = coordinates[1]

      return response

   def _get_Coordinates(self, lat, lng, hour):
      accurate_points = self._get_Points(lat, lng)
      latitudes_v = accurate_points[0]
      longitudes_v = accurate_points[1]
      petitions_data = []
      for i in range(len(latitudes_v)):
         petition = self._get_Petition(latitudes_v[i], longitudes_v[i], hour)
         if petition[0] == "Status Code: 200":
            petitions_data.append(petition[1])
            
      acceleration_x = []
      acceleration_y = []
      velocity_x = 0
      velocity_y = 0

      for i in range(len(petitions_data)):
         velocity_x += petitions_data[i][0]['v_x']
         velocity_y += petitions_data[i][0]['v_y']
         acceleration_x.append((petitions_data[i][1]['v_x'] - petitions_data[i][0]['v_x']) / (60 * 60))
         acceleration_y.append((petitions_data[i][1]['v_y'] - petitions_data[i][0]['v_y']) / (60 * 60))

      acceleration_res_x = np.sum(acceleration_x) / len(petitions_data)
      acceleration_res_y = np.sum(acceleration_y) / len(petitions_data)
      velocity_res_x = velocity_x / len(petitions_data)
      velocity_res_y = velocity_y / len(petitions_data)

      velocity_cyclon = (velocity_res_x ** 2 + velocity_res_y ** 2) ** (1/2)

      distance_x = ((velocity_res_x*3*60*60)+(1/2)*(acceleration_res_x)*(3*60*60)**2)/1000
      distance_y = ((velocity_res_y*3*60*60)+(1/2)*(acceleration_res_y)*(3*60*60)**2)/1000

      deg_lat = (distance_y/self._radioEarth)*((360)/(2*m.pi))
      deg_lon = (distance_x/self._radioEarth)*((360)/(2*m.pi))

      return [lat + deg_lat, lng + deg_lon, velocity_cyclon]
   
   def _get_Petition_One(self, lat, lng):
      params = {
         'lat':lat,
         'lon':lng,
         'exclude':'current,daily,minutely',
         'appid': self._manager_Keys._get_Available_Key(),
         'lang':'es',
         'units':'metric'
      }
      return pd.DataFrame(requests.get(self._url, params = params).json())
   
   def _get_Petition(self, lat, lng, k):
      try:
         payload = {
            "lat": lat, 
            "lon": lng,
            "exclude": "current,daily,minutely",
            "appid": self._manager_Keys._get_Available_Key(),
            "lang": "es",
            "units": "metric"
         }
         petition = requests.get(self._url, params = payload)
         if petition.status_code == 200:
            dictionary_response = []
            response = petition.json()

            for i in range(2):
               velocities = self._radToRect(response['hourly'][i+k]['wind_speed'], response['hourly'][i+k]['wind_deg'])
               dictionary_response.append({
                  'lat':response['lat'],
                  'lon':response['lon'],
                  'date':self._unixToTimeStamp(response['hourly'][i+k]['dt']),
                  'v_x':velocities[0], #m/s
                  'v_y':velocities[1], #m/s
                  'v_res':response['hourly'][i+k]['wind_speed'], #m/s
                  'temp':response['hourly'][i+k]['temp'], #grados
                  'press':response['hourly'][i+k]['pressure'] #psc
               })
            return ["Status Code: 200", dictionary_response]
         else:
            return self._get_Petition(lat, lng, k)
      
      except NameError as err:
         return self._get_Petition(lat, lng, k)
            
   def _radToRect(self, vel, deg):
      v_x = vel*m.sin(m.radians(deg)+m.pi)
      v_y = vel*m.cos(m.radians(deg)+m.pi)
      return v_x,v_y

   def _unixToTimeStamp(self, hour):
      return datetime.datetime.fromtimestamp(int(hour)).strftime('%Y-%m-%d %H:%M:%S')

   def _contDigit(self, number: int):
      if number == 0:
         return 1
      number = abs(number)
      if number <= 999999999999997:
         return m.floor(m.log10(number)) + 1
      count = 0
      while number:
         count += 1
         number //= 10
      return count

   def _formNum(self, num: int):
      if self._contDigit(num) == 1:
         return '0' + str(num)
      elif self._contDigit(num) == 2:
         return str(num) 
   
   def save_cyclone(self, cyclone):
      self._connect_bd()
      cursor = self._collection.find({'$and': [{"id": cyclone["id"]},{"name": cyclone["name"]}]})
      exists = False
      cyclone_update = {}
      for data in cursor:
         cyclone_update = data
         exists = True
         break
      
      actual_date = str(datetime.datetime.utcnow())
      petition = self._get_Petition_One(cyclone["center"]["lat"], cyclone["center"]["long"])
      data_model = self.train(cyclone["center"]["lat"], cyclone["center"]["long"], cyclone["category"], 6)
      print("Model finished!!")

      if exists:
         print("El cyclon existe")
         cyclone_update["predictedTrajectory"] = []
         cyclone_update["lastUpdate"] = actual_date
         cyclone_update["realTrajectory"].append({
            "position": {
               "lat": cyclone["center"]["lat"],
               "lng": cyclone["center"]["long"]
            },
            "windSpeed": petition['hourly'][0]['wind_speed'],
            "hurrSpeed": float(cyclone["speed"]),
            "temperature": petition['hourly'][0]['temp'],
            "pressure": petition['hourly'][0]['pressure'],
            "date": actual_date
         })
         velocity = float(cyclone["speed"])
         for index, data in enumerate(data_model):
            if index != 0:
               cyclone_update["predictedTrajectory"].append({
                  "position": {
                        "lat": data[0],
                        "lng": data[1]
                  },
                  "windSpeed": data[4],
                  "hurrSpeed": velocity,
                  "temperature": data[6],
                  "pressure": data[5],
                  "date": data[2]
               })
               velocity = velocity + data[3]
         self._collection.update_one({'$and': [{"id": cyclone["id"]},{"name": cyclone["name"]}]}, {'$set': cyclone_update})            

      else:
         print("El ciclon no existe...")
         new_cyclon = {
            "id": cyclone["id"],
            "name": cyclone["name"],
            "appearance": actual_date,
            "lastUpdate": actual_date,
            "origin": {
               "lat": cyclone["center"]["lat"],
               "lng": cyclone["center"]["long"]
            },
            "predictedTrajectory": [],
            "realTrajectory": [],
            "active": True,
            "category": cyclone["category"]
         }
         new_cyclon["realTrajectory"].append({
            "position": {
               "lat": cyclone["center"]["lat"],
               "lng": cyclone["center"]["long"]
            },
            "windSpeed": petition['hourly'][0]['wind_speed'],
            "hurrSpeed": float(cyclone["speed"]),
            "temperature": petition['hourly'][0]['temp'],
            "pressure": petition['hourly'][0]['pressure'],
            "date": actual_date
         })

         velocity = float(cyclone["speed"])
         for index, data in enumerate(data_model):
            if index != 0:
               new_cyclon["predictedTrajectory"].append({
                  "position": {
                        "lat": data[0],
                        "lng": data[1]
                  },
                  "windSpeed": data[4],
                  "hurrSpeed": velocity,
                  "temperature": data[6],
                  "pressure": data[5],
                  "date": data[2]
               })
               velocity = velocity + data[3]
         self._collection.insert_one(new_cyclon)


      




   