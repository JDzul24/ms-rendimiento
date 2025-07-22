import { ResultadoDePrueba } from '../entidades/resultado-de-prueba.entity';
import { ResultadoDePruebaEnriquecido } from '../../infraestructura/db/prisma-prueba.repositorio';

/**
 * Interfaz que define las operaciones de persistencia para la entidad ResultadoDePrueba.
 */
export interface IPruebaRepositorio {
  /**
   * Guarda múltiples nuevos resultados de pruebas en la base de datos.
   * @param resultados Un arreglo de entidades ResultadoDePrueba a persistir.
   */
  guardarMultiples(resultados: ResultadoDePrueba[]): Promise<void>;

  /**
   * Busca todos los resultados de pruebas para un atleta específico.
   * @param atletaId El ID del atleta cuyos resultados se buscan.
   * @returns Una promesa que resuelve a un arreglo de entidades ResultadoDePrueba.
   */
  encontrarPorAtletaId(
    atletaId: string,
  ): Promise<ResultadoDePruebaEnriquecido[]>;
}
