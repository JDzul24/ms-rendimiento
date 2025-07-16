import { randomUUID } from 'crypto';

interface MetricaRendimientoProps {
  id: string;
  tipo: string;
  valor: string;
  unidad: string;
  medidoEn: Date;
}

export class MetricaRendimiento {
  readonly id: string;
  readonly tipo: string;
  readonly valor: string;
  readonly unidad: string;
  readonly medidoEn: Date;

  private constructor(props: MetricaRendimientoProps) {
    if (!props.tipo || !props.valor || !props.unidad) {
      throw new Error('Los atributos de una métrica no pueden estar vacíos.');
    }
    this.id = props.id;
    this.tipo = props.tipo;
    this.valor = props.valor;
    this.unidad = props.unidad;
    this.medidoEn = props.medidoEn;
  }

  /**
   * Método de fábrica para crear una nueva instancia de una métrica.
   */
  public static crear(props: {
    tipo: string;
    valor: string;
    unidad: string;
  }): MetricaRendimiento {
    return new MetricaRendimiento({
      id: randomUUID(),
      tipo: props.tipo,
      valor: props.valor,
      unidad: props.unidad,
      medidoEn: new Date(),
    });
  }

  /**
   * Método para reconstituir la entidad desde la persistencia.
   */
  public static desdePersistencia(
    props: MetricaRendimientoProps,
  ): MetricaRendimiento {
    return new MetricaRendimiento(props);
  }
}
