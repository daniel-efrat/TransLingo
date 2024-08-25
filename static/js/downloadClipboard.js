// downloadClipboard.js
const notification = document.querySelector("#notification")

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

// Declare a variable to store the timeout
let notificationTimeout

// Remove the existing showNotification function
// And update the copyToClipboard function:

function copyToClipboard(type = "transcription") {
  const segments = type === "transcription" ? transcriptionSegments : translationSegments;
  console.log(`Copying ${type} segments:`, segments);
  const fullText = segments.map((segment) => segment.text).join(" ");
  navigator.clipboard
    .writeText(fullText)
    .then(() => {
      showNotification(
        `${type.charAt(0).toUpperCase() + type.slice(1)} copied to clipboard!`,
        'success',
        type
      );
    })
    .catch((err) => {
      console.error("Could not copy text: ", err);
      showNotification('Failed to copy to clipboard', 'error', type);
    });
}