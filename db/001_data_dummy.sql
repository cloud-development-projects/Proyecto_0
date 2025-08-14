-- ***********************************************
-- * REINICIAR BASE DE DATOS CON DATOS DE PRUEBA *
-- ***********************************************

-- 1. Eliminar datos y reiniciar IDs
TRUNCATE TABLE tarea     RESTART IDENTITY CASCADE;
TRUNCATE TABLE usuario   RESTART IDENTITY CASCADE;
TRUNCATE TABLE categoria RESTART IDENTITY CASCADE;
TRUNCATE TABLE estado    RESTART IDENTITY CASCADE;

-- 2. Insertar datos en ESTADO
INSERT INTO estado (descripcion)
VALUES ('Sin Empezar'),
       ('Empezada'),
       ('Finalizada');

-- 3. Insertar datos en USUARIO
INSERT INTO usuario (nombre_usuario, contrasena, imagen_perfil) 
VALUES ('juanperez'    , 'hash_1234'  , '/img/juanperez.png'),
       ('maria.gomez'  , 'hash_5678'  , '/img/mariagomez.png'),
       ('carlos23'     , 'hash_abc'   , NULL),
       ('ana_rodriguez', 'hash_xyz'   , '/img/anarodriguez.png'),
       ('luis_m'       , 'hash_qwerty', NULL);

-- 4. Insertar datos en CATEGORIA
INSERT INTO categoria (nombre, descripcion) 
VALUES ('Trabajo' , 'Tareas relacionadas con actividades laborales'),
       ('Estudio' , 'Tareas y actividades académicas'),
       ('Personal', 'Actividades personales y del hogar'),
       ('Deporte' , 'Rutinas y entrenamientos físicos'),
       ('Compras' , 'Lista de compras y adquisiciones pendientes');

-- 5. Insertar datos en TAREA
INSERT INTO tarea (texto_tarea, fecha_creacion, fecha_finalizacion, id_estado, id_categoria, id_usuario) 
VALUES ('Preparar presentación para la reunión de clientes' , '2025-08-10', '2025-08-14', 2, 1, 1),
       ('Estudiar capítulo 5 de matemáticas'                , '2025-08-11', '2025-08-15', 1, 2, 2),
       ('Comprar regalo de cumpleaños para XYZ'             , '2025-08-12', '2025-08-13', 1, 5, 3),
       ('Hacer mantenimiento a la bicicleta'                , '2025-08-12', NULL        , 2, 4, 4),
       ('Actualizar CV y portafolio en línea'               , '2025-08-09', '2025-08-20', 1, 1, 5),
       ('Organizar libros de la biblioteca'                 , '2025-08-08', NULL        , 3, 3, 2),
       ('Hacer informe semanal del proyecto'                , '2025-08-13', '2025-08-14', 2, 1, 1),
       ('Correr 5 km en el parque'                          , '2025-08-14', NULL        , 1, 4, 3),
       ('Hacer lista de compras para mercado del mes'       , '2025-08-07', '2025-08-08', 3, 5, 4),
       ('Preparar exposición de historia'                   , '2025-08-06', '2025-08-09', 3, 2, 5);
