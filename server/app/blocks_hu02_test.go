package app

import (
	"testing"

	"github.com/stretchr/testify/require"

	"github.com/mattermost/focalboard/server/model"
)

func TestInsertBlocksAndNotifyHU02(t *testing.T) {
	t.Run("PU-HU02B-01 - P1 - retorna lista vacia cuando no recibe bloques", func(t *testing.T) {
		// Arrange
		th, tearDown := SetupTestHelper(t)
		defer tearDown()

		// Act
		blocks, err := th.App.InsertBlocksAndNotify([]*model.Block{}, "user-id-1", false)

		// Assert
		require.NoError(t, err)
		require.NotNil(t, blocks)
		require.Empty(t, blocks)
	})

	t.Run("PU-HU02B-02 - P2 - retorna error cuando los bloques pertenecen a diferentes tableros", func(t *testing.T) {
		// Arrange
		th, tearDown := SetupTestHelper(t)
		defer tearDown()

		block1 := &model.Block{
			ID:      "card-hu02-1",
			BoardID: "board-hu02-1",
		}

		block2 := &model.Block{
			ID:      "card-hu02-2",
			BoardID: "board-hu02-2",
		}

		// Act
		blocks, err := th.App.InsertBlocksAndNotify([]*model.Block{block1, block2}, "user-id-1", false)

		// Assert
		require.ErrorIs(t, err, ErrBlocksFromMultipleBoards)
		require.Nil(t, blocks)
	})

	t.Run("PU-HU02B-03 - P3 - retorna error cuando no se puede obtener el tablero", func(t *testing.T) {
		// Arrange
		th, tearDown := SetupTestHelper(t)
		defer tearDown()

		boardID := testBoardID
		block := &model.Block{
			ID:      "card-hu02",
			BoardID: boardID,
		}

		th.Store.EXPECT().GetBoard(boardID).Return(nil, blockError{"error al obtener tablero"})

		// Act
		blocks, err := th.App.InsertBlocksAndNotify([]*model.Block{block}, "user-id-1", false)

		// Assert
		require.Error(t, err)
		require.Nil(t, blocks)
		require.EqualError(t, err, "error al obtener tablero")
	})

	t.Run("PU-HU02B-04 - P4 - retorna error cuando falla la insercion del bloque", func(t *testing.T) {
		// Arrange
		th, tearDown := SetupTestHelper(t)
		defer tearDown()

		boardID := testBoardID
		block := &model.Block{
			ID:      "card-hu02",
			BoardID: boardID,
		}

		board := &model.Board{
			ID: boardID,
		}

		th.Store.EXPECT().GetBoard(boardID).Return(board, nil)
		th.Store.EXPECT().InsertBlock(block, "user-id-1").Return(blockError{"error al insertar bloque"})

		// Act
		blocks, err := th.App.InsertBlocksAndNotify([]*model.Block{block}, "user-id-1", false)

		// Assert
		require.Error(t, err)
		require.Nil(t, blocks)
		require.EqualError(t, err, "error al insertar bloque")
	})

	t.Run("PU-HU02B-05 - P5 - inserta bloque correctamente con notificacion habilitada", func(t *testing.T) {
		// Arrange
		th, tearDown := SetupTestHelper(t)
		defer tearDown()

		boardID := testBoardID
		block := &model.Block{
			ID:      "card-hu02",
			Type:    model.TypeCard,
			BoardID: boardID,
		}

		board := &model.Board{
			ID: boardID,
		}

		th.Store.EXPECT().GetBoard(boardID).Return(board, nil)
		th.Store.EXPECT().InsertBlock(block, "user-id-1").Return(nil)
		th.Store.EXPECT().GetMembersForBoard(boardID).Return([]*model.BoardMember{}, nil)

		// Act
		blocks, err := th.App.InsertBlocksAndNotify([]*model.Block{block}, "user-id-1", false)

		// Assert
		require.NoError(t, err)
		require.Len(t, blocks, 1)
		require.Equal(t, "card-hu02", blocks[0].ID)
		require.Equal(t, boardID, blocks[0].BoardID)
	})

	t.Run("PU-HU02B-06 - P6 - inserta bloque correctamente con notificacion interna deshabilitada", func(t *testing.T) {
		// Arrange
		th, tearDown := SetupTestHelper(t)
		defer tearDown()

		boardID := testBoardID
		block := &model.Block{
			ID:      "card-hu02",
			Type:    model.TypeCard,
			BoardID: boardID,
		}

		board := &model.Board{
			ID: boardID,
		}

		th.Store.EXPECT().GetBoard(boardID).Return(board, nil)
		th.Store.EXPECT().InsertBlock(block, "user-id-1").Return(nil)
		th.Store.EXPECT().GetMembersForBoard(boardID).Return([]*model.BoardMember{}, nil)

		// Act
		blocks, err := th.App.InsertBlocksAndNotify([]*model.Block{block}, "user-id-1", true)

		// Assert
		require.NoError(t, err)
		require.Len(t, blocks, 1)
		require.Equal(t, "card-hu02", blocks[0].ID)
		require.Equal(t, boardID, blocks[0].BoardID)
	})
}