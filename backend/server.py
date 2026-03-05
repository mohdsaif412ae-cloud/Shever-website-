from fastapi import FastAPI, APIRouter, HTTPException, Depends, File, UploadFile, Form
from fastapi.staticfiles import StaticFiles
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import aiofiles
import shutil

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'shever-technical-secret-key-change-in-production')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()

# Ensure upload directories exist
UPLOAD_DIR = ROOT_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)
for subdir in ['services', 'projects', 'gallery', 'logo']:
    (UPLOAD_DIR / subdir).mkdir(exist_ok=True)

# ============ MODELS ============

class Admin(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    password_hash: str

class AdminCreate(BaseModel):
    email: EmailStr
    password: str

class AdminLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class Service(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    benefits: List[str] = []
    problems_solved: List[str] = []
    icon: str = "wrench"
    order: int = 0
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class ServiceCreate(BaseModel):
    name: str
    description: str
    benefits: List[str] = []
    problems_solved: List[str] = []
    icon: str = "wrench"
    order: int = 0

class Project(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    category: str
    image_path: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class ContactInfo(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = "contact_info"
    phone: str
    whatsapp: str
    email: EmailStr
    address: str
    trn: str

class ContactInfoUpdate(BaseModel):
    phone: str
    whatsapp: str
    email: EmailStr
    address: str
    trn: str

class HomeContent(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = "home_content"
    hero_title: str
    hero_subtitle: str
    hero_bg_image: str

class HomeContentUpdate(BaseModel):
    hero_title: str
    hero_subtitle: str
    hero_bg_image: Optional[str] = None

class ContactSubmission(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    phone: str
    email: EmailStr
    service_required: str
    message: str
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class ContactSubmissionCreate(BaseModel):
    name: str
    phone: str
    email: EmailStr
    service_required: str
    message: str

class GalleryImage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    image_path: str
    title: str = ""
    order: int = 0
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class SiteSettings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = "site_settings"
    logo_path: str

# ============ AUTH UTILITIES ============

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        return email
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

# ============ FILE UPLOAD UTILITIES ============

async def save_upload_file(upload_file: UploadFile, destination: Path) -> str:
    try:
        async with aiofiles.open(destination, 'wb') as out_file:
            content = await upload_file.read()
            await out_file.write(content)
        return str(destination.relative_to(ROOT_DIR))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

# ============ INITIALIZE DEFAULT DATA ============

async def initialize_default_data():
    # Create default admin if not exists
    admin_exists = await db.admins.find_one({"email": "admin@shever-tech.com"})
    if not admin_exists:
        default_admin = Admin(
            email="admin@shever-tech.com",
            password_hash=hash_password("admin123")
        )
        await db.admins.insert_one(default_admin.model_dump())
        logger.info("Default admin created: admin@shever-tech.com / admin123")

    # Create default contact info
    contact_exists = await db.contact_info.find_one({"id": "contact_info"})
    if not contact_exists:
        default_contact = ContactInfo(
            phone="+971 54 588 9001",
            whatsapp="+971545889001",
            email="info@shever-tech.com",
            address="Commercial Bank of Dubai Building, Al Khabeesi, Dubai",
            trn="104214899700003"
        )
        await db.contact_info.insert_one(default_contact.model_dump())

    # Create default home content
    home_exists = await db.home_content.find_one({"id": "home_content"})
    if not home_exists:
        default_home = HomeContent(
            hero_title="Reliable Technical & Maintenance Services in Dubai",
            hero_subtitle="Professional HVAC, Electrical, Plumbing, and Building Maintenance Services delivered by experienced technicians.",
            hero_bg_image="https://images.unsplash.com/photo-1763581804286-683d28919444?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODh8MHwxfHNlYXJjaHwzfHxkdWJhaSUyMHNreWxpbmUlMjBtb2Rlcm4lMjBidWlsZGluZ3xlbnwwfHx8fDE3NzI3NTAxOTd8MA&ixlib=rb-4.1.0&q=85"
        )
        await db.home_content.insert_one(default_home.model_dump())

    # Create default services
    services_count = await db.services.count_documents({})
    if services_count == 0:
        default_services = [
            Service(
                name="HVAC Maintenance",
                description="Complete heating, ventilation, and air conditioning services for residential and commercial properties.",
                benefits=["Energy efficiency improvement", "Extended equipment lifespan", "Better air quality"],
                problems_solved=["AC not cooling", "High energy bills", "Poor air circulation"],
                icon="wind",
                order=1
            ),
            Service(
                name="Electrical Works",
                description="Professional electrical installation, repair, and maintenance services by certified electricians.",
                benefits=["Safety compliance", "Reliable power supply", "Energy-efficient solutions"],
                problems_solved=["Power outages", "Faulty wiring", "Circuit breaker issues"],
                icon="zap",
                order=2
            ),
            Service(
                name="Plumbing Services",
                description="Expert plumbing solutions for leak repairs, installations, and drainage systems.",
                benefits=["Water conservation", "Prevent property damage", "Quick response time"],
                problems_solved=["Leaking pipes", "Clogged drains", "Water heater issues"],
                icon="droplet",
                order=3
            ),
            Service(
                name="Painting & Civil Works",
                description="High-quality painting and civil construction services for interior and exterior projects.",
                benefits=["Enhanced aesthetics", "Property value increase", "Durable finishes"],
                problems_solved=["Peeling paint", "Water damage", "Structural repairs"],
                icon="paint-bucket",
                order=4
            ),
            Service(
                name="Gypsum & False Ceiling",
                description="Modern false ceiling designs and gypsum board installations for commercial and residential spaces.",
                benefits=["Aesthetic appeal", "Sound insulation", "Concealed wiring"],
                problems_solved=["Old ceilings", "Exposed wiring", "Poor acoustics"],
                icon="layers",
                order=5
            ),
            Service(
                name="Carpentry Works",
                description="Custom carpentry solutions including furniture, doors, and woodwork installations.",
                benefits=["Custom designs", "Quality materials", "Expert craftsmanship"],
                problems_solved=["Damaged furniture", "Custom fittings", "Door repairs"],
                icon="hammer",
                order=6
            ),
            Service(
                name="Waterproofing",
                description="Professional waterproofing solutions for roofs, bathrooms, and basements.",
                benefits=["Prevent water damage", "Mold prevention", "Long-term protection"],
                problems_solved=["Roof leaks", "Bathroom seepage", "Basement flooding"],
                icon="shield",
                order=7
            ),
            Service(
                name="Preventive Maintenance (AMC)",
                description="Annual maintenance contracts for regular servicing and upkeep of your facilities.",
                benefits=["Cost savings", "Reduced downtime", "Extended equipment life"],
                problems_solved=["Unexpected breakdowns", "High repair costs", "Equipment failure"],
                icon="calendar-check",
                order=8
            ),
            Service(
                name="Emergency Repairs",
                description="24/7 emergency repair services for urgent technical issues and breakdowns.",
                benefits=["Rapid response", "24/7 availability", "Expert technicians"],
                problems_solved=["Emergency breakdowns", "Urgent repairs", "Critical failures"],
                icon="alert-circle",
                order=9
            )
        ]
        for service in default_services:
            await db.services.insert_one(service.model_dump())
        logger.info(f"Created {len(default_services)} default services")

# ============ PUBLIC ROUTES ============

@api_router.get("/")
async def root():
    return {"message": "Shever Technical API"}

@api_router.get("/services", response_model=List[Service])
async def get_services():
    services = await db.services.find({}, {"_id": 0}).sort("order", 1).to_list(100)
    return services

@api_router.get("/services/{service_id}", response_model=Service)
async def get_service(service_id: str):
    service = await db.services.find_one({"id": service_id}, {"_id": 0})
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    return service

@api_router.get("/projects", response_model=List[Project])
async def get_projects():
    projects = await db.projects.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return projects

@api_router.get("/contact-info", response_model=ContactInfo)
async def get_contact_info():
    contact = await db.contact_info.find_one({"id": "contact_info"}, {"_id": 0})
    if not contact:
        raise HTTPException(status_code=404, detail="Contact info not found")
    return contact

@api_router.get("/home-content", response_model=HomeContent)
async def get_home_content():
    home = await db.home_content.find_one({"id": "home_content"}, {"_id": 0})
    if not home:
        raise HTTPException(status_code=404, detail="Home content not found")
    return home

@api_router.post("/contact-submissions", response_model=ContactSubmission)
async def create_contact_submission(submission: ContactSubmissionCreate):
    new_submission = ContactSubmission(**submission.model_dump())
    await db.contact_submissions.insert_one(new_submission.model_dump())
    return new_submission

@api_router.get("/gallery", response_model=List[GalleryImage])
async def get_gallery():
    images = await db.gallery.find({}, {"_id": 0}).sort("order", 1).to_list(100)
    return images

@api_router.get("/site-settings", response_model=SiteSettings)
async def get_site_settings():
    settings = await db.site_settings.find_one({"id": "site_settings"}, {"_id": 0})
    if not settings:
        return SiteSettings(logo_path="")
    return settings

# ============ ADMIN AUTH ROUTES ============

@api_router.post("/admin/login", response_model=TokenResponse)
async def admin_login(credentials: AdminLogin):
    admin = await db.admins.find_one({"email": credentials.email}, {"_id": 0})
    if not admin or not verify_password(credentials.password, admin['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    access_token = create_access_token({"sub": admin['email']})
    return TokenResponse(access_token=access_token)

@api_router.post("/admin/register", response_model=Admin)
async def admin_register(admin_data: AdminCreate, current_admin: str = Depends(get_current_admin)):
    # Only existing admins can create new admins
    existing = await db.admins.find_one({"email": admin_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Admin with this email already exists")
    
    new_admin = Admin(
        email=admin_data.email,
        password_hash=hash_password(admin_data.password)
    )
    await db.admins.insert_one(new_admin.model_dump())
    return new_admin

# ============ ADMIN PROTECTED ROUTES - SERVICES ============

@api_router.post("/admin/services", response_model=Service)
async def create_service(service: ServiceCreate, current_admin: str = Depends(get_current_admin)):
    new_service = Service(**service.model_dump())
    await db.services.insert_one(new_service.model_dump())
    return new_service

@api_router.put("/admin/services/{service_id}", response_model=Service)
async def update_service(service_id: str, service: ServiceCreate, current_admin: str = Depends(get_current_admin)):
    existing = await db.services.find_one({"id": service_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Service not found")
    
    updated_service = Service(id=service_id, **service.model_dump())
    await db.services.replace_one({"id": service_id}, updated_service.model_dump())
    return updated_service

@api_router.delete("/admin/services/{service_id}")
async def delete_service(service_id: str, current_admin: str = Depends(get_current_admin)):
    result = await db.services.delete_one({"id": service_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Service not found")
    return {"message": "Service deleted successfully"}

# ============ ADMIN PROTECTED ROUTES - PROJECTS ============

@api_router.post("/admin/projects")
async def create_project(
    title: str = Form(...),
    description: str = Form(...),
    category: str = Form(...),
    image: UploadFile = File(...),
    current_admin: str = Depends(get_current_admin)
):
    project_id = str(uuid.uuid4())
    file_extension = image.filename.split('.')[-1]
    filename = f"{project_id}.{file_extension}"
    file_path = UPLOAD_DIR / "projects" / filename
    
    image_path = await save_upload_file(image, file_path)
    
    new_project = Project(
        id=project_id,
        title=title,
        description=description,
        category=category,
        image_path=f"/uploads/projects/{filename}"
    )
    await db.projects.insert_one(new_project.model_dump())
    return new_project

@api_router.put("/admin/projects/{project_id}")
async def update_project(
    project_id: str,
    title: str = Form(...),
    description: str = Form(...),
    category: str = Form(...),
    image: Optional[UploadFile] = File(None),
    current_admin: str = Depends(get_current_admin)
):
    existing = await db.projects.find_one({"id": project_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Project not found")
    
    image_path = existing['image_path']
    if image:
        file_extension = image.filename.split('.')[-1]
        filename = f"{project_id}.{file_extension}"
        file_path = UPLOAD_DIR / "projects" / filename
        await save_upload_file(image, file_path)
        image_path = f"/uploads/projects/{filename}"
    
    updated_project = Project(
        id=project_id,
        title=title,
        description=description,
        category=category,
        image_path=image_path,
        created_at=existing['created_at']
    )
    await db.projects.replace_one({"id": project_id}, updated_project.model_dump())
    return updated_project

@api_router.delete("/admin/projects/{project_id}")
async def delete_project(project_id: str, current_admin: str = Depends(get_current_admin)):
    project = await db.projects.find_one({"id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Delete image file
    if project['image_path']:
        file_path = ROOT_DIR / project['image_path'].lstrip('/')
        if file_path.exists():
            file_path.unlink()
    
    await db.projects.delete_one({"id": project_id})
    return {"message": "Project deleted successfully"}

# ============ ADMIN PROTECTED ROUTES - HOME CONTENT ============

@api_router.put("/admin/home-content", response_model=HomeContent)
async def update_home_content(content: HomeContentUpdate, current_admin: str = Depends(get_current_admin)):
    existing = await db.home_content.find_one({"id": "home_content"})
    if not existing:
        raise HTTPException(status_code=404, detail="Home content not found")
    
    hero_bg_image = content.hero_bg_image if content.hero_bg_image else existing['hero_bg_image']
    
    updated_content = HomeContent(
        hero_title=content.hero_title,
        hero_subtitle=content.hero_subtitle,
        hero_bg_image=hero_bg_image
    )
    await db.home_content.replace_one({"id": "home_content"}, updated_content.model_dump())
    return updated_content

@api_router.post("/admin/home-content/upload-hero-bg")
async def upload_hero_bg(
    image: UploadFile = File(...),
    current_admin: str = Depends(get_current_admin)
):
    file_extension = image.filename.split('.')[-1]
    filename = f"hero_bg.{file_extension}"
    file_path = UPLOAD_DIR / "gallery" / filename
    
    await save_upload_file(image, file_path)
    image_url = f"/uploads/gallery/{filename}"
    
    # Update home content with new image
    await db.home_content.update_one(
        {"id": "home_content"},
        {"$set": {"hero_bg_image": image_url}}
    )
    
    return {"image_url": image_url}

# ============ ADMIN PROTECTED ROUTES - CONTACT INFO ============

@api_router.put("/admin/contact-info", response_model=ContactInfo)
async def update_contact_info(contact: ContactInfoUpdate, current_admin: str = Depends(get_current_admin)):
    updated_contact = ContactInfo(**contact.model_dump())
    await db.contact_info.replace_one({"id": "contact_info"}, updated_contact.model_dump())
    return updated_contact

# ============ ADMIN PROTECTED ROUTES - GALLERY ============

@api_router.post("/admin/gallery")
async def create_gallery_image(
    title: str = Form(""),
    order: int = Form(0),
    image: UploadFile = File(...),
    current_admin: str = Depends(get_current_admin)
):
    image_id = str(uuid.uuid4())
    file_extension = image.filename.split('.')[-1]
    filename = f"{image_id}.{file_extension}"
    file_path = UPLOAD_DIR / "gallery" / filename
    
    await save_upload_file(image, file_path)
    
    new_image = GalleryImage(
        id=image_id,
        title=title,
        order=order,
        image_path=f"/uploads/gallery/{filename}"
    )
    await db.gallery.insert_one(new_image.model_dump())
    return new_image

@api_router.delete("/admin/gallery/{image_id}")
async def delete_gallery_image(image_id: str, current_admin: str = Depends(get_current_admin)):
    image = await db.gallery.find_one({"id": image_id})
    if not image:
        raise HTTPException(status_code=404, detail="Gallery image not found")
    
    # Delete image file
    file_path = ROOT_DIR / image['image_path'].lstrip('/')
    if file_path.exists():
        file_path.unlink()
    
    await db.gallery.delete_one({"id": image_id})
    return {"message": "Gallery image deleted successfully"}

# ============ ADMIN PROTECTED ROUTES - LOGO ============

@api_router.post("/admin/upload-logo")
async def upload_logo(
    logo: UploadFile = File(...),
    current_admin: str = Depends(get_current_admin)
):
    file_extension = logo.filename.split('.')[-1]
    filename = f"logo.{file_extension}"
    file_path = UPLOAD_DIR / "logo" / filename
    
    await save_upload_file(logo, file_path)
    logo_url = f"/uploads/logo/{filename}"
    
    # Update or create site settings
    await db.site_settings.update_one(
        {"id": "site_settings"},
        {"$set": {"logo_path": logo_url}},
        upsert=True
    )
    
    return {"logo_url": logo_url}

# ============ ADMIN PROTECTED ROUTES - CONTACT SUBMISSIONS ============

@api_router.get("/admin/contact-submissions", response_model=List[ContactSubmission])
async def get_contact_submissions(current_admin: str = Depends(get_current_admin)):
    submissions = await db.contact_submissions.find({}, {"_id": 0}).sort("timestamp", -1).to_list(100)
    return submissions

@api_router.delete("/admin/contact-submissions/{submission_id}")
async def delete_contact_submission(submission_id: str, current_admin: str = Depends(get_current_admin)):
    result = await db.contact_submissions.delete_one({"id": submission_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Submission not found")
    return {"message": "Submission deleted successfully"}

# ============ STATISTICS ============

@api_router.get("/admin/stats")
async def get_admin_stats(current_admin: str = Depends(get_current_admin)):
    services_count = await db.services.count_documents({})
    projects_count = await db.projects.count_documents({})
    submissions_count = await db.contact_submissions.count_documents({})
    gallery_count = await db.gallery.count_documents({})
    
    return {
        "services": services_count,
        "projects": projects_count,
        "contact_submissions": submissions_count,
        "gallery_images": gallery_count
    }

# Include the router in the main app
app.include_router(api_router)

# Mount uploads directory for serving static files
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    await initialize_default_data()
    logger.info("Server started successfully")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
