const app = new Vue({
    el: "#app",
    data:{
        email:"",
        password:"",
        name:"",
        lastName:"",
        confirmPassword:"",
        emailRecover:"",
        registerErrors:{
            name: [],
            lastName: [],
            email: [],
            password: []
        },
        loginErrors:{
            email:[],
            password:[]
        }
    },
    methods: {
        async recover(){

            $("#errorRecoverLabel").css("visibility", "hidden")
            $("#recoverMessage").text("")

            if(!checkEmail(this.emailRecover) && this.emailRecover.length>0){
                $("#errorRecoverLabel").css("visibility", "visible")
                $("#recoverMessage").text(assets.errors["BAD_FORMAT"].replace("$",assets.inputs.email.toLowerCase().split(" ")[0]))
            }
            else{

                let config = {  
                    method: 'POST',
                    headers:{
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: encrypt(this.emailRecover),
                    })
                }

                let response = await fetch("/api/requestRecoverPassword", config)
                let res = await response.json()
    
                if (res.code == 401)
                    alert.error(assets.errors[res.msg[0]],"Error")
                else{
                    $("#recoverModal").modal("hide")
                    alert.success(assets["recover_acepted"],"")
                }
            }

        },
        reset(){
            this.email = ""
            this.password = ""
            this.name = ""
            this.lastName = ""
            this.confirmPassword = ""
            this.registerErrors = {
                name: [],
                lastName: [],
                email: [],
                password: []
            }
            this.loginErrors = {
                email:[],
                password:[]
            }

        },
        async login(){

            this.loginErrors = {
                email:[],
                password:[]
            }

            if(this.email.length==0) this.loginErrors["email"].push(assets.errors["EMPTY_FORMAT"].replace("$",assets.inputs.email.toLowerCase().split(" ")[0]))
            if(this.password.length==0) this.loginErrors["password"].push(assets.errors["EMPTY_PASSWORD_L"])

            else{

                let config = {  
                    method: 'POST',
                    headers:{
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: encrypt(this.email),
                        password: encrypt(this.password)
                    })
                }

                let response = await fetch("/auth/login", config)
                let res = await response.json()
    
                if (res.code == 401)
                    alert.error(assets.errors[res.msg[0]],"Error")
                else{
                    alert.success(assets["SIGNUP_SUCCESS"],"")
                    window.location.href = "/home"
                }
            }
         
        },
        async register(){

            this.registerErrors = {
                name: [],
                lastName: [],
                email: [],
                password: []
            }

            if(!checkWords(this.name) && this.name.length>0) this.registerErrors["name"].push(assets.errors["BAD_FORMAT"].replace("$",assets.inputs.name.toLowerCase().split(" ")[0]))
            if(this.name.length==0) this.registerErrors["name"].push(assets.errors["EMPTY_FORMAT"].replace("$",assets.inputs.name.toLowerCase().split(" ")[0]))
            if(this.name.length>50) this.registerErrors["name"].push(assets.errors["MAX_LENGTH"].replace("$",assets.inputs.name.toLowerCase().split(" ")[0]))

            if(!checkWords(this.lastName)) this.registerErrors["lastName"].push(assets.errors["ONLY_LETTERS_LASTNAME"])
            if(this.lastName.length==0) this.registerErrors["lastName"].push(assets.errors["EMPTY_LASTNAME"])
            if(this.lastName.length>50) this.registerErrors["lastName"].push(assets.errors["MAX_LASTNAME"])
        
            if(!checkEmail(this.email) && this.email.length>0) this.registerErrors["email"].push(assets.errors["BAD_FORMAT"].replace("$",assets.inputs.email.toLowerCase().split(" ")[0]))
            if(this.email.length==0) this.registerErrors["email"].push(assets.errors["EMPTY_FORMAT"].replace("$",assets.inputs.email.toLowerCase().split(" ")[0]))
            if(this.email.length>50) this.registerErrors["email"].push(assets.errors["MAX_LENGTH"].replace("$",assets.inputs.email.toLowerCase().split(" ")[0]))

            if(this.password!=this.confirmPassword) this.registerErrors["password"].push(assets.errors.PASSWORD_NOT_MATCH)
            if(this.password.length<8) this.registerErrors["password"].push(assets.errors["EMPTY_PASSWORD"])
            if(this.password.length>50) this.registerErrors["password"].push(assets.errors["MAX_PASSWORD"])

            if(this.registerErrors.name.length==0 && this.registerErrors.lastName.length==0 && this.registerErrors.email.length==0 && this.registerErrors.password.length==0){
                
                let config = {
                    method: 'POST',
                    headers:{
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: encrypt(this.email),
                        password: encrypt(this.password),
                        name: encrypt(this.name),
                        lastName: encrypt(this.lastName)
                    })
                }

                let response = await fetch("/auth/register", config)
                let res = await response.json()

                if (res.code == 401)
                    res.msg.forEach(error => {
                        if(error=="BAD_INPUT")
                            alert.error(assets.errors.BAD_INPUT,"Error")
                        else if(error=="EMAIL_TAKEN")
                            this.registerErrors.email.push(assets.errors.EMAIL_TAKEN)
                        else if(error=="BAD_LOCATION")
                            alert.error(assets.errors.BAD_LOCATION,"Error")
                        else
                            this.registerErrors[error.field].push((assets.errors[error.error]).replace("$",assets.inputs[(error.field).toLowerCase()].toLowerCase().split(" ")[0]))
                    })
                else {
                    alert.success(assets["ACCOUNT_CREATED"],"")
                    window.location.href = "/home"
                }

            }

        }
    },
})