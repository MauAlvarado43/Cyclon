from noaaSocket import NoaaSocket
from databaseManager import DBManager
from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import threading
import os
import logging
from datetime import datetime, timedelta


app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
app.config['DEBUG'] = False

log = logging.getLogger('werkzeug')
log.disabled = True

cors = CORS(app, resources={r"*": {"origins": "*"}}, supports_credentials= True)

socket = NoaaSocket()

@app.route('/')
def main():
    return 'Running'

@app.route('/api/data')
def dataRequest():
    return socket.getAlertsGenerated()

@app.route('/api/test')
def test():

    db = DBManager()

    data = { 
        "data": { 
            "id": "ad012022",
            "lastPoint": {
                "position": {
                    "lat": 16.7,
                    "lng": -103.2
                },
                "windSpeed": 179.4,
                "hurrSpeed": 22.4,
                "temperature": 27.94,
                "pressure": 1005,
                "date": datetime.now().isoformat()
            },
            "name": "Simulation 1",
            "category": "H1",
            "nearest": DBManager().getNearestCity(16.7, -103.2)
        }, 
        "update": False 
    }

    cyclone = {
        "id": "ad012022",
        "origin": {
            "lat": 16.7,
            "lng": -102.2
        },
        "name": "Simulation 1",
        "appearance": datetime.now().isoformat(),
        "lastUpdate": datetime.now().isoformat(),
        "active": True,
        "category": "H1",
        "predictedTrajectory": [
            {
                "position": {
                    "lat": 16.7,
                    "lng": -102.2
                },
                "windSpeed": 200.4,
                "hurrSpeed": 24.4,
                "temperature": 27.94,
                "pressure": 1005,
                "date": (datetime.now() + timedelta(hours=3)).isoformat()
            },
            {
                "position": {
                    "lat": 18.7,
                    "lng": -104.2
                },
                "windSpeed": 260.4,
                "hurrSpeed": 24.4,
                "temperature": 27.94,
                "pressure": 1005,
                "date": (datetime.now() + timedelta(hours=6)).isoformat()
            },
            {
                "position": {
                    "lat": 22.7,
                    "lng": -110.2
                },
                "windSpeed": 50.4,
                "hurrSpeed": 24.4,
                "temperature": 27.94,
                "pressure": 1005,
                "date": (datetime.now() + timedelta(hours=9)).isoformat()
            }
        ],
        "realTrajectory": [{
           "position": {
                "lat": 16.7,
                "lng": -102.2
            },
            "windSpeed": 179.4,
            "hurrSpeed": 22.4,
            "temperature": 27.94,
            "pressure": 1005,
            "date": datetime.now().isoformat()
        }]
    }

    db._model.insert_one(cyclone)

    socketio.emit('/alert', data, namespace='/api')

    return 'Emitted'

socketio = SocketIO(app, logger=False, engineio_logger=False, debug=False, cors_allowed_origins='*')

@socketio.on('connect', namespace='/api')
def test_connect():
    print('Client connected')

@socketio.on('disconnect', namespace='/api')
def test_disconnect():
    print('Client disconnected')

thread = threading.Thread(target=socket.run, args=(socketio,))

thread.start()
socketio.run(app, port = os.environ.get("PORT", 5000), host = '0.0.0.0')