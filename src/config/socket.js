import ioClient from 'socket.io-client'
import ioServer from 'socket.io'
import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'
import { makeTweetWithImages } from '../utils/twitter'

const generateTweet = async (data) => {
                        
    const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']})
    const page = await browser.newPage()

    await page.setViewport({ width: 1280, height: 800 })
    await page.goto(process.env.URL+"/mapRender?lat="+data.lastPoint.position.lat+"&lng="+data.lastPoint.position.lng+"&cat="+data.category)

    await page.waitFor(6000)
    await page.screenshot({ path: path.join(__dirname,'../assets/wind.png'), fullPage: true })

    await page.waitFor(4500)
    await page.screenshot({ path: path.join(__dirname,'../assets/temp.png'), fullPage: true })

    await page.waitFor(4500)
    await page.screenshot({ path: path.join(__dirname,'../assets/clouds.png'), fullPage: true })

    await page.waitFor(4500)
    await page.screenshot({ path: path.join(__dirname,'../assets/pressure.png'), fullPage: true })

    await browser.close()

    let wind = fs.readFileSync(path.join(__dirname,'../assets/wind.png'))
    let temp = fs.readFileSync(path.join(__dirname,'../assets/temp.png'))
    let clouds = fs.readFileSync(path.join(__dirname,'../assets/clouds.png'))
    let pressure = fs.readFileSync(path.join(__dirname,'../assets/pressure.png'))

    let message = ''
    let category = ''

    if(data.category == 'DT')
        category = 'la depresión tropical'
    else if(data.category == 'TT')
        category = 'la tormenta tropical'
    else 
        category = 'el huracán'

    message = `Se ha detectado ${category} ` + data.name + " a " + data.nearest.distance + " km de " + data.nearest.city

    makeTweetWithImages([ wind, temp, clouds, pressure], message)

}

module.exports = (http) => {

    const io = ioServer(http)
    const client = ioClient(process.env.PYTHON_URL + '/api')

    io.on('connection', (socket) => {

    })

    client.on('connect', () => {
        console.log("CONNECTED")
    })

    client.on('/alert', (data) => {

        io.emit('/alert', {
            data
        })
        
        if(!data.update)
            generateTweet(data.data)
            
    })
    
    client.on('disconnect', () => {
        console.log("DISCONNECTED")
    })

    return io
    
}