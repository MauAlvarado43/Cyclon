const app = new Vue({
    el: "#app",
    data:{
        email:"",
        password:"",
        name:"",
        lastname:"",
        confirmPassword:""
    },
    methods: {
        login(){
            console.log(this.email)
            console.log(this.password)
        },
        register(){
            console.log(this.email)
            console.log(this.password)
            console.log(this.name)
            console.log(this.lastname)
            console.log(this.confirmPassword)
        }
    },
})