def get_next_question(analysis):

    if analysis.get("interested") is False:
        return None

    if analysis.get("experience_years") is None:
        return "How many years of relevant experience do you have?"

    if analysis.get("current_role") is None:
        return "What is your current role or background?"

    if analysis.get("notice_period") is None:
        return "What is your current notice period?"

    if analysis.get("salary_expectation") is None:
        return "What are your salary expectations?"

    if analysis.get("relocation") is None:
        return "Are you willing to relocate for this position?"

    if analysis.get("relocation") is True:
        if analysis.get("relocation_timeline") is None:
            return "If selected, when would you be able to relocate?"

    return None