import { Router } from 'express';
import { verificarToken } from '../middlewares/auth.middleware';
import {
  listarProyectos,
  mostrarFormularioCreacion,
  crearProyecto,
  obtenerProyectoPorId,
  mostrarFormularioEdicion,
  actualizarProyecto,
  mostrarConfirmacionEliminar,
  eliminarProyecto,
} from '../controllers/proyecto.controller';

const router = Router();

router.use(verificarToken);

router.get('/', listarProyectos);
router.get('/nuevo', mostrarFormularioCreacion);
router.post('/', crearProyecto);
router.get('/:id', obtenerProyectoPorId);
router.get('/:id/editar', mostrarFormularioEdicion);
router.put('/:id', actualizarProyecto);
router.get('/:id/eliminar', mostrarConfirmacionEliminar);
router.delete('/:id', eliminarProyecto);

export default router;
