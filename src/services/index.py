from aiohttp import web
from multiprocessing import Process
import socketio
from noaaSocket import NoaaSocket 
from ModelAppearance.AppearanceModel import AppearanceModel
import os

class Controller():

    def __init__(self):
        self._port = os.environ.get("PORT", 5000)
        self._model_appearance = AppearanceModel()
        self._sio = socketio.AsyncServer(cors_allowed_origins='*')

    def run_server(self):
        self._noaa_thread = NoaaSocket(self._sio)
        self._noaa_thread.start()
        self._model_appearance.starJob()
        self._app = web.Application()
        self._sio.attach(self._app) 
        self._sio.event(self.connect)
        self._sio.event(self.disconnect)
        web.run_app(self._app, host='localhost', port = self._port)
        print("Holi")

    def connect(self, sid, environ):
        print("connect ", sid)

    def disconnect(self, sid):
        print('disconnect ', sid)
    
    def startMonitoringNoaa(self):
        self._socket = NoaaSocket(self._sio)
        self._socket.run()

if __name__ == '__main__':
    init = Controller()
    init.run_server()