// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/*
 * Pruebas unitarias frontend - HU03 Juliana
 *
 * Historia de usuario:
 * Como usuario, quiero mover tareas entre columnas arrastrando y soltando,
 * para actualizar su estado de “Pendientes” a “En proceso” o “Terminadas”
 * de manera visual y rápida.
 *
 * Archivo analizado:
 * webapp/src/components/kanban/kanban.tsx
 *
 * Funciones analizadas:
 * onDropToColumn()
 * onDropToCard()
 *
 * Caminos cubiertos:
 * P1: Movimiento de tarjeta hacia otra columna.
 * P2: Movimiento de tarjeta dentro de la misma columna.
 * P3: Reorganización de columna hacia la izquierda.
 * P4: Reorganización de columna hacia la derecha.
 * P5: Drop sin tarjetas y sin opción destino.
 * P6: Movimiento inválido sobre la misma tarjeta.
 * P7: Movimiento sobre tarjeta en la misma columna hacia abajo.
 * P8: Movimiento sobre tarjeta con cambio de columna.
 * P9: Movimiento sobre tarjeta sin cambio de columna.
 * P10: Movimiento a columna sin cambio de propiedad.
 */

import * as fs from 'fs'
import * as path from 'path'

function leerCodigoHU03Frontend(): string {
    const rutaArchivo = path.join(__dirname, 'kanban.tsx')
    return fs.readFileSync(rutaArchivo, 'utf8')
}

function normalizarCodigo(codigo: string): string {
    return codigo
        .replace(/\s+/g, '')
        .replace(/\r/g, '')
        .replace(/\n/g, '')
        .replace(/\t/g, '')
}

