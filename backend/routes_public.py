"""
Public API routes for frontend consumption
No authentication required - read-only access
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, update
from typing import List, Optional

from database import get_db
from models import Blog, Project, Service, Tool, Category, Tag, ResumeDownload
import os
from fastapi.responses import FileResponse
from datetime import datetime, timezone
from fastapi import Request
from utils.security import check_rate_limit, sanitize_input
from schemas import ContactRequest, ContactResponse
from utils.email_utils import send_email
from schemas import (
    BlogResponse, ProjectResponse, ServiceResponse,
    ToolResponse, CategoryResponse, TagResponse
)

router = APIRouter(prefix="/api", tags=["Public"])


# === Blog Endpoints ===

@router.get("/blogs", response_model=List[BlogResponse])
async def get_blogs(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    category: Optional[str] = None,
    tag: Optional[str] = None,
    search: Optional[str] = None,
    featured: Optional[bool] = None,
    db: AsyncSession = Depends(get_db)
):
    """Get all published blogs with optional filtering"""
    query = select(Blog).where(Blog.published == True)
    
    # Filter by category
    if category:
        query = query.join(Category).where(Category.slug == category)
    
    # Filter by tag
    if tag:
        query = query.join(Blog.tags).where(Tag.slug == tag)
    
    # Search
    if search:
        query = query.where(
            or_(
                Blog.title.ilike(f"%{search}%"),
                Blog.excerpt.ilike(f"%{search}%"),
                Blog.content.ilike(f"%{search}%")
            )
        )
    
    # Filter by featured
    if featured is not None:
        query = query.where(Blog.featured == featured)
    
    # Order by published date
    query = query.order_by(Blog.published_at.desc())
    
    # Pagination
    query = query.offset(skip).limit(limit)
    
    result = await db.execute(query)
    blogs = result.scalars().all()
    
    return blogs


@router.get("/blogs/{slug}", response_model=BlogResponse)
async def get_blog_by_slug(
    slug: str,
    db: AsyncSession = Depends(get_db)
):
    """Get a single blog post by slug"""
    try:
        result = await db.execute(
            select(Blog).where(Blog.slug == slug, Blog.published == True)
        )
        blog = result.scalar_one_or_none()
        
        if not blog:
            raise HTTPException(status_code=404, detail="Blog not found")
        
        # Increment views using UPDATE statement
        await db.execute(
            update(Blog).where(Blog.id == blog.id).values(views=Blog.views + 1)
        )
        await db.commit()
        
        # Convert to dict to avoid SQLAlchemy relationship access issues
        blog_dict = {
            "id": blog.id,
            "title": blog.title,
            "slug": blog.slug,
            "excerpt": blog.excerpt,
            "content": blog.content,
            "author": blog.author,
            "featured_image": blog.featured_image,
            "thumbnail_image": blog.thumbnail_image,
            "read_time": blog.read_time,
            "meta_title": blog.meta_title,
            "meta_description": blog.meta_description,
            "meta_keywords": blog.meta_keywords,
            "published": blog.published,
            "featured": blog.featured,
            "category_id": blog.category_id,
            "views": (blog.views or 0) + 1,  # Return incremented value
            "likes": blog.likes or 0,
            "created_at": blog.created_at,
            "updated_at": blog.updated_at,
            "published_at": blog.published_at,
        }
        
        return blog_dict
    except Exception as e:
        import traceback, pathlib
        tb = traceback.format_exc()
        log_path = pathlib.Path(__file__).parent / "logs"
        log_path.mkdir(exist_ok=True)
        (log_path / "blog_detail_error.log").write_text(f"ERROR: {e}\n\nTrace:\n{tb}")
        # Re-raise to let FastAPI return 500 but we have logged the stack
        raise


@router.post("/blogs/{slug}/like")
async def like_blog(
    slug: str,
    db: AsyncSession = Depends(get_db)
):
    """Like a blog post"""
    result = await db.execute(
        select(Blog).where(Blog.slug == slug, Blog.published == True)
    )
    blog = result.scalar_one_or_none()
    
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    
    blog.likes += 1
    await db.commit()
    
    return {"likes": blog.likes}


# === Project Endpoints ===

@router.get("/projects", response_model=List[ProjectResponse])
async def get_projects(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    category: Optional[str] = None,
    tag: Optional[str] = None,
    status: Optional[str] = None,
    featured: Optional[bool] = None,
    db: AsyncSession = Depends(get_db)
):
    """Get all published projects with optional filtering"""
    query = select(Project).where(Project.published == True)
    
    if category:
        query = query.join(Category).where(Category.slug == category)
    
    if tag:
        query = query.join(Project.tags).where(Tag.slug == tag)
    
    if status:
        query = query.where(Project.status == status)
    
    if featured is not None:
        query = query.where(Project.featured == featured)
    
    query = query.order_by(Project.published_at.desc())
    query = query.offset(skip).limit(limit)
    
    result = await db.execute(query)
    projects = result.scalars().all()
    
    return projects


@router.get("/projects/{slug}", response_model=ProjectResponse)
async def get_project_by_slug(
    slug: str,
    db: AsyncSession = Depends(get_db)
):
    """Get a single project by slug"""
    result = await db.execute(
        select(Project).where(Project.slug == slug, Project.published == True)
    )
    project = result.scalar_one_or_none()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Increment views
    project.views += 1
    await db.commit()
    
    return project


# === Service Endpoints ===

@router.get("/services", response_model=List[ServiceResponse])
async def get_services(
    active_only: bool = True,
    featured: Optional[bool] = None,
    db: AsyncSession = Depends(get_db)
):
    """Get all services"""
    query = select(Service)
    
    if active_only:
        query = query.where(Service.active == True)
    
    if featured is not None:
        query = query.where(Service.featured == featured)
    
    query = query.order_by(Service.order.asc(), Service.created_at.desc())
    
    result = await db.execute(query)
    services = result.scalars().all()
    
    return services


@router.get("/services/{slug}", response_model=ServiceResponse)
async def get_service_by_slug(
    slug: str,
    db: AsyncSession = Depends(get_db)
):
    """Get a single service by slug"""
    result = await db.execute(
        select(Service).where(Service.slug == slug, Service.active == True)
    )
    service = result.scalar_one_or_none()
    
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    return service


# === Tool Endpoints ===

@router.get("/tools", response_model=List[ToolResponse])
async def get_tools(
    category: Optional[str] = None,
    active_only: bool = True,
    featured: Optional[bool] = None,
    db: AsyncSession = Depends(get_db)
):
    """Get all tools"""
    query = select(Tool)
    
    if active_only:
        query = query.where(Tool.active == True)
    
    if category:
        query = query.where(Tool.category == category)
    
    if featured is not None:
        query = query.where(Tool.featured == featured)
    
    query = query.order_by(Tool.order.asc(), Tool.created_at.desc())
    
    result = await db.execute(query)
    tools = result.scalars().all()
    
    return tools


@router.get('/resumes/{slug}')
async def download_resume(slug: str, db: AsyncSession = Depends(get_db)):
    """Serve a resume file and increment its download count.

    Slugs supported: onepage, full, technical
    """
    slug_map = {
        'onepage': 'Portfolio (1).pdf',
        'full': 'full cv.pdf',
        'technical': 'technical resume.pdf'
    }

    filename = slug_map.get(slug)
    if not filename:
        raise HTTPException(status_code=404, detail='Resume not found')

    uploads_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'public', 'uploads', 'resumes'))
    file_path = os.path.join(uploads_dir, filename)

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail='File not found')

    # Track download
    result = await db.execute(select(ResumeDownload).where(ResumeDownload.slug == slug))
    record = result.scalar_one_or_none()
    if not record:
        record = ResumeDownload(slug=slug, filename=filename, count=1, last_download_at=datetime.now(timezone.utc))
        db.add(record)
    else:
        record.count += 1
        record.last_download_at = datetime.now(timezone.utc)

    await db.commit()

    # Return file
    return FileResponse(file_path, media_type='application/pdf', filename=filename)


@router.get("/tools/{slug}", response_model=ToolResponse)
async def get_tool_by_slug(
    slug: str,
    db: AsyncSession = Depends(get_db)
):
    """Get a single tool by slug"""
    result = await db.execute(
        select(Tool).where(Tool.slug == slug, Tool.active == True)
    )
    tool = result.scalar_one_or_none()
    
    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")
    
    # Increment views
    tool.views += 1
    await db.commit()
    
    return tool


@router.post("/tools/{slug}/click")
async def track_tool_click(
    slug: str,
    db: AsyncSession = Depends(get_db)
):
    """Track tool click/visit"""
    result = await db.execute(
        select(Tool).where(Tool.slug == slug, Tool.active == True)
    )
    tool = result.scalar_one_or_none()
    
    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")
    
    tool.clicks += 1
    await db.commit()
    
    return {"clicks": tool.clicks}


# === Category & Tag Endpoints ===

@router.get("/categories", response_model=List[CategoryResponse])
async def get_categories(db: AsyncSession = Depends(get_db)):
    """Get all categories"""
    result = await db.execute(select(Category).order_by(Category.name))
    categories = result.scalars().all()
    return categories


@router.get("/tags", response_model=List[TagResponse])
async def get_tags(db: AsyncSession = Depends(get_db)):
    """Get all tags"""
    result = await db.execute(select(Tag).order_by(Tag.name))
    tags = result.scalars().all()
    return tags


# === Stats Endpoints ===

@router.get("/stats")
async def get_stats(db: AsyncSession = Depends(get_db)):
    """Get general statistics"""
    # Count blogs
    blog_count = await db.execute(
        select(func.count(Blog.id)).where(Blog.published == True)
    )
    
    # Count projects
    project_count = await db.execute(
        select(func.count(Project.id)).where(Project.published == True)
    )
    
    # Count services
    service_count = await db.execute(
        select(func.count(Service.id)).where(Service.active == True)
    )
    
    # Count tools
    tool_count = await db.execute(
        select(func.count(Tool.id)).where(Tool.active == True)
    )
    
    # Total blog views
    blog_views = await db.execute(
        select(func.sum(Blog.views)).where(Blog.published == True)
    )
    
    # Total project views
    project_views = await db.execute(
        select(func.sum(Project.views)).where(Project.published == True)
    )
    
    return {
        "blogs": blog_count.scalar() or 0,
        "projects": project_count.scalar() or 0,
        "services": service_count.scalar() or 0,
        "tools": tool_count.scalar() or 0,
        "blog_views": blog_views.scalar() or 0,
        "project_views": project_views.scalar() or 0,
        "total_views": (blog_views.scalar() or 0) + (project_views.scalar() or 0)
    }


@router.post('/contact', response_model=ContactResponse)
async def submit_contact(contact: ContactRequest, req: Request, db: AsyncSession = Depends(get_db)):
    """Receive contact form and forward to Gmail address using OAuth2."""
    client_ip = getattr(req.client, 'host', 'unknown')
    if not check_rate_limit(client_ip):
        raise HTTPException(status_code=429, detail='Rate limit exceeded')

    # Sanitize fields
    name = sanitize_input(contact.name)
    email = sanitize_input(contact.email)
    company = sanitize_input(contact.company) if contact.company else 'Not provided'
    phone = sanitize_input(contact.phone) if contact.phone else 'Not provided'
    service = sanitize_input(contact.service) if contact.service else 'Not specified'
    project_type = sanitize_input(contact.project_type) if contact.project_type else 'Not specified'
    budget = sanitize_input(contact.budget) if contact.budget else 'Not specified'
    timeline = sanitize_input(contact.timeline) if contact.timeline else 'Not specified'
    priority = sanitize_input(contact.priority) if contact.priority else 'Not specified'
    technical_requirements = sanitize_input(contact.technical_requirements) if contact.technical_requirements else 'None specified'
    message = sanitize_input(contact.message)

    subject = f"🔥 Devil Labs Contact – {name} | {project_type} | {priority} Priority"
    
    # Professional email template
    body = f"""
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔥 NEW CLIENT INQUIRY - DEVIL LABS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 CLIENT INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name:               {name}
Email:              {email}
Company:            {company}
Phone:              {phone}

🎯 PROJECT DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Project Type:       {project_type}
Service Interest:   {service}
Budget Range:       {budget}
Timeline:           {timeline}
Priority Level:     {priority}

💻 TECHNICAL REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{technical_requirements}

📝 PROJECT DESCRIPTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{message}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ Reply to: {email}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""

    try:
        await send_email(subject, body)
        return {"message": "Message sent successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send email: {e}")
