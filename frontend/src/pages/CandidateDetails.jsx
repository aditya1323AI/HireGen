import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getCandidateDetails } from "../services/api";


function CandidateDetails() {

  const { candidateId } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  // =========================================================
  // LOAD CANDIDATE
  // =========================================================

  useEffect(() => {

    async function loadCandidate() {

      try {

        const result =
          await getCandidateDetails(candidateId);

        setData(result);

      } catch (err) {

        console.error(err);

        setError(
          "Unable to load candidate details."
        );

      } finally {

        setLoading(false);

      }

    }

    loadCandidate();

  }, [candidateId]);


  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (
      <div className="details-page-state">
        Loading candidate...
      </div>
    );

  }


  // =========================================================
  // ERROR
  // =========================================================

  if (error) {

    return (
      <div className="details-page-state error">
        {error}
      </div>
    );

  }


  if (!data) {
    return null;
  }


  // =========================================================
  // DATA
  // =========================================================

  const {
    candidate,
    screening,
    screening_state,
    evaluation,
    answers
  } = data;


  // =========================================================
  // REQUIREMENT CHECKS
  // =========================================================

  const relocationRequired =
    screening?.relocation_required === true;


  const relocationMismatch =
    relocationRequired &&
    screening_state?.relocation === false;


  const mandatoryRequirementsMet =
    evaluation?.mandatory_requirements_met !== false;


  // =========================================================
  // RECOMMENDATION REASON
  // =========================================================

  let recommendationReason =
    "Candidate meets the current screening criteria.";


  if (
    evaluation?.reasons &&
    evaluation.reasons.length > 0
  ) {

    recommendationReason =
      evaluation.reasons.join(" ");

  } else if (
    screening_state?.interested === false
  ) {

    recommendationReason =
      "Candidate is not interested in the opportunity.";

  } else if (
    evaluation?.recommendation === "Maybe"
  ) {

    recommendationReason =
      "Candidate partially meets the screening criteria and may require further review.";

  }


  // =========================================================
  // PAGE
  // =========================================================

  return (

    <div className="candidate-details-page">


      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="details-header">

        <div>

          <Link
            to="/"
            className="back-link"
          >
            ← Back to Dashboard
          </Link>


          <div className="candidate-title">

            <div className="large-avatar">

              {candidate.name
                .split(" ")
                .map((word) => word[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}

            </div>


            <div>

              <h1>
                {candidate.name}
              </h1>

              <p>
                {candidate.position}
              </p>

            </div>

          </div>

        </div>


        <div className="candidate-header-status">

          <span className="status completed">
            {screening?.status}
          </span>

        </div>

      </div>


      {/* =====================================================
          EVALUATION + CANDIDATE INFORMATION
      ===================================================== */}

      <section className="details-grid">


        {/* ===================================================
            AI EVALUATION
        =================================================== */}

        <div className="evaluation-card">

          <div className="card-label">
            AI Evaluation
          </div>


          <div className="score">

            {evaluation?.score ?? "--"}

            <span>
              /100
            </span>

          </div>


          <div className="recommendation-large">

            <span className="recommendation-dot"></span>

            {evaluation?.recommendation ||
              "Not evaluated"}

          </div>


          {/* Recommendation reason */}

          <p
            style={{
              marginTop: "14px",
              color: "#687386",
              fontSize: "13px",
              lineHeight: "1.5"
            }}
          >
            {recommendationReason}
          </p>


          {/* Mandatory requirement warning */}

          {!mandatoryRequirementsMet && (

            <div
              style={{
                marginTop: "12px",
                padding: "10px 12px",
                background: "#fff4f4",
                border: "1px solid #f0caca",
                borderRadius: "8px",
                color: "#c43d3d",
                fontSize: "12px",
                fontWeight: "600"
              }}
            >
              ⚠ Mandatory requirement not met
            </div>

          )}

        </div>


        {/* ===================================================
            CANDIDATE INFORMATION
        =================================================== */}

        <div className="details-card">

          <div className="card-heading">
            Candidate Information
          </div>


          <div className="info-grid">


            <div>

              <span>
                Email
              </span>

              <strong>
                {candidate.email}
              </strong>

            </div>


            <div>

              <span>
                Phone
              </span>

              <strong>
                {candidate.phone}
              </strong>

            </div>


            <div>

              <span>
                Position
              </span>

              <strong>
                {candidate.position}
              </strong>

            </div>


            <div>

              <span>
                Screening
              </span>

              <strong>
                #{screening?.id}
              </strong>

            </div>


            <div>

              <span>
                Job
              </span>

              <strong>
                #{screening?.job_id}
              </strong>

            </div>


            <div>

              <span>
                Status
              </span>

              <strong>
                {screening?.status}
              </strong>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          REQUIREMENT CHECK
      ===================================================== */}

      <section className="details-card full-width">

        <div className="card-heading">
          Requirement Check
        </div>


        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "16px",
            marginTop: "18px"
          }}
        >


          {/* =================================================
              INTEREST
          ================================================= */}

          <div
            style={{
              padding: "16px",
              border: "1px solid #e5e9f0",
              borderRadius: "10px"
            }}
          >

            <span
              style={{
                display: "block",
                fontSize: "12px",
                color: "#8993a5",
                marginBottom: "7px"
              }}
            >
              Interest
            </span>


            <strong>

              {screening_state?.interested === true

                ? "✓ Interested"

                : screening_state?.interested === false

                ? "✕ Not Interested"

                : "--"}

            </strong>

          </div>


          {/* =================================================
              EXPERIENCE
          ================================================= */}

          <div
            style={{
              padding: "16px",
              border: "1px solid #e5e9f0",
              borderRadius: "10px"
            }}
          >

            <span
              style={{
                display: "block",
                fontSize: "12px",
                color: "#8993a5",
                marginBottom: "7px"
              }}
            >
              Experience
            </span>


            <strong>

              {screening_state?.experience_years
                ? `${screening_state.experience_years} years`
                : "--"}

            </strong>

          </div>


          {/* =================================================
              CURRENT ROLE
          ================================================= */}

          <div
            style={{
              padding: "16px",
              border: "1px solid #e5e9f0",
              borderRadius: "10px"
            }}
          >

            <span
              style={{
                display: "block",
                fontSize: "12px",
                color: "#8993a5",
                marginBottom: "7px"
              }}
            >
              Current Role
            </span>


            <strong>
              {screening_state?.current_role || "--"}
            </strong>

          </div>


          {/* =================================================
              NOTICE PERIOD
          ================================================= */}

          <div
            style={{
              padding: "16px",
              border: "1px solid #e5e9f0",
              borderRadius: "10px"
            }}
          >

            <span
              style={{
                display: "block",
                fontSize: "12px",
                color: "#8993a5",
                marginBottom: "7px"
              }}
            >
              Notice Period
            </span>


            <strong>
              {screening_state?.notice_period || "--"}
            </strong>

          </div>


          {/* =================================================
              SALARY
          ================================================= */}

          <div
            style={{
              padding: "16px",
              border: "1px solid #e5e9f0",
              borderRadius: "10px"
            }}
          >

            <span
              style={{
                display: "block",
                fontSize: "12px",
                color: "#8993a5",
                marginBottom: "7px"
              }}
            >
              Salary Expectation
            </span>


            <strong>
              {screening_state?.salary_expectation || "--"}
            </strong>

          </div>


          {/* =================================================
              RELOCATION
          ================================================= */}

          <div
            style={{
              padding: "16px",
              border:
                relocationMismatch
                  ? "1px solid #efb5b5"
                  : "1px solid #e5e9f0",
              borderRadius: "10px"
            }}
          >

            <span
              style={{
                display: "block",
                fontSize: "12px",
                color: "#8993a5",
                marginBottom: "7px"
              }}
            >
              Relocation
            </span>


            <strong>

              {screening_state?.relocation === true

                ? "Yes"

                : screening_state?.relocation === false

                ? "No"

                : "--"}

            </strong>


            {relocationRequired && (

              <small
                style={{
                  display: "block",
                  marginTop: "6px",
                  color:
                    relocationMismatch
                      ? "#d64545"
                      : "#687386"
                }}
              >

                {relocationMismatch
                  ? "Required — requirement not met"
                  : "Required"}

              </small>

            )}

          </div>


          {/* =================================================
              RELOCATION TIMELINE
          ================================================= */}

          <div
            style={{
              padding: "16px",
              border: "1px solid #e5e9f0",
              borderRadius: "10px"
            }}
          >

            <span
              style={{
                display: "block",
                fontSize: "12px",
                color: "#8993a5",
                marginBottom: "7px"
              }}
            >
              Relocation Timeline
            </span>


            <strong>
              {screening_state?.relocation_timeline || "--"}
            </strong>

          </div>

        </div>


        {/* ===================================================
            MANDATORY FAILURE MESSAGE
        =================================================== */}

        {relocationMismatch && (

          <div
            style={{
              marginTop: "20px",
              padding: "15px 18px",
              background: "#fff4f4",
              border: "1px solid #f0caca",
              borderRadius: "10px",
              color: "#c43d3d"
            }}
          >

            <strong>
              Mandatory requirement not met
            </strong>


            <p
              style={{
                margin: "5px 0 0",
                fontSize: "13px"
              }}
            >
              This position requires relocation,
              but the candidate is not willing
              to relocate.
            </p>

          </div>

        )}

      </section>


      {/* =====================================================
          SCREENING SUMMARY
      ===================================================== */}

      <section className="details-card full-width">

        <div className="card-heading">
          Screening Summary
        </div>


        <div className="screening-info-grid">


          <div>

            <span>
              Interest
            </span>

            <strong>

              {screening_state?.interested === true
                ? "Yes"
                : screening_state?.interested === false
                ? "No"
                : "--"}

            </strong>

          </div>


          <div>

            <span>
              Experience
            </span>

            <strong>

              {screening_state?.experience_years
                ? `${screening_state.experience_years} years`
                : "--"}

            </strong>

          </div>


          <div>

            <span>
              Current Role
            </span>

            <strong>
              {screening_state?.current_role || "--"}
            </strong>

          </div>


          <div>

            <span>
              Notice Period
            </span>

            <strong>
              {screening_state?.notice_period || "--"}
            </strong>

          </div>


          <div>

            <span>
              Salary Expectation
            </span>

            <strong>
              {screening_state?.salary_expectation || "--"}
            </strong>

          </div>


          <div>

            <span>
              Relocation
            </span>

            <strong>

              {screening_state?.relocation === true
                ? "Yes"
                : screening_state?.relocation === false
                ? "No"
                : "--"}

            </strong>

          </div>


          <div>

            <span>
              Relocation Timeline
            </span>

            <strong>
              {screening_state?.relocation_timeline || "--"}
            </strong>

          </div>

        </div>

      </section>


      {/* =====================================================
          QUESTIONS & ANSWERS
      ===================================================== */}

      <section className="details-card full-width">

        <div className="card-heading">
          Screening Questions & Answers
        </div>


        <div className="answers-list">

          {answers?.map((item) => (

            <div
              className="answer-item"
              key={item.question_id}
            >

              <div className="question-number">
                Q{item.question_order}
              </div>


              <div className="answer-content">

                <strong>
                  {item.question}
                </strong>


                <p>
                  {item.answer}
                </p>

              </div>

            </div>

          ))}

        </div>

      </section>

    </div>

  );

}


export default CandidateDetails;