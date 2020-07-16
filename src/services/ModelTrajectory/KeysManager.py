import os
import json

class KeysManager():

   def __init__(self):
      self._path = os.path.join(os.path.dirname(os.path.abspath(__file__)).replace("""\\""", "/") + "/keys.json")

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

   def _get_nose(self):
      while True:
         print(self._get_Available_Key())
         

