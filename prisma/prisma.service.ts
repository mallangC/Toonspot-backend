import {Injectable, OnModuleInit, OnModuleDestroy} from '@nestjs/common';
import {PrismaClient} from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  public readonly client: any;

  constructor() {
    let databaseUrl = process.env.DATABASE_URL! as string;
    super({
      log: [{emit: 'event', level: 'query'}, 'warn', 'error'],
      datasources: {db: {url: databaseUrl}},
    });

    this.client = this.$extends({
      query: {
        $allModels: {
          async $allOperations({operation, args, query}) {
            const kstNow = new Date(new Date().getTime() + 9 * 60 * 60 * 1000);

            if (['create', 'update', 'upsert', 'createMany', 'updateMany'].includes(operation)) {
              if (operation === 'create') {
                args.data.createdAt = kstNow;
                args.data.updatedAt = kstNow;
              } else if (operation === 'update') {
                args.data.updatedAt = kstNow;
              } else if (operation === 'upsert') {
                args.create.createdAt = kstNow;
                args.create.updatedAt = kstNow;
                args.update.updatedAt = kstNow;
              } else if (operation === 'createMany') {
                if (Array.isArray(args.data)) {
                  args.data = args.data.map((item: any) => ({
                    ...item,
                    createdAt: item.createdAt ?? kstNow,
                    updatedAt: item.updatedAt ?? kstNow,
                  }));
                }
              } else if (operation === 'updateMany') {
                args.data.updatedAt = kstNow;
              }
            }
            return query(args);
          },
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}