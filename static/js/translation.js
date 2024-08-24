const translationOutput = document.querySelector("#translation-output")
const translationContainer = document.querySelector(
  "#translation-output-container"
)
const translationActions = document.querySelector("#translation-actions")

document.addEventListener('DOMContentLoaded', function() {
  const languageList = document.querySelector("#language-list");
  if (languageList) {
    languageList.addEventListener('click', function(event) {
      if (event.target.classList.contains('dropdown-item')) {
        event.preventDefault();
        const selectedLanguage = event.target.getAttribute("data-english");
        console.log("Language selected:", selectedLanguage);
        translateTranscription(selectedLanguage);
      }
    });
  } else {
    console.error("Language list not found");
  }
});

function translateTranscription(language) {
    if (!transcriptionSegments || transcriptionSegments.length === 0) {
        console.error('No transcription segments available');
        showNotification('Error: No transcription available to translate', 'error');
        return;
    }

    const clearLoaderInterval = showLoader(translatingMessages);

    fetch('/translate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            segments: transcriptionSegments,
            language: language
        }),
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw new Error(err.error || 'Unknown error occurred'); });
        }
        return response.json();
    })
    .then(data => {
        hideLoader(clearLoaderInterval);
        const translationOutput = document.getElementById('translation-output');
        if (translationOutput) {
            displayTranslation(data.output, translationOutput);
            showTranslationActions(true);
        } else {
            console.error('Translation output element not found');
        }
    })
    .catch(error => {
        hideLoader(clearLoaderInterval);
        console.error('Translation error:', error);
        showNotification(error.message || 'An error occurred during translation.', 'error');
    });
}

function displayTranslation(segments, outputElement) {
    // Display each translated segment in its own paragraph
    outputElement.innerHTML = segments.map(segment => `<p>${segment.text}</p>`).join('');
    
    // Store the full segment data (including timestamps) for later use
    outputElement.dataset.originalSegments = JSON.stringify(segments);

    // Show the translation accordion
    const translationCollapse = new bootstrap.Collapse('#collapseTranslation', {
        show: true
    });
}