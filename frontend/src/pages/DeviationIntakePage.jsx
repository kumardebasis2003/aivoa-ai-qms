import React, { useState } from "react";

import {
  extractDeviation,
  extractDeviationFromPDF,
  generateRiskAssessment,
  editDeviation,
} from "../services/api";


/*
|--------------------------------------------------------------------------
| INITIAL DEVIATION
|--------------------------------------------------------------------------
*/

const initialDeviation = {
  site: "",
  occurrence_date: "",
  title: "",
  source: "",
  product_material: "",
  batch_number: "",
  detailed_description: "",
  initial_impact: "",
  initial_severity: "",
  risk_reason: "",
  recommended_action: "",
};


/*
|--------------------------------------------------------------------------
| INITIAL RISK
|--------------------------------------------------------------------------
*/

const initialRiskAssessment = {
  initial_impact: "",
  initial_severity: "",
  risk_reason: "",
  recommended_action: "",
};


/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

const normalizeDeviation = (data = {}) => {
  return {
    site: data.site ?? "",
    occurrence_date: data.occurrence_date ?? "",
    title: data.title ?? "",
    source: data.source ?? "",
    product_material: data.product_material ?? "",
    batch_number: data.batch_number ?? "",
    detailed_description:
      data.detailed_description ?? "",
    initial_impact:
      data.initial_impact ?? "",
    initial_severity:
      data.initial_severity ?? "",
    risk_reason:
      data.risk_reason ?? "",
    recommended_action:
      data.recommended_action ?? "",
  };
};


const getDeviationFromResponse = (response) => {
  if (!response) {
    return {};
  }

  if (response.deviation) {
    return response.deviation;
  }

  if (response.result) {
    return response.result;
  }

  if (response.data?.deviation) {
    return response.data.deviation;
  }

  if (response.data?.result) {
    return response.data.result;
  }

  return response;
};


const getRiskFromResponse = (response) => {
  if (!response) {
    return {};
  }

  if (response.risk_assessment) {
    return response.risk_assessment;
  }

  if (response.result) {
    return response.result;
  }

  if (response.data?.risk_assessment) {
    return response.data.risk_assessment;
  }

  if (response.data?.result) {
    return response.data.result;
  }

  return response;
};


