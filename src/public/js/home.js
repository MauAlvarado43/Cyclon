const addPanelInfo = () => {

    console.log(assets)

    if(activeCyclones.length == 0)
        $("#panelAlert").html(`
        <br><br><br><br><br><br><br><br><br><br><br>
        <center>
            <h4>${assets.alertMessages.no_alerts}</h4>
        </center>
    `)

    activeCyclones.forEach(element => {

        let lastPoint =  element.realTrajectory[element.realTrajectory.length - 1]
        let category = getCategoryRadious(lastPoint.windSpeed)[0]
        let radious = getCategoryRadious(lastPoint.windSpeed)[1]

        let distance = getDistance(latUser, lngUser, lastPoint.position.lat, lastPoint.position.lng)
        
        if(radious<distance<radious+250)
            $("#panelAlert")

    })

}

const getCategoryRadious = (speed) => {
    if (speed < 62)
        return ["DT", 75]
    else if (speed < 118)
        return ["TT", 200]
    else if (speed < 153)
        return ["H1", 400] 
    else if (speed < 177)
        return ["H2", 700]
    else if (speed < 210)
        return ["H3", 900]
    else if (speed < 250)
        return ["H4", 1100]
    else
        return ["H5", 1300]
}

const getDistance = (lat1, lon1, lat2, lon2) => {

    rad = function(x) {return x*Math.PI/180}

    let R = 6378.137
    let dLat = rad( lat2 - lat1 )
    let dLong = rad( lon2 - lon1 )
    let a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLong/2) * Math.sin(dLong/2)
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    let d = R * c

    return d
}
