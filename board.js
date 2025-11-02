//event listners
const Genesis_Button = document.getElementById("Genesis_Button");
Genesis_Button.addEventListener("click", CreateGenesisBlock);
const Save_Button = document.getElementById("save_button");
Save_Button.addEventListener("click", Saving);
const Export_Button = document.getElementById("export_button");
Export_Button.addEventListener("click", Export);
const board = document.getElementById("board");
const svg = document.getElementById("svg-lines");
let Nodes = [];
let SubNodes = [];
let columnCounts = {};
let SubnodeLimit = 4;
let row = {};
let alldata;
let isExport = false;

window.addEventListener("load", async () => {
  updateSvgSize();
  if (new URLSearchParams(window.location.search).get("load")) {
    await loading();
  } else {
    return;
  }
});

function parkingLot(column) {
  if (!row[column]) row[column] = [];

  let i = 1;
  while (true) {
    if (!row[column].includes(i)) {
      row[column].push(i); // Reserve the row
      return i;
    }
    i++;
  }
}

function updateSvgSize() {
  const boardRect = board.getBoundingClientRect();
  svg.setAttribute("width", board.scrollWidth);
  svg.setAttribute("height", board.scrollHeight);
  svg.style.width = board.scrollWidth + "px";
  svg.style.height = board.scrollHeight + "px";
}
window.addEventListener("load", updateSvgSize);
window.addEventListener("resize", updateSvgSize);

function CreateGenesisBlock() {
  Genesis_Button.remove();
  let Genesis = new NodeCreator(0, 1, 1, false); // Starts in column 1
  Nodes.push(Genesis);
}

class NodeCreator {
  constructor(
    LinkBackID,
    column,
    row,
    load,
    Lid,
    LBody,
    LsubnodeCount,
    Lcolor,
    Llines
  ) {
    if (load == true) {
      this.type = "Node";
      this.ID = Lid;
      this.LinkBackID = LinkBackID;
      this.Body = LBody;
      this.column = column;
      this.subnodeCount = LsubnodeCount;
      this.row = row;
      this.color = Lcolor;
      this.lines = Llines;
      this.render();
      this.DrawLine(load);
    } else {
      this.type = "Node";
      this.ID = crypto.randomUUID();
      this.LinkBackID = LinkBackID;
      this.Body = "";
      this.column = column;
      this.subnodeCount = 0;
      this.row = row;
      this.color = this.generateColor();
      this.lines = {
        fromX: null,
        fromY: null,
        toX: null,
        toY: null,
      };

      this.render();
      this.DrawLine(load);
    }
  }

  render() {
    const container = document.createElement("div");
    container.className = "Nodes";
    container.id = this.ID;
    container.innerHTML = `
         <button class="add-btn">+</button>
         <button class="remove-btn">-</button>
         <textarea placeholder="Enter text...">${this.Body}</textarea>
      `;

    const textarea = container.querySelector("textarea");
    textarea.addEventListener("input", () => {
      this.Body = textarea.value;
    });

    // Position in grid
    if (!columnCounts[this.column]) columnCounts[this.column] = 1;
    container.style.gridColumn = this.column;
    container.style.gridRow = this.row;
    board.appendChild(container);

    const addBtn = container.querySelector(".add-btn");
    addBtn.addEventListener("click", () => {
      if (this.subnodeCount < SubnodeLimit) {
        const sub = new SubNodeCreator(
          this.ID,
          this.column + 1,
          this.color,
          false,
          null,
          null,
          null,
          null,
          null
        );
        SubNodes.push(sub);
        this.subnodeCount++;
        if (this.subnodeCount == SubnodeLimit) {
          addBtn.style.backgroundColor = "#635f5cff";
        }
      }
    });

    const removeBtn = container.querySelector(".remove-btn");
    removeBtn.addEventListener("click", () => this.remove(container));

    updateSvgSize();
  }

  remove(container) {
    if (this.LinkBackID == 0) {
      alert("Can't remove Genesis Node!");
      return;
    } else {
      container.remove();
      const backLine = document.getElementById(`line-${this.ID}`);
      if (backLine) backLine.remove();
      const forwardLinkIndex = SubNodes.filter(
        (id) => id.ParentID == this.ID
      ).map((id) => id.ID);
      for (let i = 0; i < forwardLinkIndex.length; i++) {
        let forwardLink = document.getElementById(
          `line-${forwardLinkIndex[i]}`
        );
        forwardLink.remove();
      }

      const parentSubnode = SubNodes.find((sub) => sub.ID === this.LinkBackID);
      parentSubnode.hasCreatedNode = false;
      const subDiv = document.getElementById(parentSubnode.ID);
      const addButton = subDiv.querySelector(".add-btn");
      addButton.style.backgroundColor = "#4caf50";

      Nodes = Nodes.filter((node) => node.ID !== this.ID);
    }
  }

