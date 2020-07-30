require('dotenv').config()
require('../../config/database')

import mongoose from 'mongoose'
import { CycloneModel } from '../../models/CycloneModel'

import fs from 'fs'
import path from 'path'

/* This code was use to export 7370 JSON to MongoDB, then this was use to export the data in a one file */

// let uniqueJSON = []

// fs.readdir(path.join(__dirname, "./hurricanes/"), (err, directories) => {

//     directories.forEach(directory => {
        
//         fs.readdir(path.join(__dirname, `./hurricanes/${directory}`), (err, files) => {

//             files.forEach(async file => {

//                 let data = JSON.parse(fs.readFileSync(path.join(__dirname, `./hurricanes/${directory}/${file}`), 'utf8'))
                
//                 let cyclone = new CycloneModel()

//                 cyclone.id = data[0].id
//                 cyclone.name = data[0].name
//                 cyclone.appearance = data[0].realTrajectory[0].date
//                 cyclone.lastUpdate = data[0].lastUpdate
                
//                 cyclone.origin = {
//                     lat: data[0].origin[0].lat,
//                     lng: data[0].origin[0].lng
//                 }

//                 cyclone.predictedTrajectory = data[0].prediction[0].predictedTrajectory
//                 cyclone.realTrajectory = data[0].realTrajectory
//                 cyclone.active = data[0].isActive

//                 data[0].realTrajectory.forEach(point => {
//                         if (point.wind < 62){
//                             cyclone.category = "DT"
//                         }
//                         else if(point.wind < 118){
//                             cyclone.category = "TT"
//                         }
//                         else if(point.wind < 153){
//                             cyclone.category = "H1"
//                         }
//                         else if(point.wind < 177){
//                             cyclone.category = "H2"
//                         }
//                         else if(point.wind < 210){
//                             cyclone.category = "H3"
//                         }
//                         else if(point.wind < 250){
//                             cyclone.category = "H4"
//                         }
//                         else{
//                             cyclone.category = "H5"
//                         }
//                     }
//                 })

//                 uniqueJSON.push(cyclone)

//                 // await cyclone.save()

//             })

//             fs.writeFileSync(path.join(__dirname, `./hurricaines.json`),JSON.stringify(uniqueJSON),'utf8')

//         })

//     })

// })

fs.readFile(path.join(__dirname, `./hurricaines.json`), (err, file) => {

    let cyclones = JSON.parse(file)

    cyclones.forEach( async (element, index) => {

        let cyclone = new CycloneModel()
        
        cyclone.id = element.id
        cyclone.name = element.name

        element.realTrajectory.forEach(element => {
          
            cyclone.realTrajectory.push({
                position: {
                    lat: element.lat,
                    lng: element.lng
                },
                windSpeed: element.wind,
                hurrSpeed: 0,
                temperature: element.temperature,
                pressure: element.pressure,
                date: element.date
            })
            
        })

        cyclone.appearance = element.realTrajectory[0].date
        cyclone.lastUpdate = element.lastUpdate
        cyclone.origin = element.origin
        cyclone.predictedTrajectory = []
        cyclone.active = element.active

        cyclone.category = element.category
        
        await cyclone.save()

        console.log(`Cyclone #${index} saved`)

        if(index==cyclones.length-1){
            console.log("Process finished")
            process.exit(0)
        }

    })


})