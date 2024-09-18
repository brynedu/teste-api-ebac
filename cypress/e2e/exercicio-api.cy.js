/// <reference types="cypress" />
import contracts from '../contracts/user.contracts'
import { faker } from '@faker-js/faker'
var nome = faker.internet.userName()
var email = faker.internet.email()
var senha = faker.internet.password()

describe('Testes da Funcionalidade Usuários', () => {

  let token
  beforeEach(() => {
      cy.token('teste123@teste.com' , 'teste').then(tkn =>{
          token = tkn
      })
  });


  it('Deve validar contrato de usuários', () => {
    cy.request('usuarios').then(response => {
      return contracts.validateAsync(response.body)
  })
  });

  //GET
  it('Deve listar usuários cadastrados', () => {    
    cy.request({
      method: 'GET',
      url: 'usuarios'
  }).should((response) => {
      expect(response.status).equal(200)
      expect(response.body).to.have.property('usuarios')
  })    
  });

  //POST
  it('Deve cadastrar um usuário com sucesso', () => {    
    cy.registerUser(token, nome, email, senha, 'true')  
    .should((response) => {
        expect(response.status).equal(201)
        expect(response.body.message).equal('Cadastro realizado com sucesso')
    })
  });

  //POST
  it('Deve validar um usuário com email inválido', () => { 
    cy.registerUser(token, nome, 'fulano@qa.com', senha, 'false')
    .should((response) => {
        expect(response.status).equal(400)
        expect(response.body.message).equal('Este email já está sendo usado')
              
    })
  });

  //PUT
  it('Deve editar um usuário previamente cadastrado', () => {
    var email = faker.internet.email()
    var senha = faker.internet.password()
    cy.request('usuarios').then(response => {
      let id = response.body.usuarios[0]._id
      cy.request({
          method: 'PUT', 
          url: `usuarios/${id}`,
          headers: {authorization: token}, 
          body: 
          {
              "nome": "Usuário Alterado",
              "email": email,
              "password": senha,
              "administrador": "true"              
            }
      }).then(response => {
          expect(response.body.message).to.equal('Registro alterado com sucesso')
      })
  })
  });

  //DELETE
  it('Deve deletar um usuário previamente cadastrado', () => {
    var email = faker.internet.email()
    var senha = faker.internet.password()
    cy.registerUser(token, nome, email, senha, 'true') 
    .then(response => {
        let id = response.body._id
        cy.request({
            method: 'DELETE',
            url: `usuarios/${id}`,
            headers: {authorization: token}
        }).then(resp =>{
            expect(resp.body.message).to.equal('Registro excluído com sucesso')
            expect(resp.status).to.equal(200)
        })
    })
  })


});
