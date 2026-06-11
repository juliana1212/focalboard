// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {render, act} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import {mocked} from 'jest-mock'
import {Provider as ReduxProvider} from 'react-redux'

import {mockDOM, mockStateStore, wrapDNDIntl} from '../testUtils'
import {TestBlockFactory} from '../test/testBlockFactory'
import {IPropertyTemplate} from '../blocks/board'
import {Utils} from '../utils'
import Mutator from '../mutator'
import octoClient from '../octoClient'
import {Constants} from '../constants'
import {IUser} from '../user'
import {Block} from '../blocks/block'
import {Card} from '../blocks/card'
import {UserSettings} from '../userSettings'

import CenterPanel from './centerPanel'

Object.defineProperty(Constants, 'versionString', {value: '1.0.0'})

jest.mock('react-router-dom', () => {
    const originalModule = jest.requireActual('react-router-dom')

    return {
        ...originalModule,
        useRouteMatch: jest.fn(() => {
            return {url: '/board/view'}
        }),
    }
})

jest.mock('../utils')
jest.mock('../octoClient')
jest.mock('../mutator')
jest.mock('../telemetry/telemetryClient')
jest.mock('draft-js/lib/generateRandomKey', () => () => '123')

const mockedUtils = mocked(Utils, true)
const mockedMutator = mocked(Mutator, true)
const mockedOctoClient = mocked(octoClient, true)

mockedUtils.createGuid.mockReturnValue('test-id')
mockedUtils.generateClassName = jest.requireActual('../utils').Utils.generateClassName

