import os
import json
import sys
import requests

class QueryOpenWeather:

    def __init__(self):
        super(QueryOpenWeather, self).__init__()
        self._path = os.path.join(os.path.dirname(os.path.abspath(__file__)).replace("""\\""", "/") + "/files/keys.json")
        self._keyIndex = 0

    #Open Weather request to get actual weather
    def getRealPoint(self, center):

        status_code = 400

        while status_code != 200:

            try:
                response = requests.get("https://api.openweathermap.org/data/2.5/weather?lat="+str(center["lat"])+"&lon="+str(center["lng"])+"&appid="+self.getKey()+"&units=metric",headers={"Content-type":"application/json"})                
                
                if response.status_code == 200:
                    status_code = 200
                    return json.loads(response.content)

            except:
                print(sys.exc_info()[0])

    #Open Weather request to get forecast weather 
    def getForecastPoint(self, center):
        
        status_code = 400

        while status_code != 200:

            try:

                response = requests.get("https://api.openweathermap.org/data/2.5/forecast?lat="+str(center["lat"])+"&lon="+str(center["lng"])+"&appid="+self.getKey()+"&units=metric",headers={"Content-type":"application/json"})                

                if response.status_code == 200:
                    status_code = 200
                    return json.loads(response.content)

            except:
                print(sys.exc_info()[0])
    
    #Change key every time to avoid error 401 (api key saturated)
    def getKey(self):

        try:
            with open(self._path) as file:
                keys = json.load(file)

                self._keyIndex += 1

                if(self._keyIndex >= len(keys) ):
                    self._keyIndex = 0
                    
                return keys[self._keyIndex]["key"]
        except OSError:
            print("OS ERROR")

