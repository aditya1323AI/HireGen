import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { getJobs } from "../services/api";


function Jobs() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    async function loadJobs() {
      try {
        const data = await getJobs();

        setJobs(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load jobs.");
      } finally {
        setLoading(false);
      }
    }

    loadJobs();
  }, []);


  return (
    <div className="app">

      <Sidebar />

      <main className="main">

        <Topbar />

        <section className="jobs-page">

          {/* Header */}

          <div className="jobs-header">

            <div>
              <h2>Jobs</h2>

              <p>
                Create and manage job openings for
                candidate screening.
              </p>
            </div>

            <button
              className="primary-button"
              onClick={() =>
                navigate("/jobs/create")
              }
            >
              + Create Job
            </button>

          </div>


          {/* Loading */}

          {loading && (
            <div className="empty-state">
              Loading jobs...
            </div>
          )}


          {/* Error */}

          {error && (
            <div className="empty-state error">
              {error}
            </div>
          )}


          {/* Empty */}

          {!loading &&
            !error &&
            jobs.length === 0 && (
              <div className="empty-state">
                No jobs created yet.
              </div>
            )}


          {/* Jobs */}

          {!loading &&
            !error &&
            jobs.length > 0 && (

              <div className="jobs-grid">

                {jobs.map((job) => (

                  <div
                    className="job-card"
                    key={job.id}
                  >

                    <div className="job-card-header">

                      <div className="job-icon">
                        {job.title
                          .slice(0, 1)
                          .toUpperCase()}
                      </div>

                      <span className="job-status">
                        Active
                      </span>

                    </div>


                    <h3>
                      {job.title}
                    </h3>

                    <p className="job-description">
                      {job.description ||
                        "No description provided."}
                    </p>


                    <div className="job-meta">

                      <span>
                        📍 {job.location || "Remote"}
                      </span>

                      <span>
                        💼{" "}
                        {job.employment_type ||
                          "Full-time"}
                      </span>

                    </div>


                    <div className="job-meta">

                      <span>
                        Experience:{" "}
                        {job.minimum_experience != null
                          ? `${job.minimum_experience}+ years`
                          : "Not specified"}
                      </span>

                      <span>
                        {job.salary_range ||
                          "Salary not specified"}
                      </span>

                    </div>


                    <div className="job-skills">

                      {job.required_skills
                        ? job.required_skills
                            .split(",")
                            .map((skill) => (
                              <span
                                key={skill}
                              >
                                {skill.trim()}
                              </span>
                            ))
                        : null}

                    </div>


                    <div className="job-card-footer">

                      <span>
                        Job #{job.id}
                      </span>

                      <button
                        className="details-button"
                      >
                        View
                      </button>

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


export default Jobs;