document.addEventListener("DOMContentLoaded", () => {
  const summarizeButton = document.querySelector("#summarizeButton")
  const summaryOutputContainer = document.querySelector(
    "#summary-output-container"
  )
  const summaryActions = document.querySelector("#summary-actions")
  const summaryOutput = document.querySelector("#summaryOutput")
  let activeTranslateFunction

  // To store the summary text as segments
  let summarySegments = []

  summarizeButton.addEventListener("click", function () {
    const transcriptionOutput = document.querySelector("#output")
    const textToSummarize = Array.from(
      transcriptionOutput.querySelectorAll("p")
    )
      .map((p) => p.textContent)
      .join(" ")

    // Log the text being sent for summarization for debugging
    console.log("Text to summarize:", textToSummarize)

    if (!textToSummarize.trim()) {
      console.error("No transcription text available for summarization.")
      summaryOutput.textContent = "No transcription text available."
      return
    }

    // Show the loader with summarizing messages
    const clearLoaderInterval = showLoader(summarizingMessages)

    fetch("/summarize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: textToSummarize }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.output) {
          summaryOutput.textContent = data.output

          // Convert summary output into segments
          summarySegments = data.output
            .split(". ")
            .map((sentence) => ({ text: sentence + "." }))

          // Make the summary-output-container and summary-actions visible
          summaryOutputContainer.style.display = "block"
          summaryActions.style.display = "block"

          const summaryCollapse = new bootstrap.Collapse("#collapseSummary", {
            show: true, // Show the summary collapse
          })
        } else {
          summaryOutput.textContent = "No summary available."
        }
      })
      .catch((error) => {
        console.error("Error during summarization:", error)
        summaryOutput.textContent =
          "An error occurred while summarizing the transcription."
      })
      .finally(() => {
        // Hide the loader once the summarization process is complete
        hideLoader(clearLoaderInterval)
      })
  })

  // Event listener for summary translation button
  document
    .querySelector("#summary-actions .dropdown-toggle")
    .addEventListener("click", function () {
      activeTranslateFunction = translateSummary
    })

  // Event listener for transcription translation button
  document
    .querySelector("#actions .dropdown-toggle")
    .addEventListener("click", function () {
      activeTranslateFunction = translateText
    })

  // Event listener for language dropdown items
  document
    .querySelector("#language-list")
    .addEventListener("click", function (event) {
      if (event.target.matches(".dropdown-item")) {
        const language = event.target.getAttribute("data-language")
        if (activeTranslateFunction) {
          activeTranslateFunction(language)
        }
      }
    })

  // Translate Summary Function
  function translateSummary(language) {
    const summaryText = summaryOutput.textContent

    if (!summaryText.trim()) {
      console.error("No summary text available for translation.")
      return
    }

    fetch("/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: summaryText, language: language }),
    })
      .then((response) => response.json())
      .then((data) => {
        summaryOutput.textContent = data.output
        summarySegments = data.output
          .split(". ")
          .map((sentence) => ({ text: sentence + "." })) // Update segments with translated text
      })
      .catch((error) => console.error("Error translating summary:", error))
  }

  // Translate Transcription Function
  function translateText(language) {
    const transcriptionText = transcriptionSegments
      .map((segment) => segment.text)
      .join(" ")

    if (!transcriptionText.trim()) {
      console.error("No transcription text available for translation.")
      return
    }

    fetch("/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: transcriptionText, language: language }),
    })
      .then((response) => response.json())
      .then((data) => {
        transcriptionOutput.textContent = data.output
        transcriptionSegments = data.output
          .split(". ")
          .map((sentence) => ({ text: sentence + "." })) // Update segments with translated text
      })
      .catch((error) =>
        console.error("Error translating transcription:", error)
      )
  }

  // Expose translate functions globally
  window.translateSummary = translateSummary
  window.translateText = translateText
})