const getErrorMessage = (
  error,
  fallback = "Something went wrong."
) => {
  return (
    error?.response?.data?.detail ||
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
};


/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

const DeviationIntakePage = () => {

  /*
  |--------------------------------------------------------------------------
  | FORM STATE
  |--------------------------------------------------------------------------
  */

  const [rawText, setRawText] = useState("");

  const [deviation, setDeviation] = useState(
    initialDeviation
  );

  const [riskAssessment, setRiskAssessment] =
    useState(initialRiskAssessment);


  /*
  |--------------------------------------------------------------------------
  | PDF STATE
  |--------------------------------------------------------------------------
  */

  const [selectedPDF, setSelectedPDF] =
    useState(null);

  const [loadingPDF, setLoadingPDF] =
    useState(false);


  /*
  |--------------------------------------------------------------------------
  | LOADING STATE
  |--------------------------------------------------------------------------
  */

  const [loadingExtract, setLoadingExtract] =
    useState(false);

  const [loadingRisk, setLoadingRisk] =
    useState(false);

  const [loadingEdit, setLoadingEdit] =
    useState(false);


  /*
  |--------------------------------------------------------------------------
  | EDIT STATE
  |--------------------------------------------------------------------------
  */

  const [editInstruction, setEditInstruction] =
    useState("");


  /*
  |--------------------------------------------------------------------------
  | MESSAGE STATE
  |--------------------------------------------------------------------------
  */

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");


  /*
  |--------------------------------------------------------------------------
  | UPDATE FIELD
  |--------------------------------------------------------------------------
  */

  const updateDeviationField = (
    field,
    value
  ) => {

    setDeviation((previous) => ({
      ...previous,
      [field]: value,
    }));

    setError("");
  };


  /*
  |--------------------------------------------------------------------------
  | RISK ASSESSMENT
  |--------------------------------------------------------------------------
  */

  const handleRiskAssessment = async (
    deviationData = deviation
  ) => {

    setLoadingRisk(true);
    setError("");

    try {

      const response =
        await generateRiskAssessment(
          deviationData
        );

      console.log(
        "Risk assessment response:",
        response
      );

      const risk =
        getRiskFromResponse(
          response
        );

      const normalizedRisk = {
        initial_impact:
          risk.initial_impact ?? "",

        initial_severity:
          risk.initial_severity ?? "",

        risk_reason:
          risk.risk_reason ?? "",

        recommended_action:
          risk.recommended_action ?? "",
      };

      setRiskAssessment(
        normalizedRisk
      );

      /*
      |------------------------------------------------------
      | Also update deviation form
      |------------------------------------------------------
      */

      setDeviation((previous) => ({
        ...previous,

        initial_impact:
          normalizedRisk.initial_impact ||
          previous.initial_impact,

        initial_severity:
          normalizedRisk.initial_severity ||
          previous.initial_severity,

        risk_reason:
          normalizedRisk.risk_reason ||
          previous.risk_reason,

        recommended_action:
          normalizedRisk.recommended_action ||
          previous.recommended_action,
      }));

      setMessage(
        "AI risk assessment completed successfully."
      );

      return normalizedRisk;

    } catch (err) {

      console.error(
        "Risk assessment error:",
        err
      );

      setError(
        getErrorMessage(
          err,
          "Failed to generate risk assessment."
        )
      );

    } finally {

      setLoadingRisk(false);
    }
  };


  /*
  |--------------------------------------------------------------------------
  | TEXT EXTRACTION
  |--------------------------------------------------------------------------
  */

  const handleExtract = async () => {

    if (!rawText.trim()) {

      setError(
        "Please enter a deviation report first."
      );

      return;
    }

    setLoadingExtract(true);
    setError("");
    setMessage("");

    try {

      console.log(
        "Sending deviation text..."
      );

      const response =
        await extractDeviation(
          rawText
        );

      console.log(
        "Extraction response:",
        response
      );

      const extracted =
        getDeviationFromResponse(
          response
        );

      const normalized =
        normalizeDeviation(
          extracted
        );

      setDeviation(
        normalized
      );

      setMessage(
        "Deviation extracted successfully."
      );

      /*
      |------------------------------------------------------
      | Automatically run risk assessment
      |------------------------------------------------------
      */

      await handleRiskAssessment(
        normalized
      );

    } catch (err) {

      console.error(
        "Extraction error:",
        err
      );

      setError(
        getErrorMessage(
          err,
          "Failed to extract deviation."
        )
      );

    } finally {

      setLoadingExtract(false);
    }
  };


  /*
  |--------------------------------------------------------------------------
  | PDF UPLOAD
  |--------------------------------------------------------------------------
  */

  const handlePDFUpload = async (
    event
  ) => {

    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }


    /*
    |------------------------------------------------------
    | Validate PDF
    |------------------------------------------------------
    */

    const isPDF =
      file.type === "application/pdf" ||
      file.name
        .toLowerCase()
        .endsWith(".pdf");

    if (!isPDF) {

      setError(
        "Please select a valid PDF file."
      );

      event.target.value = "";

      return;
    }


    /*
    |------------------------------------------------------
    | Store file
    |------------------------------------------------------
    */

    setSelectedPDF(file);

    setError("");
    setMessage("");

    setLoadingPDF(true);


    try {

      console.log(
        "Uploading PDF:",
        file.name
      );


      /*
      |------------------------------------------------------
      | Call PDF API
      |------------------------------------------------------
      */

      const response =
        await extractDeviationFromPDF(
          file
        );


      console.log(
        "PDF extraction response:",
        response
      );


      /*
      |------------------------------------------------------
      | Put extracted text into textarea
      |------------------------------------------------------
      */

      if (
        response?.extracted_text
      ) {

        setRawText(
          response.extracted_text
        );
      }


      /*
      |------------------------------------------------------
      | Get deviation
      |------------------------------------------------------
      */

      const extracted =
        getDeviationFromResponse(
          response
        );


      if (
        !extracted ||
        Object.keys(extracted).length === 0
      ) {

        throw new Error(
          "Backend did not return deviation data."
        );
      }


      /*
      |------------------------------------------------------
      | Normalize
      |------------------------------------------------------
      */

      const normalized =
        normalizeDeviation(
          extracted
        );


      /*
      |------------------------------------------------------
      | Update form
      |------------------------------------------------------
      */

      setDeviation(
        normalized
      );


      setMessage(
        "PDF processed and deviation extracted successfully."
      );


      /*
      |------------------------------------------------------
      | Automatic risk assessment
      |------------------------------------------------------
      */

      await handleRiskAssessment(
        normalized
      );

    } catch (err) {

      console.error(
        "PDF extraction error:",
        err
      );

      setError(
        getErrorMessage(
          err,
          "Failed to process PDF."
        )
      );

    } finally {

      setLoadingPDF(false);

      event.target.value = "";
    }
  };


  /*
  |--------------------------------------------------------------------------
  | EDIT DEVIATION
  |--------------------------------------------------------------------------
  */

  const handleEdit = async () => {

    if (!editInstruction.trim()) {

      setError(
        "Please enter an edit instruction."
      );

      return;
    }


    setLoadingEdit(true);
    setError("");
    setMessage("");


    try {

      console.log(
        "Edit instruction:",
        editInstruction
      );


      const response =
        await editDeviation(
          deviation,
          editInstruction
        );


      console.log(
        "Edit response:",
        response
      );


      const edited =
        getDeviationFromResponse(
          response
        );


      const normalized =
        normalizeDeviation(
          edited
        );


      setDeviation(
        normalized
      );


      setEditInstruction("");


      setMessage(
        "Deviation updated successfully."
      );


      /*
      |------------------------------------------------------
      | Recalculate risk after edit
      |------------------------------------------------------
      */

      await handleRiskAssessment(
        normalized
      );

    } catch (err) {

      console.error(
        "Edit deviation error:",
        err
      );

      setError(
        getErrorMessage(
          err,
          "Failed to edit deviation."
        )
      );

    } finally {

      setLoadingEdit(false);
    }
  };


  /*
  |--------------------------------------------------------------------------
  | RESET
  |--------------------------------------------------------------------------
  */

  const handleReset = () => {

    setRawText("");

    setSelectedPDF(null);

    setLoadingPDF(false);

    setDeviation({
      ...initialDeviation,
    });

    setRiskAssessment({
      ...initialRiskAssessment,
    });

    setEditInstruction("");

    setMessage("");

    setError("");
  };


  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (

    <div className="min-h-screen bg-slate-50">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="bg-white border-b border-slate-200">

        <div className="max-w-7xl mx-auto px-6 py-5">

          <div className="flex items-center justify-between">

            <div>

              <h1 className="text-2xl font-bold text-slate-900">
                Deviation Intake
              </h1>

              <p className="text-sm text-slate-500 mt-1">
                AI-powered deviation extraction,
                risk assessment and editing
              </p>

            </div>


            <button
              type="button"
              onClick={handleReset}
              className="
                px-4
                py-2
                rounded-lg
                border
                border-slate-300
                bg-white
                text-sm
                font-semibold
                text-slate-700
                hover:bg-slate-50
              "
            >
              Reset
            </button>

          </div>

        </div>

      </div>


      {/* =====================================================
          MAIN
      ===================================================== */}

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* ===================================================
            SUCCESS MESSAGE
        =================================================== */}

        {message && (

          <div
            className="
              mb-6
              rounded-xl
              border
              border-green-200
              bg-green-50
              px-4
              py-3
              text-sm
              text-green-700
            "
          >

            {message}

          </div>

        )}


        {/* ===================================================
            ERROR MESSAGE
        =================================================== */}

        {error && (

          <div
            className="
              mb-6
              rounded-xl
              border
              border-red-200
              bg-red-50
              px-4
              py-3
              text-sm
              text-red-700
            "
          >

            {error}

          </div>

        )}


        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">


          {/* =================================================
              LEFT
          ================================================= */}

          <div className="space-y-6">


            {/* ===============================================
                AI EXTRACTION
            =============================================== */}

            <div
              className="
                bg-white
                rounded-2xl
                border
                border-slate-200
                shadow-sm
                p-6
              "
            >

              <div className="mb-5">

                <h2 className="text-lg font-bold text-slate-900">
                  AI Deviation Extraction
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Paste a deviation report or upload
                  a PDF.
                </p>

              </div>


              {/* =============================================
                  PDF UPLOAD
              ============================================= */}

              <div className="mb-5">

                <div className="text-xs font-semibold text-slate-600 mb-2">
                  Upload Deviation Report
                </div>


                <label
                  htmlFor="deviation-pdf"
                  className="
                    flex
                    items-center
                    justify-between
                    gap-4
                    border-2
                    border-dashed
                    border-slate-300
                    rounded-xl
                    p-4
                    cursor-pointer
                    transition
                    hover:border-blue-400
                    hover:bg-blue-50
                  "
                >

                  <div className="flex items-center gap-3">

                    <div
                      className="
                        w-11
                        h-11
                        rounded-xl
                        bg-red-50
                        flex
                        items-center
                        justify-center
                        text-xl
                      "
                    >
                      📄
                    </div>


                    <div>

                      <div className="text-sm font-semibold text-slate-700">

                        {selectedPDF
                          ? selectedPDF.name
                          : "Upload PDF deviation report"}

                      </div>


                      <div className="text-xs text-slate-400 mt-1">

                        PDF files only

                      </div>

                    </div>

                  </div>


                  <div
                    className="
                      px-4
                      py-2
                      rounded-lg
                      bg-slate-100
                      text-slate-700
                      text-xs
                      font-semibold
                    "
                  >

                    {loadingPDF
                      ? "Reading..."
                      : "Choose PDF"}

                  </div>

                </label>


                <input
                  id="deviation-pdf"
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={
                    handlePDFUpload
                  }
                  disabled={
                    loadingPDF ||
                    loadingExtract ||
                    loadingRisk ||
                    loadingEdit
                  }
                />


                {loadingPDF && (

                  <div
                    className="
                      mt-3
                      rounded-lg
                      bg-blue-50
                      border
                      border-blue-100
                      px-4
                      py-3
                      text-sm
                      text-blue-700
                    "
                  >

                    AI is reading the PDF
                    and extracting deviation
                    information...

                  </div>

                )}

              </div>


              {/* =============================================
                  TEXT INPUT
              ============================================= */}

              <div className="mb-4">

                <label
                  className="
                    block
                    text-sm
                    font-semibold
                    text-slate-700
                    mb-2
                  "
                >
                  Deviation Report
                </label>


                <textarea
                  value={rawText}
                  onChange={(event) => {

                    setRawText(
                      event.target.value
                    );

                    setError("");
                  }}
                  placeholder="
Paste deviation report here...
"
                  rows={10}
                  className="
                    w-full
                    rounded-xl
                    border
                    border-slate-300
                    px-4
                    py-3
                    text-sm
                    text-slate-800
                    outline-none
                    resize-none
                    focus:ring-2
                    focus:ring-blue-500
                    focus:border-blue-500
                  "
                />

              </div>


              {/* =============================================
                  EXTRACT BUTTON
              ============================================= */}

              <button
                type="button"
                onClick={
                  handleExtract
                }
                disabled={
                  loadingPDF ||
                  loadingExtract ||
                  loadingRisk ||
                  loadingEdit
                }
                className="
                  w-full
                  rounded-xl
                  bg-blue-600
                  px-5
                  py-3
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-blue-700
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                "
              >

                {loadingExtract
                  ? "Extracting..."
                  : loadingRisk
                  ? "Assessing Risk..."
                  : "Extract Deviation"}

              </button>

            </div>


            {/* =================================================
                DEVIATION FORM
            ================================================= */}

            <div
              className="
                bg-white
                rounded-2xl
                border
                border-slate-200
                shadow-sm
                p-6
              "
            >

              <div className="mb-5">

                <h2 className="text-lg font-bold text-slate-900">
                  Deviation Details
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Review and update the extracted
                  information.
                </p>

              </div>


              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">


                {/* SITE */}

                <div>

                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Site
                  </label>

                  <input
                    value={
                      deviation.site
                    }
                    onChange={(event) =>
                      updateDeviationField(
                        "site",
                        event.target.value
                      )
                    }
                    className="
                      w-full
                      rounded-lg
                      border
                      border-slate-300
                      px-3
                      py-2.5
                      text-sm
                      outline-none
                      focus:ring-2
                      focus:ring-blue-500
                    "
                  />

                </div>


                {/* DATE */}

                <div>

                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Occurrence Date
                  </label>

                  <input
                    value={
                      deviation.occurrence_date
                    }
                    onChange={(event) =>
                      updateDeviationField(
                        "occurrence_date",
                        event.target.value
                      )
                    }
                    className="
                      w-full
                      rounded-lg
                      border
                      border-slate-300
                      px-3
                      py-2.5
                      text-sm
                      outline-none
                      focus:ring-2
                      focus:ring-blue-500
                    "
                  />

                </div>


                {/* TITLE */}

                <div className="md:col-span-2">

                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Title
                  </label>

                  <input
                    value={
                      deviation.title
                    }
                    onChange={(event) =>
                      updateDeviationField(
                        "title",
                        event.target.value
                      )
                    }
                    className="
                      w-full
                      rounded-lg
                      border
                      border-slate-300
                      px-3
                      py-2.5
                      text-sm
                      outline-none
                      focus:ring-2
                      focus:ring-blue-500
                    "
                  />

                </div>


                {/* SOURCE */}

                <div>

                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Source
                  </label>

                  <input
                    value={
                      deviation.source
                    }
                    onChange={(event) =>
                      updateDeviationField(
                        "source",
                        event.target.value
                      )
                    }
                    className="
                      w-full
                      rounded-lg
                      border
                      border-slate-300
                      px-3
                      py-2.5
                      text-sm
                      outline-none
                      focus:ring-2
                      focus:ring-blue-500
                    "
                  />

                </div>


                {/* PRODUCT */}

                <div>

                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Product / Material
                  </label>

                  <input
                    value={
                      deviation.product_material
                    }
                    onChange={(event) =>
                      updateDeviationField(
                        "product_material",
                        event.target.value
                      )
                    }
                    className="
                      w-full
                      rounded-lg
                      border
                      border-slate-300
                      px-3
                      py-2.5
                      text-sm
                      outline-none
                      focus:ring-2
                      focus:ring-blue-500
                    "
                  />

                </div>


                {/* BATCH */}

                <div>

                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Batch Number
                  </label>

                  <input
                    value={
                      deviation.batch_number
                    }
                    onChange={(event) =>
                      updateDeviationField(
                        "batch_number",
                        event.target.value
                      )
                    }
                    className="
                      w-full
                      rounded-lg
                      border
                      border-slate-300
                      px-3
                      py-2.5
                      text-sm
                      outline-none
                      focus:ring-2
                      focus:ring-blue-500
                    "
                  />

                </div>


                {/* DESCRIPTION */}

                <div className="md:col-span-2">

                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Detailed Description
                  </label>

                  <textarea
                    value={
                      deviation.detailed_description
                    }
                    onChange={(event) =>
                      updateDeviationField(
                        "detailed_description",
                        event.target.value
                      )
                    }
                    rows={5}
                    className="
                      w-full
                      rounded-lg
                      border
                      border-slate-300
                      px-3
                      py-2.5
                      text-sm
                      outline-none
                      resize-none
                      focus:ring-2
                      focus:ring-blue-500
                    "
                  />

                </div>


                {/* IMPACT */}

                <div>

                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Initial Impact
                  </label>

                  <select
                    value={
                      deviation.initial_impact
                    }
                    onChange={(event) =>
                      updateDeviationField(
                        "initial_impact",
                        event.target.value
                      )
                    }
                    className="
                      w-full
                      rounded-lg
                      border
                      border-slate-300
                      px-3
                      py-2.5
                      text-sm
                      outline-none
                      focus:ring-2
                      focus:ring-blue-500
                    "
                  >

                    <option value="">
                      Select Impact
                    </option>

                    <option value="Low">
                      Low
                    </option>

                    <option value="Medium">
                      Medium
                    </option>

                    <option value="High">
                      High
                    </option>

                    <option value="Critical">
                      Critical
                    </option>

                  </select>

                </div>


                {/* SEVERITY */}

                <div>

                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Initial Severity
                  </label>

                  <select
                    value={
                      deviation.initial_severity
                    }
                    onChange={(event) =>
                      updateDeviationField(
                        "initial_severity",
                        event.target.value
                      )
                    }
                    className="
                      w-full
                      rounded-lg
                      border
                      border-slate-300
                      px-3
                      py-2.5
                      text-sm
                      outline-none
                      focus:ring-2
                      focus:ring-blue-500
                    "
                  >

                    <option value="">
                      Select Severity
                    </option>

                    <option value="Minor">
                      Minor
                    </option>

                    <option value="Major">
                      Major
                    </option>

                    <option value="Critical">
                      Critical
                    </option>

                  </select>

                </div>


                {/* RISK REASON */}

                <div className="md:col-span-2">

                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Risk Reason
                  </label>

                  <textarea
                    value={
                      deviation.risk_reason
                    }
                    onChange={(event) =>
                      updateDeviationField(
                        "risk_reason",
                        event.target.value
                      )
                    }
                    rows={4}
                    className="
                      w-full
                      rounded-lg
                      border
                      border-slate-300
                      px-3
                      py-2.5
                      text-sm
                      outline-none
                      resize-none
                      focus:ring-2
                      focus:ring-blue-500
                    "
                  />

                </div>


                {/* ACTION */}

                <div className="md:col-span-2">

                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Recommended Action
                  </label>

                  <textarea
                    value={
                      deviation.recommended_action
                    }
                    onChange={(event) =>
                      updateDeviationField(
                        "recommended_action",
                        event.target.value
                      )
                    }
                    rows={4}
                    className="
                      w-full
                      rounded-lg
                      border
                      border-slate-300
                      px-3
                      py-2.5
                      text-sm
                      outline-none
                      resize-none
                      focus:ring-2
                      focus:ring-blue-500
                    "
                  />

                </div>

              </div>

            </div>


            {/* =================================================
                AI EDIT
            ================================================= */}

            <div
              className="
                bg-white
                rounded-2xl
                border
                border-slate-200
                shadow-sm
                p-6
              "
            >

              <h2 className="text-lg font-bold text-slate-900">
                AI Edit
              </h2>

              <p className="text-sm text-slate-500 mt-1 mb-4">
                Tell the AI what you want to change.
              </p>


              <textarea
                value={
                  editInstruction
                }
                onChange={(event) =>
                  setEditInstruction(
                    event.target.value
                  )
                }
                placeholder='Example: "Change severity to Critical"'
                rows={4}
                className="
                  w-full
                  rounded-xl
                  border
                  border-slate-300
                  px-4
                  py-3
                  text-sm
                  resize-none
                  outline-none
                  focus:ring-2
                  focus:ring-blue-500
                "
              />


              <button
                type="button"
                onClick={
                  handleEdit
                }
                disabled={
                  loadingEdit ||
                  loadingPDF ||
                  loadingExtract ||
                  loadingRisk
                }
                className="
                  mt-4
                  w-full
                  rounded-xl
                  bg-purple-600
                  px-5
                  py-3
                  text-sm
                  font-semibold
                  text-white
                  hover:bg-purple-700
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                "
              >

                {loadingEdit
                  ? "Updating..."
                  : "Apply AI Edit"}

              </button>

            </div>

          </div>


          {/* =================================================
              RIGHT SIDE
          ================================================= */}

          <div className="space-y-6">


            {/* =================================================
                AI COPILOT
            ================================================= */}

            <div
              className="
                bg-white
                rounded-2xl
                border
                border-slate-200
                shadow-sm
                p-6
              "
            >

              <div className="flex items-center justify-between mb-5">

                <div>

                  <h2 className="text-lg font-bold text-slate-900">
                    AI Copilot
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    AI-generated risk assessment
                  </p>

                </div>


                <div
                  className="
                    px-3
                    py-1.5
                    rounded-full
                    bg-green-50
                    text-green-700
                    text-xs
                    font-semibold
                  "
                >
                  AI Active
                </div>

              </div>


              {/* =================================================
                  RISK
              ================================================= */}

              {loadingRisk ? (

                <div
                  className="
                    rounded-xl
                    bg-blue-50
                    border
                    border-blue-100
                    p-5
                    text-sm
                    text-blue-700
                  "
                >

                  AI is analyzing the deviation
                  risk...

                </div>

              ) : (

                <div className="space-y-4">


                  {/* IMPACT */}

                  <div>

                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Initial Impact
                    </div>

                    <div
                      className="
                        mt-2
                        rounded-lg
                        bg-slate-50
                        border
                        border-slate-200
                        px-4
                        py-3
                        text-sm
                        font-semibold
                        text-slate-800
                      "
                    >

                      {riskAssessment.initial_impact ||
                        "Not assessed"}

                    </div>

                  </div>


                  {/* SEVERITY */}

                  <div>

                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Initial Severity
                    </div>

                    <div
                      className="
                        mt-2
                        rounded-lg
                        bg-slate-50
                        border
                        border-slate-200
                        px-4
                        py-3
                        text-sm
                        font-semibold
                        text-slate-800
                      "
                    >

                      {riskAssessment.initial_severity ||
                        "Not assessed"}

                    </div>

                  </div>


                  {/* RISK REASON */}

                  <div>

                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Risk Reason
                    </div>

                    <div
                      className="
                        mt-2
                        rounded-lg
                        bg-slate-50
                        border
                        border-slate-200
                        px-4
                        py-3
                        text-sm
                        leading-6
                        text-slate-700
                      "
                    >

                      {riskAssessment.risk_reason ||
                        "No risk reason available."}

                    </div>

                  </div>


                  {/* ACTION */}

                  <div>

                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Recommended Action
                    </div>

                    <div
                      className="
                        mt-2
                        rounded-lg
                        bg-slate-50
                        border
                        border-slate-200
                        px-4
                        py-3
                        text-sm
                        leading-6
                        text-slate-700
                      "
                    >

                      {riskAssessment.recommended_action ||
                        "No recommendation available."}

                    </div>

                  </div>

                </div>

              )}

            </div>


            {/* =================================================
                EXTRACTED PDF/TEXT
            ================================================= */}

            <div
              className="
                bg-white
                rounded-2xl
                border
                border-slate-200
                shadow-sm
                p-6
              "
            >

              <h2 className="text-lg font-bold text-slate-900">
                Source Content
              </h2>

              <p className="text-sm text-slate-500 mt-1 mb-4">
                Text supplied to the AI extraction
                workflow.
              </p>


              <div
                className="
                  rounded-xl
                  bg-slate-50
                  border
                  border-slate-200
                  p-4
                  max-h-80
                  overflow-y-auto
                "
              >

                {rawText ? (

                  <p
                    className="
                      text-sm
                      leading-6
                      text-slate-700
                      whitespace-pre-wrap
                    "
                  >
                    {rawText}
                  </p>

                ) : (

                  <p className="text-sm text-slate-400">
                    No source content available yet.
                  </p>

                )}

              </div>

            </div>


            {/* =================================================
                WORKFLOW STATUS
            ================================================= */}

            <div
              className="
                bg-white
                rounded-2xl
                border
                border-slate-200
                shadow-sm
                p-6
              "
            >

              <h2 className="text-lg font-bold text-slate-900 mb-4">
                Workflow
              </h2>


              <div className="space-y-3">


                <div className="flex items-center gap-3">

                  <div
                    className={`
                      w-8
                      h-8
                      rounded-full
                      flex
                      items-center
                      justify-center
                      text-xs
                      font-bold
                      ${
                        rawText
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-400"
                      }
                    `}
                  >
                    1
                  </div>

                  <div>

                    <div className="text-sm font-semibold text-slate-700">
                      Input
                    </div>

                    <div className="text-xs text-slate-400">
                      Text or PDF
                    </div>

                  </div>

                </div>


                <div className="flex items-center gap-3">

                  <div
                    className={`
                      w-8
                      h-8
                      rounded-full
                      flex
                      items-center
                      justify-center
                      text-xs
                      font-bold
                      ${
                        deviation.title ||
                        deviation.product_material
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-400"
                      }
                    `}
                  >
                    2
                  </div>

                  <div>

                    <div className="text-sm font-semibold text-slate-700">
                      AI Extraction
                    </div>

                    <div className="text-xs text-slate-400">
                      LangGraph + Groq
                    </div>

                  </div>

                </div>


                <div className="flex items-center gap-3">

                  <div
                    className={`
                      w-8
                      h-8
                      rounded-full
                      flex
                      items-center
                      justify-center
                      text-xs
                      font-bold
                      ${
                        riskAssessment.initial_impact
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-400"
                      }
                    `}
                  >
                    3
                  </div>

                  <div>

                    <div className="text-sm font-semibold text-slate-700">
                      Risk Assessment
                    </div>

                    <div className="text-xs text-slate-400">
                      AI Copilot
                    </div>

                  </div>

                </div>


                <div className="flex items-center gap-3">

                  <div
                    className={`
                      w-8
                      h-8
                      rounded-full
                      flex
                      items-center
                      justify-center
                      text-xs
                      font-bold
                      ${
                        editInstruction === "" &&
                        deviation.title
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-400"
                      }
                    `}
                  >
                    4
                  </div>

                  <div>

                    <div className="text-sm font-semibold text-slate-700">
                      Final Review
                    </div>

                    <div className="text-xs text-slate-400">
                      Edit and review
                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};


export default DeviationIntakePage;