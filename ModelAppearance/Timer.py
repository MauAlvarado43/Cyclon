from datetime import datetime, timedelta
from threading import Thread
from time import sleep
import pandas as pd
import os

class Timer(Thread):

   def __init__(self, function):
      super(Timer, self).__init__()
      path = os.path.join(os.path.dirname(os.path.abspath(__file__)).replace("""\\""", "/") + "/utils/programming.csv")
      settings = pd.read_csv(path)
      self._state = True
      self.hour = settings['hour'][0]
      self.delay = 1
      self.function = function
      self.step_hours = int(settings['step_hours'][0])

   def stop(self):
      self._state = False

   def run(self):
      hour_aux = datetime.strptime(self.hour, '%H:%M:%S')
      hour = datetime.now()
      hour = hour.replace(hour = hour_aux.hour, minute = hour_aux.minute, second = hour_aux.second, microsecond = 0)

      if hour <= datetime.now():
         hour += timedelta(hours = self.step_hours)
      print("Starting automatic execution...")
      print(f"Next scheduled execution on {hour.date()} at {hour.time()}")

      while self._state:
         if hour <= datetime.now():
            self.function()
            print(f"Scheduled execution executed on {hour.date()} at {hour.time()}")
            hour += timedelta(hours = self.step_hours)
            print(f"Next scheduled execution on {hour.date()} at {hour.time()}")
         
         sleep(self.delay)

      else:
         print("Automatic execution finished")

