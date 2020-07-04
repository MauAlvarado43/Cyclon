import math as m

class EarthPoints():

    def __init__(self, radioEarth = 6371):
        self._radioEarth = radioEarth        
        super().__init__()

    def getPoints(self, lat, lng, category):
        self._radioCyclon = self._switch_categorias(category)
        self._latCyclon = lat
        self._lngCyclon = lng
        RL = (4/3) * self._radioEarth * (self._radioCyclon / self._radioEarth)    
        r1L = RL + self._radioCyclon / 3
        r2L = RL + 2 * self._radioCyclon / 3
        r3L = RL + self._radioCyclon
        r4L = RL + self._radioCyclon * 11/10
        radiosL = [r1L,r2L,r3L,r4L]
        allDataL = self._pointsCoordinates(radiosL)
        longitudes_v = allDataL[1]
        latitudes_v = allDataL[0]
        return latitudes_v,longitudes_v

    def _pointsCoordinates(self, radios):
        r4 = radios[3]
        latitudes = []
        longitudes = []
        for r in radios:
            if r != r4:
                for i in range(12):
                    r_lon = r*m.sin(m.radians(i*30))
                    r_lat = r*m.cos(m.radians(i*30))                
                    ang_lat = r_lat / self._radioEarth
                    ang_lon = r_lon / self._radioEarth                
                    lat = self._latCyclon + self._convToDeg(ang_lat)
                    lon = self._lngCyclon + self._convToDeg(ang_lon)                
                    latitudes.append(lat)
                    longitudes.append(lon)
            else:
                for i in range(4):
                    r_lon = r*m.sin(m.radians(i*90))
                    r_lat = r*m.cos(m.radians(i*90))                
                    ang_lat = r_lat / self._radioEarth
                    ang_lon = r_lon / self._radioEarth                
                    lat = self._latCyclon + self._convToDeg(ang_lat)
                    lon = self._lngCyclon + self._convToDeg(ang_lon)
                    latitudes.append(lat)
                    longitudes.append(lon)
        return latitudes,longitudes   

    def _convToDeg(self, anguloR):
        anguloD = anguloR * (360 / (2 * m.pi))
        return anguloD

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