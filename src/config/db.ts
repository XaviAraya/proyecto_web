// Configuración de conexión a base de datos — placeholder.
// No se usa todavía: los modelos actuales trabajan con arrays estáticos en memoria.
// Queda preparado para una futura integración real (ej. mysql2, TypeORM, Prisma).

export const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || '',
};
