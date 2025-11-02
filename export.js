const gdata = JSON.parse(localStorage.getItem("sharedData"));
console.log(gdata);
let gtitle;
let gtheme;

const form = document.getElementById("ExportForm");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  gtitle = document.getElementById("GameTitle").value;
  gtheme = document.getElementById("Theme").value;
  exporthtml(gdata, gtheme, gtitle);
  console.log("Game Title:", gtitle);
  console.log("Theme:", gtheme);
});

function exporthtml(data, theme, title) {
  if (theme === "CRT") {
    // stringify data
    const jsonData = JSON.stringify(data, null, 2);

    // HTML code
    const HTMLcode = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');
    body {
      background-color: #1a1f1f;
      color: #d8e6d8;
      font-family: 'VT323', monospace;
      margin: 0;
      padding: 20px;
      line-height: 1.6;
      overflow: hidden;
    }
    #game-container {
      max-width: 800px;
      margin: 0 auto;
      background-color: #1c2525;
      padding: 20px;
      border: 3px solid #2a3636;
      border-radius: 10px;
      box-shadow: 0 0 20px rgba(0, 50, 50, 0.5);
      position: relative;
    }
    #dialogue {
      margin-bottom: 20px;
      max-height: 400px;
      overflow-y: auto;
      text-shadow: 0 0 5px rgba(100, 255, 200, 0.3);
      animation: flicker 4s infinite;
    }
    @keyframes flicker {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.98; }
    }
    .dialogue-text { margin: 10px 0; font-size: 1.2em; }
    .inner-thought { color: #8cd1c8; font-style: italic; }
    .option {
      cursor: pointer;
      padding: 10px;
      margin: 5px 0;
      background-color: #2a3636;
      border: 1px solid #3a4a4a;
      border-radius: 3px;
      font-size: 1.1em;
    }
    .option:hover {
      background-color: #3a4a4a;
      box-shadow: 0 0 10px rgba(100, 255, 200, 0.5);
    }
    .player-choice {
      color: #e8d923;
      margin: 10px 0;
      padding-left: 20px;
      border-left: 2px solid #e8d923;
    }
  </style>
</head>

<body>
  <div id="game-container">
    <div id="dialogue"></div>
    <div id="options"></div>
  </div>

  <script>
    const data = ${jsonData};
    let currentNodeID = data.nodes[0].ID;

    const nodes = data.nodes;
    const subnodes = data.subnodes;

    function getNodeByID(id) {
      return nodes.find(n => n.ID === id);
    }

    function getSubnodesForNode(nodeID) {
      return subnodes.filter(s => s.ParentID === nodeID);
    }

    function getNextNodeForSubnode(subnodeID) {
      return nodes.find(n => n.LinkBackID === subnodeID);
    }

    function displayNode(nodeID, selectedOption = null) {
      const node = getNodeByID(nodeID);
      if (!node) return console.error("Node not found:", nodeID);

      const dialogueDiv = document.getElementById('dialogue');
      const optionsDiv = document.getElementById('options');

      if (selectedOption) {
        dialogueDiv.innerHTML += '<p class="player-choice">You: ' + selectedOption.Body + '</p>';
      }

      dialogueDiv.innerHTML += '<p class="dialogue-text">' + node.Body + '</p>';
      dialogueDiv.scrollTop = dialogueDiv.scrollHeight;

      optionsDiv.innerHTML = '';
      const options = getSubnodesForNode(node.ID);

      if (options.length === 0) {
        optionsDiv.innerHTML = '<p>[THE END]</p>';
        return;
      }

      options.forEach(option => {
        const el = document.createElement('div');
        el.className = 'option';
        el.textContent = option.Body;
        el.addEventListener('click', () => {
          const nextNode = getNextNodeForSubnode(option.ID);
          if (nextNode) {
            currentNodeID = nextNode.ID;
            displayNode(currentNodeID, option);
          } else {
            dialogueDiv.innerHTML += '<p class="player-choice">You: ' + option.Body + '</p>';
            optionsDiv.innerHTML = '<p>[THE END]</p>';
          }
        });
        optionsDiv.appendChild(el);
      });
    }

    window.onload = () => displayNode(currentNodeID);
  </script>
</body>
</html>
`;

    // Create downloadable HTML file
    const blob = new Blob([HTMLcode], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = title.replace(/\s+/g, "_") + ".html";
    a.click();
    URL.revokeObjectURL(url);
  }
}
