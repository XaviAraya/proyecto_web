import 'dotenv/config';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import methodOverride from 'method-override';
import { engine } from 'express-handlebars';

import authRoutes from './routes/auth.routes';
import proyectoRoutes from './routes/proyecto.routes';

const app = express();

app.engine(
  '.hbs',
  engine({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    partialsDir: path.join(__dirname, 'views/partials'),
    helpers: {
      eq: (a: unknown, b: unknown) => a === b,
      formatFecha: (fecha: string) => {
        if (!fecha) return '';
        const d = new Date(fecha);
        if (Number.isNaN(d.getTime())) return fecha;
        return d.toLocaleDateString('es-CL');
      },
      formatMonto: (monto: number) => {
        if (typeof monto !== 'number') return String(monto);
        return new Intl.NumberFormat('es-CL').format(monto);
      },
    },
  }),
);
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(
  methodOverride((req) => {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      const method = (req.body as Record<string, unknown>)._method;
      delete (req.body as Record<string, unknown>)._method;
      return method as string;
    }
    return req.method;
  }),
);
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/', (_req, res) => res.redirect('/proyectos'));

app.use('/', authRoutes);
app.use('/proyectos', proyectoRoutes);

app.use((_req, res) => {
  res.status(404).send('Página no encontrada');
});

export default app;
