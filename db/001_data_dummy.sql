-- ***********************************************
-- * RESET DATABASE WITH TEST/DUMMY DATA      *
-- ***********************************************

-- WARNING: This file is for development/testing only!
-- It will delete ALL existing data and replace it with test data.

-- 1. Clear all data (but keep tables and states)
TRUNCATE TABLE tasks      RESTART IDENTITY CASCADE;
TRUNCATE TABLE users      RESTART IDENTITY CASCADE;
TRUNCATE TABLE categories RESTART IDENTITY CASCADE;
-- NOTE: We DON'T truncate states as they're created during schema setup

-- 2. Insert test users with Gravatar profile pictures
INSERT INTO users (username, password, profile_img) 
VALUES ('juanperez'      , '$2a$10$hash1234'  , 'https://www.gravatar.com/avatar/88773a5342684a9223538352aac9add9?d=identicon&s=200'),
       ('maria_garcia'   , '$2a$10$hash5678'  , 'https://www.gravatar.com/avatar/58946d1c8f840180b7e7e2e0d81b4cc6?d=identicon&s=200'),
       ('carlos23'       , '$2a$10$hashabc'   , 'https://www.gravatar.com/avatar/9f9d51bc70ef21ca5c14f307980a29d8?d=identicon&s=200'),
       ('ana_rodriguez'  , '$2a$10$hashxyz'   , 'https://www.gravatar.com/avatar/6384e2b2184bcbf58eccf10ca7a6563c?d=identicon&s=200'),
       ('luis_m'         , '$2a$10$hashtest'  , 'https://www.gravatar.com/avatar/9da1f8e0aecc9d868bad115129706a77?d=identicon&s=200');

-- 3. Insert test categories
INSERT INTO categories (name, description) 
VALUES ('Trabajo' , 'Tareas relacionadas con actividades laborales'),
       ('Estudio' , 'Tareas y actividades académicas'),
       ('Personal', 'Actividades personales y del hogar'),
       ('Deporte' , 'Rutinas y entrenamientos físicos'),
       ('Compras' , 'Lista de compras y adquisiciones pendientes');

-- 4. Insert test tasks
INSERT INTO tasks (task_text, creation_date, end_date, id_state, id_category, id_user) 
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