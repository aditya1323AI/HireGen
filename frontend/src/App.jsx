import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Candidates from "./pages/Candidates";
import CandidateDetails from "./pages/CandidateDetails";
import Jobs from "./pages/Jobs";
import CreateJob from "./pages/CreateJob";
import CallScreen from "./pages/CallScreen";
import AIScreening from "./pages/AIScreening";
import CreateCandidate from "./pages/CreateCandidate";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* Dashboard */}
        <Route
          path="/"
          element={<Dashboard />}
        />


        {/* Candidates */}
        <Route
          path="/candidates"
          element={<Candidates />}
        />

<Route
  path="/candidates/create"
  element={<CreateCandidate />}
/>

<Route
  path="/candidates/:candidateId"
  element={<CandidateDetails />}
/>
        <Route
          path="/candidates/:candidateId"
          element={<CandidateDetails />}
        />


        {/* Jobs */}
        <Route
          path="/jobs"
          element={<Jobs />}
        />

        <Route
          path="/jobs/create"
          element={<CreateJob />}
        />
<Route
  path="/ai-screening"
  element={<AIScreening />}
/>

        {/* AI Calling */}
        <Route
          path="/calls/:callId"
          element={<CallScreen />}
        />

      </Routes>

    </BrowserRouter>
  );
}


export default App;