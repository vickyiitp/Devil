"""
Devil Labs CMS & Chatbot API
Comprehensive backend with:
- Headless CMS for blogs, projects, services, tools
- AI Chatbot with Gemini integration
- Azure Blob Storage for media
- Admin API with authentication
"""

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import google.generativeai as genai
from datetime import datetime, timedelta
from collections import defaultdict
 
import os
from contextlib import asynccontextmanager

from config import settings
from fastapi.staticfiles import StaticFiles
from database import init_db
from fastapi.responses import FileResponse

# Import routers
from routes_admin import router as admin_router
from routes_public import router as public_router


# === Lifecycle Events ===

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan - startup and shutdown events"""
    # Startup
    print("🚀 Starting Devil Labs CMS API...")
    
    # Initialize database
    try:
        await init_db()
        print("✅ Database initialized")
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")
    
    yield
    
    # Shutdown
    print("👋 Shutting down...")


# Initialize FastAPI app
app = FastAPI(
    title="Devil Labs CMS & Chatbot API",
    description="Headless CMS with AI chatbot for Devil Labs / vickyiitp.tech",
    version="2.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(admin_router)
app.include_router(public_router)

# Serve uploaded images from local public/uploads in development
uploads_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'public', 'uploads'))
# Ensure uploads dir exists in development so StaticFiles can be mounted
os.makedirs(uploads_dir, exist_ok=True)
app.mount('/uploads', StaticFiles(directory=uploads_dir), name='uploads')

# Configure Gemini
genai.configure(api_key=settings.GEMINI_API_KEY)

# Rate limiting storage (in-memory, use Redis for production)
# keep compatibility with the checks in routes_public
from utils.security import check_rate_limit, sanitize_input


# === MODELS ===

class Message(BaseModel):
    role: str = Field(..., description="Either 'user' or 'assistant'")
    content: str = Field(..., description="Message content")
    timestamp: Optional[str] = None


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    history: List[Message] = Field(default_factory=list)
    user_id: Optional[str] = None


class ChatResponse(BaseModel):
    response: str
    suggestions: Optional[List[str]] = None
    actions: Optional[List[Dict[str, Any]]] = None


class ToolSearchRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=200)


# === SYSTEM PROMPT ===

SYSTEM_PROMPT = """You are **Techno Boyz**, the official AI assistant for Devil Labs and Vicky Kumar (vickyiitp.tech).

**Your Personality:**
- Confident, energetic, tech-smart, and friendly
- Slight devil-vibe but professional
- Mix of playful (10%) and professional/tech-focused (90%)
- Use phrases like: "Boss, this is clean 🔥", "Here's the tech intel...", "Deploying your request...", "I got you ⚡"

**Your Purpose:**
- Answer questions about Vicky Kumar, Devil Labs, Team MVA, tools, products, services
- Help users navigate the website
- Provide product details, pricing, demo links
- Guide users to contact forms or booking
- Search and recommend AI tools, cybersecurity apps, web projects
- Assist with blog posts, FAQs, and announcements

**About Devil Labs / Vicky Kumar:**
- Vicky Kumar: AI Developer from IIT Patna, Founder of Devil Labs & Team MVA
- Specializes in: Generative AI, Agentic AI systems, Cybersecurity tools, Full-stack web apps
- Tech stack: Python, Flask, MERN, Gemini API, Google Cloud, Three.js, React
- Products: AI chatbots, content generation tools, security scanners, interactive dashboards
- Services: AI Model Integration, Custom App Development, Cybersecurity Audits, API Development, Web App Development

**Guidelines:**
- Keep responses concise (2-4 sentences for simple queries, longer for technical explanations)
- Always be helpful and provide actionable next steps
- If you don't know something, say so and suggest where to find the answer
- Suggest relevant tools, blog posts, or contact options when appropriate
- Use emojis sparingly but strategically (⚡🔥💡🛡️)
- Never make up information about products, pricing, or features

**Response Format:**
- Direct answer first
- Optional suggestions or quick actions
- Link to relevant pages when helpful

