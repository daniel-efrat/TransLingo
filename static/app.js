const uploadForm = document.querySelector("#upload-form")
const output = document.querySelector("#output")
const actions = document.querySelector("#actions")
const translationOutput = document.querySelector("#translation-output")
const translationContainer = document.querySelector(
  "#translation-output-container"
)
const translationActions = document.querySelector("#translation-actions")
const notification = document.querySelector("#notification")
const loader = document.querySelector("#loader")
const loaderMessage = document.querySelector("#loader-message")
let transcriptionSegments = []
let translationSegments = []

// Messages to show during the loading process
const transcribingMessages = [
  "Just a moment... Our AI is transcribing everything you said!",
  "The AI is already transcribing all the words!",
  "Polishing and refining your transcription!",
  "Almost there - the transcription is nearly ready!",
]

const translatingMessages = [
  "Hold on... We're translating your text!",
  "Our AI is working hard to translate every word!",
  "Almost done translating your content!",
  "Just a moment more - your translation is nearly complete!",
]

document.addEventListener("DOMContentLoaded", function () {
  const fileInput = document.querySelector(".file-upload-field")
  const fileUploadWrapper = document.querySelector(".file-upload-wrapper")

  function updateFileName() {
  const fileInput = document.getElementById('audio');
  const fileName = fileInput.files[0] ? fileInput.files[0].name : 'No file chosen';
  document.getElementById('file-placeholder').textContent = fileName;
}

document.getElementById('upload-form').onsubmit = function(event) {
  event.preventDefault(); // Prevent the default form submission

  const formData = new FormData(this); // Get the form data, including the file

  // Now send the data with fetch
  fetch('/transcribe', {
    method: 'POST',
    body: formData,
  })
  .then(response => response.json())
  .then(data => {
    if (data.error) {
      console.error('Error:', data.error);
    } else {
      console.log('Transcription successful:', data);
      // Process the data as needed
    }
  })
  .catch(error => {
    console.error('Error:', error);
  });
};

// Show the loader with changing messages
function showLoader(messages) {
  if (!loader || !loaderMessage) {
    console.error("Loader or Loader Message element not found!")
    return
  }

  let currentMessageIndex = 0

  loader.style.display = "flex"
  loaderMessage.textContent = messages[currentMessageIndex]

  const interval = setInterval(() => {
    currentMessageIndex = (currentMessageIndex + 1) % messages.length
    loaderMessage.textContent = messages[currentMessageIndex]
  }, 4000)

  return () => clearInterval(interval) // Return a function to clear the interval
}

// Hide the loader
function hideLoader(clearIntervalFunc) {
  if (clearIntervalFunc) {
    clearIntervalFunc()
  }
  if (loader) {
    loader.style.display = "none"
  }
}

// Function to handle the form submission, including showing the loader and handling the response
function handleFormSubmission(formData) {
  const clearLoaderInterval = showLoader(transcribingMessages); // Show loader for transcription

  fetch("/transcribe", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      hideLoader(clearLoaderInterval); // Hide loader
      if (data.error) {
        throw new Error(data.error);
      }
      transcriptionSegments = data.output;
      displayTranscription(transcriptionSegments, output);
      actions.style.display = "block"; // Show action buttons
    })
    .catch((error) => {
      hideLoader(clearLoaderInterval); // Hide loader
      console.error("Error:", error);
      output.innerHTML = "An error occurred during transcription.";
    });
}

// Event listener for form submission
uploadForm.onsubmit = function (event) {
  event.preventDefault(); // Prevent the form from submitting the traditional way

  let file = uploadForm.elements["audio"].files[0]; // Get the selected file from the input
  if (!file) {
    output.innerHTML = "Please select a file to upload.";
    return;
  }

  let formData = new FormData(); // Create a new FormData object
  formData.append("audio", file); // Append the selected file with the key 'audio'

  handleFormSubmission(formData); // Call the form submission handler
};

// Function to display transcription or translation
function displayTranscription(segments, container) {
  container.innerHTML = "" // Clear previous content

  const rtlPattern = /[\u0590-\u05FF\u0600-\u06FF]/ // Hebrew and Arabic character ranges

  segments.forEach((segment) => {
    const paragraph = document.createElement("p")
    paragraph.textContent = segment.text

    if (rtlPattern.test(segment.text)) {
      paragraph.style.direction = "rtl"
      paragraph.style.textAlign = "right"
      paragraph.setAttribute("dir", "rtl") // Explicitly set the dir attribute to RTL
    } else {
      paragraph.style.direction = "ltr"
      paragraph.style.textAlign = "left"
      paragraph.setAttribute("dir", "ltr") // Explicitly set the dir attribute to LTR
    }

    container.appendChild(paragraph)
  })

  // Ensure the collapse behavior is applied after rendering
  const transcriptionCollapse = new bootstrap.Collapse("#collapseTranscription", {
    hide: false,
  })
}

// Function to download text in various formats
function downloadText(format, type = "transcription") {
  const segments =
    type === "transcription" ? transcriptionSegments : translationSegments

  fetch("/download", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ segments: segments, format: format }),
  })
    .then((response) => response.blob())
    .then((blob) => {
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.style.display = "none"
      a.href = url
      a.download = `${type}.${format}`
      document.body.appendChild(a)
      a.click()
      URL.revokeObjectURL(url)
      document.body.removeChild(a)
    })
    .catch((error) => {
      console.error("Error:", error)
      alert("An error occurred while downloading the file.")
    })
}

