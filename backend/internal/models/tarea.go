package models

import "time"

type Tarea struct {
    ID               int        `json:"id" db:"id"`
    UsuarioID        int        `json:"usuario_id" db:"usuario_id"`
    CategoriaID      int        `json:"categoria_id" db:"categoria_id"`
    Texto            string     `json:"texto" db:"texto"`
    Estado           string     `json:"estado" db:"estado"`
    FechaCreacion    time.Time  `json:"fecha_creacion" db:"fecha_creacion"`
    FechaFinalizacion *time.Time `json:"fecha_finalizacion,omitempty" db:"fecha_finalizacion"`
}