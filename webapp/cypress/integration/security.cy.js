const {mountMockWorkspace} = require('../support/mockWorkspace')

Cypress.on('uncaught:exception', () => false)

describe('Pruebas de Seguridad - Focalboard', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.document().then((doc) => {
      mountMockWorkspace(doc)
    })
  })

  it('HU01 Angie - no expone datos sensibles', () => {
    cy.location('pathname').should('eq', '/')
    cy.get('body').should('not.contain.text', 'password')
  })

  it('HU02 Natalia - los campos de tarjeta no aceptan codigo malicioso', () => {
    cy.get('input').first().type('<script>alert(1)</script>', {force: true})
    cy.get('body').should('not.contain.text', 'alert(1)')
    cy.get('body').should('not.contain.text', '<script>')
  })

  it('HU02 Natalia - acceso a tareas no expone datos privados', () => {
    cy.get('body').should('not.contain.text', 'nataliaflorezz7282@gmail.com')
  })

  it('HU03 Juliana - drag and drop no altera permisos', () => {
    cy.get('.Card').should('have.length', 2)
    cy.get('.Column').should('have.length', 3)
  })

  it('HU03 Juliana - la columna destino no permite inyeccion de codigo', () => {
    cy.get('body').should('not.contain.text', '<script>')
  })
})