// Function to copy transcription or translation to clipboard
function copyToClipboard(type = "transcription") {
  const segments =
    type === "transcription" ? transcriptionSegments : translationSegments
  const fullText = segments.map((segment) => segment.text).join(" ")
  navigator.clipboard
    .writeText(fullText)
    .then(() => {
      showNotification(
        `${type.charAt(0).toUpperCase() + type.slice(1)} copied to clipboard!`
      )
    })
    .catch((err) => {
      console.error("Could not copy text: ", err)
    })
}

// Function to show notification
function showNotification(message) {
  if (!notification) {
    console.error("Notification element not found!")
    return
  }

  notification.textContent = message
  notification.style.display = "block"
  setTimeout(() => {
    notification.style.display = "none"
  }, 2000)
}

// Function to translate text

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

      // Split the translated text by period (.), trim any trailing spaces, and filter out empty segments
      translationSegments = data.output
        .split(".")
        .map((text) => text.trim())
        .filter((text) => text.length > 0) // Remove empty segments
        .map((text, index, array) => {
          // Add a period to each segment except the last one
          return index < array.length - 1
            ? { text: text + "." }
            : { text: text + "." }
        })

      // Display the translation in its own container
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

      // Listen for the accordion 'shown.bs.collapse' event to ensure it's fully expanded before scrolling
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

// Loader functions
function showLoader(messages) {
  if (!loader || !loaderMessage) {
    console.error("Loader or Loader Message element not found!")
    return
  }

  let currentMessageIndex = 0

  loader.style.display = "flex"
  loaderMessage.textContent = messages[currentMessageIndex]

  const interval = setInterval(() => {
    currentMessageIndex = (currentMessageIndex + 1) % messages.length
    loaderMessage.textContent = messages[currentMessageIndex]
  }, 4000)

  return () => clearInterval(interval) // Return a function to clear the interval
}

function hideLoader(clearIntervalFunc) {
  if (clearIntervalFunc) {
    clearIntervalFunc()
  }
  if (loader) {
    loader.style.display = "none"
  }
}

// Language search filter
document
  .querySelector("#language-search")
  .addEventListener("input", function () {
    const searchQuery = this.value.toLowerCase()
    const languageItems = document.querySelectorAll("#language-list li")

    languageItems.forEach(function (item) {
      const nativeName = item.getAttribute("data-native").toLowerCase()
      const englishName = item.getAttribute("data-english").toLowerCase()

      if (
        nativeName.includes(searchQuery) ||
        englishName.includes(searchQuery)
      ) {
        item.style.display = "block"
      } else {
        item.style.display = "none"
      }
    })
  })

