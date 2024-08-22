// upload.js
const actions = document.querySelector("#actions")

function handleFormSubmission(formData) {
  const clearLoaderInterval = showLoader(transcribingMessages) // Show loader for transcription

  fetch("/transcribe", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      hideLoader(clearLoaderInterval) // Hide loader
      if (data.error) {
        throw new Error(data.error)
      }
      transcriptionSegments = data.output
      displayTranscription(transcriptionSegments, output)
      actions.style.display = "block" // Show action buttons
    })
    .catch((error) => {
      hideLoader(clearLoaderInterval) // Hide loader
      console.error("Error:", error)
      output.innerHTML = "An error occurred during transcription."
    })
}
