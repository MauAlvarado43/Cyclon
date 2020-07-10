const query = `
{
    allCyclones {
        active
        name
        appearance
    }
}
`

const getCyclones = async () => {

    const response = await fetch("/graphql?query="+query)
    const res = await response.json()

    res.data.allCyclones.forEach(element => {
        console.log(element)
    });

}


getCyclones()