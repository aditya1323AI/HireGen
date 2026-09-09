import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { createCandidate } from "../services/api";


function CreateCandidate() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    position: "",
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

    if (!form.name.trim()) {
      setError("Candidate name is required.");
      return;
    }

    if (!form.phone.trim()) {
      setError("Phone number is required.");
      return;
    }

    try {
      setLoading(true);

      await createCandidate({
        name: form.name,
        phone: form.phone,
        email: form.email || null,
        position: form.position || null,
      });

      navigate("/candidates");

    } catch (err) {
      console.error(err);

      setError(
        err.message || "Unable to create candidate."
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
                onClick={() => navigate("/candidates")}
              >
                ← Back to Candidates
              </button>

              <h2>Create Candidate</h2>

              <p>
                Add a candidate to the DigiHIRE screening process.
              </p>

            </div>

          </div>


          <form
            className="create-job-form"
            onSubmit={handleSubmit}
          >

            <div className="form-section">

              <h3>Candidate Information</h3>

              <div className="form-grid">

                <div className="form-group full-width">

                  <label>
                    Full Name *
                  </label>

                  <input
                    type="text"
                    name="name"
                    placeholder="e.g. Aditya Malpure"
                    value={form.name}
                    onChange={handleChange}
                  />

                </div>


                <div className="form-group">

                  <label>
                    Phone Number *
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    placeholder="e.g. 9876543210"
                    value={form.phone}
                    onChange={handleChange}
                  />

                </div>


                <div className="form-group">

                  <label>
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    placeholder="e.g. candidate@gmail.com"
                    value={form.email}
                    onChange={handleChange}
                  />

                </div>


                <div className="form-group full-width">

                  <label>
                    Position
                  </label>

                  <input
                    type="text"
                    name="position"
                    placeholder="e.g. Python Developer"
                    value={form.position}
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
                onClick={() =>
                  navigate("/candidates")
                }
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
                  : "Create Candidate"}
              </button>

            </div>

          </form>

        </section>

      </main>

    </div>
  );
}


export default CreateCandidate;