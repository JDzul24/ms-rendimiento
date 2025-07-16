import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  // Este método se ejecuta cuando el módulo se inicializa.
  // Es el lugar perfecto para conectarse a la base de datos.
  async onModuleInit() {
    await this.$connect();
  }

  // Este método se ejecuta cuando la aplicación recibe una señal de cierre.
  // NestJS se encarga de llamarlo. Es el lugar correcto para desconectarse.
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
