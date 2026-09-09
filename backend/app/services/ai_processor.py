import json
import re
import ollama


# ============================================================
# HELPERS
# ============================================================

NUMBER_WORDS = {
    "zero": "0",
    "one": "1",
    "two": "2",
    "three": "3",
    "four": "4",
    "five": "5",
    "six": "6",
    "seven": "7",
    "eight": "8",
    "nine": "9",
    "ten": "10",
}


def extract_experience(answer):
    """
    Extract numeric experience from answers such as:

    2 years
    two years
    I have three years of experience
    2.5 years
    """

    answer_lower = answer.lower().strip()

    # First look for numeric values.
    match = re.search(
        r"\d+(?:\.\d+)?",
        answer_lower
    )

    if match:
        return match.group()

    # Then look for number words.
    for word, number in NUMBER_WORDS.items():

        pattern = rf"\b{word}\b"

        if re.search(pattern, answer_lower):
            return number

    return None


def extract_role(answer):
    """
    Clean common conversational prefixes from role answers.
    """

    value = answer.strip()

    prefixes = [
        "i am currently",
        "i'm currently",
        "i am a",
        "i'm a",
        "i am an",
        "i'm an",
        "currently",
        "my current role is",
        "my current role:",
        "my role is",
    ]

    value_lower = value.lower()

    for prefix in prefixes:

        if value_lower.startswith(prefix):

            value = value[len(prefix):].strip()

            break

    # Remove trailing punctuation.
    value = value.rstrip(".!? ")

    # Clean common article left after prefix removal.
    if value.lower().startswith("a "):
        value = value[2:]

    elif value.lower().startswith("an "):
        value = value[3:]

    return value.title() if value else None


def extract_salary(answer):
    """
    Extract salary values while preserving useful units.

    Examples:

    20 LPA
    8 LPA
    20 lakh
    20 lakhs
    """

    answer_clean = answer.strip()

    match = re.search(
        r"(\d+(?:\.\d+)?)\s*"
        r"(lpa|lakhs?|lakh|k|crore|crores)",
        answer_clean,
        re.IGNORECASE
    )

    if match:

        number = match.group(1)
        unit = match.group(2).upper()

        if unit in ["LAKH", "LAKHS"]:
            unit = "LAKH"

        elif unit in ["CRORE", "CRORES"]:
            unit = "CRORE"

        return f"{number} {unit}"

    # Fallback: preserve the answer if AI gave us
    # something useful.
    return answer_clean if answer_clean else None


def extract_boolean(answer):
    """
    Safely determine yes/no answers.

    IMPORTANT:
    'not interested' must never become True.
    """

    text = answer.lower().strip()

    # Negative phrases FIRST.
    negative_phrases = [
        "not interested",
        "i am not interested",
        "i'm not interested",
        "don't want to",
        "do not want to",
        "not willing",
        "not ready",
        "cannot",
        "can't",
        "no",
        "nah",
        "nope",
    ]

    for phrase in negative_phrases:

        if phrase in text:
            return False

    positive_phrases = [
        "yes",
        "yeah",
        "yep",
        "sure",
        "definitely",
        "interested",
        "willing",
        "ready",
        "can relocate",
    ]

    for phrase in positive_phrases:

        if phrase in text:
            return True

    return None


# ============================================================
# MAIN AI PROCESSOR
# ============================================================

