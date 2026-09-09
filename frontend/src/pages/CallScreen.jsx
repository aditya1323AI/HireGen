import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";


const API_BASE_URL = "http://127.0.0.1:8000";


function CallScreen() {
  const { callId } = useParams();
  const navigate = useNavigate();

  const [call, setCall] = useState(null);
  const [question, setQuestion] = useState(null);

  const [answer, setAnswer] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  const [completed, setCompleted] = useState(false);

  const [listening, setListening] = useState(false);

  const [speechSupported, setSpeechSupported] =
    useState(true);

  const recognitionRef = useRef(null);


  // ============================================================
  // LOAD CALL
  // ============================================================

  async function loadCall() {
    try {
      setLoading(true);
      setError("");

      const [callResponse, questionResponse] =
        await Promise.all([
          fetch(
            `${API_BASE_URL}/api/calls/${callId}`
          ),

          fetch(
            `${API_BASE_URL}/api/calls/${callId}/question`
          ),
        ]);


      if (!callResponse.ok) {
        throw new Error(
          "Unable to load call."
        );
      }


      const callData =
        await callResponse.json();

    setCall(callData);

       if (callData.status !== "active") {
    setCompleted(true);
    }


      if (questionResponse.ok) {

        const questionData =
          await questionResponse.json();

        setQuestion(questionData);
      }

    } catch (err) {

      console.error(err);

      setError(
        err.message ||
        "Unable to load call."
      );

    } finally {

      setLoading(false);
    }
  }


  useEffect(() => {
    loadCall();
  }, [callId]);


  // ============================================================
  // SPEECH RECOGNITION SETUP
  // ============================================================

  useEffect(() => {

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;


    if (!SpeechRecognition) {

      setSpeechSupported(false);

      return;
    }


    const recognition =
      new SpeechRecognition();


    recognition.lang = "en-IN";

    recognition.continuous = false;

    recognition.interimResults = true;


    recognition.onstart = () => {

      setListening(true);
      setError("");
    };


    recognition.onresult = (event) => {

      let transcript = "";


      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {

        transcript +=
          event.results[i][0].transcript;
      }


      setAnswer(transcript);
    };


    recognition.onerror = (event) => {

      console.error(
        "Speech recognition error:",
        event.error
      );

      setListening(false);


      if (event.error === "not-allowed") {

        setError(
          "Microphone permission was denied. Please allow microphone access."
        );

      } else if (event.error === "no-speech") {

        setError(
          "No speech detected. Please try again."
        );

      } else {

        setError(
          "Speech recognition failed. Please try again."
        );
      }
    };


    recognition.onend = () => {

      setListening(false);
    };


    recognitionRef.current = recognition;


    return () => {

      recognition.stop();

      recognitionRef.current = null;
    };

  }, []);


  // ============================================================
  // SPEAK QUESTION
  // ============================================================

  function speakQuestion() {

    if (!question?.question) {
      return;
    }


    if (!window.speechSynthesis) {

      setError(
        "Text-to-speech is not supported in this browser."
      );

      return;
    }


    window.speechSynthesis.cancel();


    const speech =
      new SpeechSynthesisUtterance(
        question.question
      );


    speech.lang = "en-IN";

    speech.rate = 0.9;

    speech.pitch = 1;


    window.speechSynthesis.speak(
      speech
    );
  }


  // ============================================================
  // AUTO SPEAK NEW QUESTION
  // ============================================================

  useEffect(() => {

    if (!question?.question) {
      return;
    }


    const timer = setTimeout(() => {

      speakQuestion();

    }, 500);


    return () => {

      clearTimeout(timer);

      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };

  }, [question?.question]);


  // ============================================================
  // START / STOP MICROPHONE
  // ============================================================

  function toggleListening() {

    if (!speechSupported) {

      setError(
        "Speech recognition is not supported in this browser."
      );

      return;
    }


    if (!recognitionRef.current) {
      return;
    }


    if (listening) {

      recognitionRef.current.stop();

      return;
    }


    setAnswer("");

    setError("");


    try {

      recognitionRef.current.start();

    } catch (err) {

      console.error(err);
    }
  }


  // ============================================================
  // SUBMIT ANSWER
  // ============================================================

  async function submitAnswer(event) {

    event.preventDefault();


    if (!answer.trim()) {

      setError(
        "Please provide an answer first."
      );

      return;
    }


    try {

      setSubmitting(true);

      setError("");


      if (recognitionRef.current) {

        recognitionRef.current.stop();
      }


      const response = await fetch(
        `${API_BASE_URL}/api/calls/${callId}/answer`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            answer_text: answer,
          }),
        }
      );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.detail ||
          "Unable to submit answer."
        );
      }


      setAnswer("");


      // --------------------------------------------------------
      // CALL COMPLETED
      // --------------------------------------------------------

      if (
        data.call_status ===
        "completed"
      ) {

        setCompleted(true);


        setCall((previous) => ({
          ...previous,

          status: "completed",
        }));


        return;
      }


      // --------------------------------------------------------
      // NEXT QUESTION
      // --------------------------------------------------------

      setQuestion({

        call_id:
          data.call_id,

        question_id:
          data.next_question.id,

        question_order:
          data.next_question.question_order,

        question:
          data.next_question.question,
      });


      setCall((previous) => ({

        ...previous,

        current_question:
          data.next_question
            .question_order,
      }));


    } catch (err) {

      console.error(err);

      setError(
        err.message ||
        "Unable to submit answer."
      );

    } finally {

      setSubmitting(false);
    }
  }


  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {

    return (
      <div className="app">

        <Sidebar />

        <main className="main">

          <Topbar />

          <div className="empty-state">
            Loading call...
          </div>

        </main>

      </div>
    );
  }


  // ============================================================
  // ERROR
  // ============================================================

  if (error && !call) {

    return (
      <div className="app">

        <Sidebar />

        <main className="main">

          <Topbar />

          <div className="empty-state error">
            {error}
          </div>

        </main>

      </div>
    );
  }


  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="app">

      <Sidebar />


      <main className="main">

        <Topbar />


        <section className="call-page">

          <button
            className="back-button"
            onClick={() =>
              navigate("/candidates")
            }
          >
            ← Back to Candidates
          </button>


          <div className="call-header">

            <div>

              <span className="call-label">
                AI SCREENING CALL
              </span>

              <h2>
                Candidate Screening
              </h2>

              <p>
                Screening session #
                {call?.screening_id}
              </p>

            </div>


            <div className="call-status-badge">

              <span className="live-dot"></span>

              {completed
                ? "Completed"
                : "Call Active"}

            </div>

          </div>


          <div className="call-card">

            {/* Candidate */}

            <div className="candidate-call-info">

              <div className="candidate-call-avatar">
                AI
              </div>


              <div>

                <strong>
                  Candidate #
                  {call?.candidate_id}
                </strong>

                <span>
                  Screening #
                  {call?.screening_id}
                </span>

              </div>

            </div>


            {/* Question */}

            <div className="question-section">

              {!completed && question ? (

                <>

                  <div className="question-number">

                    QUESTION{" "}

                    {question.question_order}

                    {" "}OF 7

                  </div>


                  <h1>
                    {question.question}
                  </h1>


                  {/* SPEAK QUESTION */}

                  <button
                    type="button"
                    className="speak-question-button"
                    onClick={speakQuestion}
                  >
                    🔊 Speak Question
                  </button>


                  <form
                    onSubmit={submitAnswer}
                  >

                    <label>
                      Candidate Response
                    </label>


                    <textarea
                      value={answer}
                      onChange={(event) =>
                        setAnswer(
                          event.target.value
                        )
                      }
                      placeholder={
                        listening
                          ? "Listening to candidate..."
                          : "Candidate response will appear here..."
                      }
                      rows="5"
                      disabled={
                        submitting
                      }
                    />


                    {/* MICROPHONE */}

                    <button
                      type="button"
                      className={
                        listening
                          ? "microphone-button listening"
                          : "microphone-button"
                      }
                      onClick={
                        toggleListening
                      }
                      disabled={
                        submitting ||
                        !speechSupported
                      }
                    >

                      <span className="mic-icon">
                        🎙
                      </span>

                      {listening
                        ? "Stop Listening"
                        : "Start Speaking"}

                    </button>


                    {!speechSupported && (

                      <p className="speech-warning">
                        Speech recognition is not
                        supported in this browser.
                      </p>

                    )}


                    {error && (

                      <div className="form-error">
                        {error}
                      </div>

                    )}


                    <button
                      type="submit"
                      className="primary-button call-submit-button"
                      disabled={
                        submitting ||
                        !answer.trim()
                      }
                    >

                      {submitting
                        ? "AI Processing..."
                        : "Submit Answer →"}

                    </button>

                  </form>

                </>

              ) : (

                <div className="call-complete">

                  <div className="complete-icon">
                    ✓
                  </div>


                  <h2>
                    Screening Completed
                  </h2>


                  <p>
                    All screening questions have
                    been processed successfully.
                  </p>


                  <button
                    className="primary-button"
                    onClick={() =>
                      navigate("/candidates")
                    }
                  >
                    Back to Candidates
                  </button>

                </div>

              )}

            </div>


            {/* Progress */}

            <div className="call-progress">

              <div>

                <span>
                  Screening Progress
                </span>

                <strong>
                  {call?.current_question || 1}
                  {" "} / 7
                </strong>

              </div>


              <div className="progress-track">

                <div
                  className="progress-fill"
                  style={{
                    width: `${
                      (
                        (
                          call?.current_question ||
                          1
                        ) / 7
                      ) * 100
                    }%`,
                  }}
                />

              </div>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}


export default CallScreen;