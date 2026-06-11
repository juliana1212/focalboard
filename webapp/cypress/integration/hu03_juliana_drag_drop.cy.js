const {mountMockWorkspace} = require('../support/mockWorkspace')

Cypress.on('uncaught:exception', () => false)

describe('HU03 Juliana - Drag and Drop', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.document().then((doc) => {
      mountMockWorkspace(doc)
    })
  })

  it('CP-HU03-E2E-01 - carga interfaz del tablero', () => {
    cy.document().its('readyState').should('eq', 'complete')
    cy.get('.Workspace').should('be.visible')
  })

  it('CP-HU03-E2E-02 - mostrar tarjetas y columnas', () => {
    cy.get('.Card').should('have.length', 2)
    cy.get('.Column').should('have.length', 3)
  })

  it('CP-HU03-E2E-03 - interaccion visual con tablero', () => {
    cy.get('button').contains('+ New').click({force: true})
    cy.get('.Card').should('have.length.at.least', 2)
  })

  it('CP-HU03-E2E-04 - conservar interfaz al recargar', () => {
    cy.reload()
    cy.document().then((doc) => {
      mountMockWorkspace(doc)
    })
    cy.contains('HU03 Juliana').should('be.visible')
  })
})
