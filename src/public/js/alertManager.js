const query = `
{
    activeCyclones {
      active
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

const getActiveCyclones = async () => {

    const response = await fetch("/graphql?query="+query)
    const res = await response.json()

    res.data.activeCyclones.forEach(element => {
        
    });

}


getActiveCyclones()