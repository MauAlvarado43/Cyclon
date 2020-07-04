let map_const;
let lastLayer;
let picker_const;

let app = angular.module('app', []);

app.controller('main', ($scope, $http) => {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(function (position) {
            getTrajectoryCyclon(position.coords.latitude,position.coords.longitude);
        });
      } else{
        getTrajectoryCyclon(19,-99);
    }
});


getTrajectoryCyclon = (lat,lng) => {

    windyInit({
        key: 'c02HANLNCaQ4PjmWnj0pSauI4mbWZLHf',
        verbose: false,
        lat: lat,
        lon: lng,
        zoom: 1,
    }, windyAPI => {

        const { map, store, picker, utils, broadcast } = windyAPI;
    
        map_const = map;
        picker_const = picker
    
        store.set("particlesAnim", "on");
    
        // Wait since wather is rendered
        broadcast.once('redrawFinished', () => {
    
        });

        let latlngs = 
        [
            [ 0, 133.7106765422501, 10 ],
            [ 0, -80.27600207212568, 10 ],
            [ -2.357441458844278, -80.67054669842943, 10 ],
            [ -5.611945792584336, -80.61172157125358, 10 ],
            [ -13.462689803233275, -76.11854006963635, 10 ],
            [ -14.041693292478428, -76.17736519681777, 10 ],
            [ -18.26712019282212, -70.54677810119529, 10 ],
            [ -29.418952718484157, -71.34527648397784, 10 ],
            [ -32.28427900895961, -71.32792285025461, 10 ],
            [ -37.181501834357896, -73.59371957861326, 10 ],
            [ -43.01602720811254, -74.24079597761897, 10 ],
            [ -46.623407898661554, -75.35989328762146, 10 ],
            [ -51.37066467380068, -75.1695728586568, 10 ],
            [ -53.38593165653509, -73.81659493331755, 10 ],
            [ -55.443815168513936, -68.1497743475099, 10 ],
            [ -54.86572847860921, -65.11047610944274, 10 ],
            [ -64.71087931317399, -61.43576867129167, 10 ],
            [ -69.4557948909244, -66.51781087306323, 10 ],
            [ -69.07938553348718, -70.66162989913622, 10 ],
            [ -73.94117212825965, -80.74752903804794, 10 ],
            [ -72.36522946269199, -103.4994410490898, 10 ],
            [ -75.08472188465514, -102.17029155017167, 10 ],
            [ -73.12577403078289, -125.54768567834235, 10 ],
            [ -78.53966731370616, -162.21657479577286, 10 ],
            [ -70.93331021736563, 162.72407986296372, 10 ],
            [ -45.341678737797885, 147.9087061468859, 10 ],
            [ -47.53054810359917, 171.2137689306511, 10 ],
            [ -39.71164441361441, 177.87982184614458, 10 ],
            [ -19.25143976143893, 176.85278361385576, 10 ],
            [ -5.006286234799646, 153.51664431082884, 10 ],
            [ -1.567147221935727, 137.8665600011986, 10 ],
            [ -3.27284306692448, 135.44406537835914, 10 ],
            [ -0.8290291881672402, 132.9446661642774, 10 ],
            [ 0, 133.7106765422501, 10 ]
        ]

        let layerReal = new L.Hotline(latlngs, {
            min: 119,
            max: 250,
            palette: {
                0.0: '#0081b6',
                0.5: '#895762',
                1.0: '#a41214'
            },
            weight: 3,
            outlineColor: '#000000',
            outlineWidth: 1
        }).addTo(map_const);

        layerReal.on('click', function(e) {
            L.popup()
            .setLatLng([e.latlng.lat, e.latlng.lng])
            .setContent(`<article class="Popup" onclick="ElementoClick(\"Maria_2017\",this)"><div class="Datos MostrarDatosHuracan"><p>Latitud: ${e.latlng.lat}</p><p>Longitud: ${e.latlng.lng}</p></div></article>`)
            .openOn(map_const);
        });


        let lat =  -5.052623784175296
        let lngInicial = -250.92737176672901
        let lngFinal = 28.773477948213525
        let i = 0

        let latlngs1 = []
        latlngs1.push([lat, lngInicial, 10])
        latlngs1.push([lat, lngFinal, 10])

        let layer = new L.Hotline(latlngs1, {
            min: 119,
            max: 250,
            palette: {
                0.0: '#00bc79',
                0.5: '#887c73',
                1.0: '#a9136c'
            },
            weight: 3,
            outlineColor: '#000000',
            outlineWidth: 1
        }).addTo(map_const);

        layer.on('click', function(e) {
            L.popup()
            .setLatLng([e.latlng.lat, e.latlng.lng])
            .setContent(`<article class="Popup" onclick="ElementoClick(\"Maria_2017\",this)"><div class="Datos MostrarDatosHuracan"><p>Latitud: ${e.latlng.lat}</p><p>Longitud: ${e.latlng.lng}</p></div></article>`)
            .openOn(map_const);
        });

        let distance = 500 //Km
        let degx = ((distance/6371)*(180/Math.PI))

        while(i < 21){
            let latlngx = []
            let newLatx = lat - degx
            lat = newLatx

            latlngx.push([newLatx , lngInicial, 10])
            latlngx.push([newLatx , lngFinal, 10])

            let layer2 = new L.Hotline(latlngx, {
                min: 119,
                max: 250,
                palette: {
                    0.0: '#00bc79',
                    0.5: '#887c73',
                    1.0: '#a9136c'
                },
                weight: 3,
                outlineColor: '#000000',
                outlineWidth: 1
            }).addTo(map_const);

            layer2.on('click', function(e) {
                L.popup()
                .setLatLng([e.latlng.lat, e.latlng.lng])
                .setContent(`<article class="Popup" onclick="ElementoClick(\"Maria_2017\",this)"><div class="Datos MostrarDatosHuracan"><p>Latitud: ${e.latlng.lat}</p><p>Longitud: ${e.latlng.lng}</p></div></article>`)
                .openOn(map_const);
            });

            i++;
        }

        //Verticales

        //primer punto [13.052623784175296, -94.92737176672901] [-81.388, -94.92737176672901]

        let lng = -50.92737176672901
        let latIncial =  0.052623784175296
        let latFinal = -100
        let j = 0

        let latlngs2 = []
        latlngs2.push([latIncial, lng, 10])
        latlngs2.push([latFinal, lng, 10])

        let layer3 = new L.Hotline(latlngs2, {
            min: 119,
            max: 250,
            palette: {
                0.0: '#00bc79',
                0.5: '#887c73',
                1.0: '#a9136c'
            },
            weight: 3,
            outlineColor: '#000000',
            outlineWidth: 1
        }).addTo(map_const);

        layer3.on('click', function(e) {
            L.popup()
            .setLatLng([e.latlng.lat, e.latlng.lng])
            .setContent(`<article class="Popup" onclick="ElementoClick(\"Maria_2017\",this)"><div class="Datos MostrarDatosHuracan"><p>Latitud: ${e.latlng.lat}</p><p>Longitud: ${e.latlng.lng}</p></div></article>`)
            .openOn(map_const);
        });

        let count = 0

        while(j < 40){
            let latlngy = []
            let newLaty = lng - degx
            lng = newLaty

            latlngy.push([latIncial , newLaty, 10])
            latlngy.push([latFinal , newLaty, 10])

            let layer10 = new L.Hotline(latlngy, {
                min: 119,
                max: 250,
                palette: {
                    0.0: '#00bc79',
                    0.5: '#887c73',
                    1.0: '#a9136c'
                },
                weight: 3,
                outlineColor: '#000000',
                outlineWidth: 1
            }).addTo(map_const);

            layer10.on('click', function(e) {
                L.popup()
                .setLatLng([e.latlng.lat, e.latlng.lng])
                .setContent(`<article class="Popup" onclick="ElementoClick(\"Maria_2017\",this)"><div class="Datos MostrarDatosHuracan"><p>Latitud: ${e.latlng.lat}</p><p>Longitud: ${e.latlng.lng}</p></div></article>`)
                .openOn(map_const);
                count++;
                writeJson(e.latlng.lat, e.latlng.lng, count)
            });

            j++;
        }
    })
}