def process_candidate_answer(question, answer):

    question_lower = question.lower().strip()


    # ---------------------------------------------------------
    # Determine field
    # ---------------------------------------------------------

    if "interested" in question_lower:

        field = "interested"

        instruction = """
Determine whether the candidate is interested.

Return true if interested.
Return false if not interested.
"""


    elif "experience" in question_lower:

        field = "experience_years"

        instruction = """
Extract the number of years of relevant experience.

Return only the number as a string.

Examples:
"2 years" -> "2"
"two years" -> "2"
"3.5 years" -> "3.5"
"""


    elif (
        "current role" in question_lower
        or "background" in question_lower
    ):

        field = "current_role"

        instruction = """
Extract only the candidate's current professional role
or background.

Do not include conversational phrases such as:
"I am currently"
"I am a"
"My current role is"
"""


    elif "notice period" in question_lower:

        field = "notice_period"

        instruction = """
Extract the candidate's notice period.

Examples:
"2 months" -> "2 months"
"30 days" -> "30 days"
"immediate" -> "Immediate"
"""


    elif "salary" in question_lower:

        field = "salary_expectation"

        instruction = """
Extract the candidate's salary expectation.

Examples:
"20 LPA" -> "20 LPA"
"8 lakh" -> "8 LAKH"
"""


    elif (
        "relocate" in question_lower
        and "when" not in question_lower
    ):

        field = "relocation"

        instruction = """
Determine whether the candidate is willing to relocate.

Return true for yes.
Return false for no.

Do not return a string.
"""


    elif (
        "relocate" in question_lower
        or "relocation" in question_lower
    ):

        field = "relocation_timeline"

        instruction = """
Extract when the candidate can relocate.

Examples:
"Immediately" -> "Immediately"
"After 2 months" -> "After 2 months"
"""


    else:

        field = "summary"

        instruction = """
Give a short summary of the candidate's answer.
"""


    # ---------------------------------------------------------
    # Prompt
    # ---------------------------------------------------------

    prompt = f"""
You are an HR screening assistant.

Question:
{question}

Candidate answer:
{answer}

Task:
{instruction}

Return ONLY valid JSON.

Required format:

{{
  "{field}": null
}}

Rules:

1. Do not guess.
2. Extract information only from the candidate's answer.
3. If information is unavailable, return null.
4. Return exactly one field.
5. Boolean fields must use true or false.
6. Never return boolean values as strings.
7. Do not use markdown.
"""


    # ---------------------------------------------------------
    # Call Ollama
    # ---------------------------------------------------------

    try:

        response = ollama.chat(
            model="gemma3:1b",
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        raw_result = response["message"]["content"]

    except Exception as exc:

        print(
            "OLLAMA ERROR:",
            exc
        )

        raw_result = ""


    print(
        "RAW AI RESPONSE:",
        raw_result
    )


    # ---------------------------------------------------------
    # Clean response
    # ---------------------------------------------------------

    result = raw_result.strip()

    result = result.replace(
        "```json",
        ""
    )

    result = result.replace(
        "```",
        ""
    )

    result = result.replace(
        "“",
        '"'
    )

    result = result.replace(
        "”",
        '"'
    )

    result = result.replace(
        "’",
        "'"
    )

    result = result.strip()


    # ---------------------------------------------------------
    # Parse AI result
    # ---------------------------------------------------------

    data = None

    if result:

        try:

            data = json.loads(result)

        except json.JSONDecodeError:

        # Ollama may occasionally add text before or after
        # the JSON object. Try extracting the JSON object.

            json_match = re.search(
                r"\{.*\}",
                result,
                re.DOTALL
            )

            if json_match:

                try:

                    data = json.loads(
                        json_match.group()
                    )

                except json.JSONDecodeError:

                    print(
                        "INVALID AI JSON:",
                        result
                    )

            else:

                print(
                    "INVALID AI JSON:",
                    result
                )


    # ---------------------------------------------------------
    # AI result must be a dictionary
    # ---------------------------------------------------------

    if not isinstance(data, dict):

        data = {}


    # ---------------------------------------------------------
    # Get AI value
    # ---------------------------------------------------------

    ai_value = data.get(field)


    # ---------------------------------------------------------
    # Deterministic fallback
    # ---------------------------------------------------------

    if field == "interested":

        if not isinstance(ai_value, bool):

            fallback = extract_boolean(answer)

            if fallback is not None:
                ai_value = fallback


    elif field == "experience_years":

        if (
            ai_value is None
            or str(ai_value).strip().lower()
            in NUMBER_WORDS
        ):

            ai_value = extract_experience(answer)

        else:

            # Normalize AI output such as "two".
            ai_value = extract_experience(
                str(ai_value)
            ) or str(ai_value).strip()


    elif field == "current_role":

        # Role must always come from the candidate's
        # actual answer. Do not trust invalid AI types
        # such as true/false.
        ai_value = extract_role(answer)

    elif field == "notice_period":

        if not ai_value:

            ai_value = answer.strip()

        else:

            ai_value = str(ai_value).strip()


    elif field == "salary_expectation":

        if not ai_value:

            ai_value = extract_salary(answer)

        else:

            ai_value = extract_salary(
                str(ai_value)
            )


    elif field == "relocation":

        if not isinstance(ai_value, bool):

            fallback = extract_boolean(answer)

            if fallback is not None:
                ai_value = fallback


    elif field == "relocation_timeline":

        if not ai_value:

            ai_value = answer.strip()

        else:

            ai_value = str(ai_value).strip()


    elif field == "summary":

        if not ai_value:

            ai_value = answer.strip()


    # ---------------------------------------------------------
    # Build final result
    # ---------------------------------------------------------

    final_result = {
        field: ai_value
    }


    # ---------------------------------------------------------
    # Debug
    # ---------------------------------------------------------

    print(
        "PROCESSED RESULT:",
        final_result
    )


    return final_result