export interface UfResultado {
  fecha: string;
  valor: number;
}

export async function obtenerUF(): Promise<UfResultado> {
  const url = process.env.UF_API_URL || 'https://mindicador.cl/api/uf';

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`UF API respondió con status ${res.status}`);
    }

    const data = (await res.json()) as { serie?: Array<{ fecha: string; valor: number }> };
    const serie = data.serie?.[0];

    if (!serie) {
      throw new Error('Formato de respuesta de la UF inesperado');
    }

    return { fecha: serie.fecha, valor: serie.valor };
  } catch (err) {
    console.error('Error obteniendo UF:', (err as Error).message);
    return { fecha: '', valor: 0 };
  }
}
