import { Prisma } from '../generated/prisma/client';
import { prisma } from '../config/db';
import { IProyecto } from '../types/proyecto';

function isNotFoundError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2025'
  );
}

export function findAll(): Promise<IProyecto[]> {
  return prisma.proyecto.findMany();
}

export function findById(id: number): Promise<IProyecto | null> {
  return prisma.proyecto.findUnique({ where: { id } });
}

export function create(data: Omit<IProyecto, 'id'>): Promise<IProyecto> {
  return prisma.proyecto.create({ data });
}

export async function update(
  id: number,
  data: Partial<Omit<IProyecto, 'id' | 'created_by'>>,
): Promise<IProyecto | undefined> {
  try {
    return await prisma.proyecto.update({ where: { id }, data });
  } catch (error) {
    if (isNotFoundError(error)) return undefined;
    throw error;
  }
}

export async function remove(id: number): Promise<boolean> {
  try {
    await prisma.proyecto.delete({ where: { id } });
    return true;
  } catch (error) {
    if (isNotFoundError(error)) return false;
    throw error;
  }
}
