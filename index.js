//event listeners
const New_Project = document.getElementById("New_Project");
New_Project.addEventListener("click", MakeNewProject);
const Load_Project = document.getElementById("Load_Project");
Load_Project.addEventListener("click", LoadProject);

async function MakeNewProject() {
  const filePath = await window.openSaveWindow.openWindow();
  if (!filePath) {
    return;
  }
  //fix hard coded address!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  window.open("board.html", "_self");
}

async function LoadProject() {
  const filePath = await window.openLoadWindow.openWindow();
  if (!filePath) {
    return;
  }

  //fix hard coded address!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  window.open("board.html?load=true", "_self");
}
