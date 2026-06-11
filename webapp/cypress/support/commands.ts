// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import 'cypress-axe'

Cypress.Commands.add('injectAxePage', () => cy.injectAxe())

type CheckA11yContext = string | Node | import('axe-core').ContextObject | undefined
type CheckA11yOptions = import('cypress-axe').Options | undefined

Cypress.Commands.add(
    'checkA11yPage',
    (context: CheckA11yContext = undefined, options: CheckA11yOptions = undefined) =>
        cy.checkA11y(context, options),
)