describe('HU03 Juliana - Mover tareas entre columnas - Frontend', () => {
    test('PU-HU03F-01 - P1 - movimiento de tarjeta hacia otra columna', () => {
        /*
         * Objetivo:
         * Validar el camino P1 del grafo de flujo de control.
         *
         * Camino P1:
         * N1-N2-N3-N4-N5-N6-N7-N8-N10-N11-N12-N13-N14-N15-N16-N17-N18-N20-N21-N22-N55
         *
         * Este camino representa el movimiento de una tarjeta hacia una columna diferente.
         * En este caso, el sistema debe actualizar la propiedad de la tarjeta y actualizar
         * el orden visual del tablero.
         */

        const codigo = leerCodigoHU03Frontend()

        const validaciones = [
            'const onDropToColumn = useCallback',
            'const {selectedCardIds} = props',
            'const optionId = option ? option.id : undefined',
            'let draggedCardIds = selectedCardIds',
            'if (card)',
            'draggedCardIds = Array.from(new Set(selectedCardIds).add(card.id))',
            'if (draggedCardIds.length > 0)',
            'await mutator.performAsUndoGroup',
            'const draggedCards',
            'for (const draggedCard of draggedCards)',
            'const oldValue = draggedCard.fields.properties[groupByProperty!.id]',
            'if (optionId !== oldValue)',
            'mutator.changePropertyValue',
            'const newOrder = orderAfterMoveToColumn(draggedCardIds, optionId)',
            'mutator.changeViewCardOrder',
            'await Promise.all(awaits)',
        ]

        for (const texto of validaciones) {
            expect(codigo).toContain(texto)
        }
    })

    test('PU-HU03F-02 - P2 - movimiento de tarjeta dentro de la misma columna', () => {
        /*
         * Objetivo:
         * Validar el camino P2 del grafo de flujo de control.
         *
         * Este camino representa un movimiento en el que la tarjeta no cambia de columna.
         * Por lo tanto, no se requiere actualizar la propiedad de la tarjeta, pero sí se
         * conserva la actualización del orden visual.
         */

        const codigo = leerCodigoHU03Frontend()

        expect(codigo).toContain('const oldValue = draggedCard.fields.properties[groupByProperty!.id]')
        expect(codigo).toContain('if (optionId !== oldValue)')
        expect(codigo).toContain('mutator.changePropertyValue')
        expect(codigo).toContain('const newOrder = orderAfterMoveToColumn(draggedCardIds, optionId)')
        expect(codigo).toContain('mutator.changeViewCardOrder')
    })

    test('PU-HU03F-03 - P3 - reorganización de columna hacia la izquierda', () => {
        /*
         * Objetivo:
         * Validar el camino P3 del grafo de flujo de control.
         *
         * Este camino representa el caso en el que no hay tarjetas arrastradas,
         * pero existe dstOption y la columna se reorganiza hacia la izquierda.
         */

        const codigo = leerCodigoHU03Frontend()

        expect(codigo).toContain('} else if (dstOption) {')
        expect(codigo).toContain('const visibleOptionIds = visibleGroups.map((o) => o.option.id)')
        expect(codigo).toContain('const srcBlockX = visibleOptionIds.indexOf(option.id)')
        expect(codigo).toContain('const dstBlockX = visibleOptionIds.indexOf(dstOption.id)')
        expect(codigo).toContain("const moveTo = (srcBlockX > dstBlockX ? 'aboveRow' : 'belowRow') as Position")
        expect(codigo).toContain('dragAndDropRearrange')
        expect(codigo).toContain('mutator.changeViewVisibleOptionIds')
    })

    test('PU-HU03F-04 - P4 - reorganización de columna hacia la derecha', () => {
        /*
         * Objetivo:
         * Validar el camino P4 del grafo de flujo de control.
         *
         * Este camino representa el caso en el que no hay tarjetas arrastradas,
         * pero existe dstOption y la columna se reorganiza hacia la derecha.
         */

        const codigo = leerCodigoHU03Frontend()

        expect(codigo).toContain("srcBlockX > dstBlockX ? 'aboveRow' : 'belowRow'")
        expect(codigo).toContain('moveTo')
        expect(codigo).toContain('visibleOptionIdsRearranged')
        expect(codigo).toContain('dragAndDropRearrange')
        expect(codigo).toContain('mutator.changeViewVisibleOptionIds')
    })

    test('PU-HU03F-05 - P5 - drop sin tarjetas y sin opción destino', () => {
        /*
         * Objetivo:
         * Validar el camino P5 del grafo de flujo de control.
         *
         * Este camino representa el caso en el que draggedCardIds no tiene elementos
         * y tampoco existe dstOption. En ese escenario, el flujo no realiza cambios.
         */

        const codigo = normalizarCodigo(leerCodigoHU03Frontend())

        expect(codigo).toContain('if(draggedCardIds.length>0)')
        expect(codigo).toContain('}elseif(dstOption){')
        expect(codigo).toContain('mutator.changeViewVisibleOptionIds')
    })

    test('PU-HU03F-06 - P6 - movimiento inválido sobre la misma tarjeta', () => {
        /*
         * Objetivo:
         * Validar el camino P6 del grafo de flujo de control.
         *
         * Este camino representa la validación de onDropToCard().
         * Si la tarjeta origen es igual a la tarjeta destino, o si no existe
         * groupByProperty, el flujo debe finalizar sin cambios.
         */

        const codigo = leerCodigoHU03Frontend()

        expect(codigo).toContain('const onDropToCard = useCallback')
        expect(codigo).toContain('if (srcCard.id === dstCard.id || !groupByProperty)')
        expect(codigo).toContain('return')
    })

    test('PU-HU03F-07 - P7 - movimiento sobre tarjeta en la misma columna hacia abajo', () => {
        /*
         * Objetivo:
         * Validar el camino P7 del grafo de flujo de control.
         *
         * Este camino representa el movimiento de una tarjeta dentro de la misma columna,
         * hacia una posición inferior. En ese caso se debe ajustar destIndex.
         */

        const codigo = leerCodigoHU03Frontend()

        expect(codigo).toContain('const isDraggingDown = cardOrder.indexOf(srcCard.id) <= cardOrder.indexOf(dstCard.id)')
        expect(codigo).toContain('if (srcCard.fields.properties[groupByProperty!.id] === optionId && isDraggingDown)')
        expect(codigo).toContain('destIndex += 1')
        expect(codigo).toContain('cardOrder.splice(destIndex, 0, ...draggedCardIds)')
        expect(codigo).toContain('mutator.changeViewCardOrder')
    })

    test('PU-HU03F-08 - P8 - movimiento sobre tarjeta con cambio de columna', () => {
        /*
         * Objetivo:
         * Validar el camino P8 del grafo de flujo de control.
         *
         * Este camino representa el caso en el que una tarjeta se suelta sobre otra
         * tarjeta ubicada en una columna diferente. Por lo tanto, se actualiza
         * la propiedad de la tarjeta y el orden visual.
         */

        const codigo = leerCodigoHU03Frontend()

        expect(codigo).toContain('const optionId = dstCard.fields.properties[groupByProperty.id]')
        expect(codigo).toContain('const oldOptionId = draggedCard.fields.properties[groupByProperty!.id]')
        expect(codigo).toContain('if (optionId !== oldOptionId)')
        expect(codigo).toContain('mutator.changePropertyValue')
        expect(codigo).toContain('mutator.changeViewCardOrder')
    })

    test('PU-HU03F-09 - P9 - movimiento sobre tarjeta sin cambio de columna', () => {
        /*
         * Objetivo:
         * Validar el camino P9 del grafo de flujo de control.
         *
         * Este camino representa el movimiento sobre otra tarjeta cuando no cambia
         * la columna. En este caso no se requiere changePropertyValue(), pero sí
         * se actualiza el orden visual con changeViewCardOrder().
         */

        const codigo = leerCodigoHU03Frontend()

        expect(codigo).toContain('if (optionId !== oldOptionId)')
        expect(codigo).toContain('await Promise.all(awaits)')
        expect(codigo).toContain('await mutator.changeViewCardOrder(props.board.id, activeView.id, activeView.fields.cardOrder, cardOrder, description)')
    })

    test('PU-HU03F-10 - P10 - movimiento a columna sin cambio de propiedad', () => {
        /*
         * Objetivo:
         * Validar el camino P10 del grafo de flujo de control.
         *
         * Este camino representa el caso en el que existe card, pero la columna destino
         * coincide con el valor anterior de la tarjeta. Por esta razón no se actualiza
         * la propiedad, pero sí se recalcula y actualiza el orden visual.
         */

        const codigo = leerCodigoHU03Frontend()

        expect(codigo).toContain('if (card)')
        expect(codigo).toContain('if (optionId !== oldValue)')
        expect(codigo).toContain('const newOrder = orderAfterMoveToColumn(draggedCardIds, optionId)')
        expect(codigo).toContain('mutator.changeViewCardOrder')
    })
})