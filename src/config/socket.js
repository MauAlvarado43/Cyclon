import ioClient from 'socket.io-client'
import ioServer from 'socket.io'
import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'
import { makeTweet, makeTweetWithImages } from '../utils/twitter'
import fetch from 'node-fetch'

export default class CyclonSocket {

    constructor(http){

        this.io = ioServer(http)

        this.io.on('connection', client => {
            client.on('/alert', data => {  })
            client.on('disconnect', () => { })
        })

    }

    async generateTweet(data) {
                        
        const browser = await puppeteer.launch()
        const page = await browser.newPage()
    
        await page.setViewport({ width: 1280, height: 800 })
        await page.goto(process.env.URL+"/mapRender?lat="+data.lastPoint[0]+"&lng="+data.lastPoint[1]+"&cat="+data.category)

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

        let req = await fetch("https://geocode.xyz/"+data.lastPoint[0]+","+data.lastPoint[1]+"?json=1")
        let json = await req.json()

        let message = ''
        let category = ''

        if(data.category == 'DT')
            category = 'la depresión tropical'
        else if(data.category == 'TT')
            category = 'la tormenta tropical'
        else 
            data.category = 'el huracán'

        if(json.suggestion!=undefined){
            
            if(json.suggestion.north && Object.keys(json.suggestion.north.distance).length === 0){
                let nearestCity = json.suggestion.south.city
                let distanceN = json.suggestion.south.distance
                message = `Se ha detectado ${category} `+data.name+" a "+distanceN+" km de "+nearestCity
            }
            else{
                let nearestCity = json.suggestion.north.city
                let distanceN = json.suggestion.north.distance
                message = `Se ha detectado ${category} `+data.name+" a "+distanceN+" km de "+nearestCity
            }
            
        }
        else{

            let nearestCity = resolve.city
            let distanceN = resolve.distance

            message = `Se ha detectado ${category} `+data.name+" a "+distanceN+" km de "+nearestCity;
        }

        makeTweetWithImages([ wind, temp, clouds, pressure], message)

    }

    connectPython(){

        this.client = ioClient(process.env.PYTHON_URL + '/api')

        this.client.on('connect', function(){
            console.log("CONNECTED")
        })

        this.client.on('/alert', function(data){

            this.io.emit('/alert', {
                data:{
                    id: data.data.id,
                    location: {
                        lat: data.data.lastPoint[0],
                        lng: data.data.lastPoint[1]
                    },
                    name: data.data.name,
                    category: data.data.category
                },
                update: data.update
            })
            
            if(!data.update)
                this.generateTweet(data.data)
        })
        
        this.client.on('disconnect', function(){
            console.log("DISCONNECTED")
        })
    }

    disconnectPython(){
        this.client.disconnect()
    }


}

