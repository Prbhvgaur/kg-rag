import { ApiResponse, KGDocument, IngestionJob, QueryResult } from '../types'
import { supabase } from './supabase'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

async function getHeaders(): Promise<Record<string, string>> {
  // Bypassing Supabase calls if in demo mode
  if (localStorage.getItem('demo_mode') === 'true') {
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer demo-token',
      'X-Request-ID': crypto.randomUUID()
    }
  }

  try {
    const { data: { session } } = await supabase.auth.getSession()
    return {
      'Content-Type': 'application/json',
      'Authorization': session ? `Bearer ${session.access_token}` : '',
      'X-Request-ID': crypto.randomUUID()
    }
  } catch (err) {
    console.error('Failed to get Supabase session for headers:', err)
    return {
      'Content-Type': 'application/json',
      'Authorization': '',
      'X-Request-ID': crypto.randomUUID()
    }
  }
}

async function request<T>(url: string, options: RequestInit = {}, timeout = 10000): Promise<ApiResponse<T>> {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)

  try {
    const headers = await getHeaders()
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: { ...headers, ...options.headers },
      signal: controller.signal
    })

    clearTimeout(id)
    const result = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Request failed',
        code: result.code || 'UNKNOWN_ERROR',
        request_id: result.request_id
      }
    }

    return result as ApiResponse<T>
  } catch (error: any) {
    clearTimeout(id)
    return {
      success: false,
      error: error.name === 'AbortError' ? 'Request timed out' : error.message || 'An unknown error occurred',
      code: error.name === 'AbortError' ? 'TIMEOUT' : 'NETWORK_ERROR'
    }
  }
}

export const api = {
  health: () => request<{ status: string; dependencies: any }>('/health', { method: 'GET' }),
  
  documents: {
    list: () => request<KGDocument[]>('/api/documents', { method: 'GET' }),
    delete: (id: string) => request<void>(`/api/documents/${id}`, { method: 'DELETE' }),
    upload: (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      
      return new Promise<ApiResponse<IngestionJob>>(async (resolve) => {
        const { data: { session } } = await supabase.auth.getSession()
        const xhr = new XMLHttpRequest()
        
        xhr.open('POST', `${API_BASE_URL}/api/ingest`)
        xhr.setRequestHeader('Authorization', session ? `Bearer ${session.access_token}` : '')
        xhr.setRequestHeader('X-Request-ID', crypto.randomUUID())
        
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText))
          } else {
            resolve({
              success: false,
              error: 'Upload failed',
              code: 'UPLOAD_ERROR'
            })
          }
        }
        
        xhr.onerror = () => {
          resolve({
            success: false,
            error: 'Network error during upload',
            code: 'NETWORK_ERROR'
          })
        }
        
        xhr.send(formData)
      })
    }
  },
  
  jobs: {
    status: (jobId: string) => request<IngestionJob>(`/api/status/${jobId}`, { method: 'GET' })
  },
  
  query: {
    ask: (question: string) => request<QueryResult>('/api/query', {
      method: 'POST',
      body: JSON.stringify({ question })
    }, 30000) // 30s timeout for LLM
  }
}
