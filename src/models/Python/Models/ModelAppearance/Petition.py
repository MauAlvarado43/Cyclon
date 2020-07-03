import requests
import pandas as pd
import os
import json

class Petition():

    def __init__(self,  url = 'https://api.openweathermap.org/data/2.5/onecall'):
        self._url = url
        super().__init__()
    
    def getPetition(self, lat, lng):
        params = {
            'lat':lat,
            'lon':lng,
            'exclude':'current,daily,minutely',
            'appid':self._api_key,
            'lang':'es',
            'units':'metric'
        }

        try:
            response = requests.get(self._url, params = params)

            if response.status_code == 200:
                return ["Peticion exitosa", pd.DataFrame(response.json())]
                
            elif response.status_code == 401 or response.status_code == 400:
                print(response.json())
                return ["No se pudo procesar la peticion", response.json()]
        
        except NameError as err:
            return ["No se pudo procesar la peticion", err]

    def changeKey(self):
        with open(os.path.join(os.path.dirname(os.path.abspath(__file__)).replace("""\\""", "/") + "/utils/keys.json")) as file:
            keys = json.load(file)
            index = int(keys['numberKey'])
            self._api_key = keys['keys'][index]
            if index == 7:
                keys['numberKey'] = 0
            else:
                keys['numberKey'] = index + 1

            with open(os.path.join(os.path.dirname(os.path.abspath(__file__)).replace("""\\""", "/") + "/utils/keys.json"), 'w') as OpenFile:
                json.dump(keys, OpenFile, indent = 4)



