import nodemailer from 'nodemailer'
import { errorLog } from './logger'
import path from 'path'
import fs from 'fs'
import { generateToken, encryptAES } from './cipher'

const sendEmail = (destiny, topic, language, name, level, _id) => {

    try{

        let assets = (JSON.parse(fs.readFileSync(path.join(__dirname,'../assets/emails.json'),'utf-8')))

        let transporter = nodemailer.createTransport({
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
        
        let mailOptions = {
            from: 'hypersoftcode@gmail.com',
            to: destiny,
            subject: assets[language][topic].subject,
            html: getHTML(topic, assets, name, level, language, _id),
            attachments: 
            [
                {
                filename: 'CyclonHeader.png',
                path: 'src/public/images/CyclonHeader.png',
                cid: 'logo'
                },
                {
                    filename: 'app-store-us.png',
                    path: 'src/public/images/app-store-us.png',
                    cid: 'appstore'
                },
                {
                    filename: 'google-play-us.png',
                    path: 'src/public/images/google-play-us.png',
                    cid: 'googleplay'
                },
                {
                    filename: 'twitter2x.png',
                    path: 'src/public/images/twitter2x.png',
                    cid: 'twitter'
                },
                {
                    filename: 'facebook2x.png',
                    path: 'src/public/images/facebook2x.png',
                    cid: 'facebook'
                },

            ]
        }

        if (language == "es"){
            mailOptions.attachments[1] = {
                filename: 'app-store-es.png',
                path: 'src/public/images/app-store-es.png',
                cid: 'appstore'
            }
            mailOptions.attachments[2] = {
                filename: 'google-play-es.png',
                path: 'src/public/images/google-play-es.png',
                cid: 'googleplay'
            }
        }

        transporter.sendMail(mailOptions, function(err, info){
            if (err){
                console.log(err)
            }
            else{
                console.log("ENVIADO")
            }
        })

    }catch(err){
        console.log(err)
        errorLog.error(err)
    }

}

const getHTML = (topic, assets, name, level, language, _id) => {

    if (topic == "verification"){
        let html = fs.readFileSync(path.join(__dirname,'./templates/verification.html'),'utf-8')
        .replace("$(0)", name)
        .replace("$(1)",assets[language].verification.text[0])
        .replace("$(2)",assets[language].level[level])
        .replace("$(3)",assets[language].verification.text[1])
        .replace("$(4)", name.split(" ")[0] + " !")
        .replace("$(5)",assets[language].verification.text[2])
        .replace("$(6)",assets[language].verification.text[3])
        .replace("$(7)",assets[language].verification.text[4])
        .replace("$(8)",assets[language].verification.text[5])
        .replace("$(9)",assets[language].verification.text[6])
        .replace("$(10)",assets[language].verification.text[7])
        .replace("$(11)",assets[language].verification.text[8])
        .replace('$(link)', "href=\""+ process.env.URL + "/verifyAccount?v="+generateToken()+"&u="+encryptAES(_id)+"\"")
        
        return html
    }

}

export { sendEmail }