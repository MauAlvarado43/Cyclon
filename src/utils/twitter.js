import Twitter from 'twitter'
import { errorLog } from './logger'

const client = new Twitter({
  consumer_key: '',
  consumer_secret: '',
  access_token_key: '',
  access_token_secret: ''
})

const makeTweet = (status) => {

    try{

        let tweet = {
            status:status
        }

        client.post('statuses/update', tweet, (err,data,response)=>{
            if(err){
                console.log(err)
            }
        })

    }catch(err){
        console.log(err)
    }

}

const makeTweetWithImages = (image,status) => {

    try{

        client.post("media/upload", { media: image[0]}, (err,dataInit,response)=>{
            client.post("media/upload", { media: image[1]}, (err,dataAppend1,response)=>{
                client.post("media/upload", { media: image[2]}, (err,dataAppend2,response)=>{
                    client.post("media/upload", { media: image[3]}, (err,dataFinished,response)=>{
                        if(err){
                            console.log(err)
                        }

                        let tweet = {
                            status:status,
                            media_ids:`${dataInit.media_id_string},${dataAppend1.media_id_string},${dataAppend2.media_id_string},${dataFinished.media_id_string}`
                        }

                        client.post('statuses/update',tweet,(err2,data,response)=>{
                            console.log("tweeted")
                            if(err2){
                                console.log(err2)
                            }
                        })
                        
                    })
                })
            })
        })

    }catch(err){
        console.log(err)
    }

}

export {makeTweet, makeTweetWithImages}