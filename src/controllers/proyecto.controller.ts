import { Request, Response } from 'express';
import * as ProyectoModel from '../models/proyecto.model';
import * as UsuarioModel from '../models/usuario.model';
import { obtenerUF } from '../services/uf.service';

export function mostrarFormularioCreacion(_req: Request, res: Response): void {
  res.render('proyectos/crear');
}

export async function listarProyectos(_req: Request, res: Response): Promise<void> {
  const proyectos = ProyectoModel.findAll();
  const uf = await obtenerUF();
  res.render('proyectos/listar', { proyectos, uf });
}

export function crearProyecto(req: Request, res: Response): void {
  const { nombre, fecha_inicio, estado, responsable, monto } = req.body as Record<string, string>;

  ProyectoModel.create({
    nombre,
    fecha_inicio,
    estado,
    responsable,
    monto: Number(monto) || 0,
    created_by: req.usuario!.id,
  });

  res.redirect('/proyectos');
}

export function obtenerProyectoPorId(req: Request, res: Response): void {
  const id = Number(req.params.id);
  const proyecto = ProyectoModel.findById(id);

  if (!proyecto) {
    res.status(404).render('proyectos/listar', {
      proyectos: ProyectoModel.findAll(),
      error: 'Proyecto no encontrado.',
    });
    return;
  }

  const creador = UsuarioModel.findById(proyecto.created_by);
  res.render('proyectos/detalle', {
    proyecto,
    creadorNombre: creador ? creador.nombre : `Usuario #${proyecto.created_by}`,
  });
}

export function mostrarFormularioEdicion(req: Request, res: Response): void {
  const id = Number(req.params.id);
  const proyecto = ProyectoModel.findById(id);

  if (!proyecto) {
    res.redirect('/proyectos');
    return;
  }

  res.render('proyectos/editar', { proyecto });
}

export function actualizarProyecto(req: Request, res: Response): void {
  const id = Number(req.params.id);
  const { nombre, fecha_inicio, estado, responsable, monto } = req.body as Record<string, string>;

  const actualizado = ProyectoModel.update(id, {
    nombre,
    fecha_inicio,
    estado,
    responsable,
    monto: Number(monto) || 0,
  });

  if (!actualizado) {
    res.redirect('/proyectos');
    return;
  }

  res.redirect(`/proyectos/${id}`);
}

export function mostrarConfirmacionEliminar(req: Request, res: Response): void {
  const id = Number(req.params.id);
  const proyecto = ProyectoModel.findById(id);

  if (!proyecto) {
    res.redirect('/proyectos');
    return;
  }

  res.render('proyectos/eliminar', { proyecto });
}

export function eliminarProyecto(req: Request, res: Response): void {
  const id = Number(req.params.id);
  ProyectoModel.remove(id);
  res.redirect('/proyectos');
}
