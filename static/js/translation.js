const translationOutput = document.querySelector("#translation-output")
const translationContainer = document.querySelector(
  "#translation-output-container"
)

document.querySelectorAll("#language-list .dropdown-item").forEach((item) => {
  item.addEventListener("click", function (event) {
    event.preventDefault()
    const selectedLanguage = this.getAttribute("data-language")
    console.log("Language selected:", selectedLanguage) // Debugging line
    translateText(selectedLanguage)
  })
})

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
    .then((response) => {
      if (!response.ok) {
        return response.json().then((data) => {
          throw new Error(data.error || "Unknown error occurred")
        })
      }
      return response.json()
    })
    .then((data) => {
      hideLoader(clearLoaderInterval)

      if (data.error) {
        throw new Error(data.error)
      }

      translationSegments = data.output
        .split(".")
        .map((text) => text.trim())
        .filter((text) => text.length > 0)
        .map((text, index, array) => {
          return index < array.length - 1
            ? { text: text + "." }
            : { text: text + "." }
        })

      // Ensure the translated text is displayed in the translationOutput element
      translationOutput.innerHTML = translationSegments
        .map((segment) => `<p>${segment.text}</p>`)
        .join("")

      translationContainer.style.display = "block" // Show translation container

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
      hideLoader(clearLoaderInterval)
      console.error("Error:", error.message)
      alert(`An error occurred during translation: ${error.message}`)
    })
}
