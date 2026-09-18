import uuid
import io
from typing import List, Optional
from fastapi import APIRouter, File, UploadFile, Query, HTTPException, Response
from pydantic import BaseModel
from PIL import Image

router = APIRouter()


class UUIDGenerateRequest(BaseModel):
    version: str = "v4"  # v1, v4, v5
    quantity: int = 5
    uppercase: bool = False
    hyphenated: bool = True
    namespace: Optional[str] = "dns"  # dns, url, oid, x500
    name: Optional[str] = "nexus.workspace"


class UUIDGenerateResponse(BaseModel):
    uuids: List[str]
    version: str
    count: int


@router.post("/uuid/generate", response_model=UUIDGenerateResponse)
async def generate_uuids(req: UUIDGenerateRequest):
    if req.quantity < 1 or req.quantity > 500:
        raise HTTPException(status_code=400, detail="Quantity must be between 1 and 500")

    result = []
    ns_uuid = uuid.NAMESPACE_DNS
    if req.namespace == "url":
        ns_uuid = uuid.NAMESPACE_URL
    elif req.namespace == "oid":
        ns_uuid = uuid.NAMESPACE_OID
    elif req.namespace == "x500":
        ns_uuid = uuid.NAMESPACE_X500

    for _ in range(req.quantity):
        if req.version == "v1":
            val = uuid.uuid1()
        elif req.version == "v5":
            val = uuid.uuid5(ns_uuid, req.name or "nexus")
        else:
            val = uuid.uuid4()

        raw_str = str(val)
        if not req.hyphenated:
            raw_str = raw_str.replace("-", "")
        if req.uppercase:
            raw_str = raw_str.upper()
        else:
            raw_str = raw_str.lower()
        result.append(raw_str)

    return UUIDGenerateResponse(
        uuids=result,
        version=req.version,
        count=len(result)
    )


@router.post("/convert/jpg-to-pdf")
async def convert_jpg_to_pdf(
    files: List[UploadFile] = File(...),
    paper_size: str = Query("A4")
):
    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded")

    images = []
    for file in files:
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail=f"Invalid file type: {file.filename}")
        contents = await file.read()
        try:
            img = Image.open(io.BytesIO(contents))
            if img.mode != "RGB":
                img = img.convert("RGB")
            images.append(img)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to process image {file.filename}: {str(e)}")

    if not images:
        raise HTTPException(status_code=400, detail="No valid images to convert")

    output_pdf = io.BytesIO()
    first_img = images[0]
    rest_imgs = images[1:] if len(images) > 1 else []
    first_img.save(output_pdf, format="PDF", save_all=True, append_images=rest_imgs)
    output_pdf.seek(0)

    return Response(
        content=output_pdf.getvalue(),
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=converted.pdf"}
    )


@router.post("/convert/merge-pdf")
async def merge_pdf_files(files: List[UploadFile] = File(...)):
    if len(files) < 2:
        raise HTTPException(status_code=400, detail="Please upload at least 2 PDF files to merge")

    from pypdf import PdfWriter

    writer = PdfWriter()
    for file in files:
        if not file.filename.lower().endswith(".pdf") and file.content_type != "application/pdf":
            raise HTTPException(status_code=400, detail=f"File {file.filename} is not a valid PDF")
        contents = await file.read()
        try:
            reader_stream = io.BytesIO(contents)
            writer.append(reader_stream)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error processing PDF {file.filename}: {str(e)}")

    output_stream = io.BytesIO()
    writer.write(output_stream)
    output_stream.seek(0)
    writer.close()

    return Response(
        content=output_stream.getvalue(),
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=merged_document.pdf"}
    )


# Processed Image / BG Remover DB endpoints
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.deps import get_current_user, get_active_workspace_id
from app.models.user import User
from app.schemas.processed_image import ProcessedImageCreate, ProcessedImageResponse
from app.repositories.processed_image_repo import ProcessedImageRepository
from fastapi import Depends


@router.get("/bg-remover/history", response_model=List[ProcessedImageResponse])
async def list_processed_images(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    workspace_id: str = Depends(get_active_workspace_id)
):
    repo = ProcessedImageRepository(db)
    return await repo.list_images(workspace_id)


@router.post("/bg-remover/history", response_model=ProcessedImageResponse)
async def save_processed_image(
    data: ProcessedImageCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    workspace_id: str = Depends(get_active_workspace_id)
):
    repo = ProcessedImageRepository(db)
    return await repo.create(workspace_id, current_user.id, data)


