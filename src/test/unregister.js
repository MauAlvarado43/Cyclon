import chai, { expect, assert } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import chaiHttp from 'chai-http'
import app from '../server'
import faker from 'faker'

const should = chai.should()

chai.use(chaiHttp)
chai.use(chaiAsPromised)

describe('POST /api/login', () => {
    it('should POST a login', done => {
        let login = {
            username: faker.lorem.word(),
            password: faker.lorem.word()
        }
        chai.request(app)
            .post('/api/login')
            .send(login)
            .end((err, res) => {
                expect(err).to.be.null
                expect(res).to.have.status(200)
                expect(res.body).be.a('object')
                expect(res.body).to.have.property('code')
                done()
            })
    })
})