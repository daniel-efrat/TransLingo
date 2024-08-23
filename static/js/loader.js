// loader.js

// Messages to show during the loading process
const loaderMessage = document.querySelector("#loader-message")
const transcribingMessages = [
  "Just a moment... Our AI is transcribing everything you said!",
  "The AI is already transcribing all the words!",
  "This may take a while, depending on your file size...",
  "Polishing and refining your transcription!",
  "Almost there - the transcription is nearly ready!",
]

const translatingMessages = [
  "Hold on... We're translating your text!",
  "Our AI is working hard to translate every word!",
  "This may take a while, depending on your file size...",
  "Almost done translating your content!",
  "Just a moment more - your translation is nearly complete!",
]

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
