import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";


function AIScreening() {

  const navigate = useNavigate();

  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);

  const [selectedJobs, setSelectedJobs] = useState({});

  const [loading, setLoading] = useState(true);
  const [startingCandidate, setStartingCandidate] = useState(null);

  const [error, setError] = useState("");


  // =========================================================
  // LOAD CANDIDATES + JOBS
  // =========================================================

  useEffect(() => {

    async function loadData() {

      try {

        setLoading(true);
        setError("");


        const [
          candidatesResponse,
          jobsResponse
        ] = await Promise.all([

          fetch(
            "http://127.0.0.1:8000/api/candidates"
          ),

          fetch(
            "http://127.0.0.1:8000/api/jobs"
          )

        ]);


        if (!candidatesResponse.ok) {

          throw new Error(
            "Unable to load candidates."
          );

        }


        if (!jobsResponse.ok) {

          throw new Error(
            "Unable to load jobs."
          );

        }


        const candidatesData =
          await candidatesResponse.json();

        const jobsData =
          await jobsResponse.json();


        setCandidates(candidatesData);
        setJobs(jobsData);


        // -----------------------------------------------------
        // Automatically select matching job
        // -----------------------------------------------------

        const defaultSelections = {};


        candidatesData.forEach((candidate) => {

          if (candidate.screening_id) {
            return;
          }


          const matchingJob =
            jobsData.find(
              (job) =>
                job.title?.toLowerCase().trim() ===
                candidate.position?.toLowerCase().trim()
            );


          if (matchingJob) {

            defaultSelections[candidate.candidate_id] =
              matchingJob.id;

          }

        });


        setSelectedJobs(defaultSelections);

      } catch (err) {

        console.error(err);

        setError(
          err.message ||
          "Unable to load screening data."
        );

      } finally {

        setLoading(false);

      }

    }


    loadData();

  }, []);


  // =========================================================
  // HANDLE JOB SELECTION
  // =========================================================

  function handleJobChange(
    candidateId,
    jobId
  ) {

    setSelectedJobs((previous) => ({
      ...previous,
      [candidateId]: jobId
    }));

  }


  // =========================================================
  // START AI CALL
  // =========================================================

  async function startCall(candidate) {

    try {

      setError("");

      setStartingCandidate(
        candidate.candidate_id
      );


      let screeningId =
        candidate.screening_id;


      // =====================================================
      // NEW CANDIDATE
      // =====================================================

      if (!screeningId) {

        const selectedJobId =
          selectedJobs[candidate.candidate_id];


        if (!selectedJobId) {

          setError(
            `Please select a job for ${candidate.name} before starting the AI call.`
          );

          setStartingCandidate(null);

          return;

        }


        // ---------------------------------------------------
        // CREATE SCREENING
        // ---------------------------------------------------

        const screeningResponse =
          await fetch(
            "http://127.0.0.1:8000/api/screening",
            {
              method: "POST",

              headers: {
                "Content-Type": "application/json"
              },

              body: JSON.stringify({

                candidate_id:
                  candidate.candidate_id,

                job_id:
                  Number(selectedJobId)

              })

            }
          );


        const screeningData =
          await screeningResponse.json();


        if (!screeningResponse.ok) {

          throw new Error(
            typeof screeningData.detail === "string"
              ? screeningData.detail
              : "Unable to create screening."
          );

        }


        screeningId =
          screeningData.id;


        // ---------------------------------------------------
        // Update candidate locally
        // ---------------------------------------------------

        setCandidates((previous) =>

          previous.map((item) =>

            item.candidate_id ===
            candidate.candidate_id

              ? {
                  ...item,
                  screening_id: screeningId,
                  status: "pending"
                }

              : item

          )

        );

      }


      // =====================================================
      // START CALL
      // =====================================================

      const callResponse =
        await fetch(
          "http://127.0.0.1:8000/api/calls/start",
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json"
            },

            body: JSON.stringify({

              screening_id:
                Number(screeningId)

            })

          }
        );


      const callData =
        await callResponse.json();


      if (!callResponse.ok) {

        throw new Error(
          typeof callData.detail === "string"
            ? callData.detail
            : "Unable to start AI call."
        );

      }


      // =====================================================
      // GO TO CALL SCREEN
      // =====================================================

      navigate(
        `/calls/${callData.id}`
      );


    } catch (err) {

      console.error(
        "START AI CALL ERROR:",
        err
      );


      setError(
        err.message ||
        "Unable to start AI call."
      );


    } finally {

      setStartingCandidate(null);

    }

  }


  // =========================================================
  // RENDER
  // =========================================================

  return (

    <div className="app">

      <Sidebar />


      <main className="main">

        <section className="ai-screening-page">


          {/* =================================================
              HEADER
          ================================================= */}

          <div
            style={{
              padding: "40px 36px 25px"
            }}
          >

            <span
              style={{
                color: "#315bea",
                fontSize: "12px",
                fontWeight: "700",
                letterSpacing: "1px"
              }}
            >
              DIGIHIRE AI
            </span>


            <h1
              style={{
                margin: "8px 0",
                fontSize: "32px"
              }}
            >
              AI Screening
            </h1>


            <p
              style={{
                color: "#7d8799"
              }}
            >
              Manage AI-powered candidate
              screening calls.
            </p>

          </div>


          {/* =================================================
              ERROR
          ================================================= */}

          {error && (

            <div
              style={{
                margin: "0 36px 20px",
                padding: "12px 16px",
                background: "#fff1f1",
                color: "#d64545",
                borderRadius: "8px"
              }}
            >
              {error}
            </div>

          )}


          {/* =================================================
              LOADING
          ================================================= */}

          {loading && (

            <div
              style={{
                padding: "40px",
                color: "#7d8799"
              }}
            >
              Loading screening sessions...
            </div>

          )}


          {/* =================================================
              NO CANDIDATES
          ================================================= */}

          {!loading &&
            !error &&
            candidates.length === 0 && (

              <div
                style={{
                  padding: "40px"
                }}
              >
                No candidates found.
              </div>

            )}


          {/* =================================================
              CANDIDATES
          ================================================= */}

          {!loading &&
            candidates.length > 0 && (

              <div
                style={{
                  padding: "0 36px 40px"
                }}
              >

                {candidates.map((candidate) => (

                  <div
                    key={candidate.candidate_id}
                    style={{
                      background: "#ffffff",
                      border: "1px solid #e1e6ef",
                      borderRadius: "14px",
                      padding: "22px",
                      marginBottom: "14px",

                      display: "flex",
                      alignItems: "center",
                      gap: "25px"
                    }}
                  >


                    {/* =======================================
                        CANDIDATE
                    ======================================= */}

                    <div
                      style={{
                        flex: 2,
                        display: "flex",
                        alignItems: "center",
                        gap: "14px"
                      }}
                    >

                      <div
                        style={{
                          width: "52px",
                          height: "52px",
                          borderRadius: "12px",
                          background: "#edf2ff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#315bea",
                          fontWeight: "700",
                          fontSize: "17px"
                        }}
                      >

                        {candidate.name
                          ?.split(" ")
                          .map(
                            (word) =>
                              word[0]
                          )
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}

                      </div>


                      <div>

                        <h3
                          style={{
                            margin: 0
                          }}
                        >
                          {candidate.name}
                        </h3>


                        <p
                          style={{
                            margin:
                              "5px 0 0",
                            color:
                              "#8993a5",
                            fontSize:
                              "13px"
                          }}
                        >
                          {candidate.email}
                        </p>

                      </div>

                    </div>


                    {/* =======================================
                        POSITION
                    ======================================= */}

                    <div
                      style={{
                        flex: 1
                      }}
                    >

                      <span
                        style={{
                          display: "block",
                          color: "#8993a5",
                          fontSize: "11px",
                          marginBottom: "5px"
                        }}
                      >
                        Position
                      </span>


                      <strong>
                        {candidate.position}
                      </strong>

                    </div>


                    {/* =======================================
                        SCREENING
                    ======================================= */}

                    <div
                      style={{
                        width: "90px"
                      }}
                    >

                      <span
                        style={{
                          display: "block",
                          color: "#8993a5",
                          fontSize: "11px",
                          marginBottom: "5px"
                        }}
                      >
                        Screening
                      </span>


                      <strong>
                        {candidate.screening_id
                          ? `#${candidate.screening_id}`
                          : "#"}
                      </strong>

                    </div>


                    {/* =======================================
                        NEW CANDIDATE JOB SELECTOR
                    ======================================= */}

                    {!candidate.screening_id && (

                      <div
                        style={{
                          width: "190px"
                        }}
                      >

                        <span
                          style={{
                            display: "block",
                            color: "#8993a5",
                            fontSize: "11px",
                            marginBottom: "5px"
                          }}
                        >
                          Job
                        </span>


                        <select
                          value={
                            selectedJobs[
                              candidate.candidate_id
                            ] || ""
                          }
                          onChange={(event) =>
                            handleJobChange(
                              candidate.candidate_id,
                              event.target.value
                            )
                          }
                          style={{
                            width: "100%",
                            padding: "9px 10px",
                            border:
                              "1px solid #dce2eb",
                            borderRadius: "8px",
                            background:
                              "#ffffff",
                            color:
                              "#172033",
                            fontSize:
                              "13px"
                          }}
                        >

                          <option value="">
                            Select job
                          </option>


                          {jobs.map((job) => (

                            <option
                              key={job.id}
                              value={job.id}
                            >
                              {job.title}
                            </option>

                          ))}

                        </select>

                      </div>

                    )}


                    {/* =======================================
                        STATUS
                    ======================================= */}

                    <div
                      style={{
                        width: "100px"
                      }}
                    >

                      <span
                        className={
                          candidate.status
                            ?.toLowerCase() ===
                          "completed"

                            ? "status completed"

                            : "status pending-status"
                        }
                      >
                        {candidate.status}
                      </span>

                    </div>


                    {/* =======================================
                        ACTION
                    ======================================= */}

                    <div>

                      {candidate.status
                        ?.toLowerCase() ===
                        "completed" ? (

                        <span
                          style={{
                            color:
                              "#8993a5",
                            fontSize:
                              "13px"
                          }}
                        >
                          Completed
                        </span>

                      ) : (

                        <button
                          className="primary-button"
                          disabled={
                            startingCandidate ===
                            candidate.candidate_id
                          }
                          onClick={() =>
                            startCall(candidate)
                          }
                        >

                          {startingCandidate ===
                          candidate.candidate_id

                            ? "Starting..."

                            : "🎙 Start AI Call"}

                        </button>

                      )}

                    </div>

                  </div>

                ))}

              </div>

            )}

        </section>

      </main>

    </div>

  );

}


export default AIScreening;