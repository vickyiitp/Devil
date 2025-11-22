"""
Admin API routes for CMS management
Authentication required for all endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional, Any, Dict
from datetime import datetime, timezone
from slugify import slugify

from database import get_db
from models import Blog, Project, Service, Tool, Category, Tag, Asset
from schemas import (
    BlogCreate, BlogUpdate, BlogResponse,
    ProjectCreate, ProjectUpdate, ProjectResponse,
    ServiceCreate, ServiceUpdate, ServiceResponse,
    ToolCreate, ToolUpdate, ToolResponse,
    CategoryCreate, CategoryResponse,
    TagCreate, TagResponse,
    UploadResponse,
    LoginRequest, TokenResponse
)
from auth import get_current_user, authenticate_admin, create_access_token
from storage import storage_service

router = APIRouter(prefix="/api/admin", tags=["Admin"])


# === Authentication ===

@router.post("/login", response_model=TokenResponse)
async def admin_login(credentials: LoginRequest):
    """Admin login endpoint"""
    if not authenticate_admin(credentials.username, credentials.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    access_token = create_access_token(
        data={"sub": credentials.username}
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


# === Blog Management ===

@router.get("/blogs", response_model=List[BlogResponse])
async def get_all_blogs(
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Get all blogs (including unpublished) for admin"""
    result = await db.execute(
        select(Blog).order_by(Blog.created_at.desc())
    )
    blogs = result.scalars().all()
    return blogs


