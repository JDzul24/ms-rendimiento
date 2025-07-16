import { randomUUID } from 'crypto';
import { MetricaRendimiento } from './metrica-rendimiento.value-object';

interface CrearSesionProps {
  atletaId: string;
  routineAssignmentId?: string;
  startTime: Date;
}

interface SesionEntrenamientoProps extends CrearSesionProps {
  id: string;
  endTime?: Date;
  rpeScore?: number;
  metricas: MetricaRendimiento[];
}

export class SesionEntrenamiento {
  readonly id: string;
  readonly atletaId: string;
  readonly routineAssignmentId?: string;
  readonly startTime: Date;
  public endTime?: Date;
  public rpeScore?: number;
  private _metricas: MetricaRendimiento[];

  private constructor(props: SesionEntrenamientoProps) {
    this.id = props.id;
    this.atletaId = props.atletaId;
    this.routineAssignmentId = props.routineAssignmentId;
    this.startTime = props.startTime;
    this.endTime = props.endTime;
    this.rpeScore = props.rpeScore;
    this._metricas = props.metricas || [];
  }

  /**
   * Método de fábrica para crear una nueva Sesión de Entrenamiento.
   * Representa el inicio de la sesión.
   */
  public static iniciar(props: CrearSesionProps): SesionEntrenamiento {
    if (!props.atletaId) {
      throw new Error('Una sesión debe estar asociada a un atleta.');
    }
    return new SesionEntrenamiento({
      id: randomUUID(),
      ...props,
      metricas: [],
    });
  }

  /**
   * Método para finalizar la sesión, aplicando reglas de negocio.
   */
  public finalizar(props: {
    endTime: Date;
    rpeScore?: number;
    metricas?: { tipo: string; valor: string; unidad: string }[];
  }): void {
    if (this.endTime) {
      throw new Error('La sesión ya ha sido finalizada.');
    }
    if (props.endTime < this.startTime) {
      throw new Error(
        'La fecha de finalización no puede ser anterior a la de inicio.',
      );
    }
    if (props.rpeScore && (props.rpeScore < 1 || props.rpeScore > 10)) {
      throw new Error('El RPE debe estar en un rango de 1 a 10.');
    }

    this.endTime = props.endTime;
    this.rpeScore = props.rpeScore;

    if (props.metricas) {
      this._metricas = props.metricas.map((m) => MetricaRendimiento.crear(m));
    }
  }

  /**
   * Getter para acceder a las métricas de forma controlada.
   */
  public get metricas(): readonly MetricaRendimiento[] {
    return this._metricas;
  }

  /**
   * Método para reconstituir la entidad desde la base de datos.
   */
  public static desdePersistencia(props: {
    id: string;
    atletaId: string;
    routineAssignmentId?: string;
    startTime: Date;
    endTime?: Date;
    rpeScore?: number;
    metricas: MetricaRendimiento[];
  }): SesionEntrenamiento {
    return new SesionEntrenamiento(props);
  }
}
