-- *******************************
-- * ELIMINAR OBJETOS EXISTENTES *
-- *******************************

-- NOTA: Habilitar las siguiente 4 líneas si se requiere eliminar las tablas 
--       completamente e iniciar la creación de las mismas desde cero.

-- DROP TABLE IF EXISTS tasks;
-- DROP TABLE IF EXISTS users;
-- DROP TABLE IF EXISTS categories;
-- DROP TABLE IF EXISTS states;


-- -----------------------------------------------------------------------------

-- ***************************
-- * CREACION TABLA USUARIOS *
-- ***************************
CREATE TABLE IF NOT EXISTS users (
    id             SERIAL PRIMARY KEY, 
    username       VARCHAR(50) NOT NULL UNIQUE,
    password       VARCHAR(255) NOT NULL, 
    profile_img    TEXT NULL
);


COMMENT ON TABLE users                 IS 'Contiene la información del usuario';
-- COMENTARIOS DE CADA COLUMNA
COMMENT ON COLUMN users.id             IS 'Identificador único del usuario';
COMMENT ON COLUMN users.username       IS 'Nombre único que identifica al usuario';
COMMENT ON COLUMN users.password       IS 'Contraseña del usuario';
COMMENT ON COLUMN users.profile_img    IS 'Ruta al archivo de imagen de perfil';

-- -----------------------------------------------------------------------------

-- ****************************
-- * CREACION TABLA CATEGORIA *
-- ****************************
CREATE TABLE IF NOT EXISTS categories (
    id          SERIAL PRIMARY KEY, 
    name        VARCHAR(100) NOT NULL, 
    description TEXT 
);

COMMENT ON TABLE categories              IS 'Categorías para clasificar las tareas';
-- COMENTARIOS DE CADA COLUMNA
COMMENT ON COLUMN categories.id          IS 'Identificador único de la categoría';
COMMENT ON COLUMN categories.name        IS 'Nombre de la categoría';
COMMENT ON COLUMN categories.description IS 'Descripción opcional de la categoría';

-- -----------------------------------------------------------------------------

-- *************************
-- * CREACION TABLA ESTADO *
-- *************************
CREATE TABLE IF NOT EXISTS states (
    id                 SERIAL PRIMARY KEY,
    description        varchar(100)
);

COMMENT ON TABLE  states             IS 'Estados para clasificar los estados de las tareas';
-- COMENTARIOS DE CADA COLUMNA
COMMENT ON COLUMN states.id          IS 'Identificador único del estado';
COMMENT ON COLUMN states.description IS 'Descripción del estado';

INSERT INTO states (description)
VALUES ('Sin Empezar'),
       ('Empezada'),
       ('Finalizada');

-- -----------------------------------------------------------------------------

-- ************************
-- * CREACION TABLA TAREA *
-- ************************
CREATE TABLE IF NOT EXISTS tasks (
    id                 SERIAL PRIMARY KEY,
    task_text          TEXT NOT NULL, 
    creation_date      DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date           DATE,
    id_state           INT REFERENCES states(id)     ON DELETE SET NULL,
    id_category        INT REFERENCES categories(id) ON DELETE SET NULL,
    id_user            INT REFERENCES users(id)      ON DELETE CASCADE 
);

COMMENT ON TABLE  tasks                    IS 'Contiene las tareas creadas por los usuarios';
-- COMENTARIOS DE CADA COLUMNA
COMMENT ON COLUMN tasks.id                 IS 'Identificador único de la tarea';
COMMENT ON COLUMN tasks.task_text          IS 'Texto descriptivo de la tarea';
COMMENT ON COLUMN tasks.creation_date      IS 'Fecha de creación de la tarea';
COMMENT ON COLUMN tasks.end_date           IS 'Fecha tentativa para finalizar la tarea';
COMMENT ON COLUMN tasks.id_state           IS 'Identificar del estado seleccionado';
COMMENT ON COLUMN tasks.id_category        IS 'Clave foránea que referencia a la categoría de la tarea.';
COMMENT ON COLUMN tasks.id_user            IS 'Clave foránea que referencia al usuario que creó la tarea';

