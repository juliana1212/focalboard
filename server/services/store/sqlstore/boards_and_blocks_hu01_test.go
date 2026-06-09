// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/*
Pruebas unitarias backend - HU01 Angie

Historia de usuario:
Como usuario de un equipo, quiero crear un tablero nuevo con columnas predefinidas
para organizar mis tareas, de manera que pueda iniciar un proyecto rápidamente.

Archivo analizado:
server/services/store/sqlstore/boards_and_blocks.go

Función analizada:
createBoardsAndBlocks()

Caminos cubiertos:
P1: Flujo exitoso con tableros y bloques.
P2: Error al insertar tablero.
P3: Error al insertar bloque.
P4: Flujo sin tableros por recorrer, pero con bloques.
P5: Flujo con tableros, pero sin bloques.

Nota:
Estas pruebas corresponden a una validación estructural de caja blanca.
Se revisa que la función conserve las instrucciones, ciclos y retornos necesarios
para cubrir los caminos independientes definidos en el grafo de flujo de control.
*/

package sqlstore

import (
	"os"
	"strings"
	"testing"
)

func leerCodigoHU01Backend(t *testing.T) string {
	t.Helper()

	contenido, err := os.ReadFile("boards_and_blocks.go")
	if err != nil {
		t.Fatalf("No se pudo leer el archivo boards_and_blocks.go: %v", err)
	}

	return string(contenido)
}

func normalizarCodigo(codigo string) string {
	codigo = strings.ReplaceAll(codigo, "\t", "")
	codigo = strings.ReplaceAll(codigo, "\n", "")
	codigo = strings.ReplaceAll(codigo, "\r", "")
	codigo = strings.ReplaceAll(codigo, " ", "")
	return codigo
}

func TestHU01Backend_P1_FlujoExitosoConTablerosYBloques(t *testing.T) {
	/*
		Objetivo:
		Validar el camino P1 del grafo de flujo de control.

		Camino P1:
		N1-N2-N3-N4-N5-N6-N7-N8-N10-N5-N11-N12-N13-N14-N16-N11-N17-N18-N19

		Este camino representa el flujo exitoso donde:
		1. Se inicializan las listas boards y blocks.
		2. Se recorre bab.Boards.
		3. Se ejecuta insertBoard().
		4. No ocurre error al insertar tablero.
		5. Se agrega newBoard a boards.
		6. Se recorre bab.Blocks.
		7. Se ejecuta insertBlock().
		8. No ocurre error al insertar bloque.
		9. Se agrega block a blocks.
		10. Se crea newBab y se retorna newBab, nil.
	*/

	codigo := leerCodigoHU01Backend(t)

	validaciones := []string{
		"func (s *SQLStore) createBoardsAndBlocks",
		"boards := []*model.Board{}",
		"blocks := []*model.Block{}",
		"for _, board := range bab.Boards",
		"s.insertBoard(db, board, userID)",
		"boards = append(boards, newBoard)",
		"for _, block := range bab.Blocks",
		"s.insertBlock(db, b, userID)",
		"blocks = append(blocks, block)",
		"newBab := &model.BoardsAndBlocks",
		"return newBab, nil",
	}

	for _, texto := range validaciones {
		if !strings.Contains(codigo, texto) {
			t.Errorf("No se encontró en el código la instrucción esperada para P1: %s", texto)
		}
	}
}

func TestHU01Backend_P2_ErrorAlInsertarTablero(t *testing.T) {
	/*
		Objetivo:
		Validar el camino P2 del grafo de flujo de control.

		Camino P2:
		N1-N2-N3-N4-N5-N6-N7-N8-N9-N19

		Este camino representa el caso en el que ocurre un error durante insertBoard().
		La función debe retornar nil, err y no continuar con el procesamiento de bloques.
	*/

	codigo := normalizarCodigo(leerCodigoHU01Backend(t))

	validacion := "newBoard,err:=s.insertBoard(db,board,userID)iferr!=nil{returnnil,err}"

	if !strings.Contains(codigo, validacion) {
		t.Errorf("No se encontró la validación de error esperada para insertBoard().")
	}
}

