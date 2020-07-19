from subprocess import call
import time
import os
import numpy as np
from Geometry import Geometry
from Petition import Petition
import datetime
import pickle
from sklearn.cluster import KMeans
import json
from time import sleep
from Timer import Timer

class AppearanceModel():

   def __init__(self, geometry = Geometry(), oceans = ["North_Atlantic","North_Pacific", "South_Atlantic","South_Pacific"], petition = Petition()):
      self._oceans = oceans
      self._geometryPoints = geometry
      self._petition = petition
      self._timer = Timer(self._monitoring)
      with open(os.path.join(os.path.dirname(os.path.abspath(__file__)).replace("""\\""", "/") + "/utils/model_clustering.pickle"), 'rb') as file:
         self._kmeans, self._X, self._Y = pickle.load(file)

   def starJob(self):
      self._timer.start()

   def test(self):
      print("Inicio del monitore... :)")
      self._monitoring()
   
   def stop(self):
      self._timer.stop()

   def _monitoring(self):
      start_time = time.time()
      data_json = []
      for ocean in self._oceans:
         points = self._geometryPoints.getPoints(ocean)
         for coords in points:
            lat = coords['lat']
            lng = coords['lng']
            print("Lat: %s , Lng: %s" %(str(lat), str(lng)))
            petition = self._petition.getPetition(lat, lng)
            message = petition[0]
            if message == "No se pudo procesar la peticion":
               print("Hubo un error")
            else:
               data = petition[1]
               for i in range(len(data)):
                  wind =  float(data['hourly'][i]['wind_speed'])
                  pressure = float(data['hourly'][i]['pressure'])
                  prediction = self._kmeans.predict(np.array([[wind, pressure]]))
                  if prediction[0] == 1:
                     data_json.append({
                        "ocean": ocean,
                        "lat": lat,
                        "lng": lng,
                        "date": self._unixToTimestamp(data['hourly'][i]['dt'])
                     })
                     break

               print("Terminado lat: %s , lng: %s , oceano %s" % (str(lat), str(lng), str(ocean)))
                       
      with open(os.path.join(os.path.dirname(os.path.abspath(__file__)).replace("""\\""","/")+ "/utils/results.json"), 'w') as file:
         json.dump(data_json, file, indent=4)
         end_time = time.time()
         print(f"Total time: {end_time - start_time}")

        
   def _unixToTimestamp(self, hour):
      return datetime.datetime.fromtimestamp(int(hour)).strftime('%Y-%m-%d %H:%M:%S')