describe('HU02 Natalia - Frontend - addCard()', () => {
    const board = TestBlockFactory.createBoard()
    board.id = 'board-hu02'
    board.teamId = 'team-hu02'

    const activeView = TestBlockFactory.createBoardView(board)
    activeView.id = 'view-hu02'
    activeView.fields.cardOrder = ['card1', 'card2']

    const card1 = TestBlockFactory.createCard(board)
    card1.id = 'card1'
    card1.title = 'card1'
    card1.fields.properties = {property1: 'value1'}

    const card2 = TestBlockFactory.createCard(board)
    card2.id = 'card2'
    card2.title = 'card2'
    card2.fields.properties = {property1: 'value1'}

    const groupProperty: IPropertyTemplate = {
        id: 'property1',
        name: 'Pendientes',
        type: 'select',
        options: [
            {
                color: 'propColorBlue',
                id: 'pendientes',
                value: 'Pendientes',
            },
        ],
    }

    const state = {
        clientConfig: {
            value: {},
        },
        searchText: '',
        users: {
            me: {
                id: 'user_id_1',
            },
            myConfig: {
                onboardingTourStarted: {value: false},
            },
            boardUsers: {
                'user-id-1': {username: 'natalia'},
            },
            blockSubscriptions: [],
        },
        teams: {
            current: {id: 'team-hu02'},
        },
        boards: {
            current: board.id,
            boards: {
                [board.id]: board,
            },
            templates: [],
            myBoardMemberships: {
                [board.id]: {userId: 'user_id_1', schemeAdmin: true},
            },
        },
        limits: {
            limits: {
                cards: 0,
                used_cards: 0,
                card_limit_timestamp: 0,
                views: 0,
            },
        },
        cards: {
            templates: [],
            cards: [card1, card2],
            current: card1.id,
        },
        views: {
            views: {
                [activeView.id]: activeView,
            },
            current: activeView.id,
        },
        contents: {
            contents: [],
            contentsByCard: {},
        },
        comments: {
            comments: [],
            commentsByCard: {},
        },
    }

    const store = mockStateStore([], state)

    beforeAll(() => {
        mockDOM()
        console.error = jest.fn()
    })

    beforeEach(() => {
        // Arrange general
        jest.clearAllMocks()

        activeView.fields.viewType = 'board'
        activeView.fields.groupById = groupProperty.id
        activeView.fields.cardOrder = ['card1', 'card2']

        board.cardProperties = [groupProperty]

        UserSettings.prefillRandomIcons = false

        mockedOctoClient.searchTeamUsers.mockResolvedValue(Object.values(state.users.boardUsers) as IUser[])

        mockedMutator.performAsUndoGroup.mockImplementation(async (callback: () => Promise<void>) => {
            await callback()
        })

        mockedMutator.insertBlock.mockImplementation(async (...args: any[]) => {
            const block = args[1] as Block
            const afterRedo = args[3] as ((block: Block) => Promise<void>) | undefined

            const newCard = {
                ...block,
                id: 'new-card-hu02',
            } as Card

            if (afterRedo) {
                await afterRedo(newCard)
            }

            return newCard
        })

        mockedMutator.changeViewCardOrder.mockResolvedValue()
    })

    function renderCenterPanel(showCard = jest.fn(), groupByProperty: IPropertyTemplate | undefined = groupProperty) {
        return render(wrapDNDIntl(
            <ReduxProvider store={store}>
                <CenterPanel
                    cards={[card1, card2]}
                    views={[activeView]}
                    board={board}
                    activeView={activeView}
                    readonly={false}
                    showCard={showCard}
                    groupByProperty={groupByProperty}
                    shownCardId={card1.id}
                    hiddenCardsCount={0}
                />
            </ReduxProvider>,
        ))
    }

    test('PU-HU02F-01 - P1 - crea tarjeta en grupo con apertura automática', async () => {
        // Arrange
        activeView.fields.viewType = 'board'
        const showCard = jest.fn()
        const {container} = renderCenterPanel(showCard)

        const buttonWithMenuElement = container.querySelector('.ButtonWithMenu')
        expect(buttonWithMenuElement).not.toBeNull()

        // Act
        await act(async () => {
            userEvent.click(buttonWithMenuElement!)
        })

        // Assert
        expect(mockedMutator.performAsUndoGroup).toHaveBeenCalledTimes(1)
        expect(mockedMutator.insertBlock).toHaveBeenCalledTimes(1)
        expect(mockedMutator.changeViewCardOrder).toHaveBeenCalledTimes(1)
    })

    test('PU-HU02F-02 - P2 - crea tarjeta en grupo sin apertura automática', async () => {
        // Arrange
        activeView.fields.viewType = 'table'
        const {container} = renderCenterPanel()

        const buttonWithMenuElement = container.querySelector('.ButtonWithMenu')
        expect(buttonWithMenuElement).not.toBeNull()

        // Act
        await act(async () => {
            userEvent.click(buttonWithMenuElement!)
        })

        const insertedCard = mockedMutator.insertBlock.mock.calls[0][1] as Card

        // Assert
        expect(mockedMutator.insertBlock).toHaveBeenCalledTimes(1)
        expect(insertedCard.boardId).toBe(board.id)
        expect(insertedCard.parentId).toBe(board.id)
        expect(mockedMutator.changeViewCardOrder).toHaveBeenCalledTimes(1)
    })

    test('PU-HU02F-03 - P3 - crea tarjeta en vista agrupada sin groupByOptionId', async () => {
        // Arrange
        activeView.fields.viewType = 'table'
        const {container} = renderCenterPanel()

        const buttonWithMenuElement = container.querySelector('.ButtonWithMenu')
        expect(buttonWithMenuElement).not.toBeNull()

        // Act
        await act(async () => {
            userEvent.click(buttonWithMenuElement!)
        })

        const insertedCard = mockedMutator.insertBlock.mock.calls[0][1] as Card

        // Assert
        expect(mockedMutator.insertBlock).toHaveBeenCalledTimes(1)
        expect(insertedCard.fields.properties).toBeDefined()
        expect(mockedMutator.changeViewCardOrder).toHaveBeenCalledTimes(1)
    })

    test('PU-HU02F-04 - P4 - crea tarjeta en vista sin agrupación', async () => {
        // Arrange
        activeView.fields.viewType = 'gallery'
        activeView.fields.groupById = ''
        const {container} = renderCenterPanel(jest.fn(), undefined)

        const buttonWithMenuElement = container.querySelector('.ButtonWithMenu')
        expect(buttonWithMenuElement).not.toBeNull()

        // Act
        await act(async () => {
            userEvent.click(buttonWithMenuElement!)
        })

        const insertedCard = mockedMutator.insertBlock.mock.calls[0][1] as Card

        // Assert
        expect(mockedMutator.insertBlock).toHaveBeenCalledTimes(1)
        expect(insertedCard.boardId).toBe(board.id)
        expect(mockedMutator.changeViewCardOrder).toHaveBeenCalledTimes(1)
    })

    test('PU-HU02F-05 - P5 - crea tarjeta con ícono aleatorio habilitado', async () => {
        // Arrange
        activeView.fields.viewType = 'gallery'
        activeView.fields.groupById = ''
        UserSettings.prefillRandomIcons = true
        const {container} = renderCenterPanel(jest.fn(), undefined)

        const buttonWithMenuElement = container.querySelector('.ButtonWithMenu')
        expect(buttonWithMenuElement).not.toBeNull()

        // Act
        await act(async () => {
            userEvent.click(buttonWithMenuElement!)
        })

        const insertedCard = mockedMutator.insertBlock.mock.calls[0][1] as Card

        // Assert
        expect(mockedMutator.insertBlock).toHaveBeenCalledTimes(1)
        expect(insertedCard.fields.icon).toBeDefined()
        expect(mockedMutator.changeViewCardOrder).toHaveBeenCalledTimes(1)
    })
})
