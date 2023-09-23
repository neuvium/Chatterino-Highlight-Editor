let settingsData;

const fileInput = document.getElementById("fileInput");
const fileNameDisplay = document.getElementById("fileNameDisplay");

fileInput.addEventListener("input", handleFileInputChange);

function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
}

function handleFileInputChange(event) {
  const file = event.target.files[0];
  fileNameDisplay.textContent = file ? file.name : "No file selected";
}

function handleFile() {
  const file = fileInput.files[0];
  if (!file) {
    alert("No file selected.");
    return;
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    const content = event.target.result;
    settingsData = JSON.parse(content);
    displayHighlights();
  };
  reader.readAsText(file);
}

function addHighlight() {
  const newPatternInput = document.getElementById("newHighlight");
  const newColorInput = document.getElementById("newColor");
  const newPattern = newPatternInput.value;
  let newColor = newColorInput.value;

  if (!newPattern || !newColor) {
    alert("Please enter both pattern and color.");
    return;
  }

  if (!settingsData.highlighting) {
    settingsData.highlighting = { highlights: [] };
  }

  if (!newPattern.startsWith("@")) {
    newPatternInput.value = "@" + newPattern;
  }

  newColor = removeAlphaChannel(newColor);

  const newHighlight = {
    pattern: newPatternInput.value,
    showInMentions: true,
    alert: true,
    sound: false,
    regex: false,
    case: false,
    soundUrl: "",
    color: newColor,
  };

  const colorDisplay = document.getElementById("colorDisplay");
  colorDisplay.style.backgroundColor = newColor;

  settingsData.highlighting.highlights.push(newHighlight);
  displayHighlights();
}

function removeAlphaChannel(color) {
  return color.startsWith("#ff") ? "#" + color.slice(3) : color;
}

function hexToRgb(hex) {
  hex = hex.replace(/^#/, "");
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `${r}, ${g}, ${b}`;
}

function displayHighlights() {
  const highlightsContainer = document.getElementById("highlightsContainer");
  const highlights = settingsData.highlighting?.highlights || [];

  if (highlightsContainer) {
    highlightsContainer.innerHTML = "";
    highlights.forEach((highlight, index) => {
      const rgbColor = removeAlphaChannel(highlight.color);
      const patternWithAt = highlight.pattern.startsWith("@")
        ? highlight.pattern
        : `@${highlight.pattern}`;
      const listItem = document.createElement("div");
      listItem.classList.add("highlight-item");
      listItem.style.backgroundColor = `rgba(${hexToRgb(rgbColor)}, 0.2)`;
      listItem.innerHTML = `<span class="highlight-index">${
        index + 1
      }.</span> ${patternWithAt}`;
      highlightsContainer.appendChild(listItem);
    });
  }
}

function invertColor(hex) {
  const r = (255 - parseInt(hex.slice(1, 3), 16)).toString(16).padStart(2, "0");
  const g = (255 - parseInt(hex.slice(3, 5), 16)).toString(16).padStart(2, "0");
  const b = (255 - parseInt(hex.slice(5, 7), 16)).toString(16).padStart(2, "0");
  return `#${r}${g}${b}`;
}

function downloadModifiedFile() {
  const originalFileName = fileInput.files[0].name;
  const modifiedSettings = JSON.stringify(settingsData, null, 2);
  const blob = new Blob([modifiedSettings], { type: "application/json" });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `modified_${originalFileName}`;

  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
}
