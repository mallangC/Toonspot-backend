import {Module} from '@nestjs/common';
import {FavoriteController} from './favorite.controller';
import {FavoriteService} from './favorite.service';
import {FavoriteRepository} from "./favorit.repository";
import {ToonModule} from "../toon/toon.module";
import {PrismaModule} from "../../prisma/prisma.module";

@Module({
  imports: [PrismaModule, ToonModule],
  controllers: [FavoriteController],
  providers: [FavoriteService, FavoriteRepository]
})
export class FavoriteModule {}
