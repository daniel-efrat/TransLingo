// languageFilter.js

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
