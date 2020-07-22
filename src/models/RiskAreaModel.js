import mongoose from 'mongoose'

const { Schema } = mongoose

/**
 * Represents an area of risk where a hurricane can be generated.
 * @constructor
 * @property {JSON} position - An object which has the coordinates of the risk area 
 * @property {String} ocean - Ocean which the risk area belongs
 * @property {Date} date - Date when the weather conditions are favorable to cause a hurricane
 */

const RiskAreaSchema = new Schema({
   position: {
      lat: Number,
      lng: Number
   },
   ocean: String,
   date: Date
})

const RiskAreaModel = mongoose.model('RiskArea', RiskAreaSchema)

export { RiskAreaModel }