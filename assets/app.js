// ====== CONFIG ======
const API_URL = "https://script.google.com/macros/s/AKfycbxv9vlzDiZEv8rB9nRF6Dm7OkU5ophr7eyydSXQ8lt5romkgdj88kZ1LjKcUEl4S_ry6A/exec";

// ====== SESSION ======
function saveStudentSession(data){
  localStorage.setItem("token", data.token);
  localStorage.setItem("student", JSON.stringify(data.student));
}
function getToken(){ return localStorage.getItem("token"); }
function getStudent(){
  try { return JSON.parse(localStorage.getItem("student") || "null"); }
  catch(_){ return null; }
}

function isAdmin(){
  return localStorage.getItem("mode")==="admin" && !!localStorage.getItem("firebase_token");
}
function requireStudent(){
  if (!getToken()) location.href = "index.html";
}
function requireAdmin(){
  if (!isAdmin()) location.href = "admin-login.html";
}
function requireStudentOrAdmin(){
  if (isAdmin()) return;
  if (!getToken()) location.href = "index.html";
}

function logoutStudent(){
  localStorage.removeItem("token");
  localStorage.removeItem("student");
  location.href="index.html";
}
function logoutAdmin(){
  localStorage.removeItem("mode");
  localStorage.removeItem("firebase_token");
  location.href="index.html";
}

// ====== ADMIN SELECTION ======
function setAdminSelection(course, section){
  localStorage.setItem("admin_course", course || "");
  localStorage.setItem("admin_section", section || "");
}
function getAdminCourse(){ return localStorage.getItem("admin_course") || ""; }
function getAdminSection(){ return localStorage.getItem("admin_section") || ""; }

// ====== HELPERS ======
function qs(k){ return new URLSearchParams(location.search).get(k); }
function esc(s){
  return String(s ?? "").replace(/[&<>"']/g, m => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[m]));
}

// ====== API ======
async function api(action, payload={}){
  const body = JSON.stringify({
    action,
    token: getToken(),
    firebase_token: localStorage.getItem("firebase_token"),
    ...payload
  });

  const res = await fetch(API_URL, { method:"POST", body });
  const data = await res.json().catch(()=>({ok:false,message:"تعذر قراءة الرد"}));
  if (!data.ok) throw new Error(data.message || "خطأ");
  return data;
}

// ====== TABLE RENDER ======
function renderTable(wrapperEl, headers, rows){
  if (!rows || rows.length===0){
    wrapperEl.innerHTML = `<div class="muted">لا توجد بيانات.</div>`;
    return;
  }
  // if rows are objects
  const isObj = typeof rows[0] === "object" && !Array.isArray(rows[0]);
  const H = headers && headers.length ? headers : (isObj ? Object.keys(rows[0]) : []);
  const thead = `<thead><tr>${H.map(h=>`<th>${esc(h)}</th>`).join("")}</tr></thead>`;
  const tbody = `<tbody>${
    rows.map(r=>{
      return `<tr>${
        H.map(h=>{
          const v = isObj ? r[h] : r[H.indexOf(h)];
          return `<td>${esc(v)}</td>`;
        }).join("")
      }</tr>`;
    }).join("")
  }</tbody>`;
  wrapperEl.innerHTML = `<div class="tableWrap"><table class="table">${thead}${tbody}</table></div>`;
}
