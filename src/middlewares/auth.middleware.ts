import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types/express';

export function verificarToken(req: Request, res: Response, next: NextFunction): void {
  const cookieToken = req.cookies?.token as string | undefined;
  const authHeader = req.headers.authorization;
  const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
  const token = cookieToken || headerToken;

  if (!token) {
    res.redirect('/login');
    return;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    req.usuario = payload;
    next();
  } catch {
    res.clearCookie('token');
    res.redirect('/login');
  }
}

export function cargarUsuario(req: Request, res: Response, next: NextFunction): void {
  const cookieToken = req.cookies?.token as string | undefined;

  if (cookieToken) {
    try {
      const payload = jwt.verify(cookieToken, process.env.JWT_SECRET as string) as JwtPayload;
      req.usuario = payload;
      res.locals.usuario = payload;
    } catch {
      // Sesión inválida o expirada: se ignora, la vista se renderiza como usuario anónimo.
    }
  }

  next();
}
