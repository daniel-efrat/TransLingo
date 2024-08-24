// upload.js
function safelyAccessElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.warn(`Element with id '${id}' not found`); // Changed from error to warning
        return null;
    }
    return element;
}

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
      transcriptionSegments = data.output // Store full segment objects
      const outputElement = safelyAccessElement('output');
      if (outputElement) {
        displayTranscription(transcriptionSegments, outputElement)
      } else {
        console.error('Output element not found');
      }
      const actionsElement = safelyAccessElement('transcription-actions');
      if (actionsElement) {
        actionsElement.style.display = "block" // Show action buttons
      } else {
        console.warn("Transcription actions element not found, unable to display actions.");
      }
      // Show the transcription accordion
      const transcriptionCollapse = new bootstrap.Collapse('#collapseTranscription', {
        show: true
      });
    })
    .catch((error) => {
      hideLoader(clearLoaderInterval) // Hide loader
      console.error("Error:", error)
      const outputElement = safelyAccessElement('output');
      if (outputElement) {
        outputElement.innerHTML = "An error occurred during transcription."
      }
    })
}