import { useState } from 'react'
import { QueryResult } from '../types'
import { api } from '../lib/api'

export const useQuery = () => {
  const [result, setResult] = useState<QueryResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const ask = async (question: string) => {
    setLoading(true)
    setError(null)
    const response = await api.query.ask(question)
    if (response.success && response.data) {
      setResult(response.data)
    } else {
      setError(response.error || 'Failed to get answer')
    }
    setLoading(false)
  }

  return { ask, result, loading, error }
}
