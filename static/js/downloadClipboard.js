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

function showNotification() {
  const notification = document.querySelector(".notification")

  if (!notification) {
    console.error("Notification element not found!")
    return
  }

  notification.textContent = "Copied to clipboard!"
  notification.style.display = "block"

  // Clear any existing timeout before setting a new one
  if (notificationTimeout) {
    clearTimeout(notificationTimeout)
  }

  notificationTimeout = setTimeout(() => {
    notification.style.display = "none"
  }, 2000)
}


// Function to copy transcription or translation to clipboard
function copyToClipboard(type = "transcription") {
  const segments = type === "transcription" ? transcriptionSegments : translationSegments;
  console.log(`Copying ${type} segments:`, segments); // Debugging log
  const fullText = segments.map((segment) => segment.text).join(" ");
  navigator.clipboard
    .writeText(fullText)
    .then(() => {
      showNotification(
        `${type.charAt(0).toUpperCase() + type.slice(1)} copied to clipboard!`
      );
    })
    .catch((err) => {
      console.error("Could not copy text: ", err);
    });
}



