import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { getCandidates, getCandidateDetails } from "../services/api";


function Candidates() {
  const navigate = useNavigate();

  const [candidates, setCandidates] = useState([]);
  const [candidateDetails, setCandidateDetails] = useState({});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    async function loadCandidates() {
      try {
        const data = await getCandidates();

        setCandidates(data);

        const details = {};

        await Promise.all(
          data.map(async (candidate) => {
            if (!candidate.candidate_id) {
              return;
            }

            try {
              const result = await getCandidateDetails(
                candidate.candidate_id
              );

              details[candidate.candidate_id] = {
                score: result.evaluation?.score ?? null,
                recommendation:
                  result.evaluation?.recommendation ?? null,
              };
            } catch (err) {
              console.error(
                `Unable to load candidate ${candidate.candidate_id}`,
                err
              );
            }
          })
        );

        setCandidateDetails(details);

      } catch (err) {
        console.error(err);
        setError("Unable to load candidates.");
      } finally {
        setLoading(false);
      }
    }

    loadCandidates();
  }, []);


  const filteredCandidates = useMemo(() => {
    return candidates.filter((candidate) => {
      const searchValue = search.toLowerCase().trim();

      const matchesSearch =
        !searchValue ||
        candidate.name?.toLowerCase().includes(searchValue) ||
        candidate.email?.toLowerCase().includes(searchValue) ||
        candidate.position?.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "All" ||
        candidate.status?.toLowerCase() ===
          statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [candidates, search, statusFilter]);


  return (
    <div className="app">

      <Sidebar />

      <main className="main">

        <Topbar />

        <section className="candidates-page">

          {/* Page Header */}

          <div className="candidates-header">

            <div>
              <h2>Candidates</h2>

              <p>
                Manage and review candidates processed through
                DigiHIRE.
              </p>
            </div>

            <button
  className="primary-button"
  onClick={() => navigate("/candidates/create")}
>
  + Add Candidate
</button>

          </div>


          {/* Filters */}

          <div className="candidate-filters">

            <div className="search-box">
              <span>⌕</span>

              <input
                type="text"
                placeholder="Search candidates..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />
            </div>


            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              className="status-filter"
            >
              <option value="All">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="Not Started">Not Started</option>
            </select>

          </div>


          {/* Candidate count */}

          <div className="candidate-count">
            {filteredCandidates.length}{" "}
            {filteredCandidates.length === 1
              ? "candidate"
              : "candidates"}
          </div>


          {/* Candidate List */}

          <section className="candidates-panel">

            <div className="candidates-table-header">

              <span>Candidate</span>
              <span>Position</span>
              <span>Status</span>
              <span>AI Score</span>
              <span>Recommendation</span>
              <span></span>

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
              filteredCandidates.length === 0 && (
                <div className="empty-state">
                  No candidates found.
                </div>
              )}


            {!loading &&
              !error &&
              filteredCandidates.map((candidate) => {

                const details =
                  candidateDetails[candidate.candidate_id];

                const initials = candidate.name
                  ? candidate.name
                      .split(" ")
                      .map((word) => word[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()
                  : "NA";


                return (
                  <div
                    className="candidate-table-row"
                    key={candidate.candidate_id}
                  >

                    {/* Candidate */}

                    <div className="candidate-main">

                      <div className="candidate-avatar">
                        {initials}
                      </div>

                      <div>
                        <strong>
                          {candidate.name}
                        </strong>

                        <span>
                          {candidate.email}
                        </span>
                      </div>

                    </div>


                    {/* Position */}

                    <div className="candidate-position">
                      {candidate.position}
                    </div>


                    {/* Status */}

                    <div>

                      <span
                        className={
                          candidate.status?.toLowerCase() ===
                          "completed"
                            ? "status completed"
                            : "status pending-status"
                        }
                      >
                        {candidate.status}
                      </span>

                    </div>


                    {/* Score */}

                    <div className="table-score">

  {candidate.status?.toLowerCase() === "completed" &&
  details?.score != null ? (
    <>
      <strong>
        {details.score}
      </strong>

      <span>/100</span>
    </>
  ) : (
    <span>--</span>
  )}

</div>


                    {/* Recommendation */}

                    <div className="table-recommendation">

  {candidate.status?.toLowerCase() === "completed" &&
  details?.recommendation ? (
    <>
      <span className="recommendation-dot"></span>

      {details.recommendation}
    </>
  ) : (
    <span className="not-evaluated">
      Not evaluated
    </span>
  )}

</div>
                    {/* Action */}

                    <div>

                      <button
                        className="details-button"
                        onClick={() =>
                          navigate(
                            `/candidates/${candidate.candidate_id}`
                          )
                        }
                      >
                        View
                      </button>

                    </div>

                  </div>
                );
              })}

          </section>

        </section>

      </main>

    </div>
  );
}

export default Candidates;