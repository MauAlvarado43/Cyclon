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
