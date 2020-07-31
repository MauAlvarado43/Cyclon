import math as m

class EarthPoints():
   
   def __init__(self, radioEarth = 6371):
      self._radioEarth = radioEarth

   def _inicializate_variable(self, lat, lng, category, time):
      self._latitude_cyclon = lat
      self._longitude_cyclon = lng
      self._category_cyclon = category
      self._time_cyclon = time
      self._radio_cyclon = self._switch_categorias(category)

   def _get_Points(self, lat, lng):
      RL = (4/3) * self._radio_cyclon
      radios = [
        RL + (self._radio_cyclon / 3),
        RL + 2 * (self._radio_cyclon / 3),
        RL + (self._radio_cyclon),
        RL + (self._radio_cyclon * 11/10),
      ]
      points = self._point_Coordinates(radios)
      return points[0], points[1]

   def _point_Coordinates(self, radios):
      latitudes = []
      longitudes = []
      for radio in radios:
         if radio != radios[-1]:
            for i in range(12):
               r_lng = radio * m.sin(m.radians(i*30))
               r_lat = radio * m.cos(m.radians(i*30))
               ang_lng = r_lng / self._radioEarth
               ang_lat = r_lat / self._radioEarth
               lat = self._latitude_cyclon + self._conv_To_Deg(ang_lat)
               lng = self._longitude_cyclon + self._conv_To_Deg(ang_lng)
               latitudes.append(lat)
               longitudes.append(lng)
            
         else:
            for i in range(4):
               r_lng = radio * m.sin(m.radians(i*90))
               r_lat = radio * m.cos(m.radians(i*90))
               ang_lng = r_lng / self._radioEarth
               ang_lat = r_lat / self._radioEarth
               lat = self._latitude_cyclon + self._conv_To_Deg(ang_lat)
               lng = self._longitude_cyclon + self._conv_To_Deg(ang_lng)
               latitudes.append(lat)
               longitudes.append(lng)
      return latitudes,longitudes

   def _conv_To_Deg(self, anguloR):
      anguloD = anguloR * (360 / (2 * m.pi))
      return anguloD

   def _switch_categorias(self, categoria):
        switcher = {
                "DT": 75,
                "TT": 200,
                "H1": 400,
                "H2": 700,
                "H3": 900,
                "H4": 1100,
                "H5": 1300
                }
        return switcher.get(categoria, "Categoria inválida")