const getCategoryRadious = (speed) => {
    if (speed < 62)
        return [assets.alertMessages.DT, 75]
    else if (speed < 118)
        return [assets.alertMessages.TT, 200]
    else if (speed < 153)
        return [assets.alertMessages.H1, 400] 
    else if (speed < 177)
        return [assets.alertMessages.H2, 700]
    else if (speed < 210)
        return [assets.alertMessages.H3, 900]
    else if (speed < 250)
        return [assets.alertMessages.H4, 1100]
    else
        return [assets.alertMessages.H5, 1300]
}

const getRealLayerPallet = () => {
    return {
        0.248: '#48ce7d',
        0.472: '#6de825',
        0.612: '#d3ed28',
        0.708: '#e8ae27',
        0.84: '#e36d29',
        1.0: '#e33529'
    }
}

const getPredictedLayerPallet = () => {
    return {
        0.248: '#4cbdd3',
        0.472: '#2b6fe3',
        0.612: '#592be3',
        0.708: '#af28e0',
        0.84: '#e324b6',
        1.0: '#e3242e'
    }
}

const getIcon = (category) => {
    if(category=="DT")
        return "/images/DT.png"
    if(category=="TT")
        return "/images/TT.png"
    if(category=="H1" || category=="H2" ||category=="H3" ||category=="H4" ||category=="H5")
        return "/images/HN.png"
    if(category=="RT")
        return "/images/RT.png"
}

const getCategoryRadiousByCAT = (category) => {
    if(category=="DT")
        return 75
    if(category=="TT")
        return 200
    if(category=="H1") 
        return 400
    if(category=="H2") 
        return 700
    if(category=="H3")
        return 900
    if(category=="H4") 
        return 1100
    if(category=="H5")
        return 1300
}

const getCategoryMessage = (category) => {
    if(category=="DT")
        return assets.alertMessages._DT
    if(category=="TT")
        return assets.alertMessages._TT
    if(category=="H1") 
        return assets.alertMessages._H1
    if(category=="H2") 
        return assets.alertMessages._H2
    if(category=="H3")
        return assets.alertMessages._H3
    if(category=="H4") 
        return assets.alertMessages._H4
    if(category=="H5")
        return assets.alertMessages._H5
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
