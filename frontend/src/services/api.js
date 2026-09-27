import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000";

const API = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});


/*
|--------------------------------------------------------------------------
| 1. EXTRACT DEVIATION FROM TEXT
|--------------------------------------------------------------------------
| POST /api/deviations/extract
|
| Request:
| {
|   "text": "..."
| }
|--------------------------------------------------------------------------
*/

export const extractDeviation = async (text) => {
  const response = await API.post(
    "/api/deviations/extract",
    {
      text,
    }
  );

  return response.data;
};


/*
|--------------------------------------------------------------------------
| 2. EXTRACT DEVIATION FROM PDF
|--------------------------------------------------------------------------
| POST /api/deviations/extract-pdf
|
| Request:
| multipart/form-data
| file = PDF
|--------------------------------------------------------------------------
*/

export const extractDeviationFromPDF = async (file) => {
  const formData = new FormData();

  formData.append("file", file);

  const response = await API.post(
    "/api/deviations/extract-pdf",
    formData
  );

  return response.data;
};


/*
|--------------------------------------------------------------------------
| 3. RISK ASSESSMENT
|--------------------------------------------------------------------------
| POST /api/deviations/risk-assessment
|
| Request:
| {
|   "deviation": {
|      ...
|   }
| }
|--------------------------------------------------------------------------
*/

export const generateRiskAssessment = async (deviation) => {
  const response = await API.post(
    "/api/deviations/risk-assessment",
    {
      deviation,
    }
  );

  return response.data;
};


/*
|--------------------------------------------------------------------------
| 4. EDIT DEVIATION
|--------------------------------------------------------------------------
| POST /api/deviations/edit
|
| Request:
| {
|   "deviation": {
|      ...
|   },
|   "instruction": "Change severity to Critical"
| }
|--------------------------------------------------------------------------
*/

export const editDeviation = async (
  deviation,
  instruction
) => {
  const response = await API.post(
    "/api/deviations/edit",
    {
      deviation,
      instruction,
    }
  );

  return response.data;
};


/*
|--------------------------------------------------------------------------
| DEFAULT API
|--------------------------------------------------------------------------
*/

export default API;