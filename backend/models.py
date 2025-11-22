"""
Database models for CMS
"""
from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

# Many-to-many association tables
blog_tags = Table(
    'blog_tags',
    Base.metadata,
    Column('blog_id', Integer, ForeignKey('blogs.id', ondelete='CASCADE')),
    Column('tag_id', Integer, ForeignKey('tags.id', ondelete='CASCADE'))
)

project_tags = Table(
    'project_tags',
    Base.metadata,
    Column('project_id', Integer, ForeignKey('projects.id', ondelete='CASCADE')),
    Column('tag_id', Integer, ForeignKey('tags.id', ondelete='CASCADE'))
)


class Category(Base):
    __tablename__ = 'categories'
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    blogs = relationship('Blog', back_populates='category')
    projects = relationship('Project', back_populates='category')


class Tag(Base):
    __tablename__ = 'tags'
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False, index=True)
    slug = Column(String(50), unique=True, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    blogs = relationship('Blog', secondary=blog_tags, back_populates='tags')
    projects = relationship('Project', secondary=project_tags, back_populates='tags')


class Blog(Base):
    __tablename__ = 'blogs'
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False, index=True)
    slug = Column(String(200), unique=True, nullable=False, index=True)
    excerpt = Column(Text, nullable=False)
    content = Column(Text, nullable=False)
    author = Column(String(100), nullable=False, default='Vicky Kumar')
    
    # Media
    featured_image = Column(String(500), nullable=True)  # CDN URL
    thumbnail_image = Column(String(500), nullable=True)  # CDN URL (optimized)
    
    # Metadata
    read_time = Column(Integer, nullable=True)  # in minutes
    views = Column(Integer, default=0)
    likes = Column(Integer, default=0)
    
    # SEO
    meta_title = Column(String(200), nullable=True)
    meta_description = Column(String(300), nullable=True)
    meta_keywords = Column(String(200), nullable=True)
    
    # Status
    published = Column(Boolean, default=False, index=True)
    featured = Column(Boolean, default=False, index=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    published_at = Column(DateTime(timezone=True), nullable=True)
    
    # Foreign Keys
    category_id = Column(Integer, ForeignKey('categories.id', ondelete='SET NULL'), nullable=True)
    
    # Relationships
    category = relationship('Category', back_populates='blogs')
    tags = relationship('Tag', secondary=blog_tags, back_populates='blogs')


class Project(Base):
    __tablename__ = 'projects'
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False, index=True)
    slug = Column(String(200), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=False)
    long_description = Column(Text, nullable=True)
    
    # Media
    featured_image = Column(String(500), nullable=True)  # CDN URL
    thumbnail_image = Column(String(500), nullable=True)  # CDN URL
    demo_video_url = Column(String(500), nullable=True)  # YouTube/Vimeo embed
    gallery_images = Column(Text, nullable=True)  # JSON array of CDN URLs
    
    # Links
    demo_url = Column(String(500), nullable=True)
    github_url = Column(String(500), nullable=True)
    live_url = Column(String(500), nullable=True)
    
    # Project Details
    tech_stack = Column(Text, nullable=True)  # JSON array
    client = Column(String(100), nullable=True)
    duration = Column(String(50), nullable=True)  # e.g., "3 months"
    team_size = Column(Integer, nullable=True)
    
    # Stats
    stars = Column(Integer, default=0)
    forks = Column(Integer, default=0)
    views = Column(Integer, default=0)
    
    # Status
    published = Column(Boolean, default=False, index=True)
    featured = Column(Boolean, default=False, index=True)
    status = Column(String(50), default='completed')  # completed, in-progress, planned
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    published_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Foreign Keys
    category_id = Column(Integer, ForeignKey('categories.id', ondelete='SET NULL'), nullable=True)
    
    # Relationships
    category = relationship('Category', back_populates='projects')
    tags = relationship('Tag', secondary=project_tags, back_populates='projects')


class Service(Base):
    __tablename__ = 'services'
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False, index=True)
    slug = Column(String(200), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=False)
    long_description = Column(Text, nullable=True)
    
    # Pricing
    price = Column(Float, nullable=True)
    price_range = Column(String(50), nullable=True)  # e.g., "$500-$2000"
    currency = Column(String(10), default='USD')
    pricing_model = Column(String(50), nullable=True)  # fixed, hourly, monthly
    
    # Media
    icon = Column(String(500), nullable=True)  # Icon name or CDN URL
    featured_image = Column(String(500), nullable=True)
    
    # Service Details
    features = Column(Text, nullable=True)  # JSON array
    deliverables = Column(Text, nullable=True)  # JSON array
    duration = Column(String(50), nullable=True)
    
    # SEO
    meta_title = Column(String(200), nullable=True)
    meta_description = Column(String(300), nullable=True)
    
    # Status
    active = Column(Boolean, default=True, index=True)
    featured = Column(Boolean, default=False, index=True)
    order = Column(Integer, default=0)  # For custom sorting
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class Tool(Base):
    __tablename__ = 'tools'
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, index=True)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=False)
    
    # Media
    logo = Column(String(500), nullable=True)  # CDN URL
    icon = Column(String(500), nullable=True)
    screenshot = Column(String(500), nullable=True)
    
    # Links
    website_url = Column(String(500), nullable=True)
    demo_url = Column(String(500), nullable=True)
    github_url = Column(String(500), nullable=True)
    
    # Tool Details
    category = Column(String(100), nullable=True)  # AI, DevOps, Design, etc.
    tech_stack = Column(Text, nullable=True)  # JSON array
    features = Column(Text, nullable=True)  # JSON array
    
    # Pricing
    pricing = Column(String(50), nullable=True)  # free, freemium, paid
    price = Column(Float, nullable=True)
    
    # Stats
    views = Column(Integer, default=0)
    clicks = Column(Integer, default=0)
    rating = Column(Float, nullable=True)
    
    # Status
    active = Column(Boolean, default=True, index=True)
    featured = Column(Boolean, default=False, index=True)
    order = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class Asset(Base):
    """Track uploaded images and files"""
    __tablename__ = 'assets'
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(200), nullable=False)
    original_filename = Column(String(200), nullable=False)
    file_type = Column(String(50), nullable=False)  # image/jpeg, image/png, etc.
    file_size = Column(Integer, nullable=False)  # in bytes
    
    # Storage
    storage_url = Column(String(500), nullable=False, unique=True)  # CDN URL
    blob_name = Column(String(500), nullable=False)  # Blob storage path
    container_name = Column(String(100), nullable=False)
    
    # Variants (for responsive images)
    thumbnail_url = Column(String(500), nullable=True)
    medium_url = Column(String(500), nullable=True)
    large_url = Column(String(500), nullable=True)
    
    # Metadata
    width = Column(Integer, nullable=True)
    height = Column(Integer, nullable=True)
    alt_text = Column(String(200), nullable=True)
    tags = Column(Text, nullable=True)  # JSON array
    
    # Usage tracking
    used_in = Column(String(50), nullable=True)  # blog, project, service, tool
    used_in_id = Column(Integer, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class ResumeDownload(Base):
    __tablename__ = 'resume_downloads'

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    filename = Column(String(200), nullable=False)
    count = Column(Integer, default=0)
    last_download_at = Column(DateTime(timezone=True), nullable=True)
