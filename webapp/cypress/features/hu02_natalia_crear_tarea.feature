Feature: Crear tarjeta con responsable y fecha
  Como miembro de un tablero
  Quiero agregar tareas a las columnas con fechas de entrega
  Para que todos los miembros del equipo sepan quién hace qué y cuándo

  Scenario: Abrir tablero y mostrar columna Pendientes
    Given El tablero HU2 Natalia está abierto
    Then La columna "Pendientes" se muestra

  Scenario: Crear tarea con título
    Given El tablero HU2 Natalia está abierto
    When Creo una tarjeta con el título "Crear pruebas de caja negra HU2"
    Then La tarjeta se muestra con el título

  Scenario: Asignar responsable a la tarjeta
    Given La tarjeta "Crear pruebas de caja negra HU2" existe
    When Asigno el responsable "nataliaflorezz7282@gmail.com"
    Then La tarjeta muestra el responsable asignado

  Scenario: Registrar fecha de entrega
    Given La tarjeta "Crear pruebas de caja negra HU2" existe
    When Asigno la fecha de entrega "15 de junio"
    Then La tarjeta muestra la fecha de entrega correcta

  Scenario: Persistencia al recargar
    Given La tarjeta "Crear pruebas de caja negra HU2" existe
    When Recargo el tablero
    Then La tarjeta conserva título, responsable y fecha de entrega


