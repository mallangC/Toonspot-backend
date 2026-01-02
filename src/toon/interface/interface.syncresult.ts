import {ToonDto} from "../dto/toon.dto";
import {ToonUpdate} from "./interface.toon.update";

export interface SyncResult {
  createData: ToonDto[];
  updateData: ToonUpdate[];
}