func TestHU01Backend_P3_ErrorAlInsertarBloque(t *testing.T) {
	/*
		Objetivo:
		Validar el camino P3 del grafo de flujo de control.

		Camino P3:
		N1-N2-N3-N4-N5-N6-N7-N8-N10-N5-N11-N12-N13-N14-N15-N19

		Este camino representa el caso en el que el tablero se inserta correctamente,
		pero ocurre un error durante insertBlock().
		La función debe retornar nil, err y no crear newBab exitosamente.
	*/

	codigo := normalizarCodigo(leerCodigoHU01Backend(t))

	validacion := "err:=s.insertBlock(db,b,userID)iferr!=nil{returnnil,err}"

	if !strings.Contains(codigo, validacion) {
		t.Errorf("No se encontró la validación de error esperada para insertBlock().")
	}
}

func TestHU01Backend_P4_FlujoSinTablerosPeroConBloques(t *testing.T) {
	/*
		Objetivo:
		Validar el camino P4 del grafo de flujo de control.

		Camino P4:
		N1-N2-N3-N4-N5-N11-N12-N13-N14-N16-N11-N17-N18-N19

		Este camino contempla que bab.Boards pueda estar vacío.
		Estructuralmente, si no hay tableros por recorrer, el primer ciclo no se ejecuta
		y el flujo puede continuar hacia el ciclo de bloques.
	*/

	codigo := leerCodigoHU01Backend(t)

	posicionCicloBoards := strings.Index(codigo, "for _, board := range bab.Boards")
	posicionCicloBlocks := strings.Index(codigo, "for _, block := range bab.Blocks")

	if posicionCicloBoards == -1 {
		t.Fatalf("No se encontró el ciclo de tableros bab.Boards.")
	}

	if posicionCicloBlocks == -1 {
		t.Fatalf("No se encontró el ciclo de bloques bab.Blocks.")
	}

	if posicionCicloBlocks <= posicionCicloBoards {
		t.Errorf("El ciclo de bloques debería aparecer después del ciclo de tableros.")
	}

	if !strings.Contains(codigo, "blocks = append(blocks, block)") {
		t.Errorf("No se encontró la inserción de bloques en la lista blocks.")
	}
}

func TestHU01Backend_P5_FlujoConTablerosPeroSinBloques(t *testing.T) {
	/*
		Objetivo:
		Validar el camino P5 del grafo de flujo de control.

		Camino P5:
		N1-N2-N3-N4-N5-N6-N7-N8-N10-N5-N11-N17-N18-N19

		Este camino contempla que bab.Blocks pueda estar vacío.
		Estructuralmente, si no hay bloques por recorrer, el segundo ciclo no se ejecuta
		y la función continúa con la creación de newBab.
	*/

	codigo := leerCodigoHU01Backend(t)

	posicionCicloBlocks := strings.Index(codigo, "for _, block := range bab.Blocks")
	posicionNewBab := strings.Index(codigo, "newBab := &model.BoardsAndBlocks")

	if posicionCicloBlocks == -1 {
		t.Fatalf("No se encontró el ciclo de bloques bab.Blocks.")
	}

	if posicionNewBab == -1 {
		t.Fatalf("No se encontró la creación de newBab.")
	}

	if posicionNewBab <= posicionCicloBlocks {
		t.Errorf("La creación de newBab debe ocurrir después del ciclo de bloques.")
	}

	if !strings.Contains(codigo, "Boards: boards") {
		t.Errorf("No se encontró la asignación de boards dentro de newBab.")
	}

	if !strings.Contains(codigo, "Blocks: blocks") {
		t.Errorf("No se encontró la asignación de blocks dentro de newBab.")
	}
}