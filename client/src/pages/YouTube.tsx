import { useState, useEffect } from 'react'

type Video = {
  id: string
  title: string
  description: string
  thumbnail: string
  channel: string
  publishedAt: string
  duration?: string
  url: string
  source: string
}
type ProgressRow = { status: 'not_started' | 'in_progress' | 'done'; percent: number; updatedAt: string }
export default function YouTube() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('C++ programming')
  const [savedVideos, setSavedVideos] = useState<Set<string>>(new Set())
  const [videoProgress, setVideoProgress] = useState<Record<string, ProgressRow>>({})

  async function searchVideos(searchQuery: string = query) {
    setLoading(true)
    setError(null)
    try {
      const r = await fetch(`/api/youtube/search?q=${encodeURIComponent(searchQuery)}`, {
        credentials: 'include',
      })
      if (!r.ok) {
        throw new Error('Failed to fetch videos')
      }
      const data = await r.json()
      setVideos(data.items || [])
    } catch (err) {
      setError('Failed to fetch videos')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function loadTrending() {
    setLoading(true)
    setError(null)
    try {
      const r = await fetch('/api/youtube/trending', {
        credentials: 'include',
      })
      if (!r.ok) {
        throw new Error('Failed to fetch trending videos')
      }
      const data = await r.json()
      setVideos(data.items || [])
    } catch (err) {
      setError('Failed to fetch trending videos')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function loadSavedVideos() {
    try {
      const r = await fetch('/api/saved', { credentials: 'include' })
      const data = await r.json()
      const saved: Set<string> = new Set(data.items.filter((item: any) => item.source === 'youtube').map((item: any) => item.id))
      setSavedVideos(saved)
    } catch (err) {
      console.error('Failed to load saved videos:', err)
    }
  }

  async function loadVideoProgress() {
    try {
      const r = await fetch('/api/progress', { credentials: 'include' })
      const data = await r.json()
      setVideoProgress(data.progress || {})
    } catch (err) {
      console.error('Failed to load video progress:', err)
    }
  }

  async function saveVideo(video: Video) {
    try {
      await fetch('/api/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          id: video.id,
          title: video.title,
          author: video.channel,
          year: new Date(video.publishedAt).getFullYear(),
          source: 'youtube',
          url: video.url
        }),
      })
      setSavedVideos(prev => new Set([...prev, video.id]))
    } catch (err) {
      console.error('Failed to save video:', err)
    }
  }

  async function unsaveVideo(videoId: string) {
    try {
      await fetch(`/api/saved/${encodeURIComponent(videoId)}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      setSavedVideos(prev => {
        const newSet = new Set(prev)
        newSet.delete(videoId)
        return newSet
      })
    } catch (err) {
      console.error('Failed to unsave video:', err)
    }
  }

  async function updateVideoProgress(videoId: string, progress: Partial<ProgressRow>) {
    try {
      const currentProgress = videoProgress[videoId] || { status: 'in_progress', percent: 0, updatedAt: new Date().toISOString() }
      const newProgress = { ...currentProgress, ...progress }
      
      await fetch(`/api/progress/${encodeURIComponent(videoId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newProgress),
      })
      
      setVideoProgress(prev => ({
        ...prev,
        [videoId]: newProgress
      }))
    } catch (err) {
      console.error('Failed to update progress:', err)
    }
  }

  useEffect(() => {
    searchVideos('C++ programming')
    loadSavedVideos()
    loadVideoProgress()
  }, [])

  return (
    <div>
      <h2>YouTube Videos</h2>
      
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for videos..."
            style={{ padding: 8, flex: 1 }}
          />
          <button onClick={() => searchVideos()} disabled={loading}>
            Search
          </button>
        </div>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {loading && <p>Loading videos...</p>}
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
        {videos.map((video) => {
          const isSaved = savedVideos.has(video.id)
          const progress = videoProgress[video.id]
          const progressPercent = progress?.percent || 0
          const progressStatus = progress?.status || 'not_started'
          
          return (
            <div key={video.id} style={{ border: '1px solid #ddd', borderRadius: 8, overflow: 'hidden', position: 'relative' }}>
              {/* Progress bar */}
              {progressPercent > 0 && (
                <div style={{ 
                  position: 'absolute', 
                  top: 0, 
                  left: 0, 
                  right: 0, 
                  height: 4, 
                  backgroundColor: '#e0e0e0',
                  zIndex: 1
                }}>
                  <div style={{ 
                    height: '100%', 
                    width: `${progressPercent}%`, 
                    backgroundColor: progressStatus === 'done' ? '#28a745' : '#007bff',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              )}
              
              {/* Saved indicator */}
              {isSaved && (
                <div style={{ 
                  position: 'absolute', 
                  top: 8, 
                  right: 8, 
                  backgroundColor: '#28a745', 
                  color: 'white', 
                  padding: '2px 6px', 
                  borderRadius: 4, 
                  fontSize: 10,
                  zIndex: 1
                }}>
                  ✓ Saved
                </div>
              )}
              
              <img 
                src={video.thumbnail} 
                alt={video.title}
                style={{ width: '100%', height: 180, objectFit: 'cover' }}
              />
              <div style={{ padding: 12 }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: 14, lineHeight: 1.3 }}>
                  {video.title}
                </h3>
                <p style={{ margin: '0 0 8px 0', fontSize: 12, color: '#666' }}>
                  {video.channel}
                </p>
                <p style={{ margin: '0 0 12px 0', fontSize: 11, color: '#888', lineHeight: 1.4 }}>
                  {video.description}
                </p>
                
                {/* Progress info */}
                {progress && (
                  <div style={{ marginBottom: 12, padding: 8, backgroundColor: '#f8f9fa', borderRadius: 4 }}>
                    <div style={{ fontSize: 11, color: '#666', marginBottom: 4 }}>
                      Progress: {progressPercent}% ({progressStatus})
                    </div>
                  </div>
                )}
                
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <a 
                    href={video.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ 
                      padding: '6px 12px', 
                      backgroundColor: '#007bff', 
                      color: 'white', 
                      textDecoration: 'none', 
                      borderRadius: 4,
                      fontSize: 12
                    }}
                  >
                    Watch
                  </a>
                  <button 
                    onClick={() => isSaved ? unsaveVideo(video.id) : saveVideo(video)}
                    style={{ 
                      padding: '6px 12px', 
                      backgroundColor: isSaved ? '#dc3545' : '#28a745', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: 4,
                      fontSize: 12,
                      cursor: 'pointer'
                    }}
                  >
                    {isSaved ? 'Unsave' : 'Save'}
                  </button>
                  <button 
                    onClick={() => updateVideoProgress(video.id, { percent: Math.min(100, progressPercent + 25) })}
                    style={{ 
                      padding: '6px 12px', 
                      backgroundColor: '#6c757d', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: 4,
                      fontSize: 12,
                      cursor: 'pointer'
                    }}
                  >
                    +25%
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      
      {videos.length === 0 && !loading && (
        <p>No videos found. Try a different search term.</p>
      )}
    </div>
  )
}
