from Models.ModelTrajectory import TrajectoriesModel as TM
from Models.ModelAppearance import AppearanceModel as AM
import sys
import pandas as pd

TrajectoriesModel = TM.TrajectoriesModel()
AppearanceModel = AM.AppearanceModel()
model = sys.argv[1]

if model == "Trajectory":
    coordinates = TrajectoriesModel.train(time = sys.argv[2], lat = sys.argv[3], lng = sys.argv[4], category = sys.argv[5])
    
    latitudes = []
    longitudes = []
    date = []
    velocity = []
    wind = []
    pressure = []
    temperature = []

    for i in coordinates:
        latitudes.append(i[0])
        longitudes.append(i[1])
        date.append(i[2])
        velocity.append(i[3])
        wind.append(i[4])
        pressure.append(i[5])
        temperature.append(i[6])
        
    df = pd.DataFrame({
        'latitudes': latitudes,
        'longitudes': longitudes,
        'date': date,
        'velocity': [float(value)*3.6 for value in velocity], #Km/h
        'wind': [float(value)*3.6 for value in wind], #Km/h
        'pressure': pressure,
        'temperature': temperature
    })
    print(df.to_json(orient='table', index=False, default_handler=str))
    sys.exit()
    
elif model == "Appearance":
    typeMethod = sys.argv[2]
    
    if typeMethod == "startJob":
        AppearanceModel.startJob()

    elif typeMethod == "test":
        AppearanceModel.test()


