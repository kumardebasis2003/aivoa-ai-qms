import json
import os
import re
from typing import Any

from dotenv import load_dotenv
from langchain_core.messages import HumanMessage
from langchain_groq import ChatGroq
from langgraph.graph import StateGraph, START, END
from typing_extensions import TypedDict


# =========================================================
# ENVIRONMENT
# =========================================================

load_dotenv()


GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv(
    "GROQ_MODEL",
    "llama-3.3-70b-versatile"
)


if not GROQ_API_KEY:
    raise ValueError(
        "GROQ_API_KEY is missing. "
        "Please add GROQ_API_KEY to your .env file."
    )


# =========================================================
# LLM
# =========================================================

llm = ChatGroq(
    model=GROQ_MODEL,
    temperature=0,
    api_key=GROQ_API_KEY,
)


# =========================================================
# HELPERS
# =========================================================

def parse_json_response(content: Any) -> dict:

    if not isinstance(content, str):
        content = str(content)

    content = content.strip()

    # Remove markdown code block if model returns it
    content = re.sub(
        r"^```json\s*",
        "",
        content,
        flags=re.IGNORECASE
    )

    content = re.sub(
        r"^```\s*",
        "",
        content
    )

    content = re.sub(
        r"\s*```$",
        "",
        content
    )

    content = content.strip()

    # Direct JSON
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        pass

    # Try extracting JSON object
    start = content.find("{")
    end = content.rfind("}")

    if start != -1 and end != -1:

        json_text = content[start:end + 1]

        try:
            return json.loads(json_text)
        except json.JSONDecodeError as exc:
            raise ValueError(
                f"AI returned invalid JSON: {content}"
            ) from exc

    raise ValueError(
        f"AI did not return valid JSON: {content}"
    )


def invoke_ai(prompt: str) -> dict:

    response = llm.invoke(
        [
            HumanMessage(content=prompt)
        ]
    )

    return parse_json_response(
        response.content
    )


# =========================================================
# LANGGRAPH STATE
# =========================================================

class DeviationState(TypedDict):
    text: str
    result: dict


# =========================================================
# EXTRACT DEVIATION
# =========================================================

def extract_deviation_node(
    state: DeviationState
):

    prompt = f"""
You are an AI assistant for a pharmaceutical
Quality Management System called AIVOA.

Analyze the deviation report below.

Extract only information that is explicitly available.

Do not invent information.

If information is missing, return an empty string.

Return ONLY valid JSON.

Required JSON:

{{
    "site": "",
    "occurrence_date": "",
    "title": "",
    "source": "",
    "product_material": "",
    "batch_number": "",
    "detailed_description": "",
    "initial_impact": "",
    "initial_severity": "",
    "risk_reason": "",
    "recommended_action": ""
}}

Rules:

initial_impact must be one of:

"Low"
"Medium"
"High"
"Critical"

initial_severity must be one of:

"Minor"
"Major"
"Critical"

If impact or severity cannot be reliably determined,
return an empty string.

Do not invent batch numbers.

Do not invent dates.

Do not invent site names.

Do not invent product names.

Deviation report:

{state["text"]}
"""

    result = invoke_ai(prompt)

    state["result"] = result

    return state


# =========================================================
# LANGGRAPH WORKFLOW
# =========================================================

workflow = StateGraph(DeviationState)

workflow.add_node(
    "extract_deviation",
    extract_deviation_node
)

workflow.add_edge(
    START,
    "extract_deviation"
)

workflow.add_edge(
    "extract_deviation",
    END
)

deviation_graph = workflow.compile()


# =========================================================
# PROCESS DEVIATION
# =========================================================

def process_deviation(text: str) -> dict:

    result = deviation_graph.invoke(
        {
            "text": text,
            "result": {}
        }
    )

    return result["result"]


# =========================================================
# RISK ASSESSMENT
# =========================================================

def generate_risk_assessment(
    deviation: dict
) -> dict:

    prompt = f"""
You are a pharmaceutical Quality Management
System risk assessment assistant.

Analyze the following deviation.

Return ONLY valid JSON.

Required structure:

{{
    "initial_impact": "",
    "initial_severity": "",
    "risk_reason": "",
    "recommended_action": ""
}}

Rules:

initial_impact must be exactly one of:

"Low"
"Medium"
"High"
"Critical"

initial_severity must be exactly one of:

"Minor"
"Major"
"Critical"

Assess based only on the information provided.

Do not invent facts.

The risk_reason must briefly explain
why the selected impact and severity are appropriate.

The recommended_action should be practical
for a pharmaceutical QMS.

Deviation:

{json.dumps(deviation, indent=2)}
"""

    result = invoke_ai(prompt)

    return {
        "initial_impact": result.get(
            "initial_impact",
            ""
        ),
        "initial_severity": result.get(
            "initial_severity",
            ""
        ),
        "risk_reason": result.get(
            "risk_reason",
            ""
        ),
        "recommended_action": result.get(
            "recommended_action",
            ""
        )
    }


# =========================================================
# EDIT DEVIATION
# =========================================================

def edit_deviation(
    deviation: dict,
    instruction: str
) -> dict:

    prompt = f"""
You are an AI assistant for a pharmaceutical
Quality Management System.

The user wants to modify an existing deviation record.

Existing deviation:

{json.dumps(deviation, indent=2)}

User instruction:

{instruction}

Return the COMPLETE updated deviation as valid JSON.

Required structure:

{{
    "site": "",
    "occurrence_date": "",
    "title": "",
    "source": "",
    "product_material": "",
    "batch_number": "",
    "detailed_description": "",
    "initial_impact": "",
    "initial_severity": "",
    "risk_reason": "",
    "recommended_action": ""
}}

Rules:

1. Keep information that the user did not ask to change.
2. Only modify information relevant to the instruction.
3. Do not invent facts.
4. Do not remove existing information unnecessarily.
5. initial_impact must be one of:
   "Low", "Medium", "High", "Critical"
6. initial_severity must be one of:
   "Minor", "Major", "Critical"

Return ONLY JSON.
"""

    result = invoke_ai(prompt)

    return result


# =========================================================
# HEALTH CHECK
# =========================================================

def check_ai_service() -> dict:

    return {
        "status": "online",
        "provider": "Groq",
        "model": GROQ_MODEL
    }