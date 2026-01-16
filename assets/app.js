// ================== CONFIG ==================
const API_URL = "https://script.google.com/macros/s/AKfycbxv9vlzDiZEv8rB9nRF6Dm7OkU5ophr7eyydSXQ8lt5romkgdj88kZ1LjKcUEl4S_ry6A/exec";

// ================== HELPERS ==================
function qs(k){ return new URLSearchParams(location.search).get(k); }
function esc(s){
  return String(s ?? "").replace(/[&<>"']/g, m => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[m]));
}
function toStr(v){ return (v===null || v===undefined) ? "" : String(v); }

function saveSession(data){
  localStorage.setItem("token", data.token);
  localStorage.setItem("student", JSON.stringify(data.student));
}
function getToken(){ return localStorage.getItem("token"); }
function getStudent(){ return JSON.parse(localStorage.getItem("student") || "null"); }

function isAdmin(){
  return localStorage.getItem("mode")==="admin" && !!localStorage.getItem("firebase_token");
}
function requireStudentOrAdmin(){
  if (isAdmin()) return;
  if (!getToken()) location.href = "index.html";
}
function requireAdmin(){
  if (!isAdmin()) location.href = "admin-login.html";
}
function logoutStudent(){
  localStorage.removeItem("token");
  localStorage.removeItem("student");
  localStorage.removeItem("selected_course");
  localStorage.removeItem("selected_section");
  location.href = "index.html";
}
function exitAdmin(){
  localStorage.removeItem("mode");
  localStorage.removeItem("firebase_token");
  localStorage.removeItem("admin_course");
  localStorage.removeItem("admin_section");
  location.href = "index.html";
}

function setSelectedCourseSection(course, section){
  localStorage.setItem("selected_course", course || "");
  localStorage.setItem("selected_section", section || "");
}
function getSelectedCourse(){ return localStorage.getItem("selected_course") || ""; }
function getSelectedSection(){ return localStorage.getItem("selected_section") || ""; }

function setAdminCourseSection(course, section){
  localStorage.setItem("admin_course", course || "");
  localStorage.setItem("admin_section", section || "");
}
function getAdminCourse(){ return localStorage.getItem("admin_course") || ""; }
function getAdminSection(){ return localStorage.getItem("admin_section") || ""; }

// ================== API ==================
async function api(action, payload={}){
  const bodyObj = {
    action,
    token: getToken(),
    firebase_token: localStorage.getItem("firebase_token"),
    ...payload
  };
  const res = await fetch(API_URL, { method:"POST", body: JSON.stringify(bodyObj) });
  const data = await res.json().catch(()=>({ok:false, message:"تعذر قراءة رد الخادم"}));
  if (!data.ok) throw new Error(data.message || "حدث خطأ");
  return data;
}

// ================== RENDER TABLE ==================
function renderTable(container, rows, options={}){
  const { title="" } = options;
  if (!rows || !rows.length){
    container.innerHTML = `<div class="muted">لا توجد بيانات.</div>`;
    return;
  }
  const head = Object.keys(rows[0]);
  const thead = `<tr>${head.map(h=>`<th>${esc(h)}</th>`).join("")}</tr>`;
  const tbody = rows.map(r=>`<tr>${head.map(h=>`<td>${esc(r[h])}</td>`).join("")}</tr>`).join("");
  container.innerHTML = `
    ${title ? `<div class="h2" style="margin:0 0 10px 0">${esc(title)}</div>`:""}
    <div class="tableWrap">
      <table class="table">
        <thead>${thead}</thead>
        <tbody>${tbody}</tbody>
      </table>
    </div>
  `;
}
