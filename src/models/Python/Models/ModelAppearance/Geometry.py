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

    def getProbability(self, clusters_centers, X, Y, cluster):

        cluster_0 = clusters_centers[0]
        cluster_1 = clusters_centers[1]
        
        X_cluster0 = cluster_0[0]
        Y_cluster0 = cluster_0[1]
        
        X_cluster1 = cluster_1[0]
        Y_cluster1 = cluster_1[1]

        distance_between_clusters = math.sqrt((math.pow((X_cluster1 - X_cluster0) ,2))+(math.pow((Y_cluster1 - Y_cluster0) ,2)))
        distance_to_cluster = 0

        if cluster[0] == 0:
            distance_to_cluster = math.sqrt((math.pow((X_cluster0 - X) ,2))+(math.pow((Y_cluster0 - Y) ,2)))

        elif cluster[0] == 1:
            distance_to_cluster = math.sqrt((math.pow((X_cluster1 - X) ,2))+(math.pow((Y_cluster1 - Y) ,2)))

        return (1 - ((distance_to_cluster * 0.50) / (distance_between_clusters/2)))
