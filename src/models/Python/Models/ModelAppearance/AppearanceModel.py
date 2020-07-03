from subprocess import call
import time
import os
import numpy as np
from apscheduler.schedulers.background import BackgroundScheduler
from Models.ModelAppearance import Geometry as Geo
from Models.ModelAppearance import Petition as Pet
import datetime
import pickle
from sklearn.cluster import KMeans
import json
from time import sleep

class AppearanceModel():

    def __init__(self, geometry = Geo.Geometry(), oceans = ["North_Atlantic","North_Pacific", "South_Atlantic","South_Pacific"], petition = Pet.Petition()):
        self._oceans = ["North_Atlantic"]#oceans
        self._geometryPoints = geometry
        self._petition = petition
        with open(os.path.join(os.path.dirname(os.path.abspath(__file__)).replace("""\\""", "/") + "/utils/model_clustering.pickle"), 'rb') as file:
            self._kmeans, self._X, self._Y = pickle.load(file)
        super().__init__()

    def startJob(self):
        print("Iniciando Monitoreo...")
        self._monitoring()
        self._scheduler = BackgroundScheduler()
        self._scheduler.add_job(self._monitoring, 'interval', seconds=86400)
        self._scheduler.start()
        try:
            while True:
                time.sleep(5)
        except (SystemExit, KeyboardInterrupt):
            self._scheduler.shutdown()

    def test(self):
        print("Inicio del Monitoreo... :)")
        self._monitoring()

    def _monitoring(self):
        self._petition.changeKey()
        data_json = []
        for ocean in self._oceans:
            points = self._geometryPoints.getPoints(ocean)
            for coords in points:
                lat = coords['lat']
                lng = coords['lng']
                print("Lat: %s , Lng: %s" %(str(lat), str(lng)))
                petition = self._petition.getPetition(lat, lng)
                message = petition[0]
                if message == "No se pudo procesar la peticion":
                    print("Hubo un error")
                else:
                    data = petition[1]
                    for i in range(len(data)):
                        wind =  float(data['hourly'][i]['wind_speed'])
                        pressure = float(data['hourly'][i]['pressure'])
                        prediction = self._kmeans.predict(np.array([[wind, pressure]]))
                        probability = self._geometryPoints.getProbability(self._kmeans.cluster_centers_, wind, pressure, prediction)   
                        print("Wind %f , Pressure %f" %(wind, pressure))
                        print("Cluster %i , Probabilidad %f" % (prediction[0], probability))
                        if probability >= 0.50 and prediction[0] == 1:
                            data_json.append({
                                "ocean": ocean,
                                "lat": lat,
                                "lng": lng,
                                "date": self._unixToTimestamp(data['hourly'][i]['dt']),
                                "probabiity": probability
                            })
                            break

                    print("Terminado lat: %s , lng: %s , oceano %s" % (str(lat), str(lng), str(ocean)))

            print("Terminó de Monitorear oceano: %s" % str(ocean))
        
        with open(os.path.join(os.path.dirname(os.path.abspath(__file__)).replace("""\\""","/").replace("jobs/Python/Models/ModelAppearance","db/k_means.json")), 'w') as file:
            json.dump(data_json, file, indent=4)

        
    def _unixToTimestamp(self, hour):
        return datetime.datetime.fromtimestamp(int(hour)).strftime('%Y-%m-%d %H:%M:%S')

    def _printProgressBar (self, iteration, total, prefix = '', suffix = '', decimals = 1, length = 100, fill = '█'):
        """
        Call in a loop to create terminal progress bar
        @params:
            iteration   - Required  : current iteration (Int)
            total       - Required  : total iterations (Int)
            prefix      - Optional  : prefix string (Str)
            suffix      - Optional  : suffix string (Str)
            decimals    - Optional  : positive number of decimals in percent complete (Int)
            length      - Optional  : character length of bar (Int)
            fill        - Optional  : bar fill character (Str)
        """
        percent = ("{0:." + str(decimals) + "f}").format(100 * (iteration / float(total)))
        filledLength = int(length * iteration // total)
        bar = fill * filledLength + '-' * (length - filledLength)
        print('\r%s |%s| %s%% %s' % (prefix, bar, percent, suffix), end = '\r')
        # Print New Line on Complete
        if iteration == total: 
            print()
