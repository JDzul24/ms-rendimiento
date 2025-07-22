import { randomUUID } from 'crypto';

// Reutilizamos el enum para mantener la consistencia en todo el dominio.
export enum ResultadoCombateEnum {
  VICTORIA = 'VICTORIA',
  DERROTA = 'DERROTA',
  EMPATE = 'EMPATE',
  NO_APLICA = 'NO_APLICA',
}

interface EventoCombateProps {
  id: string;
  atletaId: string;
  tipoEvento: string;
  fecha: Date;
  nombreOponente?: string;
  resultado?: ResultadoCombateEnum;
}

export class EventoCombate {
  readonly id: string;
  readonly atletaId: string;
  readonly tipoEvento: string;
  readonly fecha: Date;
  public nombreOponente?: string;
  public resultado?: ResultadoCombateEnum;

  private constructor(props: EventoCombateProps) {
    this.id = props.id;
    this.atletaId = props.atletaId;
    this.tipoEvento = props.tipoEvento;
    this.fecha = props.fecha;
    this.nombreOponente = props.nombreOponente;
    this.resultado = props.resultado;
  }

  /**
   * Método de fábrica para crear una nueva instancia de EventoCombate.
   */
  public static crear(props: {
    atletaId: string;
    tipoEvento: string;
    fecha: Date;
    nombreOponente?: string;
    resultado?: ResultadoCombateEnum;
  }): EventoCombate {
    // Validaciones de negocio a nivel de dominio
    if (!props.atletaId || !props.tipoEvento || !props.fecha) {
      throw new Error(
        'Los campos atletaId, tipoEvento y fecha son requeridos.',
      );
    }
    if (props.fecha > new Date()) {
      throw new Error('La fecha del evento no puede ser en el futuro.');
    }

    return new EventoCombate({
      id: randomUUID(),
      atletaId: props.atletaId,
      tipoEvento: props.tipoEvento,
      fecha: props.fecha,
      nombreOponente: props.nombreOponente,
      resultado: props.resultado,
    });
  }

  /**
   * Método para reconstituir la entidad desde la capa de persistencia.
   */
  public static desdePersistencia(props: EventoCombateProps): EventoCombate {
    return new EventoCombate(props);
  }
}
