from subprocess import call
import time
import os
import numpy as np
from ModelAppearance.Geometry import Geometry
from ModelAppearance.Petition import Petition
import datetime
import pickle
from sklearn.cluster import KMeans
import json
from time import sleep
from ModelAppearance.Timer import Timer
import os
import pymongo

class AppearanceModel():

   def __init__(self, geometry = Geometry(), oceans = ["North_Atlantic","North_Pacific", "South_Atlantic","South_Pacific"], petition = Petition()):
      self._oceans = oceans
      self._geometryPoints = geometry
      self._petition = petition
      self._timer = Timer(self._monitoring)
      self._mongo_URL = "mongodb+srv://CyC1:kybmim-hoqhob-2Doswo@cyc1-p6vhd.mongodb.net/cyclon?retryWrites=true&w=majority"
      self._mongoLocal = "mongodb://localhost:27017/"
      self._connect_bd()
      with open(os.path.join(os.path.dirname(os.path.abspath(__file__)).replace("""\\""", "/") + "/utils/model_clustering.pickle"), 'rb') as file:
         self._kmeans, self._X, self._Y = pickle.load(file)

   def _connect_bd(self):
      try:
         self._client = pymongo.MongoClient(self._mongo_URL)
         self._database = self._client.cyclon
         self._collection = self._database.hurricaines
      except Exception as err:
         print(f"Error to connect with {self._mongo_URL}")
         self._client = pymongo.MongoClient(self._mongoLocal)
         self._database = self._client.cyclon
         self._collection = self._database.RiskArea
         print(f"Connect with local database in {self._mongoLocal}")

   def starJob(self):
      self._timer.start()

   def test(self):
      self._monitoring()
   
   def stop(self):
      self._timer.stop()

   def _monitoring(self):
      data_json = []
      for ocean in self._oceans:
         data_json = []
         points = self._geometryPoints.getPoints(ocean)
         for coords in points:
            lat = coords['lat']
            lng = coords['lng']
            petition = self._petition.getPetition(lat, lng)
            message = petition[0]
            if message == False:
               print("Error detected")
            else:
               data = petition[1]
               for i in range(len(data)):
                  wind =  float(data['hourly'][i]['wind_speed'])
                  pressure = float(data['hourly'][i]['pressure'])
                  prediction = self._kmeans.predict(np.array([[wind, pressure]]))
                  if prediction[0] == 1:
                     data_json.append({
                        "position": {
                           "lat": float(lat),
                           "lng": float(lng) 
                        },
                        "ocean": ocean.replace("_"," "),
                        "date": self._unixToTimestamp(data['hourly'][i]['dt'])
                     })
                     break

               print("Finished lat: %s , lng: %s , ocean %s" % (str(lat), str(lng), str(ocean)))
         
         self._saving_scanning(data_json)
        
   def _unixToTimestamp(self, hour):
      return datetime.datetime.fromtimestamp(int(hour)).strftime('%Y-%m-%d %H:%M:%S')

   def _saving_scanning(self, data):
      self._connect_bd()
      for scan in data:
         result = self._collection.insert_one(scan)


