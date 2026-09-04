@SPEC-VALID-001
Feature: Validaci├│n de la frontera HTTP con Zod

  Como responsable del backend
  quiero que todo dato externo se valide con Zod antes de llegar a la base de datos
  para que un dato mal formado devuelva 400 con un mensaje claro
  en lugar de propagarse hasta la capa de datos.

  Scenario: Rechazar imageId nulo antes de consultar la base de datos
    Given un body de anotaci├│n con imageId nulo
    When se valida con el esquema de creaci├│n
    Then la validaci├│n falla
    And el mensaje se├▒ala el campo imageId

  Scenario: Rechazar imageId que no es n├║mero
    Given un body de anotaci├│n con imageId "no-soy-un-numero"
    When se valida con el esquema de creaci├│n
    Then la validaci├│n falla

  Scenario: Rechazar un body vac├¡o
    Given un body de anotaci├│n vac├¡o
    When se valida con el esquema de creaci├│n
    Then la validaci├│n falla

  Scenario: Rechazar imageId cero o negativo
    Given un body de anotaci├│n con imageId 0
    When se valida con el esquema de creaci├│n
    Then la validaci├│n falla

  Scenario: Aceptar un body de anotaci├│n completo y v├ílido
    Given un body con imageId 1, categoryId 2 y bbox v├ílido
    When se valida con el esquema de creaci├│n
    Then la validaci├│n es exitosa
    And los datos quedan tipados seg├║n el esquema

  Scenario: Rechazar un status que no pertenece al enum
    Given un body de estado con status 12345
    When se valida con el esquema de estado
    Then la validaci├│n falla

  Scenario: Rechazar un status con texto arbitrario
    Given un body de estado con status "borrado"
    When se valida con el esquema de estado
    Then la validaci├│n falla

  Scenario: Aceptar los tres estados v├ílidos del ciclo de anotaci├│n
    Given un body de estado con status "completed"
    When se valida con el esquema de estado
    Then la validaci├│n es exitosa

  Scenario: Rechazar un route param que no es entero positivo
    Given el route param "abc"
    When se valida con el esquema de id
    Then la validaci├│n falla

  Scenario: Rechazar el route param cero
    Given el route param "0"
    When se valida con el esquema de id
    Then la validaci├│n falla

  Scenario: Aceptar y convertir un route param num├®rico
    Given el route param "7"
    When se valida con el esquema de id
    Then la validaci├│n es exitosa
    And el valor convertido es el n├║mero 7
