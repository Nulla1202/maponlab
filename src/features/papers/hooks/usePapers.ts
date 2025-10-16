'use client'

import { useState, useEffect } from 'react'
import { Paper } from '@/core/models/Paper'
import { IndexedDBProvider } from '@/core/storage/providers/IndexedDBProvider'
import { PaperRepository } from '@/core/storage/repositories/PaperRepository'

export function usePapers() {
  const [papers, setPapers] = useState<Paper[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const repository = new PaperRepository(new IndexedDBProvider())

  const loadPapers = async () => {
    try {
      setLoading(true)
      const allPapers = await repository.findAll()
      console.log(`📚 IndexedDBから論文読み込み: ${allPapers.length}件`)
      allPapers.forEach(paper => {
        const geoCount = paper.affiliations.filter(a => a.geoPoint !== null).length
        console.log(`  - 「${paper.title}」: ${paper.affiliations.length}所属, ${geoCount}件に座標`)
      })
      setPapers(allPapers)
      setError(null)
    } catch (err) {
      setError(err as Error)
      console.error('Load papers error:', err)
    } finally {
      setLoading(false)
    }
  }

  const addPaper = async (paper: Paper) => {
    try {
      const geoCount = paper.affiliations.filter(a => a.geoPoint !== null).length
      console.log(`💾 論文を保存: 「${paper.title}」(${paper.affiliations.length}所属, ${geoCount}件に座標)`)
      await repository.save(paper)
      await loadPapers()
    } catch (err) {
      setError(err as Error)
      console.error('Add paper error:', err)
      throw err
    }
  }

  const deletePaper = async (id: string) => {
    try {
      await repository.delete(id)
      await loadPapers()
    } catch (err) {
      setError(err as Error)
      console.error('Delete paper error:', err)
      throw err
    }
  }

  const getPaper = async (id: string): Promise<Paper | null> => {
    try {
      return await repository.findById(id)
    } catch (err) {
      setError(err as Error)
      console.error('Get paper error:', err)
      return null
    }
  }

  useEffect(() => {
    loadPapers()
  }, [])

  return {
    papers,
    loading,
    error,
    addPaper,
    deletePaper,
    getPaper,
    reload: loadPapers
  }
}
