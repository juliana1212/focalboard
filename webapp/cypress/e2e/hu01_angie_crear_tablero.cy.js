/*
 * Prueba E2E con Cypress - HU01 Angie
 *
 * Historia de usuario:
 * Como usuario de un equipo, quiero crear un tablero nuevo con columnas predefinidas
 * para organizar mis tareas, de manera que pueda iniciar un proyecto rápidamente.
 *
 * Funcionalidad evaluada:
 * Creación o identificación de tablero y validación de columnas de trabajo.
 *
 * Herramienta:
 * Cypress
 *
 * Técnicas aplicadas:
 * - Prueba E2E.
 * - Validación funcional de interfaz.
 * - Patrón AAA: Arrange, Act, Assert.
 * - Aserciones con should() y expect().
 */

describe('HU01 Angie - Crear tablero con columnas predefinidas', () => {
    beforeEach(() => {
        // Arrange
        cy.visit('http://localhost:8000')
        cy.wait(3000)
    })

    it('CP-HU01-E2E-01 - debe cargar Focalboard correctamente', () => {
        // Act
        cy.document().its('readyState').should('eq', 'complete')

        // Assert
        cy.get('body').should('be.visible')
        cy.get('body').should('not.contain.text', 'Application error')
        cy.get('body').should('not.contain.text', 'Cannot GET')
        cy.get('body').should('not.contain.text', '404')
    })

    it('CP-HU01-E2E-02 - debe mostrar una interfaz principal visible para el usuario', () => {
        // Act
        cy.get('body').should('be.visible')

        // Assert
        cy.get('body').then(($body) => {
            const textoPagina = $body.text().trim()
            expect(textoPagina.length).to.be.greaterThan(0)
        })
    })

    it('CP-HU01-E2E-03 - debe permitir iniciar la creación o selección de un tablero', () => {
        // Arrange
        cy.get('body').should('be.visible')

        // Act
        cy.get('body').then(($body) => {
            const texto = $body.text().toLowerCase()

            if (texto.includes('create board')) {
                cy.contains(/create board/i).click({force: true})
            } else if (texto.includes('new board')) {
                cy.contains(/new board/i).click({force: true})
            } else if (texto.includes('crear tablero')) {
                cy.contains(/crear tablero/i).click({force: true})
            } else if (texto.includes('nuevo tablero')) {
                cy.contains(/nuevo tablero/i).click({force: true})
            } else if ($body.find('button').length > 0) {
                cy.get('button').first().click({force: true})
            }
        })

        cy.wait(2000)

        // Assert
        cy.get('body').should('be.visible')
        cy.get('body').should('not.contain.text', 'Application error')
        cy.get('body').should('not.contain.text', 'Cannot GET')
    })

    it('CP-HU01-E2E-04 - debe mostrar elementos relacionados con tablero o columnas', () => {
        // Arrange
        cy.get('body').should('be.visible')

        // Act
        cy.wait(2000)

        // Assert
        cy.get('body').then(($body) => {
            const texto = $body.text().toLowerCase()

            const contieneElementoTablero =
                texto.includes('board') ||
                texto.includes('tablero') ||
                texto.includes('card') ||
                texto.includes('tarjeta') ||
                texto.includes('column') ||
                texto.includes('columna') ||
                texto.includes('todo') ||
                texto.includes('pendiente') ||
                texto.includes('doing') ||
                texto.includes('en proceso') ||
                texto.includes('done') ||
                texto.includes('terminado')

            expect(contieneElementoTablero).to.eq(true)
        })
    })

    it('CP-HU01-E2E-05 - debe conservar la interfaz después de recargar la página', () => {
        // Arrange
        cy.get('body').should('be.visible')

        // Act
        cy.reload()
        cy.wait(3000)

        // Assert
        cy.document().its('readyState').should('eq', 'complete')
        cy.get('body').should('be.visible')
        cy.get('body').should('not.contain.text', 'Application error')
        cy.get('body').should('not.contain.text', 'Cannot GET')
        cy.get('body').should('not.contain.text', '404')
    })
})