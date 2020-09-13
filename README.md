#Cyclon

Cyclon is a project that seeks to alert the coastal population to the appearance of hurricanes.
The project is developmenting with two programming languages: JavaScript (Node.js) and Python. The first is in charge of
carry out the rendering of the web page and the API-REST with which the entire system communicates, the
the second is used to carry out the predictive (K-Means) and mathematical (Vector Sum) models.

All the data we work with is true and is obtained from NOAA, through HTTP requests to its API mounted on the URL 
"https://www.nhc.noaa.gov/CurrentStorms.json". The database was compiled from the same agency.