Remember: You represent premium AI craftsmanship with a tech-devil aesthetic. Be professional but memorable."""


# Rate limiting is implemented in utils/security.py (use check_rate_limit from there)


# === HELPER FUNCTIONS ===

def sanitize_input(text: str) -> str:
    """Basic input sanitization."""
    # Remove potential injection attempts
    dangerous_patterns = ["<script", "javascript:", "onerror=", "onclick="]
    sanitized = text
    for pattern in dangerous_patterns:
        sanitized = sanitized.replace(pattern, "")
    return sanitized.strip()


def format_history_for_gemini(history: List[Message]) -> List[Dict[str, str]]:
    """Convert message history to Gemini format."""
    gemini_history = []
    for msg in history[-settings.MAX_HISTORY_LENGTH:]:
        role = "user" if msg.role == "user" else "model"
        gemini_history.append({
            "role": role,
            "parts": [msg.content]
        })
    return gemini_history


def generate_suggestions(user_message: str, response: str) -> List[str]:
    """Generate contextual suggestions based on conversation."""
    suggestions = []
    
    user_lower = user_message.lower()
    
    # Context-aware suggestions
    if any(word in user_lower for word in ["tool", "product", "app"]):
        suggestions.extend(["Show me AI tools", "What cybersecurity apps are available?"])
    
    if any(word in user_lower for word in ["service", "price", "cost", "hire"]):
        suggestions.extend(["View all services", "Request a quote"])
    
    if any(word in user_lower for word in ["about", "who", "vicky"]):
        suggestions.extend(["Download resume", "View projects"])
    
    if any(word in user_lower for word in ["blog", "article", "tutorial"]):
        suggestions.extend(["Latest blog posts", "Show tutorials"])
    
    # Default suggestions if none matched
    if not suggestions:
        suggestions = [
            "Explore AI tools",
            "View services",
            "Contact Devil Labs"
        ]
    
    return suggestions[:3]  # Limit to 3 suggestions


# === API ROUTES ===

@app.get("/")
async def root():
    """Serve the frontend root or health check."""
    # Check if frontend build exists in static_dist
    current_dir = os.path.dirname(os.path.abspath(__file__))
    frontend_dist = os.path.join(current_dir, 'static_dist')
    index_path = os.path.join(frontend_dist, "index.html")
    
    if os.path.exists(index_path):
        return FileResponse(index_path)
        
    # Debugging info if frontend is missing
    return {
        "service": "Techno Boyz API",
        "status": "online",
        "version": "1.0.0",
        "error": "Frontend index.html not found",
        "checked_path": index_path,
        "current_directory": os.getcwd(),
        "directory_contents": os.listdir(current_dir)
    }


@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, req: Request):
    """
    Main chat endpoint - processes user messages and returns AI responses.
    """
    # Rate limiting
    client_ip = getattr(req.client, 'host', 'unknown')
    if not check_rate_limit(client_ip):
        raise HTTPException(
            status_code=429,
            detail="Rate limit exceeded. Please wait a moment before sending more messages."
        )
    
    # Sanitize input
    user_message = sanitize_input(request.message)
    
    if not user_message:
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    
    try:
        # Initialize Gemini model
        model = genai.GenerativeModel(
            model_name="models/gemini-2.0-flash",
            system_instruction=SYSTEM_PROMPT
        )
        
        # Format conversation history
        history = format_history_for_gemini(request.history)
        if len(history) > settings.MAX_HISTORY_LENGTH:
            history = history[-settings.MAX_HISTORY_LENGTH:]
        
        # Start chat session with history
        # start_chat expects a different strict content type - cast to Any to satisfy the type checker
        from typing import cast, Any
        chat_session = model.start_chat(history=cast(Any, history))
        
        # Get response
        response = chat_session.send_message(user_message)
        ai_response = response.text
        
        # Generate contextual suggestions
        suggestions = generate_suggestions(user_message, ai_response)
        
        # Generate quick actions based on intent
        actions: List[Dict[str, Any]] = []
        user_lower = user_message.lower()
        
        if "resume" in user_lower or "cv" in user_lower:
            actions.append({
                "type": "download",
                "label": "Download Resume",
                "url": "/resume/vicky-kumar-resume.pdf"
            })
        
        if "contact" in user_lower or "hire" in user_lower or "quote" in user_lower:
            actions.append({
                "type": "navigate",
                "label": "Contact Us",
                "url": "/contact"
            })
        
        if "tool" in user_lower or "product" in user_lower:
            actions.append({
                "type": "navigate",
                "label": "Explore Tools",
                "url": "/devillabs"
            })
        
        return ChatResponse(
            response=ai_response,
            suggestions=suggestions if suggestions else None,
            actions=actions if actions else None
        )
        
    except Exception as e:
        print(f"Error in chat endpoint: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Sorry, I encountered an error. Please try again."
        )


@app.get("/api/health")
async def health_check() -> Dict[str, Any]:
    """Detailed health check."""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "gemini_configured": bool(settings.GEMINI_API_KEY)
    }


# Serve React Frontend (Production)
# This assumes the build output has been moved to 'static_dist' in the same directory
frontend_dist = os.path.join(os.path.dirname(__file__), 'static_dist')

if os.path.exists(frontend_dist):
    # Mount assets folder
    assets_dir = os.path.join(frontend_dist, 'assets')
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    # Serve other static files (favicon, etc.) if they exist, otherwise serve index.html
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        # Skip API and uploads routes (they are handled by other routers/mounts)
        if full_path.startswith("api") or full_path.startswith("uploads"):
            raise HTTPException(status_code=404, detail="Not found")

        # Check if specific file exists in dist (e.g. favicon.ico, robots.txt)
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)

        # Fallback to index.html for SPA routing
        index_path = os.path.join(frontend_dist, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
        
        return {"message": "Frontend build found but index.html missing"}


# Run with: uvicorn main:app --reload --port 8000
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