@router.get("/blogs/{slug}", response_model=BlogResponse)
async def get_admin_blog_by_slug(
    slug: str,
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Get a single blog post by slug for admin (allows unpublished)"""
    result = await db.execute(
        select(Blog).where(Blog.slug == slug)
    )
    blog = result.scalar_one_or_none()

    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")

    return blog


# NOTE: Project and Service admin get-by-slug endpoints are defined later in the file under their respective sections.


@router.post("/blogs", response_model=BlogResponse)
async def create_blog(
    blog_data: BlogCreate,
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Create a new blog post"""
    # Generate slug
    slug = slugify(blog_data.title)
    
    # Check if slug exists
    result = await db.execute(select(Blog).where(Blog.slug == slug))
    if result.scalar_one_or_none():
        slug = f"{slug}-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}"
    
    # Create blog
    blog = Blog(
        **blog_data.model_dump(exclude={'tag_ids'}),
        slug=slug,
        published_at=datetime.now(timezone.utc) if blog_data.published else None
    )
    
    # Add tags
    if blog_data.tag_ids:
        tag_result = await db.execute(select(Tag).where(Tag.id.in_(blog_data.tag_ids)))
        blog.tags = tag_result.scalars().all()
    
    db.add(blog)
    await db.commit()
    await db.refresh(blog)
    
    return blog


@router.put("/blogs/{blog_id}", response_model=BlogResponse)
async def update_blog(
    blog_id: int,
    blog_data: BlogUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Update a blog post"""
    result = await db.execute(select(Blog).where(Blog.id == blog_id))
    blog = result.scalar_one_or_none()
    
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    
    # Update fields
    update_data = blog_data.model_dump(exclude_unset=True, exclude={'tag_ids'})
    
    for field, value in update_data.items():
        setattr(blog, field, value)
    
    # Update slug if title changed
    if blog_data.title:
        # Use setattr to avoid static analyzer assignment errors with SQLAlchemy Column types
        setattr(blog, 'slug', slugify(blog_data.title))
    
    # Update tags
    if blog_data.tag_ids is not None:
        tag_result = await db.execute(select(Tag).where(Tag.id.in_(blog_data.tag_ids)))
        blog.tags = tag_result.scalars().all()
    
    # Set published_at if publishing for first time
    # Published_at is a SQLAlchemy Column; use getattr to avoid static analyzer false-positives
    current_published_at = getattr(blog, 'published_at', None)
    if blog_data.published and current_published_at is None:
        setattr(blog, 'published_at', datetime.now(timezone.utc))
    
    await db.commit()
    await db.refresh(blog)
    
    return blog


@router.delete("/blogs/{blog_id}")
async def delete_blog(
    blog_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Delete a blog post"""
    result = await db.execute(select(Blog).where(Blog.id == blog_id))
    blog = result.scalar_one_or_none()
    
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    
    await db.delete(blog)
    await db.commit()
    
    return {"message": "Blog deleted successfully"}


# === Project Management ===

@router.get("/projects", response_model=List[ProjectResponse])
async def get_all_projects(
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Get all projects (including unpublished) for admin"""
    result = await db.execute(
        select(Project).order_by(Project.created_at.desc())
    )
    projects = result.scalars().all()
    return projects




@router.get("/projects/{slug}", response_model=ProjectResponse)
async def get_admin_project_by_slug(
    slug: str,
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Get a single project by slug for admin (allows unpublished)"""
    result = await db.execute(
        select(Project).where(Project.slug == slug)
    )
    project = result.scalar_one_or_none()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    return project


@router.post("/projects", response_model=ProjectResponse)
async def create_project(
    project_data: ProjectCreate,
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Create a new project"""
    slug = slugify(project_data.title)
    
    # Check if slug exists
    result = await db.execute(select(Project).where(Project.slug == slug))
    if result.scalar_one_or_none():
        slug = f"{slug}-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}"
    
    project = Project(
        **project_data.model_dump(exclude={'tag_ids'}),
        slug=slug,
        published_at=datetime.now(timezone.utc) if project_data.published else None
    )
    
    # Add tags
    if project_data.tag_ids:
        tag_result = await db.execute(select(Tag).where(Tag.id.in_(project_data.tag_ids)))
        project.tags = tag_result.scalars().all()
    
    db.add(project)
    await db.commit()
    await db.refresh(project)
    
    return project


@router.put("/projects/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: int,
    project_data: ProjectUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Update a project"""
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    update_data = project_data.model_dump(exclude_unset=True, exclude={'tag_ids'})
    
    for field, value in update_data.items():
        setattr(project, field, value)
    
    if project_data.title:
        setattr(project, 'slug', slugify(project_data.title))
    
    if project_data.tag_ids is not None:
        tag_result = await db.execute(select(Tag).where(Tag.id.in_(project_data.tag_ids)))
        project.tags = tag_result.scalars().all()
    
    current_published_at = getattr(project, 'published_at', None)
    if project_data.published and current_published_at is None:
        setattr(project, 'published_at', datetime.now(timezone.utc))
    
    await db.commit()
    await db.refresh(project)
    
    return project


@router.delete("/projects/{project_id}")
async def delete_project(
    project_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Delete a project"""
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    await db.delete(project)
    await db.commit()
    
    return {"message": "Project deleted successfully"}


# === Service Management ===

@router.get("/services", response_model=List[ServiceResponse])
async def get_all_services(
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Get all services (including inactive) for admin"""
    result = await db.execute(
        select(Service).order_by(Service.order.asc(), Service.created_at.desc())
    )
    services = result.scalars().all()
    return services


@router.get("/services/{slug}", response_model=ServiceResponse)
async def get_admin_service_by_slug(
    slug: str,
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Get a single service by slug for admin (allows unpublished)"""
    result = await db.execute(
        select(Service).where(Service.slug == slug)
    )
    service = result.scalar_one_or_none()

    if not service:
        raise HTTPException(status_code=404, detail="Service not found")

    return service


@router.post("/services", response_model=ServiceResponse)
async def create_service(
    service_data: ServiceCreate,
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Create a new service"""
    slug = slugify(service_data.title)
    
    result = await db.execute(select(Service).where(Service.slug == slug))
    if result.scalar_one_or_none():
        slug = f"{slug}-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}"
    
    service = Service(**service_data.model_dump(), slug=slug)
    
    db.add(service)
    await db.commit()
    await db.refresh(service)
    
    return service


@router.put("/services/{service_id}", response_model=ServiceResponse)
async def update_service(
    service_id: int,
    service_data: ServiceUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Update a service"""
    result = await db.execute(select(Service).where(Service.id == service_id))
    service = result.scalar_one_or_none()
    
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    update_data = service_data.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(service, field, value)
    
    if service_data.title:
        setattr(service, 'slug', slugify(service_data.title))
    
    await db.commit()
    await db.refresh(service)
    
    return service


@router.delete("/services/{service_id}")
async def delete_service(
    service_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Delete a service"""
    result = await db.execute(select(Service).where(Service.id == service_id))
    service = result.scalar_one_or_none()
    
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    await db.delete(service)
    await db.commit()
    
    return {"message": "Service deleted successfully"}


# === Tool Management ===

@router.post("/tools", response_model=ToolResponse)
async def create_tool(
    tool_data: ToolCreate,
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Create a new tool"""
    slug = slugify(tool_data.name)
    
    result = await db.execute(select(Tool).where(Tool.slug == slug))
    if result.scalar_one_or_none():
        slug = f"{slug}-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}"
    
    tool = Tool(**tool_data.model_dump(), slug=slug)
    
    db.add(tool)
    await db.commit()
    await db.refresh(tool)
    
    return tool


@router.put("/tools/{tool_id}", response_model=ToolResponse)
async def update_tool(
    tool_id: int,
    tool_data: ToolUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Update a tool"""
    result = await db.execute(select(Tool).where(Tool.id == tool_id))
    tool = result.scalar_one_or_none()
    
    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")
    
    update_data = tool_data.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(tool, field, value)
    
    if tool_data.name:
        setattr(tool, 'slug', slugify(tool_data.name))
    
    await db.commit()
    await db.refresh(tool)
    
    return tool


@router.delete("/tools/{tool_id}")
async def delete_tool(
    tool_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Delete a tool"""
    result = await db.execute(select(Tool).where(Tool.id == tool_id))
    tool = result.scalar_one_or_none()
    
    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")
    
    await db.delete(tool)
    await db.commit()
    
    return {"message": "Tool deleted successfully"}


# === Category Management ===

@router.post("/categories", response_model=CategoryResponse)
async def create_category(
    category_data: CategoryCreate,
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Create a new category"""
    slug = slugify(category_data.name)
    category = Category(**category_data.model_dump(), slug=slug)
    
    db.add(category)
    await db.commit()
    await db.refresh(category)
    
    return category


@router.delete("/categories/{category_id}")
async def delete_category(
    category_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Delete a category"""
    result = await db.execute(select(Category).where(Category.id == category_id))
    category = result.scalar_one_or_none()
    
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    await db.delete(category)
    await db.commit()
    
    return {"message": "Category deleted successfully"}


# === Tag Management ===

@router.post("/tags", response_model=TagResponse)
async def create_tag(
    tag_data: TagCreate,
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Create a new tag"""
    slug = slugify(tag_data.name)
    tag = Tag(**tag_data.model_dump(), slug=slug)
    
    db.add(tag)
    await db.commit()
    await db.refresh(tag)
    
    return tag


@router.delete("/tags/{tag_id}")
async def delete_tag(
    tag_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Delete a tag"""
    result = await db.execute(select(Tag).where(Tag.id == tag_id))
    tag = result.scalar_one_or_none()
    
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    
    await db.delete(tag)
    await db.commit()
    
    return {"message": "Tag deleted successfully"}


# === Image Upload ===

@router.post("/upload", response_model=UploadResponse)
async def upload_image(
    file: UploadFile = File(...),
    folder: str = Form("general"),
    used_in: Optional[str] = Form(None),
    used_in_id: Optional[int] = Form(None),
    alt_text: Optional[str] = Form(None),
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Upload image to Azure Blob Storage with responsive variants
    
    Returns CDN URLs for original, thumbnail, medium, and large sizes
    """
    # Validate file type
    # content_type can be None in some cases, check safely
    if not (file.content_type and file.content_type.startswith('image/')):
        raise HTTPException(status_code=400, detail="Only image files are allowed")
    
    # Read file data
    file_data = await file.read()
    
    # Check file size (max 10MB)
    if len(file_data) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size exceeds 10MB limit")
    
    # Upload to storage
    try:
        filename = file.filename or 'upload_image'
        content_type = file.content_type or 'image/jpeg'

        upload_result = await storage_service.upload_image(
            file_data=file_data,
            filename=filename,
            content_type=content_type,
            folder=folder,
            create_variants=True
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")
    
    # Save to database
    asset = Asset(
        filename=upload_result['filename'],
        original_filename=filename,
        file_type=content_type,
        file_size=len(file_data),
        storage_url=upload_result['original'],
        blob_name=upload_result['blob_name'],
        container_name=storage_service.container_name,
        thumbnail_url=upload_result.get('thumbnail'),
        medium_url=upload_result.get('medium'),
        large_url=upload_result.get('large'),
        width=upload_result.get('width'),
        height=upload_result.get('height'),
        alt_text=alt_text,
        used_in=used_in,
        used_in_id=used_in_id
    )
    
    db.add(asset)
    await db.commit()
    await db.refresh(asset)
    
    return {
        "id": asset.id,
        "filename": asset.filename,
        "storage_url": asset.storage_url,
        "thumbnail_url": asset.thumbnail_url,
        "medium_url": asset.medium_url,
        "large_url": asset.large_url,
        "file_type": asset.file_type,
        "file_size": asset.file_size,
        "width": asset.width,
        "height": asset.height
    }


@router.delete("/assets/{asset_id}")
async def delete_asset(
    asset_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Delete an uploaded asset and its variants from storage"""
    result = await db.execute(select(Asset).where(Asset.id == asset_id))
    asset = result.scalar_one_or_none()
    
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    # Delete from storage
    # SQLAlchemy returns Column types; use getattr to avoid static analyzer issues
    await storage_service.delete_image_variants(getattr(asset, 'blob_name'))
    
    # Delete from database
    await db.delete(asset)
    await db.commit()
    
    return {"message": "Asset deleted successfully"}
