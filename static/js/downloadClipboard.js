// downloadClipboard.js

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
