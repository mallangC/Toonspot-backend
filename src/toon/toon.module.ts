import {Module} from '@nestjs/common';
import {ToonController} from './toon.controller';
import {ToonService} from './toon.service';
import {PrismaModule} from "../../prisma/prisma.module";
import {ToonRepository} from "./toon.repository";
import {ToonScheduler} from "./toon.scheduler";

@Module({
  imports: [PrismaModule],
  controllers: [ToonController],
  providers: [ToonService, ToonRepository, ToonScheduler]
})
export class ToonModule {}
