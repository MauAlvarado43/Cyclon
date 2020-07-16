from EarthPoints import EarthPoints
from KeysManager import KeysManager
import datetime
import math as m
import requests
import numpy as np

class TrajectoriesModel(EarthPoints):

   def __init__(self):
      super().__init__()
      self._url = 'https://api.openweathermap.org/data/2.5/onecall'
      self._manager_Keys =  KeysManager()

   def train(self, lat: float, lng: float, category: str, time: int):
      self._inicializate_variable(lat = lat, lng = lng, category = category, time = time)
      
      lat = self._latitude_cyclon
      lng = self._longitude_cyclon

      actual_hour = datetime.datetime.utcnow()
      date_format = f"{self._formNum(actual_hour.day)}-{self._formNum(actual_hour.month)}-{actual_hour.year} {self._formNum(actual_hour.hour)}:00:00"
      date = datetime.datetime.strptime(date_format, '%d-%m-%Y %H:%M:%S')
      response = []

      for i in range(0, self._time_cyclon + 1, 3):
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
         elif petition[0] == "Status code: 401":
            #TODO manage the errors
            print("Status code: 401")
         
         elif petition[0] == "Status code: 409": 
            #TODO manage the errors
            print("Status code: 409")
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
   
   def _get_Petition(self, lat, lng, k):
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
      elif petition.status_code == 401: #Comprobamos si la petición mando error
         #TODO manage the errors
         return "Status code: 401", "ERROR"
      elif petition.status_code == 429: #Comprobamos si la petición mando error
         #TODO manage errors
         return "Status code: 409", "ERROR"
            

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

      




   