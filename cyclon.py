from noaaSocket import NoaaSocket
from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import threading
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
app.config['DEBUG'] = False

cors = CORS(app, resources={r"*": {"origins": "*"}}, supports_credentials= True)

@app.route('/')
def main():
    return 'Running'

socketio = SocketIO(app, logger=False, engineio_logger=False, debug=False, host = '0.0.0.0', port = os.environ.get("PORT", 5000), cors_allowed_origins='*')

@socketio.on('connect', namespace='/api')
def test_connect():
    print('Client connected')

@socketio.on('disconnect', namespace='/api')
def test_disconnect():
    print('Client disconnected')

socket = NoaaSocket()

thread = threading.Thread(target=socket.run, args=(socketio,))

thread.start()
socketio.run(app)