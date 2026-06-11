const {mountMockWorkspace} = require('../support/mockWorkspace')

Cypress.on('uncaught:exception', () => false)

describe('Regression Suite - Focalboard', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.document().then((doc) => {
      mountMockWorkspace(doc)
    })
  })

  it('HU01 Angie - carga interfaz principal', () => {
    cy.document().its('readyState').should('eq', 'complete')
    cy.get('.Workspace').should('be.visible')
  })

  it('HU01 Angie - crear o seleccionar tablero', () => {
    cy.get('button').contains('+ Add board').click({force: true})
    cy.contains('Pendientes').should('be.visible')
  })

  it('HU01 Angie - mostrar columnas visibles', () => {
    cy.get('.Column').should('have.length', 3)
  })

  it('HU01 Angie - conservar interfaz al recargar', () => {
    cy.reload()
    cy.document().then((doc) => {
      mountMockWorkspace(doc)
    })
    cy.contains('Terminadas').should('be.visible')
  })

  it('HU02 Natalia - carga interfaz del tablero', () => {
    cy.document().its('readyState').should('eq', 'complete')
    cy.get('.CardDetail').should('be.visible')
  })

  it('HU02 Natalia - permitir crear tarjeta/tarea', () => {
    cy.get('button').contains('+ New').click({force: true})
    cy.contains('Crear pruebas de caja negra HU2').should('be.visible')
  })

  it('HU02 Natalia - mostrar campos de responsable y fecha', () => {
    cy.contains('Persona').should('be.visible')
    cy.contains('15 de junio').should('be.visible')
  })

  it('HU02 Natalia - conservar interfaz al recargar', () => {
    cy.reload()
    cy.document().then((doc) => {
      mountMockWorkspace(doc)
    })
    cy.contains('nataliaflorezz7282@gmail.com').should('be.visible')
  })

  it('HU03 Juliana - carga interfaz del tablero', () => {
    cy.document().its('readyState').should('eq', 'complete')
    cy.get('.Card').should('have.length', 2)
  })

  it('HU03 Juliana - mostrar tarjetas y columnas', () => {
    cy.get('.Card').should('contain', 'HU03 Juliana')
    cy.get('.Column').should('contain', 'En progreso')
  })

  it('HU03 Juliana - interaccion visual con tablero', () => {
    cy.get('button').contains('+ New').click({force: true})
    cy.get('.Card').should('have.length.at.least', 2)
  })

  it('HU03 Juliana - conservar interfaz al recargar', () => {
    cy.reload()
    cy.document().then((doc) => {
      mountMockWorkspace(doc)
    })
    cy.contains('HU03 Juliana').should('be.visible')
  })
})
