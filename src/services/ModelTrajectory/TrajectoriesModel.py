from Models.ModelTrajectory import EarthPoints as EP
import datetime
import requests
import math as m
import os
import json
import time
import numpy as np

class TrajectoriesModel():

    def __init__(self, earthPoints = EP.EarthPoints(), radioEarth = 6371):        
        self._url = 'https://api.openweathermap.org/data/2.5/onecall'
        self._radioEarth = radioEarth 
        self._earthPoints = earthPoints
        super().__init__()

    def _unixToTimeStamp(self, hour):
        return datetime.datetime.fromtimestamp(int(hour)).strftime('%Y-%m-%d %H:%M:%S')

    def _getPetition(self, lat, lon, k):
        payload = {'lat':lat,
                'lon':lon,
                'exclude':'current,daily,minutely',
                'appid':self._keyAPI,
                #'appid':'',
                #'appid':'',
                'lang':'es',
                'units':'metric'}
        r = requests.get(self._url, params=payload)
        if r.status_code == 200: #Comprobamos si la petición mando error
            dictionary = r.json()
            resDict = []
            for i in range(2):
                velocities = self._radToRect(dictionary['hourly'][i+k]['wind_speed'],dictionary['hourly'][i+k]['wind_deg']) #Para que convierta todas las velocidades en componentes
                dic = {'lat':dictionary['lat'],
                    'lon':dictionary['lon'],
                    'date':self._unixToTimeStamp(dictionary['hourly'][i+k]['dt']),
                    'v_x':velocities[0], #m/s
                    'v_y':velocities[1], #m/s
                    'v_res':dictionary['hourly'][i+k]['wind_speed'], #m/s
                    'temp':dictionary['hourly'][i+k]['temp'], #grados
                    'press':dictionary['hourly'][i+k]['pressure'] #psc
                    }
                resDict.append(dic)
            return "Status code: 200", resDict
        elif r.status_code == 401: #Comprobamos si la petición mando error
            return "Status code: 401", "ERROR"
        elif r.status_code == 429: #Comprobamos si la petición mando error
            return "Status code: 401", "ERROR"

    def _radToRect(self, vel,deg):
        v_x = vel*m.sin(m.radians(deg)+m.pi)
        v_y = vel*m.cos(m.radians(deg)+m.pi)
        return v_x,v_y

    def _changeKey(self):
        with open(os.path.join(os.path.dirname(os.path.abspath(__file__)).replace("""\\""", "/") + "/keys.json")) as file:
            keys = json.load(file)
            index = int(keys['numberKey'])
            self._keyAPI = keys['keys'][index]
            if index == 9:
                keys['numberKey'] = 0
            else:
                keys['numberKey'] = index + 1

            with open(os.path.join(os.path.dirname(os.path.abspath(__file__)).replace("""\\""", "/") + "/keys.json"), 'w') as OpenFile:
                json.dump(keys, OpenFile, indent = 4)

    def train(self, **kwargs):
        self._latCyclon = float(kwargs['lat'])
        self._lngCyclon = float(kwargs['lng'])   
        self._category =  kwargs['category']
        self._radioCyclon = self._switch_categorias(kwargs['category']) 
        self._changeKey()

        lat = self._latCyclon
        lng = self._lngCyclon
        response = []

        ah = datetime.datetime.utcnow()
        date_non = str(self._formNum(ah.day)) + '-' + str(self._formNum(ah.month)) + '-' + str(ah.year) + ' ' + str(self._formNum(ah.hour)) + ':00:00'
        date = datetime.datetime.strptime(date_non, '%d-%m-%Y %H:%M:%S')

        for i in range(0, int(kwargs['time'])+1, 3):
            weather_data = self._requestOpenDataRaw(lat, lng, i)
            coordinates = self._getCoordinates(lat, lng, self._radioCyclon, i)
            response.append([lat, lng, str(date+datetime.timedelta(hours=i)), coordinates[2], weather_data['v_res'], weather_data['press'], weather_data['temp']]) #Se da el orden de lat,lon,hora de llegada,velocidad del huracán,viento,presión,temperatura
            lat = coordinates[0]
            lng = coordinates[1]
        
        return response

    def _getCoordinates(self, lat, lng, radio , hour):
            
        ptsRaw = self._earthPoints.getPoints(lat, lng, self._category)
        latitudes_v = ptsRaw[0] #Se obtienen las coordenadas de todos los puntos
        longitudes_v = ptsRaw[1]    
        #Ahora se hace un ciclo for en el que se llamará a getDataOneCall, dónde se obtendran los datos de las últimas dos horas
        allData = []
            
        for i in range(len(latitudes_v)): #len(latitudes_v) en vez de 5
            dataOne = self._getPetition(latitudes_v[i],longitudes_v[i], hour)
            if dataOne[0] == "Status code: 401":
                print("Error en la llave, se han generado: "+str(i)+" peticiones")
                break
            elif dataOne[0] == "Status code: 429":
                print("Error en la cuenta, esta se encuentra deshabilitada")
                break
            elif dataOne[0] == "Status code: 200":
                allData.append(dataOne[1])

            #time.sleep(2)
            
        a_x = []
        a_y = []
        vres_x = 0
        vres_y = 0
            
        for i in range(len(allData)): #Ahora determinamos las aceleraciones en esos puntos
            dictInit = allData[i][0]
            dictEnd = allData[i][1]
            vres_x = vres_x + dictInit['v_x']
            vres_y = vres_y + dictInit['v_y']
            a_x.append((dictEnd['v_x'] - dictInit['v_x']) / (60*60)) #Obtenemos la Aceleración en X
            a_y.append((dictEnd['v_y'] - dictInit['v_y']) / (60*60)) #Aceleración en Y
                
        ares_x = np.sum(a_x)/len(allData) #Aceleración del huracán en x
        ares_y = np.sum(a_y)/len(allData) #Aceleración del huracán en y
        vres_xp = vres_x/len(allData) #Velocidad Inicial del Huracán en x
        vres_yp = vres_y/len(allData) #Velocidad Inicial del Huracán en y
            
        #Velocidad del huracán (Data)
            
        v_hur = (vres_xp**2+vres_yp**2)**(1/2) 
            
        #Cálculando su movimiento:
            
        d_x = ((vres_xp*3*60*60)+(1/2)*(ares_x)*(3*60*60)**2)/1000 #Se cálcula la distancia que recorre en 3 horas
        d_y = ((vres_yp*3*60*60)+(1/2)*(ares_y)*(3*60*60)**2)/1000 #En y
            
        #ahora solo sumamos a la latitud y longitud originales como si fuese una esfera
            
        deg_lat = (d_y/self._radioEarth)*((360)/(2*m.pi)) #Convertimos a grados para sumarlos en la latitud
        deg_lon = (d_x/self._radioEarth)*((360)/(2*m.pi))
            
        #Finalmente sumamos
            
        lat_end = lat + deg_lat
        lon_end = lng + deg_lon
        
        return lat_end,lon_end,v_hur

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

    def _requestOpenDataRaw(self, lat,lon,k):
        dataOne = self._getPetition(lat,lon,k)
        return dataOne[1][0]

    def _switch_categorias(self, categoria):
        switcher = {
                "TD": 75,
                "TT": 200,
                "S1": 400,
                "S2": 700,
                "S3": 900,
                "S4": 1100,
                "S5": 1300
        }
        return switcher.get(categoria, "Categoria inválida")


