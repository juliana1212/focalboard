// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/*
 * Pruebas unitarias frontend - HU01 Angie
 * Historia de usuario:
 * Como usuario de un equipo, quiero crear un tablero nuevo con columnas predefinidas
 * para organizar mis tareas, de manera que pueda iniciar un proyecto rápidamente.
 *
 * Archivo analizado:
 * webapp/src/mutator.ts
 *
 * Método analizado:
 * addEmptyBoard()
 *
 * Caminos cubiertos:
 * P1: Creación exitosa con afterRedo definido.
 * P2: Creación exitosa sin afterRedo definido.
 * P3: Error durante createBoardsAndBlocks().
 */

import mutator from './mutator'
import {TestBlockFactory} from './test/testBlockFactory'
import 'isomorphic-fetch'
import {FetchMock} from './test/fetchMock'
import {mockDOM} from './testUtils'

global.fetch = FetchMock.fn

beforeEach(() => {
    FetchMock.fn.mockReset()
})

beforeAll(() => {
    mockDOM()
})

const intlMock = {
    formatMessage: ({defaultMessage}: {id: string, defaultMessage: string}) => defaultMessage,
} as any

describe('HU01 Angie - Crear tablero con columnas predefinidas - Frontend', () => {
    test('PU-HU01F-01 - P1 - creación exitosa de tablero con afterRedo definido', async () => {
        /*
         * Objetivo:
         * Validar el camino P1 del grafo de flujo de control.
         *
         * Camino P1:
         * N1-N2-N3-N4-N5-N6-N7-N8-N9-N10-N11-N12-N15
         *
         * Este camino representa el flujo exitoso donde:
         * 1. Se crea el tablero.
         * 2. Se crea la vista asociada.
         * 3. Se ejecuta createBoardsAndBlocks().
         * 4. No ocurre error.
         * 5. Se obtiene el tablero creado.
         * 6. Existe afterRedo.
         * 7. Se ejecuta afterRedo con el id del tablero creado.
         */

        const teamId = 'team-hu01-angie'
        const afterRedo = jest.fn()
        const beforeUndo = jest.fn()

        const board = TestBlockFactory.createBoard()
        board.id = 'board-hu01-angie-p1'
        board.teamId = teamId

        const view = TestBlockFactory.createBoardView(board)
        view.id = 'view-hu01-angie-p1'
        view.boardId = board.id
        view.parentId = board.id

        const response = {
            boards: [board],
            blocks: [view],
        }

        FetchMock.fn.mockReturnValueOnce(
            FetchMock.jsonResponse(JSON.stringify(response)),
        )

        const result = await mutator.addEmptyBoard(
            teamId,
            intlMock,
            afterRedo,
            beforeUndo,
        )

        expect(FetchMock.fn).toBeCalledTimes(1)
        expect(result.boards).toHaveLength(1)
        expect(result.blocks).toHaveLength(1)
        expect(result.boards[0].id).toBe('board-hu01-angie-p1')
        expect(result.boards[0].teamId).toBe(teamId)
        expect(afterRedo).toBeCalledTimes(1)
        expect(afterRedo).toBeCalledWith('board-hu01-angie-p1')
    })

    test('PU-HU01F-02 - P2 - creación exitosa de tablero sin afterRedo definido', async () => {
        /*
         * Objetivo:
         * Validar el camino P2 del grafo de flujo de control.
         *
         * Camino P2:
         * N1-N2-N3-N4-N5-N6-N7-N8-N9-N10-N11-N13-N15
         *
         * Este camino representa el flujo exitoso donde:
         * 1. Se crea el tablero.
         * 2. Se crea la vista asociada.
         * 3. Se ejecuta createBoardsAndBlocks().
         * 4. No ocurre error.
         * 5. Se obtiene el tablero creado.
         * 6. No existe afterRedo.
         * 7. El flujo finaliza sin ejecutar acción posterior.
         */

        const teamId = 'team-hu01-angie'

        const board = TestBlockFactory.createBoard()
        board.id = 'board-hu01-angie-p2'
        board.teamId = teamId

        const view = TestBlockFactory.createBoardView(board)
        view.id = 'view-hu01-angie-p2'
        view.boardId = board.id
        view.parentId = board.id

        const response = {
            boards: [board],
            blocks: [view],
        }

        FetchMock.fn.mockReturnValueOnce(
            FetchMock.jsonResponse(JSON.stringify(response)),
        )

        const result = await mutator.addEmptyBoard(
            teamId,
            intlMock,
        )

        expect(FetchMock.fn).toBeCalledTimes(1)
        expect(result.boards).toHaveLength(1)
        expect(result.blocks).toHaveLength(1)
        expect(result.boards[0].id).toBe('board-hu01-angie-p2')
        expect(result.boards[0].teamId).toBe(teamId)
    })

    test('PU-HU01F-03 - P3 - error durante createBoardsAndBlocks', async () => {
        /*
         * Objetivo:
         * Validar el camino P3 del grafo de flujo de control.
         *
         * Camino P3:
         * N1-N2-N3-N4-N5-N6-N7-N8-N14-N15
         *
         * Este camino representa el flujo alternativo donde:
         * 1. Se inicia la creación del tablero.
         * 2. Se crea el objeto board.
         * 3. Se crea la vista asociada.
         * 4. Se llama createBoardsAndBlocks().
         * 5. Ocurre un error durante la creación.
         * 6. El error se propaga hacia el flujo superior.
         */

        const teamId = 'team-hu01-angie'
        const afterRedo = jest.fn()

        FetchMock.fn.mockRejectedValueOnce(
            new Error('Error simulado durante createBoardsAndBlocks'),
        )

        await expect(
            mutator.addEmptyBoard(
                teamId,
                intlMock,
                afterRedo,
            ),
        ).rejects.toThrow('Error simulado durante createBoardsAndBlocks')

        expect(FetchMock.fn).toBeCalledTimes(1)
        expect(afterRedo).not.toBeCalled()
    })
})