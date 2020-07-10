import mongoose from 'mongoose'
import {encryptAES} from '../utils/cipher'
import {checkWords, checkEmail} from '../utils/regex'

const { Schema } = mongoose

/**
 * Represents a hurricane.
 * @constructor
 * @property {Date} appearance - Date when the cyclone was detected
 * @property {Date} lastUpdate - Date when the server update the cyclone
 * @property {JSON} origin - An object which has the geolocation (latitude and longitude) about cyclone's appearance
 * @property {Array} predictedTrajectory - An array which has objects about a prediction of cyclone's point with temperature, wind speed, pressure, latitude, longitude and date
 * @property {Arary} realTrajectory - An array which has objects about a real cyclone's point with temperature, wind speed, pressure, latitude, longitude and date
 */

const CycloneSchema = new Schema({
    id: String,
    name: String,
    appearance:Date,
    lastUpdate: Date,
    origin: {
        lat: Number,
        lng: Number
    },
    predictedTrajectory: Array,
    realTrajectory: Array,
    active: Boolean,
    category: String
})

const CycloneModel = mongoose.model("Hurricaine", CycloneSchema)

export {CycloneModel, Trajectory}