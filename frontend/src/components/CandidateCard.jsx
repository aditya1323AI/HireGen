function CandidateCard({ candidate, onView }) {
  const initials = candidate.name
    ? candidate.name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "NA";

  return (
    <div className="candidate-row">
      <div className="candidate-info">
        <div className="candidate-avatar">
          {initials}
        </div>

        <div>
          <strong>{candidate.name}</strong>
          <span>{candidate.position}</span>
        </div>
      </div>

      <div className="candidate-status">
        <span className="status completed">
          {candidate.status}
        </span>
      </div>

      <div className="candidate-score">
        <strong>
          {candidate.score ?? "--"}
        </strong>

        <span>
          {candidate.score ? "/ 100" : ""}
        </span>
      </div>

      <div className="recommendation">
        {candidate.recommendation ? (
          <>
            <span className="recommendation-dot"></span>
            {candidate.recommendation}
          </>
        ) : (
          "Not evaluated"
        )}
      </div>

      <button
        className="details-button"
        onClick={() => onView?.(candidate)}
      >
        View
      </button>
    </div>
  );
}

export default CandidateCard;