writeJson = (lat, lng, count)=>{
    $.ajax({
        url: "/testToWriteJson",
        method: "POST",
        data: {
            file: "data_south_pacific.json", 
            lat: parseFloat(lat),
            lng: parseFloat(lng)
        }, 
        success: function(response){
            alert(String(response) + "____" + String(count))
        }
    })
}


/*
getTrajectoryCyclon = (lat,lng) => {

    windyInit({
        key: 'c02HANLNCaQ4PjmWnj0pSauI4mbWZLHf',
        verbose: false,
        lat: lat,
        lon: lng,
        zoom: 1,
    }, windyAPI => {
    
        const { map, store, picker, utils, broadcast } = windyAPI;
    
        map_const = map;
        picker_const = picker
    
        store.set("particlesAnim", "on");
    
        // Wait since wather is rendered
        broadcast.once('redrawFinished', () => {
    
        });

        $.ajax({
            method: 'post',
            url: '/getActiveCyclons',
            data: {},
            success: (response) => {
                
                let cyclons = [];
                console.log(response)
                response.data.forEach(element => {
    
                    let latlngsReal = [];
                    let latlngsPredicted = [];
    
                    element.trajectory.forEach(item => {
                        if(item.state == "real"){
                            latlngsReal.push([parseFloat(item.lat), parseFloat(item.lng), parseFloat(item.wind)])
                        }else if(item.state == "prediction"){
                            latlngsPredicted.push([parseFloat(item.lat), parseFloat(item.lng), parseFloat(item.wind)])
                        }
                    });
    
                    if (lastLayer != null) {
                        map_const.removeLayer(lastLayer)
                    }
    
                    map_const.doubleClickZoom.disable();
    
                    map_const.on('dblclick', function (e) {
                        picker_const.open({ lat: e.latlng.lat, lon: e.latlng.lng });
                    });
    
                    var icon = L.icon({
                        iconUrl: '../img/cyclone.png',
                        iconSize: [35, 35], // size of the icon
                        popupAnchor: [-3, -76] // point from which the popup should open relative to the iconAnchor
                    });

                    var marker = L.marker([latlngsReal[latlngsReal.length-1][0], latlngsReal[latlngsReal.length-1][1]], { icon: icon }).addTo(map_const);

                    let layerReal = new L.Hotline(latlngsReal, {
                        min: 119,
                        max: 250,
                        palette: {
                            0.0: '#00bc79',
                            0.5: '#887c73',
                            1.0: '#a9136c'
                        },
                        weight: 6,
                        outlineColor: '#000000',
                        outlineWidth: 1
                    }).addTo(map_const);

                    var layerPredicted = new L.Hotline(latlngsPredicted, {
                        min: 119,
                        max: 250,
                        palette: {
                          0.0: '#0081b6',
                          0.5: '#895762',
                          1.0: '#a41214'
                        },
                        weight: 6,
                        outlineColor: '#000000',
                        outlineWidth: 1
                      }).addTo(map_const);
                        // zoom the map to the polyline

                        
                    marker.on('click', function (e) {
                        map_const.fitBounds(layerReal.getBounds());
                        L.popup()
                            .setLatLng([e.latlng.lat, e.latlng.lng])
                            .setContent(
                            `<article class="Popup" onclick="ElementoClick(\"Maria_2017\",this)"><header><h2 class="Titulo">${element.name}</h2></header><div class="Datos MostrarDatosHuracan"><p class="Categoria">Catégoria: ${element.category}</p><p class="Posicion">Posición: ${latlngsReal[latlngsReal.length-1][0]}N,  ${latlngsReal[latlngsReal.length-1][1]}W.</p><p class="Velocidad">Velocidad: 50 Km/h</p><p class="Presion">Presión: ${element.pressure} mb.</p></div></article>`)
                            .openOn(map_const);
                    });
                    
                    layerReal.on('click', function(e) {
                        for(let item of element.trajectory){
                            if(item.state == "real" && ((e.latlng.lat > item.lat && e.latlng.lng > item.lng) || (Math.abs(e.latlng.lat) > Math.abs(item.lat) && Math.abs(e.latlng.lng) > Math.abs(item.lng)))){
                                L.popup()
                                .setLatLng([e.latlng.lat, e.latlng.lng])
                                .setContent(`<article class="Popup" onclick="ElementoClick(\"Maria_2017\",this)"><div class="Datos MostrarDatosHuracan"><p>Latitud: ${Math.round((e.latlng.lat) * 1000) / 1000}</p><p>Longitud: ${Math.round((e.latlng.lng) * 1000) / 1000}</p><p>Velocidad: ${parseFloat(item.wind)} Km/h</p><p>Fecha: ${String(item.date).split(".")[0]}</p></div></article>`)
                                .openOn(map_const);
                                break;
                            }
                        }
                    });
                    
                    layerPredicted.on('click', function(e) {
                        for(let item of element.trajectory){
                            if(item.state == "prediction" && ((e.latlng.lat > item.lat && e.latlng.lng > item.lng) || (Math.abs(e.latlng.lat) > Math.abs(item.lat) && Math.abs(e.latlng.lng) > Math.abs(item.lng)))){
                                L.popup()
                                .setLatLng([e.latlng.lat, e.latlng.lng])
                                .setContent(`<article class="Popup" onclick="ElementoClick(\"Maria_2017\",this)"><div class="Datos MostrarDatosHuracan"><p>Latitud: ${Math.round((e.latlng.lat) * 1000) / 1000}</p><p>Longitud: ${Math.round((e.latlng.lng) * 1000) / 1000}</p><p>Velocidad: ${parseFloat(item.wind)} Km/h</p><p>Fecha: ${item.date}</p></div></article>`)
                                .openOn(map_const);
                                break;
                            }
                        }
                    });

                    layerReal.on('mouseover', function () {
                        layerReal.setStyle({
                            weight: 8,
                        });
                    });
    
                    layerReal.on('mouseout', function () {
                        layerReal.setStyle({
                            weight: 6,
                        });
                    });

                    layerPredicted.on('mouseover', function () {
                        layerPredicted.setStyle({
                            weight: 8,
                        });
                    });
    
                    layerPredicted.on('mouseout', function () {
                        layerPredicted.setStyle({
                            weight: 6,
                        });
                    });
    
                    picker_const.on('pickerOpened', latLon => {
                        const { lat, lon, values, overlay } = picker_const.getParams();
                    });
    
                    picker_const.on('pickerMoved', latLon => {
                    });
    
                    picker_const.on('pickerClosed', () => {
                        // picker was closed
                    });

                    cyclons.push([[element.name],[icon],[marker],[layerReal],[layerPredicted]])

                });
                
            }            
        }); 
    });
}
*/
