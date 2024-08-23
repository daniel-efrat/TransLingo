const translationOutput = document.querySelector("#translation-output")
const translationContainer = document.querySelector(
  "#translation-output-container"
)

document.querySelectorAll("#language-list .dropdown-item").forEach((item) => {
  item.addEventListener("click", function (event) {
    event.preventDefault()
    const selectedLanguage = this.getAttribute("data-english")
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
        .map((text) => ({ text: text + "." }))

      console.log("translationSegments:", translationSegments)

      // Clear previous translation content but keep the actions intact
      const translationOutput = document.querySelector("#translation-output")
      translationOutput.innerHTML = "" // Clear previous content only in the text container

      const rtlPattern = /[\u0590-\u05FF\u0600-\u06FF]/ // Hebrew and Arabic character ranges

      translationSegments.forEach((segment) => {
        const paragraph = document.createElement("p")
        paragraph.textContent = segment.text

        if (rtlPattern.test(segment.text)) {
          paragraph.classList.add("rtl")
          paragraph.classList.remove("ltr")
        } else {
          paragraph.classList.add("ltr")
          paragraph.classList.remove("rtl")
        }

        translationOutput.appendChild(paragraph)
      })

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

