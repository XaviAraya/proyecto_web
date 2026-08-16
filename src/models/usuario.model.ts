import { IUsuario } from '../types/usuario';

const usuarios: IUsuario[] = [];
let nextId = 1;

export function findAll(): IUsuario[] {
  return usuarios;
}

export function findByCorreo(correo: string): IUsuario | undefined {
  return usuarios.find((u) => u.correo === correo);
}

export function findById(id: number): IUsuario | undefined {
  return usuarios.find((u) => u.id === id);
}

export function create(data: Omit<IUsuario, 'id'>): IUsuario {
  const usuario: IUsuario = { id: nextId++, ...data };
  usuarios.push(usuario);
  return usuario;
}

export default usuarios;
