const query = `
{
    searchCyclone(year: $ ) {
        active
        name
        appearance
        lastUpdate
        origin{
            lat
            lng
        }
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
        category
    }
}
`

const app = new Vue({
    el: "#app",
    data:{
        year: (new Date()).getFullYear(),
        cyclones: ['Nothing'],
        selectedCyclone: '',
        selectedGraph: '',
        selectedTrajectory: ''
    },
    methods: {
        async searhCyclones(){
            if(this.year >1859 && this.year < ((new Date()).getFullYear() + 1) ){

                this.selectedCyclone = ''
                $("#graph").text("")

                const response = await fetch("/graphql?query="+(query.replace("$", this.year)))
                const res = await response.json()

                let cyclonesArray = []

                res.data.searchCyclone.forEach(element => {
                    
                    cyclonesArray.push({
                            active: element.active,
                            name: element.name,
                            appearance: (new Date(element.appearance * 1)).toISOString(),
                            lastUpdate: (new Date(element.lastUpdate * 1)).toISOString(),
                            origin: element.origin,
                            realTrajectory: element.realTrajectory,
                            predictedTrajectory: element.predictedTrajectory,
                            category: element.category
                    })

                })

                this.cyclones = cyclonesArray

            }
        },
        showCyclone(){

            if (lastLayer != null) {
                map_const.removeLayer(lastLayer)
            }
            if(lastmarker != null){
                map_const.removeLayer(lastmarker)
            }

            this.showGraph()

            let palette = {}
            let latlngs = []
            let trajectorySelected =  this.cyclones[(this.selectedCyclone.split(" ")[0])-1][this.selectedTrajectory]

            let table = `<table class="table small" style="background-color: white;">
                            <tr>
                                <th>${assets.units.latitude.label}</th>
                                <th>${assets.units.longitude.label}</th>
                                <th>${assets.units.windSpeed.label} ${assets.units.windSpeed.unit}</th>
                                <th>${assets.units.hurrSpeed.label} ${assets.units.hurrSpeed.unit}</th>
                                <th>${assets.units.temperature.label} ${assets.units.temperature.unit}</th>
                                <th>${assets.units.pressure.label} ${assets.units.pressure.unit}</th>
                                <th>${assets.date}</th>
                            </tr>`

            if(this.selectedTrajectory!='realTrajectory') 
                palette = {
                    0.0: '#0081b6',
                    0.5: '#895762',
                    1.0: '#a41214'
                }
            else
                palette = {
                    0.0: '#00bc79',
                    0.5: '#887c73',
                    1.0: '#a9136c'
                }

            trajectorySelected.forEach(element => {

                table += `<tr>
                            <td>${element.position.lat}</td>
                            <td>${element.position.lng}</td>
                            <td>${((element.windSpeed == 0) ? assets.not_registered : Math.round(element.windSpeed * 100) / 100)}</td>
                            <td>${((element.hurrSpeed == 0) ? assets.not_registered : Math.round(element.hurrSpeed * 100) / 100)}</td>
                            <td>${((element.temperature == 0) ? assets.not_registered : Math.round(element.temperature * 100) / 100)}</td>
                            <td>${((element.pressure == 0) ? assets.not_registered : Math.round(((element.pressure<100) ? element.pressure*100 : element.pressure) * 100) / 100)}</td>
                            <td>${element.date}</td>
                        </tr>`

                latlngs.push([element.position.lat, element.position.lng, element.windSpeed])
            })      
            
            lastLayer = new L.Hotline(latlngs, {
                min: 119,
                max: 250,
                palette: palette,
                weight: 6,
                outlineColor: '#000000',
                outlineWidth: 1
            }).addTo(map_const)

            lastLayer.on('click', function (e) {

                let latClicked = e.latlng.lat
                let lngClicked = e.latlng.lng
                let distance = 9999999
                let toShow = {}

                trajectorySelected.forEach(item => {
                    let distanceTemp = getDistance(latClicked,lngClicked,item.position.lat,item.position.lng)
                    if(distanceTemp<distance){
                        distance = distanceTemp;
                        toShow = item;
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

            lastLayer.on('mouseover', function () {
                lastLayer.setStyle({
                  weight: 4,
                })
            })
    
            lastLayer.on('mouseout', function () {
                lastLayer.setStyle({
                  weight: 3,
                })
            })

            if(trajectorySelected.length==1){       
                map_const.flyTo([
                    trajectorySelected[0].position.lat, 
                    trajectorySelected[0].position.lng], 4)
            }
            else{
                map_const.flyTo([
                    trajectorySelected[Math.round(trajectorySelected.length / 2)].position.lat,
                    trajectorySelected[Math.round(trajectorySelected.length / 2)].position.lng], 4)
            }

            
            // if(this.cyclones[(this.selectedCyclone.split(" ")[0])-1].active){

            //     var icon = L.icon({
            //         iconUrl: '../../img/cyclone.png',
            //         iconSize: [35, 35],
            //         popupAnchor: [-3, -76]
            //     })

            //     var marker = L.marker([json[0].realTrajectory[json[0].realTrajectory.length-1].lat, json[0].realTrajectory[json[0].realTrajectory.length-1].lng], { icon: icon }).addTo(map_const);
                
            //     marker.on('click', function (e) {
            //         map_const.fitBounds(hotlineLayer.getBounds());
            //         L.popup()
            //             .setLatLng([e.latlng.lat, e.latlng.lng])
            //             .setContent(`<article class="Popup" onclick="ElementoClick(\"Maria_2017\",this)"><header><h4 class="Titulo">${json[0].name}</h4></header><br><div class="Datos MostrarDatosHuracan"><h6 style=\"color:black;\">Posición: ${json[0].realTrajectory[json[0].realTrajectory.length-1].lat}N,  ${json[0].realTrajectory[json[0].realTrajectory.length-1].lng}W</h6><br></div></article>`)
            //             .openOn(map_const)
            //     })

            //     lastmarker = marker

            // }

            map_const.fitBounds(lastLayer.getBounds())

            table += `</table>`
            $("#cycloneTable").text("")
            $("#cycloneTable").html(table)
            
        },
        showGraph(){

            if(this.selectedGraph == "") this.selectedGraph = 'windSpeed'
            if(this.selectedTrajectory == "") this.selectedTrajectory = 'realTrajectory'

            let data = []
            let ySUM = 0

            this.cyclones[(this.selectedCyclone.split(" ")[0])-1][this.selectedTrajectory].forEach(element => {

                let date = new Date(element.date)

                ySUM += element[this.selectedGraph]

                data.push({
                    x: date.toLocaleString(),
                    y: Math.round((((element[this.selectedGraph]<100 && this.selectedGraph=='pressure'))?element[this.selectedGraph]*100:element[this.selectedGraph])*100)/100
                })
            })
            
            if(ySUM!=0)
                generateMultipleLineGraph("graph", data, [assets.units[this.selectedGraph].label], [assets.units[this.selectedGraph].unit], ['#FF0000'], 'x', ['y'])
            else 
                $("#graph").text("NOT REGISTERED")

        }
    },
    async beforeMount(){
        this.searhCyclones()
    }
})