import { randomUUID } from 'crypto';

interface AsistenciaProps {
  id: string;
  atletaId: string;
  fecha: Date;
  registradoPorId: string; // ID del entrenador que registra
}

export class Asistencia {
  readonly id: string;
  readonly atletaId: string;
  readonly fecha: Date;
  readonly registradoPorId: string;

  private constructor(props: AsistenciaProps) {
    this.id = props.id;
    this.atletaId = props.atletaId;
    this.fecha = props.fecha;
    this.registradoPorId = props.registradoPorId;
  }

  /**
   * Método de fábrica para crear una nueva instancia de Asistencia.
   */
  public static crear(props: {
    atletaId: string;
    fecha: Date;
    registradoPorId: string;
  }): Asistencia {
    // Validaciones de negocio a nivel de dominio
    if (!props.atletaId || !props.fecha || !props.registradoPorId) {
      throw new Error(
        'Los campos atletaId, fecha y registradoPorId son requeridos.',
      );
    }
    // Para normalizar, guardamos la fecha siempre a medianoche (sin horas/minutos)
    const fechaNormalizada = new Date(props.fecha);
    fechaNormalizada.setUTCHours(0, 0, 0, 0);

    return new Asistencia({
      id: randomUUID(),
      atletaId: props.atletaId,
      fecha: fechaNormalizada,
      registradoPorId: props.registradoPorId,
    });
  }

  /**
   * Método para reconstituir la entidad desde la capa de persistencia.
   */
  public static desdePersistencia(props: AsistenciaProps): Asistencia {
    return new Asistencia(props);
  }
}
