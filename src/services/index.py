from aiohttp import web
from multiprocessing import Process
from Models.ModelAppearance import AppearanceModel as AM
import socketio
import noaaSocket
import sys
import pandas as pd

AppearanceModel = AM.AppearanceModel()
AppearanceModel.startJob()

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