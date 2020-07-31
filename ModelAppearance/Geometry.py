import json
import math
import os
import pandas as pd

class Geometry():

   def __init__(self):
      super().__init__()

   def getPoints(self, ocean):
      with open(os.path.join(os.path.dirname(os.path.abspath(__file__)).replace("""\\""", "/") + "/utils/Geometry_%s.json" % ocean), 'rb') as file:
         data = json.load(file)
      return data['accuratePoints']