let graph = null

const generateMultipleLineGraph = (id,data,label,units,colors, keyX, keyY) => {
    $(`#${id}`).text("")
    graph = new Morris.Line({
        element: id,
        data: data,
        xkey: keyX,
        ykeys: keyY,
        labels: label,
        xLabels:"",
        postUnits: units,
        parseTime: false,
        resize: true,
        xLabelAngle:45,
        lineColors:colors,
        hideHover: true,
        gridTextColor: "#FFF",
        goalLineColors: "#FFF"
    })
}