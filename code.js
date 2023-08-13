const now = Date.now();

let timeout;
function commitChange(id) {
  hasImage = false;
  [...document.getElementsByClassName("dot-pulse")].forEach(pulse => pulse.classList.add("hidden"));
  updateBoxes((box, index) => updateBox(box, id, TYPES[index]));
  document.getElementById("iframe").src = `https://www.youtube.com/embed/${id}`;
}

const TYPES = ["", "hq", "mq", "sd", "maxres"];

function onChange(value) {
  const id = value.match(/(https:\/\/www\.youtube\.com\/watch\?v=)?(.+)/)?.[2];
  clearTimeout(timeout);
  if (id) {
    timeout = setTimeout(commitChange, 1000, id);
    [...document.getElementsByClassName("dot-pulse")].forEach(pulse => pulse.classList.remove("hidden"));
  }
}

function addHistory(id) {
  const hist = getHistory().filter(([yid]) => yid!==id);
  hist.push([id, Date.now()]);
  hist.sort((a, b) => b[1] - a[1]);
  localStorage.setItem("hist", JSON.stringify(hist.slice(0,20)));

  refresh(hist, id);
}

function removeHistory(id) {
  const hist = getHistory().filter(([yid]) => yid!==id);
  hist.sort((a, b) => b[1] - a[1]);
  localStorage.setItem("hist", JSON.stringify(hist.slice(0,20)));

  refresh(hist, id, true);
}

function refresh(hist, id, removal) {
  const histDiv = document.querySelector("#hist");
  hist.map(([yid]) => yid).forEach((yid, index) => {
    const imgId = `mini-${yid}`;
    let img = document.querySelector(`#${imgId}`);
    if (removal && yid === id) {
      histDiv.removeChild(img);
      return;
    }
    if (!img) {
      img = histDiv.appendChild(document.createElement("img"));
      img.id = imgId;
      img.src = `https://img.youtube.com/vi/${yid}/default.jpg?${now}`;
      img.classList.add("mini-image");
      img.addEventListener("click", () => {
          commitChange(yid);
      });
    }
    img.disabled = yid !== id;
    if (yid !== id) {
      img.classList.add("clickable");
    } else {
      img.classList.remove("clickable");
    }
  });
 realign(hist);
}

function realign(hist) {
  hist.map(([yid]) => yid).forEach((yid, index) => {
    const imgId = `mini-${yid}`;
    const img = document.querySelector(`#${imgId}`);
    if (img) {
      img.style.left = `${(window.innerWidth - hist.length * 42) / 2 + index * 42}px`;
    }
  });
}

window.addEventListener("resize", () => {
  realign(getHistory());
});

function getHistory() {
  return JSON.parse(localStorage.getItem("hist") ?? "[]");
}

const loadSet = new Set();
function pendingLoad(id, type) {
  loadSet.add(`${id}-${type}`);
}

function completedLoad(id, type) {
  loadSet.delete(`${id}-${type}`);
  if (!loadSet.size) {
    if (hasImage) {
      addHistory(id);
    } else {
      removeHistory(id);
    }
  }
}

function updateBox(box, id, type) {
  // box.textContent = type;
  box.setAttribute("title", type);
  box.setAttribute("disabled", true);
  const imageUrl = `https://img.youtube.com/vi/${id}/${type}default.jpg?${now}`;
  const image = new Image();
  image.src = imageUrl;
  pendingLoad(id, type);
  image.addEventListener("load", () => {
    box.removeAttribute("disabled");
    box.style.backgroundImage = `url(${imageUrl})`;
    box.href = imageUrl;
    if (image.naturalWidth !== 120 || image.naturalHeight !== 90) {
      hasImage = true;
    }
    completedLoad(id, type);
  });
}

function updateBoxes(callback) {
  document.querySelectorAll(".image-box").forEach(callback);
}

document.addEventListener("DOMContentLoaded", () => {
  commitChange(getHistory()[0]?.[0] ?? "gXKQivjYZOs");
  document.querySelector("#textbox").focus();
});
