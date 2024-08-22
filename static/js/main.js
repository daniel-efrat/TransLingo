// main.js
const output = document.querySelector("#output")

document.addEventListener("DOMContentLoaded", function () {
  const uploadForm = document.querySelector("#upload-form")

  uploadForm.onsubmit = function (event) {
    event.preventDefault() // Prevent the form from submitting the traditional way

    let file = uploadForm.elements["audio"].files[0] // Get the selected file from the input
    if (!file) {
      output.innerHTML = "Please select a file to upload."
      return
    }

    let formData = new FormData() // Create a new FormData object
    formData.append("audio", file) // Append the selected file with the key 'audio'

    handleFormSubmission(formData) // Call the form submission handler
  }

  // Other initialization code here
})
