def evaluate_candidate(
    state,
    relocation_required=False
):
    score = 0
    reasons = []


    # =========================================================
    # INTEREST
    # =========================================================

    if state.get("interested") is False:

        return {
            "score": 0,
            "recommendation": "Not Recommended",
            "mandatory_requirements_met": False,
            "reasons": [
                "Candidate is not interested in the job opportunity."
            ]
        }

    if state.get("interested") is True:
        score += 20


    # =========================================================
    # EXPERIENCE
    # =========================================================

    if state.get("experience_years"):

        try:

            experience = float(
                state["experience_years"]
            )

            if experience >= 3:
                score += 30

            elif experience >= 1:
                score += 20

            else:
                score += 10

        except (ValueError, TypeError):

            pass


    # =========================================================
    # CURRENT ROLE
    # =========================================================

    if state.get("current_role"):
        score += 15


    # =========================================================
    # NOTICE PERIOD
    # =========================================================

    if state.get("notice_period"):
        score += 10


    # =========================================================
    # SALARY EXPECTATION
    # =========================================================

    if state.get("salary_expectation"):
        score += 10


    # =========================================================
    # RELOCATION
    # =========================================================

    if state.get("relocation") is True:

        score += 15

    elif (
        state.get("relocation") is False
        and relocation_required is True
    ):

        reasons.append(
            "Relocation is required for this position, "
            "but the candidate is unwilling to relocate."
        )


    # =========================================================
    # MANDATORY REQUIREMENTS
    # =========================================================

    mandatory_requirements_met = (
        len(reasons) == 0
    )


    # =========================================================
    # FINAL RECOMMENDATION
    # =========================================================

    if not mandatory_requirements_met:

        recommendation = "Not Recommended"

    elif score >= 70:

        recommendation = "Recommended"

    elif score >= 50:

        recommendation = "Maybe"

    else:

        recommendation = "Not Recommended"


    # =========================================================
    # FINAL RESULT
    # =========================================================

    return {
        "score": score,
        "recommendation": recommendation,
        "mandatory_requirements_met": mandatory_requirements_met,
        "reasons": reasons
    }