  generateColor() {
    const hue = Math.floor(Math.random() * 360); // HSL hue
    return `hsl(${hue}, 80%, 60%)`;
  }

  DrawLine(load) {
    updateSvgSize();
    if (load == true) {
      if (!this.LinkBackID || this.LinkBackID === 0) return;

      const fromX = this.lines.fromX;
      const fromY = this.lines.fromY;
      const toX = this.lines.toX;
      const toY = this.lines.toY;

      const line = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
      );
      line.setAttribute("x1", fromX);
      line.setAttribute("y1", fromY);
      line.setAttribute("x2", toX);
      line.setAttribute("y2", toY);
      line.setAttribute("stroke", "yellow");
      line.setAttribute("stroke-width", "2");
      line.id = `line-${this.ID}`;
      svg.appendChild(line);
    } else {
      if (!this.LinkBackID || this.LinkBackID === 0) return;

      const fromElem = document.getElementById(this.LinkBackID);
      const toElem = document.getElementById(this.ID);
      if (!fromElem || !toElem) return;

      const fromX = fromElem.offsetLeft + fromElem.offsetWidth / 2;
      const fromY = fromElem.offsetTop + fromElem.offsetHeight / 2;
      const toX = toElem.offsetLeft + toElem.offsetWidth / 2;
      const toY = toElem.offsetTop + toElem.offsetHeight / 2;

      this.lines.fromX = fromX;
      this.lines.fromY = fromY;
      this.lines.toX = toX;
      this.lines.toY = toY;

      const line = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
      );
      line.setAttribute("x1", fromX);
      line.setAttribute("y1", fromY);
      line.setAttribute("x2", toX);
      line.setAttribute("y2", toY);
      line.setAttribute("stroke", "yellow");
      line.setAttribute("stroke-width", "2");
      line.id = `line-${this.ID}`;
      svg.appendChild(line);
    }
  }
}

class SubNodeCreator {
  constructor(
    ParentID,
    column,
    parentColor,
    load,
    Lrow,
    Lid,
    LBody,
    LhasCreatedNode,
    Llines
  ) {
    if (load == true) {
      this.type = "SubNode";
      this.ID = Lid;
      this.ParentID = ParentID;
      this.Body = LBody;
      this.column = column;
      this.row = Lrow;
      this.color = parentColor;
      this.hasCreatedNode = LhasCreatedNode;
      this.lines = Llines;
      this.render(load);
      this.DrawLine(load);
    } else {
      this.type = "SubNode";
      this.ID = crypto.randomUUID();
      this.ParentID = ParentID;
      this.Body = "";
      this.column = column;
      this.row;
      this.color = parentColor;
      this.hasCreatedNode = false;
      this.lines = {
        fromX: null,
        fromY: null,
        toX: null,
        toY: null,
      };
      this.render(load);
      this.DrawLine(load);
    }
  }

  render(load) {
    const container = document.createElement("div");
    container.className = "SubNodes";
    container.id = this.ID;
    container.innerHTML = `
         <button class="add-btn">+</button>
         <button class="remove-btn">-</button>
         <textarea placeholder="Enter text...">${this.Body}</textarea>
      `;

    const textarea = container.querySelector("textarea");
    textarea.addEventListener("input", () => {
      this.Body = textarea.value;
    });

    // Grid placement
    if (!columnCounts[this.column]) columnCounts[this.column] = 1;
    if (load == true) {
      container.style.gridColumn = this.column;
      container.style.gridRow = this.row;
      if (!row[this.column]) row[this.column] = [];
      if (!row[this.column].includes(this.row))
        row[this.column].push(parseInt(this.row));
    } else {
      container.style.gridColumn = this.column;
      container.style.gridRow = parkingLot(this.column);
      this.row = container.style.gridRow;
    }
    board.appendChild(container);

    const addBtn = container.querySelector(".add-btn");
    addBtn.addEventListener("click", () => {
      if (!this.hasCreatedNode) {
        const node = new NodeCreator(
          this.ID,
          this.column + 1,
          this.row,
          false,
          null,
          null,
          null,
          null,
          null
        );
        Nodes.push(node);
        this.hasCreatedNode = true;
        addBtn.style.backgroundColor = "#635f5cff";
      }
    });

    const removeBtn = container.querySelector(".remove-btn");
    removeBtn.addEventListener("click", () => this.remove(container));

    updateSvgSize();
  }

