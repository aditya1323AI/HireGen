import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { createJob } from "../services/api";


function CreateJob() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    employment_type: "Full-time",
    required_skills: "",
    minimum_experience: "",
    salary_range: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  function handleChange(event) {
    const { name, value } = event.target;

    setForm({
      ...form,
      [name]: value,
    });
  }


  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    if (!form.title.trim()) {
      setError("Job title is required.");
      return;
    }

    try {
      setLoading(true);

      await createJob({
        title: form.title,
        description: form.description || null,
        location: form.location || null,
        employment_type: form.employment_type || null,
        required_skills: form.required_skills || null,
        minimum_experience:
          form.minimum_experience === ""
            ? null
            : Number(form.minimum_experience),
        salary_range: form.salary_range || null,
      });

      navigate("/jobs");

    } catch (err) {
      console.error(err);

      setError(
        err.message || "Unable to create job."
      );

    } finally {
      setLoading(false);
    }
  }


  return (
    <div className="app">

      <Sidebar />

      <main className="main">

        <Topbar />

        <section className="create-job-page">

          <div className="create-job-header">

            <div>
              <button
                className="back-button"
                onClick={() => navigate("/jobs")}
              >
                ← Back to Jobs
              </button>

              <h2>Create Job</h2>

              <p>
                Create a job opening for your hiring process.
              </p>
            </div>

          </div>


          <form
            className="create-job-form"
            onSubmit={handleSubmit}
          >

            <div className="form-section">

              <h3>Job Details</h3>

              <div className="form-grid">

                <div className="form-group full-width">
                  <label>
                    Job Title *
                  </label>

                  <input
                    type="text"
                    name="title"
                    placeholder="e.g. Python Developer"
                    value={form.title}
                    onChange={handleChange}
                  />
                </div>


                <div className="form-group">
                  <label>
                    Location
                  </label>

                  <input
                    type="text"
                    name="location"
                    placeholder="e.g. Pune"
                    value={form.location}
                    onChange={handleChange}
                  />
                </div>


                <div className="form-group">
                  <label>
                    Employment Type
                  </label>

                  <select
                    name="employment_type"
                    value={form.employment_type}
                    onChange={handleChange}
                  >
                    <option value="Full-time">
                      Full-time
                    </option>

                    <option value="Part-time">
                      Part-time
                    </option>

                    <option value="Contract">
                      Contract
                    </option>

                    <option value="Internship">
                      Internship
                    </option>
                  </select>
                </div>


                <div className="form-group">
                  <label>
                    Minimum Experience
                  </label>

                  <input
                    type="number"
                    name="minimum_experience"
                    min="0"
                    placeholder="e.g. 2"
                    value={form.minimum_experience}
                    onChange={handleChange}
                  />
                </div>


                <div className="form-group">
                  <label>
                    Salary Range
                  </label>

                  <input
                    type="text"
                    name="salary_range"
                    placeholder="e.g. 6-10 LPA"
                    value={form.salary_range}
                    onChange={handleChange}
                  />
                </div>


                <div className="form-group full-width">
                  <label>
                    Required Skills
                  </label>

                  <input
                    type="text"
                    name="required_skills"
                    placeholder="e.g. Python, FastAPI, AWS, PostgreSQL"
                    value={form.required_skills}
                    onChange={handleChange}
                  />

                  <span className="form-help">
                    Separate multiple skills with commas.
                  </span>
                </div>


                <div className="form-group full-width">
                  <label>
                    Job Description
                  </label>

                  <textarea
                    name="description"
                    rows="6"
                    placeholder="Describe the role, responsibilities and requirements..."
                    value={form.description}
                    onChange={handleChange}
                  />
                </div>

              </div>

            </div>


            {error && (
              <div className="form-error">
                {error}
              </div>
            )}


            <div className="form-actions">

              <button
                type="button"
                className="secondary-button"
                onClick={() => navigate("/jobs")}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-button"
                disabled={loading}
              >
                {loading
                  ? "Creating..."
                  : "Create Job"}
              </button>

            </div>

          </form>

        </section>

      </main>

    </div>
  );
}


export default CreateJob;