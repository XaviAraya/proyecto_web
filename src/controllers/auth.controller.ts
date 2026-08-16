import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import * as UsuarioModel from '../models/usuario.model';

export function mostrarRegistro(_req: Request, res: Response): void {
  res.render('auth/registro');
}

export async function registrarUsuario(req: Request, res: Response): Promise<void> {
  const { nombre, correo, clave } = req.body as { nombre?: string; correo?: string; clave?: string };

  if (!nombre || !correo || !clave) {
    res.render('auth/registro', { error: 'Todos los campos son obligatorios.' });
    return;
  }

  if (await UsuarioModel.findByCorreo(correo)) {
    res.render('auth/registro', { error: 'Ese correo ya está registrado.' });
    return;
  }

  const claveHash = await bcrypt.hash(clave, 10);
  await UsuarioModel.create({ nombre, correo, clave: claveHash });

  res.render('auth/registro', { exito: 'Usuario registrado correctamente. Ya puedes iniciar sesión.' });
}

export function mostrarLogin(_req: Request, res: Response): void {
  res.render('auth/login');
}

export async function iniciarSesion(req: Request, res: Response): Promise<void> {
  const { correo, clave } = req.body as { correo?: string; clave?: string };
  const usuario = correo ? await UsuarioModel.findByCorreo(correo) : undefined;
  const claveValida = usuario && clave ? await bcrypt.compare(clave, usuario.clave) : false;

  if (!usuario || !claveValida) {
    res.render('auth/login', { error: 'Correo o clave incorrectos.' });
    return;
  }

  const payload = { id: usuario.id, correo: usuario.correo };
  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN || '1h') as SignOptions['expiresIn'],
  };
  const token = jwt.sign(payload, process.env.JWT_SECRET as string, options);

  res.cookie('token', token, { httpOnly: true });
  res.redirect('/proyectos');
}

export function cerrarSesion(_req: Request, res: Response): void {
  res.clearCookie('token');
  res.redirect('/login');
}
