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
    id             SERIAL       PRIMARY KEY, 
    username       VARCHAR(50)  NOT NULL UNIQUE,
    password       VARCHAR(255) NOT NULL, 
    profile_img    TEXT NULL
);


COMMENT ON TABLE users                 IS 'Contains user information';
-- COMENTARIOS DE CADA COLUMNA
COMMENT ON COLUMN users.id             IS 'Unique user identifier';
COMMENT ON COLUMN users.username       IS 'Unique name identifying the user';
COMMENT ON COLUMN users.password       IS 'Contraseña del usuario';
COMMENT ON COLUMN users.profile_img    IS 'User password';

-- -----------------------------------------------------------------------------

-- ****************************
-- * CREACION TABLA CATEGORIA *
-- ****************************
CREATE TABLE IF NOT EXISTS categories (
    id          SERIAL PRIMARY KEY, 
    name        VARCHAR(100) NOT NULL, 
    description TEXT 
);

COMMENT ON TABLE categories              IS 'Categories for classifying tasks';
-- COMENTARIOS DE CADA COLUMNA
COMMENT ON COLUMN categories.id          IS 'Unique category identifier';
COMMENT ON COLUMN categories.name        IS 'Category name';
COMMENT ON COLUMN categories.description IS 'Optional category description';

-- -----------------------------------------------------------------------------

-- *************************
-- * CREACION TABLA ESTADO *
-- *************************
CREATE TABLE IF NOT EXISTS states (
    id                 SERIAL PRIMARY KEY,
    description        varchar(100)
);

COMMENT ON TABLE  states             IS 'States for classifying task statuses';
-- COMENTARIOS DE CADA COLUMNA
COMMENT ON COLUMN states.id          IS 'Unique status identifier';
COMMENT ON COLUMN states.description IS 'Status description';

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

COMMENT ON TABLE  tasks                    IS 'Contains tasks created by users';
-- COMENTARIOS DE CADA COLUMNA
COMMENT ON COLUMN tasks.id                 IS 'Unique task identifier';
COMMENT ON COLUMN tasks.task_text          IS 'Task description';
COMMENT ON COLUMN tasks.creation_date      IS 'Task creation date';
COMMENT ON COLUMN tasks.end_date           IS 'Tentative task completion date';
COMMENT ON COLUMN tasks.id_state           IS 'Foreign key referencing the status';
COMMENT ON COLUMN tasks.id_category        IS 'Foreign key referencing the task category';
COMMENT ON COLUMN tasks.id_user            IS 'Foreign key referencing the user who created the task';

