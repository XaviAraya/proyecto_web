import { IProyecto } from '../types/proyecto';

const proyectos: IProyecto[] = [];
let nextId = 1;

export function findAll(): IProyecto[] {
  return proyectos;
}

export function findById(id: number): IProyecto | undefined {
  return proyectos.find((p) => p.id === id);
}

export function create(data: Omit<IProyecto, 'id'>): IProyecto {
  const proyecto: IProyecto = { id: nextId++, ...data };
  proyectos.push(proyecto);
  return proyecto;
}

export function update(
  id: number,
  data: Partial<Omit<IProyecto, 'id' | 'created_by'>>,
): IProyecto | undefined {
  const proyecto = findById(id);
  if (!proyecto) return undefined;
  Object.assign(proyecto, data);
  return proyecto;
}

export function remove(id: number): boolean {
  const idx = proyectos.findIndex((p) => p.id === id);
  if (idx === -1) return false;
  proyectos.splice(idx, 1);
  return true;
}

export default proyectos;
