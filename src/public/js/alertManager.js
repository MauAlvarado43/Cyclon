const query = `
{
    activeCyclones {
        active
        category
        name
        realTrajectory {
            position {
                lat
                lng
            }
            windSpeed
            hurrSpeed
            temperature
            pressure
            date
        }
        predictedTrajectory {
            position {
                lat
                lng
            }
            windSpeed
            hurrSpeed
            temperature
            pressure
            date
        }
    }
}
`

let activeCyclones = []

const getActiveCyclones = async () => {

    const response = await fetch("/graphql?query="+query)
    const res = await response.json()
    
    activeCyclones = res.data.activeCyclones

    if(addPanelInfo) addPanelInfo()

}

const drawCyclones = () => {
       
    activeCyclones.forEach(element => {

        let lastPoint =  element.realTrajectory[element.realTrajectory.length - 1]
        let [category, radious] = getCategoryRadious(lastPoint.windSpeed)
        let icon = getIcon(element.category)
        let latlngsReal = []

        element.realTrajectory.forEach(point => {
            latlngsReal.push([point.position.lat, point.position.lng, point.windSpeed])
        })

        let layerRealTrayectory = new L.Hotline(latlngsReal, {
            min: 119,
            max: 250,
            palette: getRealLayerPallet(),
            weight: 6,
            outlineColor: '#000000',
            outlineWidth: 1
        }).addTo(map_const)

        layerRealTrayectory.on('mouseover', () => { layerRealTrayectory.setStyle({ weight: 4 }) })

        layerRealTrayectory.on('mouseout', () => { layerRealTrayectory.setStyle({ weight: 3 }) })

        layerRealTrayectory.on('click', function (e) {

            let latClicked = e.latlng.lat
            let lngClicked = e.latlng.lng
            let distance = 9999999
            let toShow = {}

            element.realTrajectory.forEach(item => {
                let distanceTemp = getDistance(latClicked,lngClicked,item.position.lat,item.position.lng)
                if(distanceTemp<distance){
                    distance = distanceTemp
                    toShow = item
                }
            }) 

            let popup = `
                <h6 style="color:black;">${assets.units.latitude.label}:  ${Math.round((latClicked) * 100) / 100}</h6>
                <h6 style="color:black;">${assets.units.longitude.label}:  ${Math.round((lngClicked) * 100) / 100}</h6>

                <h6 style="color:black;">${assets.units.windSpeed.label}:  ${((toShow.windSpeed == 0) ? assets.not_registered : Math.round(toShow.windSpeed * 100) / 100 + assets.units.windSpeed.unit)}</h6>
                <h6 style="color:black;">${assets.units.hurrSpeed.label}:  ${((toShow.hurrSpeed == 0) ? assets.not_registered : Math.round(toShow.hurrSpeed * 100) / 100 + assets.units.hurrSpeed.unit)}</h6>
                <h6 style="color:black;">${assets.units.temperature.label}:  ${((toShow.temperature == 0) ? assets.not_registered : Math.round(toShow.temperature * 100) / 100 + assets.units.windSpeed.unit)}</h6>
                <h6 style="color:black;">${assets.units.pressure.label}:  ${((toShow.pressure == 0) ? assets.not_registered : Math.round(((toShow.pressure<100) ? toShow.pressure*100 : toShow.pressure) * 100) / 100 + assets.units.windSpeed.unit)}</h6>

                <h6 style="color:black;">${assets.date}: ${(new Date(toShow.date)).toLocaleString()}</h6>
            `

            L.popup().setLatLng([e.latlng.lat, e.latlng.lng]).setContent(popup).openOn(map_const)

        })

        let latlngsPredicted = []

        element.predictedTrajectory.forEach(point => {
            latlngsPredicted.push([point.position.lat, point.position.lng, point.windSpeed])
        })

        let layerPredictedTrayectory = new L.Hotline(latlngsPredicted, {
            min: 119,
            max: 250,
            palette: getPredictedLayerPallet(),
            weight: 6,
            outlineColor: '#000000',
            outlineWidth: 1
        }).addTo(map_const)

        layerPredictedTrayectory.on('mouseover', () => { layerPredictedTrayectory.setStyle({ weight: 4 }) })

        layerPredictedTrayectory.on('mouseout', () => { layerPredictedTrayectory.setStyle({ weight: 3 }) })

        layerPredictedTrayectory.on('click', function (e) {

            let latClicked = e.latlng.lat
            let lngClicked = e.latlng.lng
            let distance = 9999999
            let toShow = {}

            element.predictedTrajectory.forEach(item => {
                let distanceTemp = getDistance(latClicked,lngClicked,item.position.lat,item.position.lng)
                if(distanceTemp<distance){
                    distance = distanceTemp
                    toShow = item
                }
            }) 

            let popup = `
                <h6 style="color:black;">${assets.units.latitude.label}:  ${Math.round((latClicked) * 100) / 100}</h6>
                <h6 style="color:black;">${assets.units.longitude.label}:  ${Math.round((lngClicked) * 100) / 100}</h6>

                <h6 style="color:black;">${assets.units.windSpeed.label}:  ${((toShow.windSpeed == 0) ? assets.not_registered : Math.round(toShow.windSpeed * 100) / 100 + assets.units.windSpeed.unit)}</h6>
                <h6 style="color:black;">${assets.units.hurrSpeed.label}:  ${((toShow.hurrSpeed == 0) ? assets.not_registered : Math.round(toShow.hurrSpeed * 100) / 100 + assets.units.hurrSpeed.unit)}</h6>
                <h6 style="color:black;">${assets.units.temperature.label}:  ${((toShow.temperature == 0) ? assets.not_registered : Math.round(toShow.temperature * 100) / 100 + assets.units.temperature.unit)}</h6>
                <h6 style="color:black;">${assets.units.pressure.label}:  ${((toShow.pressure == 0) ? assets.not_registered : Math.round(((toShow.pressure<100) ? toShow.pressure*100 : toShow.pressure) * 100) / 100 + assets.units.pressure.unit)}</h6>

                <h6 style="color:black;">${assets.date}: ${(new Date(toShow.date)).toLocaleString()}</h6>
            `

            L.popup().setLatLng([e.latlng.lat, e.latlng.lng]).setContent(popup).openOn(map_const)

        })

        var iconMarker = L.icon({
            iconUrl: icon,
            iconSize: [30, 30],
            popupAnchor: [-3, -76]
        })

        var marker = L.marker([element.realTrajectory[element.realTrajectory.length-1].position.lat, element.realTrajectory[element.realTrajectory.length-1].position.lng], { icon: iconMarker }).addTo(map_const);
        
        marker.on('click', (e) => {
            map_const.fitBounds(layerRealTrayectory.getBounds())
            L.popup().setLatLng([e.latlng.lat, e.latlng.lng]).setContent(`<h4 style="color:black;">${element.name}</h4><h6 style="color:black;">${assets.simbology.position}: ${element.realTrajectory[element.realTrajectory.length-1].position.lat}N,  ${element.realTrajectory[element.realTrajectory.length-1].position.lng}W</h6><h6 style="color: black;">${assets.simbology.category}: ${category}</h6>`).openOn(map_const)
        })

    })
}