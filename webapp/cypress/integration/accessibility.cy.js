const {mountMockWorkspace} = require('../support/mockWorkspace')

Cypress.on('uncaught:exception', () => false)

describe('Pruebas de accesibilidad - Focalboard', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.document().then((doc) => {
      mountMockWorkspace(doc)
    })
  })

  it('HU01 Angie - columnas visibles y accesibles', () => {
    cy.get('.Workspace').should('be.visible')
    cy.get('.Column').should('have.length', 3)
    cy.contains('Pendientes').should('be.visible')
    cy.contains('En progreso').should('be.visible')
    cy.contains('Terminadas').should('be.visible')
  })

  it('HU02 Natalia - tarjeta con responsable y fecha', () => {
    cy.get('.CardDetail').should('be.visible')
    cy.contains('Crear pruebas de caja negra HU2').should('be.visible')
    cy.contains('nataliaflorezz7282@gmail.com').should('be.visible')
    cy.contains('15 de junio').should('be.visible')
  })

  it('HU03 Juliana - tarjetas visibles y navegables', () => {
    cy.get('.Card').should('have.length', 2)
    cy.contains('HU03 Juliana').should('be.visible')
    cy.get('button').should('have.length.at.least', 3)
    cy.get('input').should('have.attr', 'aria-label', 'workspace search')
  })
})
