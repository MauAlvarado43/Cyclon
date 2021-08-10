const pageUserQuery = `
{
    pageUser(page: $(0) , type: $(1) ) {
        name
        lastName
        email
        location {
            lat
            lng
        }
        type
        verify
        register
    }
}
`

const searchUserQuery = `
{
    searchUser(email: $(0) ) {
        name
        lastName
        email
        location {
            lat
            lng
        }
        type
        verify
        register
    }
}
`

const countUserQuery = `
{
    countUser( type: $(0) ) {
        count
    }
}
`

const graphUserTypeQuery = `
{
    getGraphUserType {
        normal {
            date
            count
        }
        scientist {
            date
            count
        }
    }
}
`

const graphUserRegisterQuery = `
{
    getGraphUserRegister {
        facebook{
            date
            count
        }
        google{
            date
            count
        }
        local{
            date
            count
        }
    }
}
`

const graphUserVerifiedQuery = `
{
    getGraphUserVerified {
        verified{
            date
            count
        }
        unverified{
            date
            count
        }
    }
}
`

const app = new Vue({
    el: "#app",
    data:{
        page: 0,
        selectedType: 0,
        users: [],
        maxPage: 0,
        email: ""
    },
    methods: {
        async getUserTypeGraph() {
            const response = await fetch("/graphql?query="+graphUserTypeQuery)
            const res = await response.json()
            let data = []

            try{
                for(var i = 0; i < 15; i++){
                    data.push({
                        x: new Date(res.data.getGraphUserType.normal[i].date).toLocaleDateString(),
                        y: res.data.getGraphUserType.normal[i].count,
                        z: res.data.getGraphUserType.scientist[i].count
                    })
                }
                generateMultipleLineGraph("graphUserType", data, [assets.inputs.user_type.type[0], assets.inputs.user_type.type[1]], [' ' + assets.inputs.persons], ['#ee560d','#3244a8'], 'x', ['y', 'z'])
            }catch(err){
                this.getUserTypeGraph()
            }

        },
        async getUserRegisterGraph() {
            const response = await fetch("/graphql?query="+graphUserRegisterQuery)
            const res = await response.json()
            let data = []

            try{
                for(var i = 0; i < 15; i++){
                    data.push({
                        x: new Date(res.data.getGraphUserRegister.local[i].date).toLocaleDateString(),
                        y: res.data.getGraphUserRegister.local[i].count,
                        z: res.data.getGraphUserRegister.facebook[i].count,
                        za: res.data.getGraphUserRegister.google[i].count
                    })
                }
                generateMultipleLineGraph("graphUserRegister", data, [assets.inputs.register.type[0], assets.inputs.register.type[1], assets.inputs.register.type[2]], [' ' + assets.inputs.persons], ['#ee560d','#3244a8', '#5732a8'], 'x', ['y', 'z', 'za'])
            }catch(err){
                this.getUserRegisterGraph()
            }
    
        },
        async getUserVerifyGraph() {
            const response = await fetch("/graphql?query="+graphUserVerifiedQuery)
            const res = await response.json()
            let data = []

            try{
                for(var i = 0; i < 15; i++){
                    data.push({
                        x: new Date(res.data.getGraphUserVerified.verified[i].date).toLocaleDateString(),
                        y: res.data.getGraphUserVerified.unverified[i].count,
                        z: res.data.getGraphUserVerified.verified[i].count
                    })
                }
                generateMultipleLineGraph("graphUserVerified", data, [assets.inputs.status.type[0], assets.inputs.status.type[1]], [' ' + assets.inputs.persons], ['#ee560d','#3244a8'], 'x', ['y', 'z'])
            }catch(err){
                this.getUserVerifyGraph()
            }
            
        },
        async searchUser(){

            if(this.email != ""){
                let email = this.email
                const response = await fetch("/graphql?query="+(searchUserQuery.replace("$(0)", "\"" + email + "\"")))
                const res = await response.json()
    
                let table = `
                <table class="table table-sm borderless table-hover" style="background-color: #292736; color: white;">
                    <tr>
                        <th>${assets.inputs.name}</th>
                        <th>${assets.inputs.lastname}</th>
                        <th>${assets.inputs.email}</th>
                        <th>${assets.units.latitude.label}</th>
                        <th>${assets.units.longitude.label}</th>
                        <th>${assets.inputs.user_type.label}</th>
                        <th>${assets.inputs.status.label}</th>
                        <th>${assets.inputs.register.label}</th>
                        <th>${assets.buttons.delete}</th>
                    </tr>`
    
                res.data.searchUser.forEach(element => {
    
                    table += `<tr>
                                <td>${decrypt(element.name)}</td>
                                <td>${decrypt(element.lastName)}</td>
                                <td>${decrypt(element.email)}</td>
                                <td>${decrypt(element.location.lat)}</td>
                                <td>${decrypt(element.location.lng)}</td>
                                <td>${assets.inputs.user_type.type[element.type]}</td>
                                <td>${assets.inputs.status.type[(element.verify) ? 1 : 0]}</td>
                                <td>${assets.inputs.register.type[element.register]}</td>
                                <td><input type="button" value="${assets.buttons.delete}" onclick="deleteUser('${element.email}')"></td>
                            </tr>`
    
                })
    
                table += `</table>`
    
                if(res.data.searchUser.length == 0)
                    $("#usersTable").html(`<center> 
                        <br>
                        <h3>${assets.not_registered}</h3>
                    </center>`)
                else{
                    $("#usersTable").text("")
                    $("#usersTable").html(table)
                }
            }
            else{
                this.getUserPage()
            }

        },
        async getUserPage(){

            let page = document.getElementById("page").value
            if(1<=page<=this.maxPage && page != "" && page != null && page != undefined)
                this.page = page

            if(1<=this.page<=this.maxPage){
                const response = await fetch("/graphql?query="+(pageUserQuery.replace("$(0)", (this.page - 1) ).replace("$(1)", this.selectedType)))
                const res = await response.json()

                console.log("/graphql?query="+(pageUserQuery.replace("$(0)", (this.page - 1) ).replace("$(1)", this.selectedType)))
    
                this.users = res.data.pageUser

                let table = `
                <table class="table table-sm borderless table-hover" style="background-color: #292736; color: white;">
                    <tr>
                        <th style="text-align: center; vertical-align: middle;">${assets.inputs.name}</th>
                        <th style="text-align: center; vertical-align: middle;">${assets.inputs.lastname}</th>
                        <th style="text-align: center; vertical-align: middle;">${assets.inputs.email}</th>
                        <th style="text-align: center; vertical-align: middle;">${assets.units.latitude.label}</th>
                        <th style="text-align: center; vertical-align: middle;">${assets.units.longitude.label}</th>
                        <th style="text-align: center; vertical-align: middle;">${assets.inputs.user_type.label}</th>
                        <th style="text-align: center; vertical-align: middle;">${assets.inputs.status.label}</th>
                        <th style="text-align: center; vertical-align: middle;">${assets.inputs.register.label}</th>
                        <th style="text-align: center; vertical-align: middle;">${assets.buttons.upgrade}</th>
                        <th style="text-align: center; vertical-align: middle;">${assets.buttons.delete}</th>
                    </tr>`
    
                this.users.forEach(element => {

                    table += `<tr>
                                <td style="text-align: center; vertical-align: middle;">${decrypt(element.name)}</td>
                                <td style="text-align: center; vertical-align: middle;">${decrypt(element.lastName)}</td>
                                <td style="text-align: center; vertical-align: middle;">${decrypt(element.email)}</td>
                                <td style="text-align: center; vertical-align: middle;">${decrypt(element.location.lat)}</td>
                                <td style="text-align: center; vertical-align: middle;">${decrypt(element.location.lng)}</td>
                                <td style="text-align: center; vertical-align: middle;">${assets.inputs.user_type.type[element.type]}</td>
                                <td style="text-align: center; vertical-align: middle;">${assets.inputs.status.type[(element.verify) ? 1 : 0]}</td>
                                <td style="text-align: center; vertical-align: middle;">${assets.inputs.register.type[element.register]}</td>
                                <td style="text-align: center; vertical-align: middle;"><input class="btn btn-primary" type="button" value="${assets.buttons.upgrade}" onclick="upgradeUser('${element.email}')"></td>
                                <td style="text-align: center; vertical-align: middle;"><input class="btn btn-primary" type="button" value="${assets.buttons.delete}" onclick="deleteUser('${element.email}')"></td>
                            </tr>`
    
                })

                table += `</table>`

                if(res.data.pageUser.length == 0)
                    $("#usersTable").html(`<center>
                        <br>
                        <h3>${assets.not_registered}</h3>
                    </center>`)
                else{
                    $("#usersTable").text("")
                    $("#usersTable").html(table)
                }
                    

            }

        },
        async getCountUser(){
            const response = await fetch("/graphql?query="+(countUserQuery.replace("$(0)", this.selectedType)))
            const res = await response.json()

            this.page = (res.data.countUser.count/10 < 10) ? 1 : (Math.round(res.data.countUser.count/10) + 1)
            this.maxPage = (res.data.countUser.count/10 < 10) ? 1 : (Math.round(res.data.countUser.count/10) + 1)

            document.getElementById("page").setAttribute("max",this.maxPage)
            document.getElementById("page").setAttribute("value",this.maxPage)

            this.getUserPage()
        },
        decreasePage(){
            if(this.page - 1 <= 0)
                return false
            else{
                this.page--
                this.getUserPage()
            }
        },
        increasePage(){
            if(this.page + 1 > this.maxPage)
                return false
            else{
                this.page++
                this.getUserPage()
            }
        }
    },
    async beforeMount(){
        this.getCountUser()
        this.getUserTypeGraph()
        this.getUserRegisterGraph()
        this.getUserVerifyGraph()
    }
})

const deleteUser = async (email) => {
    let config = {  
        method: 'POST',
        headers:{
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: encrypt(decrypt(email)),
        })
    }

    const response = await fetch("/api/deleteUser", config)
    const res = await response.json()
    
    if(res.code == 402)
        window.location.href = "/"
    else if(res.code == 401)
        alert.error(assets.errors[res.msg],"Error")
    else
        alert.success(assets["DELETED_SUCCESSFULLY"],"")

    app.searchUser()
}

const upgradeUser = async (email) => {
    let config = {  
        method: 'POST',
        headers:{
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: encrypt(decrypt(email)),
        })
    }

    const response = await fetch("/api/upgradeUser", config)
    const res = await response.json()
    
    if(res.code == 402)
        window.location.href = "/"
    else if(res.code == 401)
        alert.error(assets.errors[res.msg],"Error")
    else
        alert.success(assets["UPGRADED_SUCCESSFULLY"],"")

    app.searchUser()
}