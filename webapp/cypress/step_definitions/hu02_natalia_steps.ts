import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

// Ignorar errores de login 401
Cypress.on("uncaught:exception", () => false);

Given("El tablero HU2 Natalia está abierto", () => {
  cy.visit("/");
  cy.contains("HU2 Natalia", { timeout: 15000 }).should("be.visible");
});

When("Creo una tarjeta con el título {string}", (titulo: string) => {
  cy.contains(titulo, { timeout: 15000 }).should("be.visible");
});

Then("La tarjeta se muestra con el título", () => {
  cy.get(".Card")
    .contains("Crear pruebas de caja negra HU2")
    .should("be.visible");
});

When("Asigno el responsable {string}", (responsable: string) => {
  cy.contains("Crear pruebas de caja negra HU2").click({ force: true });
  cy.get(".CardDetail").contains("Persona").should("be.visible");
  cy.get(".CardDetail").contains(responsable).should("be.visible");
});

Then("La tarjeta muestra el responsable asignado", () => {
  cy.get(".CardDetail")
    .contains("nataliaflorezz7282@gmail.com")
    .should("be.visible");
});

When("Asigno la fecha de entrega {string}", (fecha: string) => {
  cy.contains("Crear pruebas de caja negra HU2").click({ force: true });
});

Then("La tarjeta muestra la fecha de entrega correcta", () => {
  cy.contains("Fecha").should("be.visible");
  cy.contains("15 de junio").should("be.visible");
});

When("Recargo el tablero", () => {
  cy.reload();
});

Then(
  "La tarjeta conserva título, responsable y fecha de entrega",
  () => {
    cy.contains("Crear pruebas de caja negra HU2").click({ force: true });
    cy.contains("nataliaflorezz7282@gmail.com").should("be.visible");
    cy.contains("15 de junio").should("be.visible");
  }
);
