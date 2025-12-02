import {Injectable, OnModuleInit, OnModuleDestroy} from '@nestjs/common';
import {PrismaClient} from "@prisma/client";

@Injectable()
export class PrismaService
    extends PrismaClient
    implements OnModuleInit, OnModuleDestroy {
  constructor() {
    let databaseUrl = process.env.DATABASE_URL! as string;
    super({
      log: [
        {
          emit: 'event',
          level: 'query',
        },
        'warn',
        'error',
      ],
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
    })
  }

  async onModuleInit() {
    await this.$connect();
    // (this.$on as any)('query', (e) => {
    //   console.log('---SQL Query Log---');
    //   console.log('Query: ',e.query);
    //   console.log('Params:', e.params);
    //   console.log(`Duration: ${e.duration}ms`);
    // });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
