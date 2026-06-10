import "cypress-axe";

Cypress.Commands.add("injectAxePage", () => cy.injectAxe());
Cypress.Commands.add("checkA11yPage", (context = undefined, options = undefined) =>
  cy.checkA11y(context, options)
);