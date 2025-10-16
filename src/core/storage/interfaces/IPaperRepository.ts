import { Paper } from '../../models/Paper'

export interface IPaperRepository {
  save(paper: Paper): Promise<void>
  findById(id: string): Promise<Paper | null>
  findAll(): Promise<Paper[]>
  delete(id: string): Promise<void>
  exists(id: string): Promise<boolean>
}
