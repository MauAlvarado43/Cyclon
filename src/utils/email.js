import nodemailer from 'nodemailer'
import { errorLog } from './logger'

const sendEmail = (destiny, text, topic) => {

    try{

        var transporter = nodemailer.createTransport({
            service: 'Gmail',
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: 'hypersoftcode@gmail.com',
                pass: 'a3*/dac34&ew3$'
            },
            tls: {
                rejectUnauthorized: false
            }
        })
        
        var mailOptions = {
            from: 'hypersoftcode@gmail.com',
            to: destiny,
            subject: topic,
            html: text,
            attachments: [{
                filename: 'CyclonMini.png',
                path: 'public/images/CyclonMini.png',
                cid: 'logo'
            }]
        }

        transporter.sendMail(mailOptions, function(err, info){
            if (err){

            }
        })

    }catch(err){
        errorLog.error(err)
    }

}

export { sendEmail }