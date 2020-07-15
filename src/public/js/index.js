const app = new Vue({
    el: "#app",
    data:{
        email:"",
        password:"",
        name:"",
        lastName:"",
        confirmPassword:""
    },
    methods: {
        async login(){

            let config = {
                method: 'POST',
                headers:{
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: this.email,
                    password: this.password
                })
            }

            let response = await fetch("/auth/login", config)
            let res = await response.json()

            console.log(res)
        },
        async register(){

            let config = {
                method: 'POST',
                headers:{
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: this.email,
                    password: this.password,
                    name: this.name,
                    lastName: this.lastName
                })
            }

            console.log(config)

            let response = await fetch("/auth/register", config)
            let res = await response.json()

            console.log(res)
        }
    },
})