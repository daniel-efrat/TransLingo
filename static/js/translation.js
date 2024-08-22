// translation.js
const translationOutput = document.querySelector("#translation-output")
const translationContainer = document.querySelector(
  "#translation-output-container"
)
function translateText(language) {
  const fullText = transcriptionSegments
    .map((segment) => segment.text)
    .join(" ")

  const clearLoaderInterval = showLoader(translatingMessages) // Show loader for translation

  fetch("/translate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text: fullText, language: language }),
  })
    .then((response) => response.json())
    .then((data) => {
      hideLoader(clearLoaderInterval) // Hide loader
      if (data.error) {
        throw new Error(data.error)
      }

      translationSegments = data.output
        .split(".")
        .map((text) => text.trim())
        .filter((text) => text.length > 0) // Remove empty segments
        .map((text, index, array) => {
          return index < array.length - 1
            ? { text: text + "." }
            : { text: text + "." }
        })

      displayTranscription(translationSegments, translationOutput)
      translationContainer.style.display = "block" // Show translation container

      // Collapse transcription and expand translation
      const transcriptionCollapse = new bootstrap.Collapse(
        "#collapseTranscription",
        {
          hide: true,
        }
      )
      const translationCollapse = new bootstrap.Collapse(
        "#collapseTranslation",
        {
          show: true,
        }
      )

      document
        .querySelector("#collapseTranslation")
        .addEventListener("shown.bs.collapse", function () {
          translationContainer.scrollIntoView({ behavior: "smooth" })
        })
    })
    .catch((error) => {
      hideLoader(clearLoaderInterval) // Hide loader
      console.error("Error:", error)
      alert("An error occurred during translation.")
    })
}
