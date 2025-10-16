export interface IStorageProvider {
  save(key: string, data: unknown): Promise<void>
  load(key: string): Promise<unknown>
  delete(key: string): Promise<void>
  list(): Promise<string[]>
  exists(key: string): Promise<boolean>
}
