import { randomUUID } from 'crypto';

interface ResultadoDePruebaProps {
  id: string;
  atletaId: string;
  testId: string; // ID de la prueba estandarizada (ej: 'Plancha', 'Salto de Cuerda')
  testDate: Date;
  resultValue: string; // El resultado crudo (ej: '120', '3.5')
  normalizedScore?: number; // El puntaje calculado (ej: 8.7)
}

export class ResultadoDePrueba {
  readonly id: string;
  readonly atletaId: string;
  readonly testId: string;
  readonly testDate: Date;
  public resultValue: string;
  public normalizedScore?: number;

  private constructor(props: ResultadoDePruebaProps) {
    this.id = props.id;
    this.atletaId = props.atletaId;
    this.testId = props.testId;
    this.testDate = props.testDate;
    this.resultValue = props.resultValue;
    this.normalizedScore = props.normalizedScore;
  }

  /**
   * Método de fábrica para crear una nueva instancia de ResultadoDePrueba.
   * Representa un nuevo registro de un resultado.
   */
  public static crear(props: {
    atletaId: string;
    testId: string;
    valor: string;
    puntajeNormalizado?: number;
  }): ResultadoDePrueba {
    // Validaciones de dominio
    if (!props.atletaId || !props.testId || !props.valor) {
      throw new Error('Los campos atletaId, testId y valor son requeridos.');
    }

    return new ResultadoDePrueba({
      id: randomUUID(),
      atletaId: props.atletaId,
      testId: props.testId,
      testDate: new Date(),
      resultValue: props.valor,
      normalizedScore: props.puntajeNormalizado,
    });
  }

  /**
   * Método para reconstituir la entidad desde la persistencia.
   */
  public static desdePersistencia(
    props: ResultadoDePruebaProps,
  ): ResultadoDePrueba {
    return new ResultadoDePrueba(props);
  }
}
