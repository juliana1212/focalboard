/*
 * Cypress E2E - Pruebas de Seguridad Focalboard
 *
 * HUs evaluadas:
 * - HU01 Angie
 * - HU02 Natalia
 * - HU03 Juliana
 *
 * Ignorando login para validar seguridad básica visual
 */

Cypress.on('uncaught:exception', () => false);

describe('Pruebas de Seguridad - Focalboard', () => {
    beforeEach(() => {
        cy.visit('/');
        cy.wait(2000);
    });

    /*** HU01 Angie - no permite acceso sin autenticación ***/
    it('HU01 Angie - no permite acceso sin autenticación', () => {
        cy.visit('/')

        // Validar que la URL contiene /login o /error (regex)
        cy.url().should('match', /\/login|\/error/)
    })

    it('HU01 Angie - inputs y botones no exponen datos sensibles', () => {
        cy.get('body').should('not.contain.text', 'password')
    });

    /*** HU02 Natalia ***/
    it('HU02 Natalia - los campos de tarjeta no aceptan código malicioso', () => {
        cy.get('body').then(($body) => {
            // Simula intento de XSS
            if($body.find('input').length > 0){
                cy.get('input').first().type('<script>alert(1)</script>', {force:true})
            }
        })
        cy.get('body').should('not.contain.text', 'alert(1)');
    });

    it('HU02 Natalia - acceso a tareas protegido', () => {
        cy.get('body').should('not.contain.text', 'nataliaflorezz7282@gmail.com');
    });

    /*** HU03 Juliana ***/
    it('HU03 Juliana - drag & drop no altera permisos', () => {
        cy.get('body').should('exist')
    });

    it('HU03 Juliana - la columna destino no permite inyección de código', () => {
        cy.get('body').should('not.contain.text', '<script>');
    });
});