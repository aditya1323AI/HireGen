const API_BASE_URL = "http://127.0.0.1:8000";


async function request(url, options = {}) {
  const headers = {
    ...(options.headers || {}),
  };

  // Only send JSON content type when we actually have a body.
  if (options.body) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(
    `${API_BASE_URL}${url}`,
    {
      ...options,
      headers,
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    throw new Error(
      errorData.detail || "Something went wrong"
    );
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}


/* =========================
   CANDIDATES
========================= */

export async function getCandidates() {
  return request("/api/candidates");
}


export async function getCandidateDetails(candidateId) {
  return request(
    `/api/candidates/${candidateId}`
  );
}


/* =========================
   JOBS
========================= */

export async function getJobs() {
  return request("/api/jobs");
}


export async function getJob(jobId) {
  return request(
    `/api/jobs/${jobId}`
  );
}


export async function createJob(jobData) {
  return request(
    "/api/jobs",
    {
      method: "POST",
      body: JSON.stringify(jobData),
    }
  );
}


export async function deleteJob(jobId) {
  return request(
    `/api/jobs/${jobId}`,
    {
      method: "DELETE",
    }
  );
}
export async function createCandidate(candidateData) {
  return request(
    "/api/candidates",
    {
      method: "POST",
      body: JSON.stringify(candidateData),
    }
  );
}