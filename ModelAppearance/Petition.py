import requests
import pandas as pd
import os
import json

class Petition():

   def __init__(self,  url = 'https://api.openweathermap.org/data/2.5/onecall'):
      self._url = url
      self._path = os.path.join(os.path.dirname(os.path.abspath(__file__)).replace("""\\""", "/") + "/utils/keys.json")
    
   def getPetition(self, lat, lng):
      params = {
         'lat':lat,
         'lon':lng,
         'exclude':'current,daily,minutely',
         'appid':self._get_Available_Key(),
         'lang':'es',
         'units':'metric'
      }

      try:
         response = requests.get(self._url, params = params)

         if response.status_code == 200:
            return [True, pd.DataFrame(response.json())]
                
         else:
            # print(response.json())
            return self.getPetition(lat, lng)
        
      except NameError as err:
         return self.getPetition(lat, lng) 
         # return [False, err]

   def _get_Available_Key(self):
      try:
         with open(self._path) as file:
            keys = json.load(file)
            available_key = ""
            for key in keys:
               if key['petitions'] < 999:
                  key['petitions'] += 1
                  available_key = key['key']
                  with open(self._path, 'w') as open_file:
                     json.dump(keys, open_file, indent = 4)
                     if key['key'] == keys[-1]['key'] and key['petitions'] >= 999:
                        print("Entro")
                        for key in keys:
                           key['petitions'] = 0
                        with open(self._path, 'w') as open_file:
                           json.dump(keys, open_file, indent = 4)
                     break
               
               
               elif key['key'] == keys[-1]['key'] and key['petitions'] >= 999:
                  print("Entro")
                  for key in keys:
                     key['petitions'] = 0
                  with open(self._path, 'w') as open_file:
                     json.dump(keys, open_file, indent = 4)
                  available_key = self._get_Available_Key()
               
               
            return available_key
      except OSError:
         return self._get_Available_Key()





