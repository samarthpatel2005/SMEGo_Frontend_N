// Fetcher function for SWR
export const fetcher = async (url: string) => {
  const token = localStorage.getItem('token')
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    }
  })

  if (!response.ok) {
    const error = new Error('An error occurred while fetching the data.')
    // Attach extra info to the error object
    ;(error as any).info = await response.json()
    ;(error as any).status = response.status
    throw error
  }

  return response.json()
}

// Fetcher with POST method
export const postFetcher = async (url: string, data: any) => {
  const token = localStorage.getItem('token')
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    },
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    const error = new Error('An error occurred while posting the data.')
    ;(error as any).info = await response.json()
    ;(error as any).status = response.status
    throw error
  }

  return response.json()
}

// Fetcher with PUT method
export const putFetcher = async (url: string, data: any) => {
  const token = localStorage.getItem('token')
  
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    },
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    const error = new Error('An error occurred while updating the data.')
    ;(error as any).info = await response.json()
    ;(error as any).status = response.status
    throw error
  }

  return response.json()
}

// Fetcher with DELETE method
export const deleteFetcher = async (url: string) => {
  const token = localStorage.getItem('token')
  
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    }
  })

  if (!response.ok) {
    const error = new Error('An error occurred while deleting the data.')
    ;(error as any).info = await response.json()
    ;(error as any).status = response.status
    throw error
  }

  return response.json()
}
