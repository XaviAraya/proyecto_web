import { Request, Response } from 'express';
import * as ProyectoModel from '../models/proyecto.model';
import * as UsuarioModel from '../models/usuario.model';
import { obtenerUF } from '../services/uf.service';

export function mostrarFormularioCreacion(_req: Request, res: Response): void {
  res.render('proyectos/crear');
}

export async function listarProyectos(_req: Request, res: Response): Promise<void> {
  const proyectos = await ProyectoModel.findAll();
  const uf = await obtenerUF();
  res.render('proyectos/listar', { proyectos, uf });
}

export async function crearProyecto(req: Request, res: Response): Promise<void> {
  const { nombre, fecha_inicio, estado, responsable, monto } = req.body as Record<string, string>;

  await ProyectoModel.create({
    nombre,
    fecha_inicio,
    estado,
    responsable,
    monto: Number(monto) || 0,
    created_by: req.usuario!.id,
  });

  res.redirect('/proyectos');
}

export async function obtenerProyectoPorId(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  const proyecto = await ProyectoModel.findById(id);

  if (!proyecto) {
    res.status(404).render('proyectos/listar', {
      proyectos: await ProyectoModel.findAll(),
      error: 'Proyecto no encontrado.',
    });
    return;
  }

  const creador = await UsuarioModel.findById(proyecto.created_by);
  res.render('proyectos/detalle', {
    proyecto,
    creadorNombre: creador ? creador.nombre : `Usuario #${proyecto.created_by}`,
  });
}

export async function mostrarFormularioEdicion(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  const proyecto = await ProyectoModel.findById(id);

  if (!proyecto) {
    res.redirect('/proyectos');
    return;
  }

  res.render('proyectos/editar', { proyecto });
}

export async function actualizarProyecto(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  const { nombre, fecha_inicio, estado, responsable, monto } = req.body as Record<string, string>;

  const actualizado = await ProyectoModel.update(id, {
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

export async function mostrarConfirmacionEliminar(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  const proyecto = await ProyectoModel.findById(id);

  if (!proyecto) {
    res.redirect('/proyectos');
    return;
  }

  res.render('proyectos/eliminar', { proyecto });
}

export async function eliminarProyecto(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  await ProyectoModel.remove(id);
  res.redirect('/proyectos');
}
