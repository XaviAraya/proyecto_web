import { prisma } from '../config/db';
import { IUsuario } from '../types/usuario';

export function findAll(): Promise<IUsuario[]> {
  return prisma.usuario.findMany();
}

export function findByCorreo(correo: string): Promise<IUsuario | null> {
  return prisma.usuario.findUnique({ where: { correo } });
}

export function findById(id: number): Promise<IUsuario | null> {
  return prisma.usuario.findUnique({ where: { id } });
}

export function create(data: Omit<IUsuario, 'id'>): Promise<IUsuario> {
  return prisma.usuario.create({ data });
}
