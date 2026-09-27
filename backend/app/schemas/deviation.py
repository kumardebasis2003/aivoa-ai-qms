from typing import Optional

from pydantic import BaseModel, Field


# =========================================================
# DEVIATION DATA
# =========================================================

class Deviation(BaseModel):
    site: str = ""
    occurrence_date: str = ""
    title: str = ""
    source: str = ""
    product_material: str = ""
    batch_number: str = ""
    detailed_description: str = ""

    initial_impact: str = ""
    initial_severity: str = ""

    risk_reason: str = ""
    recommended_action: str = ""


# =========================================================
# EXTRACT REQUEST
# =========================================================

class DeviationExtractRequest(BaseModel):
    text: str = Field(
        ...,
        min_length=1,
        description="Raw deviation report text"
    )


# =========================================================
# RISK ASSESSMENT REQUEST
# =========================================================

class RiskAssessmentRequest(BaseModel):
    deviation: Deviation


# =========================================================
# EDIT REQUEST
# =========================================================

class EditDeviationRequest(BaseModel):
    deviation: Deviation

    instruction: str = Field(
        ...,
        min_length=1,
        description="Instruction for AI to modify the deviation"
    )


# =========================================================
# SAVE REQUEST
# =========================================================

class SaveDeviationRequest(BaseModel):
    deviation: Deviation


# =========================================================
# GENERIC RESPONSE
# =========================================================

class APIResponse(BaseModel):
    success: bool
    message: str
    data: Optional[dict] = None