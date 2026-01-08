import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  public readonly client: any;

  constructor() {
    const databaseUrl = process.env.DATABASE_URL!;
    super({
      log: [{ emit: 'event', level: 'query' }, 'warn', 'error'],
      datasources: { db: { url: databaseUrl } },
    });

    const skipModels = ['PostLike'];
    this.client = this.$extends({
      query: {
        $allModels: {
          async $allOperations({ model, operation, args, query }) {
            if (!skipModels.includes(model)) {
              const kstNow = new Date(new Date().getTime() + 9 * 60 * 60 * 1000);

              if (operation === 'create') {
                args.data = args.data ?? {};
                (args.data as any).createdAt = kstNow;
                (args.data as any).updatedAt = kstNow;
              }
              else if (operation === 'update') {
                args.data = args.data ?? {};
                (args.data as any).updatedAt = kstNow;
              }
              else if (operation === 'upsert') {
                args.create = args.create ?? {};
                args.update = args.update ?? {};
                (args.create as any).createdAt = kstNow;
                (args.create as any).updatedAt = kstNow;
                (args.update as any).updatedAt = kstNow;
              }
              else if (operation === 'createMany') {
                if (Array.isArray(args.data)) {
                  args.data = args.data.map((item: any) => ({
                    ...item,
                    createdAt: item.createdAt ?? kstNow,
                    updatedAt: item.updatedAt ?? kstNow,
                  }));
                }
              }
              else if (operation === 'updateMany') {
                args.data = args.data ?? {};
                (args.data as any).updatedAt = kstNow;
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