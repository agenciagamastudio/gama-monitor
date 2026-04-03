/**
 * Persistence layer for history favorites and tags
 * Uses localStorage for client-side storage
 */

const FAVORITES_KEY = 'history-favorites'
const TAGS_KEY = 'history-tags'

/**
 * Get all favorite session IDs
 */
export function getFavorites(): Set<string> {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY) || '[]'
    const parsed = JSON.parse(stored) as string[]
    return new Set(parsed)
  } catch (err) {
    console.error('Failed to load favorites:', err)
    return new Set()
  }
}

/**
 * Check if a session is favorited
 */
export function isFavorite(sessionId: string): boolean {
  return getFavorites().has(sessionId)
}

/**
 * Add session to favorites
 */
export function addFavorite(sessionId: string): void {
  try {
    const favorites = getFavorites()
    favorites.add(sessionId)
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(favorites)))
  } catch (err) {
    console.error('Failed to save favorite:', err)
  }
}

/**
 * Remove session from favorites
 */
export function removeFavorite(sessionId: string): void {
  try {
    const favorites = getFavorites()
    favorites.delete(sessionId)
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(favorites)))
  } catch (err) {
    console.error('Failed to remove favorite:', err)
  }
}

/**
 * Toggle favorite status for a session
 */
export function toggleFavorite(sessionId: string): boolean {
  if (isFavorite(sessionId)) {
    removeFavorite(sessionId)
    return false
  } else {
    addFavorite(sessionId)
    return true
  }
}

/**
 * Get all tags for a session
 */
export function getTags(sessionId: string): string[] {
  try {
    const stored = localStorage.getItem(TAGS_KEY) || '{}'
    const parsed = JSON.parse(stored) as Record<string, string[]>
    return parsed[sessionId] || []
  } catch (err) {
    console.error('Failed to load tags:', err)
    return []
  }
}

/**
 * Set tags for a session (overwrites existing)
 */
export function setTags(sessionId: string, tags: string[]): void {
  try {
    const allTags = JSON.parse(localStorage.getItem(TAGS_KEY) || '{}') as Record<string, string[]>
    allTags[sessionId] = tags
    localStorage.setItem(TAGS_KEY, JSON.stringify(allTags))
  } catch (err) {
    console.error('Failed to save tags:', err)
  }
}

/**
 * Add a tag to a session
 */
export function addTag(sessionId: string, tag: string): void {
  try {
    const tags = getTags(sessionId)
    if (!tags.includes(tag)) {
      tags.push(tag)
      setTags(sessionId, tags)
    }
  } catch (err) {
    console.error('Failed to add tag:', err)
  }
}

/**
 * Remove a tag from a session
 */
export function removeTag(sessionId: string, tag: string): void {
  try {
    const tags = getTags(sessionId)
    const filtered = tags.filter((t) => t !== tag)
    setTags(sessionId, filtered)
  } catch (err) {
    console.error('Failed to remove tag:', err)
  }
}

/**
 * Clear all data (favorites + tags)
 */
export function clearAll(): void {
  try {
    localStorage.removeItem(FAVORITES_KEY)
    localStorage.removeItem(TAGS_KEY)
  } catch (err) {
    console.error('Failed to clear storage:', err)
  }
}
