
from aiohttp import web
from multiprocessing import Process
import socketio
# import noaaSocket
from ModelAppearance.AppearanceModel import AppearanceModel
from ModelTrajectory.TrajectoriesModel import TrajectoriesModel

# Start the appearance model
# appearance_model = AppearanceModel()
# appearance_model.starJob()
import datetime
import requests
import pandas as pd
print("Starting...")

data_cyclon = {
    "id": "isid_789",
    "category": "H1",
    "name": "Isidoro",
    "speed": 98.89,
    "pressure":1013,
    "center":{
        "lat": 18.737433229586557,
        "long": -91.34870765132051
    },
    "direction": "", 
    "date": ""
}

model = TrajectoriesModel()
model.save_cyclone(data_cyclon)

"""
sio = socketio.AsyncServer(cors_allowed_origins='*')
app = web.Application()
sio.attach(app)

@sio.event
def connect(sid, environ):
    print("connect ", sid)

@sio.event
def disconnect(sid):
    print('disconnect ', sid)
   
def startMonitoring():
    socket = noaaSocket.NoaaSocket()
    socket.run(sio)

if __name__ == '__main__':

    noaaThread = Process(target=startMonitoring)
    noaaThread.start()

    web.run_app(app)
"""