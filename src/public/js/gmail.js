var CLIENT_ID = '30241802743-j36frevsmpvj855vrdao6dcavs20sp79.apps.googleusercontent.com'
var API_KEY = 'AIzaSyC_dWFOmnYiXQ6M_4Qb_SMMYoVcaHb4Yyw'

var scopes = 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send'

const authenticate = () => {
    return gapi.auth2.getAuthInstance().signIn({ scope: scopes }).then(
        () => {
            console.log('Sign-in successful')
        }, (err) => {
            console.error(err)
        }
    )
}

const loadClient = () => {
    gapi.client.setApiKey(API_KEY)
    return gapi.client.load('https://content.googleapis.com/discovery/v1/apis/gmail/v1/rest').then(
        (res) => {
            sendEmail()
            console.log(res)
        }, (err) => { 
            console.log(err) 
        }
    ).catch((reject) => { });
}

gapi.load('client:auth2', function () {
    gapi.auth2.init({ client_id: CLIENT_ID })
})

function sendEmail() {
    sendMessage(
        {
            To: 'hypersoftcode@gmail.com',
            Subject: document.getElementById("subject").val,
        },
        document.getElementById('cname').val + "\n" + document.getElementById('message').val,
        () => { }
    )

    return false
}

function sendMessage(headers_obj, message, callback) {
    var email = '';

    for (var header in headers_obj)
        email += header += ': ' + headers_obj[header] + '\r\n'

    email += '\r\n' + message

    var sendRequest = gapi.client.gmail.users.messages.send({
        userId: 'me',
        resource: {
            raw: window.btoa(email).replace(/\+/g, '-').replace(/\//g, '_'),
        },
    });

    return sendRequest.execute(callback)
}