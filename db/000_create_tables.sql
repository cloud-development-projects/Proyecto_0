-- *******************************
-- * ELIMINAR OBJETOS EXISTENTES *
-- *******************************

-- NOTA: Habilitar las siguiente 4 líneas si se requiere eliminar las tablas 
--       completamente e iniciar la creación de las mismas desde cero.

-- DROP TABLE IF EXISTS tarea;
-- DROP TABLE IF EXISTS usuario;
-- DROP TABLE IF EXISTS categoria;
-- DROP TABLE IF EXISTS estado;


-- -----------------------------------------------------------------------------

-- ***************************
-- * CREACION TABLA USUARIOS *
-- ***************************
CREATE TABLE IF NOT EXISTS usuario (
    id             SERIAL PRIMARY KEY, 
    nombre_usuario VARCHAR(50) NOT NULL UNIQUE,
    contrasena     VARCHAR(255) NOT NULL, 
    imagen_perfil  TEXT NULL
);


COMMENT ON TABLE usuario                 IS 'Contiene la información del usuario';
-- COMENTARIOS DE CADA COLUMNA
COMMENT ON COLUMN usuario.id             IS 'Identificador único del usuario';
COMMENT ON COLUMN usuario.nombre_usuario IS 'Nombre único que identifica al usuario';
COMMENT ON COLUMN usuario.contrasena     IS 'Contraseña del usuario';
COMMENT ON COLUMN usuario.imagen_perfil  IS 'Ruta al archivo de imagen de perfil';

-- -----------------------------------------------------------------------------

-- ****************************
-- * CREACION TABLA CATEGORIA *
-- ****************************
CREATE TABLE IF NOT EXISTS categoria (
    id          SERIAL PRIMARY KEY, 
    nombre      VARCHAR(100) NOT NULL, 
    descripcion TEXT 
);

COMMENT ON TABLE categoria              IS 'Categorías para clasificar las tareas';
-- COMENTARIOS DE CADA COLUMNA
COMMENT ON COLUMN categoria.id          IS 'Identificador único de la categoría';
COMMENT ON COLUMN categoria.nombre      IS 'Nombre de la categoría';
COMMENT ON COLUMN categoria.descripcion IS 'Descripción opcional de la categoría';

-- -----------------------------------------------------------------------------

-- *************************
-- * CREACION TABLA ESTADO *
-- *************************
CREATE TABLE IF NOT EXISTS estado (
    id                 SERIAL PRIMARY KEY,
    descripcion        varchar(100)
);

COMMENT ON TABLE estado              IS 'Estados para clasificar los estados de las tareas';
-- COMENTARIOS DE CADA COLUMNA
COMMENT ON COLUMN estado.id          IS 'Identificador único del estado';
COMMENT ON COLUMN estado.descripcion IS 'Descripción del estado';

INSERT INTO estado (descripcion)
VALUES ('Sin Empezar'),
       ('Empezada'),
       ('Finalizada');

-- -----------------------------------------------------------------------------

-- ************************
-- * CREACION TABLA TAREA *
-- ************************
CREATE TABLE IF NOT EXISTS tarea (
    id                 SERIAL PRIMARY KEY,
    texto_tarea        TEXT NOT NULL, 
    fecha_creacion     DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_finalizacion DATE,
    id_estado          INT REFERENCES estado(id)    ON DELETE SET NULL,
    id_categoria       INT REFERENCES categoria(id) ON DELETE SET NULL,
    id_usuario         INT REFERENCES usuario(id)   ON DELETE CASCADE 
);

COMMENT ON TABLE tarea                     IS 'Contiene las tareas creadas por los usuarios';
-- COMENTARIOS DE CADA COLUMNA
COMMENT ON COLUMN tarea.id                 IS 'Identificador único de la tarea';
COMMENT ON COLUMN tarea.texto_tarea        IS 'Texto descriptivo de la tarea';
COMMENT ON COLUMN tarea.fecha_creacion     IS 'Fecha de creación de la tarea';
COMMENT ON COLUMN tarea.fecha_finalizacion IS 'Fecha tentativa para finalizar la tarea';
COMMENT ON COLUMN tarea.id_estado          IS 'Identificar del estado seleccionado';
COMMENT ON COLUMN tarea.id_categoria       IS 'Clave foránea que referencia a la categoría de la tarea.';
COMMENT ON COLUMN tarea.id_usuario         IS 'Clave foránea que referencia al usuario que creó la tarea';

