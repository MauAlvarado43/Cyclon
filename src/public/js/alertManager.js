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