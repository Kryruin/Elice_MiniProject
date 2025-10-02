from fastapi import APIRouter, Query, HTTPException
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import os
from dotenv import load_dotenv
# Load environment variables from .env file
load_dotenv()

# Access the API key
api_key = os.getenv("YOUTUBE_API_KEY")
router = APIRouter()

# YouTube API key - in production, store this in environment variables
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")

@router.get("/search")
async def search_youtube_videos(q: str = Query("C++ programming")):
    """
    Search YouTube for videos matching the query
    """
    try:
        print(f"APIKEY: {YOUTUBE_API_KEY}")
        # Check API key first
        if not YOUTUBE_API_KEY:
            raise HTTPException(
                status_code=500, 
                detail="YouTube API key not configured. Please check your environment variables."
            )

        # Build YouTube service
        youtube = build('youtube', 'v3', developerKey=YOUTUBE_API_KEY)
        
        # Search for videos
        search_response = youtube.search().list(
            q=q,
            part='id,snippet',
            maxResults=20,
            type='video',
            order='relevance'
        ).execute()
        
        videos = []
        for item in search_response.get('items', []):
            video_id = item['id']['videoId']
            snippet = item['snippet']
            
            # Get video details for duration
            video_response = youtube.videos().list(
                part='contentDetails',
                id=video_id
            ).execute()
            
            duration = "Unknown"
            if video_response.get('items'):
                duration = video_response['items'][0]['contentDetails']['duration']
            
            videos.append({
                'id': video_id,
                'title': snippet['title'],
                'description': snippet['description'][:200] + '...' if len(snippet['description']) > 200 else snippet['description'],
                'thumbnail': snippet['thumbnails']['medium']['url'],
                'channel': snippet['channelTitle'],
                'publishedAt': snippet['publishedAt'],
                'duration': duration,
                'url': f"https://www.youtube.com/watch?v={video_id}",
                'source': 'youtube'
            })
        
        return {"items": videos}
        
    except HttpError as e:
        # Catch specific Google API errors, which will contain more details
        error_message = f"YouTube API returned status {e.resp.status}: {e.content.decode()}"
        print(error_message) # Log the error for debugging
        raise HTTPException(status_code=e.resp.status, detail=error_message)
        
    except Exception as e:
        # Catch any other unexpected errors
        print(f"Unexpected error: {str(e)}") # Log the error
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")