  remove(container) {
    container.remove();
    const backLine = document.getElementById(`line-${this.ID}`);
    backLine.remove();
    const forwardLinkIndex = Nodes.filter((id) => id.LinkBackID == this.ID).map(
      (id) => id.ID
    );
    for (let i = 0; i < forwardLinkIndex.length; i++) {
      let forwardLink = document.getElementById(`line-${forwardLinkIndex[i]}`);
      forwardLink.remove();
    }

    //free row
    const rowNum = parseInt(this.row); // this.row is stored as a string from .style
    const index = row[this.column]?.indexOf(rowNum);
    if (index !== -1) {
      row[this.column].splice(index, 1);
    }

    const parent = Nodes.find((parent) => parent.ID === this.ParentID);
    parent.subnodeCount--;

    if (parent.subnodeCount < SubnodeLimit) {
      const parentDiv = document.getElementById(parent.ID);
      const addButton = parentDiv.querySelector(".add-btn");
      if (addButton) {
        addButton.style.backgroundColor = "#4caf50"; // or any color
      }
    }

    SubNodes = SubNodes.filter((sub) => sub.ID !== this.ID);
  }

  DrawLine(load) {
    if (!this.ParentID || this.ParentID === 0) return;
    updateSvgSize();

    if (load == true) {
      const fromX = this.lines.fromX;
      const fromY = this.lines.fromY;
      const toX = this.lines.toX;
      const toY = this.lines.toY;

      const line = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
      );
      line.setAttribute("x1", fromX);
      line.setAttribute("y1", fromY);
      line.setAttribute("x2", toX);
      line.setAttribute("y2", toY);
      line.setAttribute("stroke", this.color);
      line.setAttribute("stroke-width", "2");
      line.id = `line-${this.ID}`;
      svg.appendChild(line);
    } else {
      const fromElem = document.getElementById(this.ParentID);
      const toElem = document.getElementById(this.ID);
      if (!fromElem || !toElem) return;

      const fromX = fromElem.offsetLeft + fromElem.offsetWidth / 2;
      const fromY = fromElem.offsetTop + fromElem.offsetHeight / 2;
      const toX = toElem.offsetLeft + toElem.offsetWidth / 2;
      const toY = toElem.offsetTop + toElem.offsetHeight / 2;

      this.lines.fromX = fromX;
      this.lines.fromY = fromY;
      this.lines.toX = toX;
      this.lines.toY = toY;

      const line = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
      );
      line.setAttribute("x1", fromX);
      line.setAttribute("y1", fromY);
      line.setAttribute("x2", toX);
      line.setAttribute("y2", toY);
      line.setAttribute("stroke", this.color);
      line.setAttribute("stroke-width", "2");
      line.id = `line-${this.ID}`;
      svg.appendChild(line);
    }
  }
}

function Saving() {
  const data = {
    nodes: Nodes.map((n) => ({
      ID: n.ID,
      LinkBackID: n.LinkBackID,
      Body: n.Body,
      column: n.column,
      row: n.row,
      color: n.color,
      subnodeCount: n.subnodeCount,
      lines: n.lines,
    })),
    subnodes: SubNodes.map((s) => ({
      ID: s.ID,
      ParentID: s.ParentID,
      Body: s.Body,
      column: s.column,
      row: s.row,
      color: s.color,
      hasCreatedNode: s.hasCreatedNode,
      lines: s.lines,
    })),
  };

  window.writeToSave.write(JSON.stringify(data));
  //console.log(data);
  alldata = data;
  if (isExport == false) alert("Save Complete!");
}

async function loading() {
  let loaddata = await window.readFromSave.read();
  Genesis_Button.remove();
  //console.log(loaddata);
  for (let node of loaddata.nodes) {
    Nodes.push(
      new NodeCreator(
        node.LinkBackID,
        node.column,
        node.row,
        true,
        node.ID,
        node.Body,
        node.subnodeCount,
        node.color,
        node.lines
      )
    );
  }

  for (let sub of loaddata.subnodes) {
    SubNodes.push(
      new SubNodeCreator(
        sub.ParentID,
        sub.column,
        sub.color,
        true,
        sub.row,
        sub.ID,
        sub.Body,
        sub.hasCreatedNode,
        sub.lines
      )
    );
  }
}

////////////////////////////////////////// CONSTRUCTION ZONE ///////////////////////////////////////

function Export() {
  isExport = true;
  Saving();
  localStorage.setItem("sharedData", JSON.stringify(alldata));
  window.open("export.html", "_self");
}
