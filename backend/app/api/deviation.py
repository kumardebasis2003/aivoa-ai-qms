from fastapi import APIRouter, HTTPException

from fastapi import APIRouter, HTTPException, UploadFile, File

from app.schemas.deviation import (
    DeviationExtractRequest,
    RiskAssessmentRequest,
    EditDeviationRequest,
    SaveDeviationRequest,
)

from app.services.ai_service import (
    process_deviation,
    generate_risk_assessment,
    edit_deviation,
    check_ai_service,
)


router = APIRouter(
    prefix="/api/deviations",
    tags=["Deviations"]
)


# =========================================================
# ROOT
# =========================================================

@router.get("/")
def deviation_root():

    return {
        "success": True,
        "message": "AIVOA Deviation API is working"
    }


# =========================================================
# AI HEALTH
# =========================================================

@router.get("/ai-health")
def ai_health():

    try:

        return {
            "success": True,
            "data": check_ai_service()
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# =========================================================
# EXTRACT DEVIATION
# =========================================================

@router.post("/extract")
def extract_deviation(
    request: DeviationExtractRequest
):

    try:

        result = process_deviation(
            request.text
        )

        return {
            "success": True,
            "message": "Deviation extracted successfully",
            "data": result
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# =========================================================
# RISK ASSESSMENT
# =========================================================

@router.post("/risk-assessment")
def risk_assessment(
    request: RiskAssessmentRequest
):

    try:

        result = generate_risk_assessment(
            request.deviation.model_dump()
        )

        return {
            "success": True,
            "message": "Risk assessment generated successfully",
            "data": result
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# =========================================================
# EDIT DEVIATION
# =========================================================

@router.post("/edit")
def edit_deviation_api(
    request: EditDeviationRequest
):

    try:

        result = edit_deviation(
            request.deviation.model_dump(),
            request.instruction
        )

        return {
            "success": True,
            "message": "Deviation updated successfully",
            "data": result
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# =========================================================
# SAVE DEVIATION
# =========================================================

@router.post("/save")
def save_deviation(
    request: SaveDeviationRequest
):

    try:

        deviation = request.deviation.model_dump()

        # Temporary save response.
        # PostgreSQL persistence can be added next.

        return {
            "success": True,
            "message": "Deviation saved successfully",
            "data": deviation
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
        
@router.post("/extract-pdf")
async def extract_deviation_from_pdf(
    file: UploadFile = File(...)
):
    """
    Upload a PDF deviation report and extract
    structured deviation information using AI.
    """

    # ---------------------------------------------------------
    # Validate file
    # ---------------------------------------------------------

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No file was provided."
        )

    # ---------------------------------------------------------
    # Validate extension
    # ---------------------------------------------------------

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported."
        )

    try:

        # -----------------------------------------------------
        # Read PDF
        # -----------------------------------------------------

        pdf_bytes = await file.read()

        if not pdf_bytes:
            raise HTTPException(
                status_code=400,
                detail="Uploaded PDF is empty."
            )

        # -----------------------------------------------------
        # Extract text
        # -----------------------------------------------------

        extracted_text = extract_text_from_pdf(
            pdf_bytes
        )

        # -----------------------------------------------------
        # Send extracted text to existing AI workflow
        # -----------------------------------------------------

        deviation = await process_deviation(
            extracted_text
        )

        # -----------------------------------------------------
        # Return result
        # -----------------------------------------------------

        return {
            "success": True,
            "filename": file.filename,
            "message": "PDF processed successfully.",
            "extracted_text": extracted_text,
            "deviation": deviation
        }

    except HTTPException:
        raise

    except Exception as error:

        print(
            f"PDF extraction error: {error}"
        )

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )
        
        
@router.post("/extract-pdf")
async def extract_deviation_from_pdf(
    file: UploadFile = File(...)
):
    """
    Upload a PDF deviation report and extract
    structured deviation information using AI.
    """

    # ---------------------------------------------------------
    # Validate file
    # ---------------------------------------------------------

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No file was provided."
        )

    # ---------------------------------------------------------
    # Validate extension
    # ---------------------------------------------------------

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported."
        )

    try:

        # -----------------------------------------------------
        # Read PDF
        # -----------------------------------------------------

        pdf_bytes = await file.read()

        if not pdf_bytes:
            raise HTTPException(
                status_code=400,
                detail="Uploaded PDF is empty."
            )

        # -----------------------------------------------------
        # Extract text
        # -----------------------------------------------------

        extracted_text = extract_text_from_pdf(
            pdf_bytes
        )

        # -----------------------------------------------------
        # Send extracted text to existing AI workflow
        # -----------------------------------------------------

        deviation = await process_deviation(
            extracted_text
        )

        # -----------------------------------------------------
        # Return result
        # -----------------------------------------------------

        return {
            "success": True,
            "filename": file.filename,
            "message": "PDF processed successfully.",
            "extracted_text": extracted_text,
            "deviation": deviation
        }

    except HTTPException:
        raise

    except Exception as error:

        print(
            f"PDF extraction error: {error}"
        )

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )