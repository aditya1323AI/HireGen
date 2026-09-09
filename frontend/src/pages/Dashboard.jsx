import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import StatCard from "../components/StatCard";
import CandidateCard from "../components/CandidateCard";

import { getCandidates, getCandidateDetails } from "../services/api";

function Dashboard() {
    const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    async function loadCandidates() {
      try {
        const data = await getCandidates();

        const candidatesWithDetails = await Promise.all(
          data.map(async (candidate) => {
            if (!candidate.candidate_id) {
              return candidate;
            }

            try {
              const details = await getCandidateDetails(
                candidate.candidate_id
              );

              return {
                ...candidate,
                score: details.evaluation?.score ?? null,
                recommendation:
                  details.evaluation?.recommendation ?? null,
              };
            } catch {
              return candidate;
            }
          })
        );

        setCandidates(candidatesWithDetails);
      } catch (err) {
        console.error(err);
        setError("Unable to load candidates.");
      } finally {
        setLoading(false);
      }
    }

    loadCandidates();
  }, []);


  const totalCandidates = candidates.length;

  const completedCandidates = candidates.filter(
    (candidate) => candidate.status === "completed"
  ).length;

  const recommendedCandidates = candidates.filter(
    (candidate) => candidate.recommendation === "Recommended"
  ).length;

  const pendingCandidates = candidates.filter(
    (candidate) => candidate.status === "pending"
  ).length;


  return (
    <div className="app">

      <Sidebar />

      <main className="main">

        <Topbar />

        <section className="content">

          {/* Welcome */}
          <div className="welcome">

            <div>
              <h2>Good morning 👋</h2>

              <p>
                Here's what's happening with your hiring process.
              </p>
            </div>


          </div>


          {/* Statistics */}
          <div className="stats-grid">

            <StatCard
              title="Total Candidates"
              value={totalCandidates}
              description="Active candidates"
              icon="♙"
              variant="blue"
            />

            <StatCard
              title="Screened"
              value={completedCandidates}
              description="Completed screenings"
              icon="✓"
              variant="purple"
            />

            <StatCard
              title="Recommended"
              value={recommendedCandidates}
              description="AI recommended"
              icon="★"
              variant="green"
            />

            <StatCard
              title="Pending"
              value={pendingCandidates}
              description="Pending screenings"
              icon="◷"
              variant="orange"
            />

          </div>


          {/* Candidates */}
          <section className="panel">

            <div className="panel-header">

              <div>
                <h2>Recent Candidates</h2>

                <p>
                  Latest candidates processed through DigiHIRE
                </p>
              </div>

              <button className="view-all">
                View all →
              </button>

            </div>


            {loading && (
              <div className="empty-state">
                Loading candidates...
              </div>
            )}


            {error && (
              <div className="empty-state error">
                {error}
              </div>
            )}


            {!loading &&
              !error &&
              candidates.length === 0 && (
                <div className="empty-state">
                  No candidates found.
                </div>
              )}


            {
            !loading &&
              !error &&
              candidates.map((candidate) => (
               <CandidateCard
  key={candidate.candidate_id}
  candidate={candidate}
  onView={() => {
    navigate(
      `/candidates/${candidate.candidate_id}`
    );
  }}
/>
              ))}
          </section>


          {/* Screening Overview */}
          <section className="panel screening-panel">

            <div className="panel-header">

              <div>
                <h2>AI Screening Overview</h2>

                <p>
                  Candidate screening powered by AI
                </p>
              </div>

            </div>


            <div className="screening-content">

              <div className="progress-wrapper">

                <div className="progress-circle">
                  <span>
                    {totalCandidates > 0
                      ? Math.round(
                          (completedCandidates /
                            totalCandidates) *
                            100
                        )
                      : 0}
                    %
                  </span>
                </div>


                <div>

                  <strong>
                    Screening completion
                  </strong>

                  <p>
                    {completedCandidates} of{" "}
                    {totalCandidates} candidates completed
                    screening.
                  </p>

                </div>

              </div>


              <div className="screening-summary">

                <div>
                  <span>Completed</span>
                  <strong>
                    {completedCandidates}
                  </strong>
                </div>

                <div>
                  <span>Recommended</span>
                  <strong>
                    {recommendedCandidates}
                  </strong>
                </div>

                <div>
                  <span>Pending</span>
                  <strong>
                    {pendingCandidates}
                  </strong>
                </div>

              </div>

            </div>

          </section>

        </section>

      </main>

    </div>
  );
}

export default Dashboard;