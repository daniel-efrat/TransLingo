// transcription.js

function displayTranscription(segments, container) {
  container.innerHTML = "" // Clear previous content
  segments.forEach((segment) => {
    const paragraph = document.createElement("p")
    paragraph.textContent = segment.text

    const rtlPattern = /[\u0590-\u05FF\u0600-\u06FF]/ // Hebrew and Arabic character ranges
    if (rtlPattern.test(segment.text)) {
      paragraph.style.direction = "rtl"
      paragraph.style.textAlign = "right"
    } else {
      paragraph.style.direction = "ltr"
      paragraph.style.textAlign = "left"
    }

    container.appendChild(paragraph)

    const transcriptionCollapse = new bootstrap.Collapse(
      "#collapseTranscription",
      {
        hide: false,
      }
    )
  })
}
