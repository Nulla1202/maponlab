import { IPaperRepository } from '../interfaces/IPaperRepository'
import { IStorageProvider } from '../interfaces/IStorageProvider'
import { Paper } from '../../models/Paper'

export class PaperRepository implements IPaperRepository {
  private prefix = 'paper:'

  constructor(private storageProvider: IStorageProvider) {}

  private getKey(id: string): string {
    return `${this.prefix}${id}`
  }

  private extractId(key: string): string {
    return key.replace(this.prefix, '')
  }

  async save(paper: Paper): Promise<void> {
    await this.storageProvider.save(this.getKey(paper.id), paper.toJSON())
  }

  async findById(id: string): Promise<Paper | null> {
    const data = await this.storageProvider.load(this.getKey(id))
    if (!data) {
      return null
    }
    return Paper.fromJSON(data)
  }

  async findAll(): Promise<Paper[]> {
    const keys = await this.storageProvider.list()
    const paperKeys = keys.filter((key) => key.startsWith(this.prefix))

    const papers = await Promise.all(
      paperKeys.map(async (key) => {
        const id = this.extractId(key)
        return this.findById(id)
      })
    )

    return papers.filter((p): p is Paper => p !== null)
  }

  async delete(id: string): Promise<void> {
    await this.storageProvider.delete(this.getKey(id))
  }

  async exists(id: string): Promise<boolean> {
    return this.storageProvider.exists(this.getKey(id))
  }
}
