import { Router } from 'express';
import {
  mostrarRegistro,
  registrarUsuario,
  mostrarLogin,
  iniciarSesion,
  cerrarSesion,
} from '../controllers/auth.controller';

const router = Router();

router.get('/registro', mostrarRegistro);
router.post('/registro', registrarUsuario);
router.get('/login', mostrarLogin);
router.post('/login', iniciarSesion);
router.get('/logout', cerrarSesion);

export default router;
