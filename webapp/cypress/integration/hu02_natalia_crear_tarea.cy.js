const {mountMockWorkspace} = require('../support/mockWorkspace')

Cypress.on('uncaught:exception', () => false)

describe('HU02 Natalia - Crear tarjetas/tareas', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.document().then((doc) => {
      mountMockWorkspace(doc)
    })
  })

  it('CP-HU02-E2E-01 - carga interfaz del tablero', () => {
    cy.document().its('readyState').should('eq', 'complete')
    cy.get('.CardDetail').should('be.visible')
  })

  it('CP-HU02-E2E-02 - permitir crear una tarjeta/tarea', () => {
    cy.get('button').contains('+ New').click({force: true})
    cy.contains('Crear pruebas de caja negra HU2').should('be.visible')
  })

  it('CP-HU02-E2E-03 - mostrar campos de responsable y fecha', () => {
    cy.contains('Persona').should('be.visible')
    cy.contains('15 de junio').should('be.visible')
  })

  it('CP-HU02-E2E-04 - conservar interfaz al recargar', () => {
    cy.reload()
    cy.document().then((doc) => {
      mountMockWorkspace(doc)
    })
    cy.contains('nataliaflorezz7282@gmail.com').should('be.visible')
  })
})
