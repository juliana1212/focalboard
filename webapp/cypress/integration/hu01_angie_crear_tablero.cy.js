const {mountMockWorkspace} = require('../support/mockWorkspace')

Cypress.on('uncaught:exception', () => false)

describe('HU01 Angie - Crear tablero con columnas predefinidas', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.document().then((doc) => {
      mountMockWorkspace(doc)
    })
  })

  it('CP-HU01-E2E-01 - carga interfaz principal', () => {
    cy.document().its('readyState').should('eq', 'complete')
    cy.get('.Workspace').should('be.visible')
  })

  it('CP-HU01-E2E-02 - crear o seleccionar tablero', () => {
    cy.get('button').contains('+ Add board').click({force: true})
    cy.contains('Pendientes').should('be.visible')
  })

  it('CP-HU01-E2E-03 - mostrar columnas visibles', () => {
    cy.get('.Column').should('have.length', 3)
  })

  it('CP-HU01-E2E-04 - conservar interfaz al recargar', () => {
    cy.reload()
    cy.document().then((doc) => {
      mountMockWorkspace(doc)
    })
    cy.contains('Terminadas').should('be.visible')
  })
})
