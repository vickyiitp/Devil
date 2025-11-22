"""
Pydantic schemas for API request/response validation
"""
from pydantic import BaseModel, Field, HttpUrl
from pydantic import EmailStr
from typing import Optional, List
from datetime import datetime


# === Blog Schemas ===

class BlogBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    excerpt: str = Field(..., min_length=1)
    content: str = Field(..., min_length=1)
    author: str = Field(default="Vicky Kumar", max_length=100)
    featured_image: Optional[str] = None
    thumbnail_image: Optional[str] = None
    read_time: Optional[int] = None
    meta_title: Optional[str] = Field(None, max_length=200)
    meta_description: Optional[str] = Field(None, max_length=300)
    meta_keywords: Optional[str] = Field(None, max_length=200)
    published: bool = False
    featured: bool = False
    category_id: Optional[int] = None


class BlogCreate(BlogBase):
    tag_ids: Optional[List[int]] = None


class BlogUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    excerpt: Optional[str] = None
    content: Optional[str] = None
    author: Optional[str] = None
    featured_image: Optional[str] = None
    thumbnail_image: Optional[str] = None
    read_time: Optional[int] = None
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    meta_keywords: Optional[str] = None
    published: Optional[bool] = None
    featured: Optional[bool] = None
    category_id: Optional[int] = None
    tag_ids: Optional[List[int]] = None


class BlogResponse(BlogBase):
    id: int
    slug: str
    views: int
    likes: int
    created_at: datetime
    updated_at: Optional[datetime]
    published_at: Optional[datetime]
    
    class Config:
        from_attributes = True


# === Project Schemas ===

class ProjectBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1)
    long_description: Optional[str] = None
    featured_image: Optional[str] = None
    thumbnail_image: Optional[str] = None
    demo_video_url: Optional[str] = None
    gallery_images: Optional[str] = None  # JSON string
    demo_url: Optional[str] = None
    github_url: Optional[str] = None
    live_url: Optional[str] = None
    tech_stack: Optional[str] = None  # JSON string
    client: Optional[str] = None
    duration: Optional[str] = None
    team_size: Optional[int] = None
    published: bool = False
    featured: bool = False
    status: str = "completed"
    category_id: Optional[int] = None


class ProjectCreate(ProjectBase):
    tag_ids: Optional[List[int]] = None


class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    long_description: Optional[str] = None
    featured_image: Optional[str] = None
    thumbnail_image: Optional[str] = None
    demo_video_url: Optional[str] = None
    gallery_images: Optional[str] = None
    demo_url: Optional[str] = None
    github_url: Optional[str] = None
    live_url: Optional[str] = None
    tech_stack: Optional[str] = None
    client: Optional[str] = None
    duration: Optional[str] = None
    team_size: Optional[int] = None
    published: Optional[bool] = None
    featured: Optional[bool] = None
    status: Optional[str] = None
    category_id: Optional[int] = None
    tag_ids: Optional[List[int]] = None


class ProjectResponse(ProjectBase):
    id: int
    slug: str
    stars: int
    forks: int
    views: int
    created_at: datetime
    updated_at: Optional[datetime]
    published_at: Optional[datetime]
    completed_at: Optional[datetime]
    
    class Config:
        from_attributes = True


# === Service Schemas ===

class ServiceBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1)
    long_description: Optional[str] = None
    price: Optional[float] = None
    price_range: Optional[str] = None
    currency: str = "USD"
    pricing_model: Optional[str] = None
    icon: Optional[str] = None
    featured_image: Optional[str] = None
    features: Optional[str] = None  # JSON string
    deliverables: Optional[str] = None  # JSON string
    duration: Optional[str] = None
    active: bool = True
    featured: bool = False
    order: int = 0


class ServiceCreate(ServiceBase):
    pass


class ServiceUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    long_description: Optional[str] = None
    price: Optional[float] = None
    price_range: Optional[str] = None
    currency: Optional[str] = None
    pricing_model: Optional[str] = None
    icon: Optional[str] = None
    featured_image: Optional[str] = None
    features: Optional[str] = None
    deliverables: Optional[str] = None
    duration: Optional[str] = None
    active: Optional[bool] = None
    featured: Optional[bool] = None
    order: Optional[int] = None


class ServiceResponse(ServiceBase):
    id: int
    slug: str
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True


# === Tool Schemas ===

class ToolBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: str = Field(..., min_length=1)
    logo: Optional[str] = None
    icon: Optional[str] = None
    screenshot: Optional[str] = None
    website_url: Optional[str] = None
    demo_url: Optional[str] = None
    github_url: Optional[str] = None
    category: Optional[str] = None
    tech_stack: Optional[str] = None  # JSON string
    features: Optional[str] = None  # JSON string
    pricing: Optional[str] = None
    price: Optional[float] = None
    active: bool = True
    featured: bool = False
    order: int = 0


class ToolCreate(ToolBase):
    pass


class ToolUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    logo: Optional[str] = None
    icon: Optional[str] = None
    screenshot: Optional[str] = None
    website_url: Optional[str] = None
    demo_url: Optional[str] = None
    github_url: Optional[str] = None
    category: Optional[str] = None
    tech_stack: Optional[str] = None
    features: Optional[str] = None
    pricing: Optional[str] = None
    price: Optional[float] = None
    active: Optional[bool] = None
    featured: Optional[bool] = None
    order: Optional[int] = None


class ToolResponse(ToolBase):
    id: int
    slug: str
    views: int
    clicks: int
    rating: Optional[float]
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True


# === Contact Schema ===
class ContactRequest(BaseModel):
    name: str
    email: EmailStr
    company: Optional[str] = None
    phone: Optional[str] = None
    service: Optional[str] = None
    project_type: Optional[str] = None
    budget: Optional[str] = None
    timeline: Optional[str] = None
    priority: Optional[str] = None
    technical_requirements: Optional[str] = None
    message: str


class ContactResponse(BaseModel):
    message: str


# === Category & Tag Schemas ===

class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None


class CategoryCreate(CategoryBase):
    pass


class CategoryResponse(CategoryBase):
    id: int
    slug: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class TagBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)


class TagCreate(TagBase):
    pass


class TagResponse(TagBase):
    id: int
    slug: str
    created_at: datetime
    
    class Config:
        from_attributes = True


# === Authentication Schemas ===

class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# === Upload Schemas ===

class UploadResponse(BaseModel):
    id: int
    filename: str
    storage_url: str
    thumbnail_url: Optional[str]
    medium_url: Optional[str]
    large_url: Optional[str]
    file_type: str
    file_size: int
    width: Optional[int]
    height: Optional[int]
