
const apiKey = "AIzaSyBF4h_cmKtRCeHidwRJpXv0zKgzSMllTgI";
const parentFolderId = "1B_uxnbdlf8w_iXLCjPbKysn-kgATcVXD";

const semesterSelect = document.getElementById("semesterSelect");
const subjectSelect = document.getElementById("subjectSelect");
const searchBar = document.getElementById("searchBar");
const fileListContainer = document.getElementById("fileList");
const darkModeToggle = document.getElementById("darkModeToggle");

async function fetchFolders(parentId) {
  const url = `https://www.googleapis.com/drive/v3/files?q='${parentId}'+in+parents+and+mimeType='application/vnd.google-apps.folder'&key=${apiKey}&fields=files(id,name)`;
  const res = await fetch(url);
  const data = await res.json();
  return data.files || [];
}

async function fetchFiles(folderId) {
  const url = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents+and+mimeType='application/pdf'&key=${apiKey}&fields=files(name,webViewLink)`;
  const res = await fetch(url);
  const data = await res.json();
  return data.files || [];
}

function getSmartTags(name) {
  const tags = [];
  const lower = name.toLowerCase();
  if (lower.includes("note")) tags.push("Notes");
  if (lower.includes("previous") || lower.includes("pyq")) tags.push("PYQ");
  if (lower.includes("internal")) tags.push("Internal");
  if (lower.includes("external")) tags.push("External");
  if (lower.includes("assignment")) tags.push("Assignment");
  if (lower.includes("important")) tags.push("Important");
  return tags;
}

function displayFiles(files) {
  fileListContainer.innerHTML = "";
  files.forEach(file => {
    const fileDiv = document.createElement("div");
    fileDiv.className = "file-item";
    const tags = getSmartTags(file.name);
    const tagsHtml = tags.map(tag => `<span class="tag">${tag}</span>`).join("");
    fileDiv.innerHTML = `<a href="${file.webViewLink}" target="_blank">${file.name}</a><div class="tags">${tagsHtml}</div>`;
    fileListContainer.appendChild(fileDiv);
  });
}

semesterSelect.addEventListener("change", async () => {
  const semesterId = semesterSelect.value;
  subjectSelect.innerHTML = "<option value=''>-- Select Subject --</option>";
  if (semesterId) {
    const subjects = await fetchFolders(semesterId);
    subjects.forEach(sub => {
      const option = document.createElement("option");
      option.value = sub.id;
      option.textContent = sub.name;
      subjectSelect.appendChild(option);
    });
    subjectSelect.disabled = false;
  } else {
    subjectSelect.disabled = true;
  }
});

subjectSelect.addEventListener("change", async () => {
  const subjectId = subjectSelect.value;
  const files = await fetchFiles(subjectId);
  displayFiles(files);
});

searchBar.addEventListener("input", async () => {
  const searchTerm = searchBar.value.toLowerCase();
  const subjectId = subjectSelect.value;
  if (!subjectId) return;
  const files = await fetchFiles(subjectId);
  const filtered = files.filter(file => file.name.toLowerCase().includes(searchTerm));
  displayFiles(filtered);
});

window.onload = async () => {
  const semesters = await fetchFolders(parentFolderId);
  semesters.forEach(folder => {
    const option = document.createElement("option");
    option.value = folder.id;
    option.textContent = folder.name;
    semesterSelect.appendChild(option);
  });

  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark");
    darkModeToggle.checked = true;
  }
};

darkModeToggle.addEventListener("change", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("darkMode", darkModeToggle.checked);
});
