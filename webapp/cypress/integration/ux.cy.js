const {mountMockWorkspace} = require('../support/mockWorkspace')

Cypress.on('uncaught:exception', () => false)

describe('Pruebas UX - Focalboard', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.document().then((doc) => {
      mountMockWorkspace(doc)
    })
  })

  it('HU01 Angie - Columnas y botones visibles', () => {
    cy.contains('Pendientes').should('be.visible')
    cy.contains('En progreso').should('be.visible')
    cy.contains('Terminadas').should('be.visible')
    cy.get('.Column').its('length').should('eq', 3)
    cy.get('button').should('have.length.at.least', 3)
  })

  it('HU02 Natalia - Tarjeta con responsable y fecha', () => {
    cy.get('.CardDetail').should('be.visible')
    cy.contains('Crear pruebas de caja negra HU2').should('be.visible')
    cy.get('.CardDetail').contains('Persona').should('be.visible')
    cy.contains('nataliaflorezz7282@gmail.com').should('be.visible')
    cy.get('.CardDetail').contains('15 de junio').should('be.visible')
  })

  it('HU03 Juliana - Drag & Drop visual', () => {
    cy.get('.Card').should('have.length', 2)
    cy.get('.Column').eq(1).should('contain', 'En progreso')
  })
})
