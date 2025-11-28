"""
Azure Blob Storage integration for media uploads
Handles image upload, optimization, and CDN URL generation
"""
from azure.storage.blob import BlobServiceClient, ContentSettings, generate_blob_sas, BlobSasPermissions
from PIL import Image
import io
import os
from typing import Dict, Any
from datetime import datetime, timezone
from datetime import timedelta
import hashlib
from config import settings

# Initialize Azure Blob Storage client
blob_service_client = BlobServiceClient.from_connection_string(
    settings.AZURE_STORAGE_CONNECTION_STRING
) if settings.AZURE_STORAGE_CONNECTION_STRING != "your_azure_connection_string_here" else None


class StorageService:
    """Service for handling file uploads to Azure Blob Storage"""
    
    def __init__(self):
        self.container_name = settings.AZURE_STORAGE_CONTAINER_NAME
        self.blob_service_client = blob_service_client
        
    async def upload_image(
        self,
        file_data: bytes,
        filename: str,
        content_type: str,
        folder: str = "uploads",
        create_variants: bool = True
    ) -> Dict[str, Any]:
        """
        Upload image to Azure Blob Storage with optional variants
        
        Args:
            file_data: Image bytes
            filename: Original filename
            content_type: MIME type
            folder: Storage folder path
            create_variants: Whether to create thumbnail/medium/large variants
            
        Returns:
            Dict with URLs for original and variants
        """
        if not self.blob_service_client:
            # Fallback to local storage for development
            return await self._upload_local(file_data, filename, folder)
        
        # Generate unique filename
        timestamp = datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')
        file_hash = hashlib.md5(file_data).hexdigest()[:8]
        name, ext = os.path.splitext(filename)
        safe_name = self._sanitize_filename(name)
        unique_filename = f"{safe_name}_{timestamp}_{file_hash}{ext}"
        
        # Upload original image
        blob_name = f"{folder}/{unique_filename}"
        original_url = await self._upload_blob(blob_name, file_data, content_type)
        
        result: Dict[str, Any] = {
            'original': original_url,
            'blob_name': blob_name,
            'filename': unique_filename
        }
        
        # Create responsive variants
        if create_variants and content_type.startswith('image/'):
            try:
                image = Image.open(io.BytesIO(file_data))
                
                # Thumbnail (300px width)
                thumbnail_data = self._resize_image(image, width=300)
                thumbnail_blob = f"{folder}/thumbnails/{unique_filename}"
                result['thumbnail'] = await self._upload_blob(
                    thumbnail_blob, thumbnail_data, content_type
                )
                
                # Medium (800px width)
                medium_data = self._resize_image(image, width=800)
                medium_blob = f"{folder}/medium/{unique_filename}"
                result['medium'] = await self._upload_blob(
                    medium_blob, medium_data, content_type
                )
                
                # Large (1920px width)
                large_data = self._resize_image(image, width=1920)
                large_blob = f"{folder}/large/{unique_filename}"
                result['large'] = await self._upload_blob(
                    large_blob, large_data, content_type
                )
                
                # Get dimensions
                result['width'] = image.width
                result['height'] = image.height
                
            except Exception as e:
                print(f"Error creating image variants: {e}")
        
        return result

    def _parse_connection_string(self):
        """Parse Azure connection string into a dict"""
        conn_str = (settings.AZURE_STORAGE_CONNECTION_STRING or "")
        parts = [p for p in conn_str.split(";") if p]
        pair_map = {}
        for p in parts:
            if "=" in p:
                k, v = p.split("=", 1)
                pair_map[k] = v
        return pair_map

    def generate_presigned_url(self, blob_name: str, expiry_seconds: int = 3600) -> str:
        """Generate an Azure Blob SAS URL for the given blob name (container relative)"""
        if not self.blob_service_client:
            # When running locally without Azure, return path
            account_name = (settings.AZURE_STORAGE_CONTAINER_NAME or "")
            return f"/uploads/{blob_name}"

        # Parse connection string for account name and key
        conn_map = self._parse_connection_string()
        account_name = conn_map.get('AccountName')
        account_key = conn_map.get('AccountKey') or conn_map.get('SharedAccessKey')
        if not account_name or not account_key:
            raise Exception("Azure storage account name/key missing; cannot generate SAS URL")

        # Build SAS
        sas_token = generate_blob_sas(
            account_name=account_name,
            container_name=self.container_name,
            blob_name=blob_name,
            account_key=account_key,
            permission=BlobSasPermissions(read=True),
            expiry=datetime.utcnow() + timedelta(seconds=expiry_seconds)
        )

        # Construct URL
        blob_url = f"https://{account_name}.blob.core.windows.net/{self.container_name}/{blob_name}?{sas_token}"
        return blob_url
    
    async def _upload_blob(
        self,
        blob_name: str,
        data: bytes,
        content_type: str
    ) -> str:
        """Upload data to Azure Blob Storage"""
        try:
            assert self.blob_service_client is not None
            blob_client = self.blob_service_client.get_blob_client(
                container=self.container_name,
                blob=blob_name
            )
            
            content_settings = ContentSettings(content_type=content_type)
            
            blob_client.upload_blob(
                data,
                overwrite=True,
                content_settings=content_settings
            )
            
            # Return CDN URL (cast to str for static analyzers)
            return str(blob_client.url)
            
        except Exception as e:
            raise Exception(f"Failed to upload to Azure: {str(e)}")
    
    async def delete_blob(self, blob_name: str) -> bool:
        """Delete a blob from Azure Storage"""
        try:
            if not self.blob_service_client:
                return False
                
            blob_client = self.blob_service_client.get_blob_client(
                container=self.container_name,
                blob=blob_name
            )
            blob_client.delete_blob()
            return True
            
        except Exception as e:
            print(f"Error deleting blob: {e}")
            return False
    
    async def delete_image_variants(self, blob_name: str) -> bool:
        """Delete image and all its variants"""
        try:
            # Delete original
            await self.delete_blob(blob_name)
            
            # Extract filename
            filename = os.path.basename(blob_name)
            folder = os.path.dirname(blob_name)
            
            # Delete variants
            await self.delete_blob(f"{folder}/thumbnails/{filename}")
            await self.delete_blob(f"{folder}/medium/{filename}")
            await self.delete_blob(f"{folder}/large/{filename}")
            
            return True
            
        except Exception as e:
            print(f"Error deleting image variants: {e}")
            return False
    
    def _resize_image(self, image: Image.Image, width: int) -> bytes:
        """Resize image maintaining aspect ratio"""
        # Calculate new height
        aspect_ratio = image.height / image.width
        new_height = int(width * aspect_ratio)
        
        # Resize
        resized = image.resize((width, new_height), Image.Resampling.LANCZOS)
        
        # Convert to bytes
        output = io.BytesIO()
        
        # Determine format
        format_map = {
            'JPEG': 'JPEG',
            'JPG': 'JPEG',
            'PNG': 'PNG',
            'WEBP': 'WEBP',
            'GIF': 'GIF'
        }
        img_format = format_map.get(image.format or 'JPEG', 'JPEG')
        
        # Save with optimization
        if img_format == 'JPEG':
            resized.save(output, format=img_format, quality=85, optimize=True)
        elif img_format == 'PNG':
            resized.save(output, format=img_format, optimize=True)
        else:
            resized.save(output, format=img_format)
        
        return output.getvalue()
    
    def _sanitize_filename(self, filename: str) -> str:
        """Sanitize filename for safe storage"""
        import re
        # Remove special characters, keep only alphanumeric, dash, underscore
        safe = re.sub(r'[^a-zA-Z0-9_-]', '_', filename)
        # Limit length
        return safe[:100]
    
    async def _upload_local(
        self,
        file_data: bytes,
        filename: str,
        folder: str
    ) -> Dict[str, Any]:
        """Fallback local storage for development"""
        # Create uploads directory
        upload_dir = os.path.join(os.path.dirname(__file__), '..', 'public', 'uploads', folder)
        os.makedirs(upload_dir, exist_ok=True)
        
        # Generate unique filename
        timestamp = datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')
        name, ext = os.path.splitext(filename)
        unique_filename = f"{name}_{timestamp}{ext}"
        
        # Save file
        filepath = os.path.join(upload_dir, unique_filename)
        with open(filepath, 'wb') as f:
            f.write(file_data)
        
        # Return local URL
        local_url = f"/uploads/{folder}/{unique_filename}"
        
        return {
            'original': local_url,
            'blob_name': f"{folder}/{unique_filename}",
            'filename': unique_filename
        }


# Global instance
storage_service = StorageService()
