const API_URL = "https://script.google.com/macros/s/AKfycbxv9vlzDiZEv8rB9nRF6Dm7OkU5ophr7eyydSXQ8lt5romkgdj88kZ1LjKcUEl4S_ry6A/exec";
function saveSession(data){
  localStorage.setItem("token", data.token);
  localStorage.setItem("student", JSON.stringify(data.student || {}));
}
function getToken(){ return localStorage.getItem("token"); }
function getStudent(){ return JSON.parse(localStorage.getItem("student") || "null"); }

function isAdmin(){
  return localStorage.getItem("mode")==="admin" && !!localStorage.getItem("firebase_token");
}

function requireStudentOrAdmin(){
  if(isAdmin()) return;
  if(!getToken()) location.href = "index.html";
}

function requireAdminOnly(){
  if(!isAdmin()) location.href = "admin-login.html";
}

function exitAdminMode(){
  localStorage.removeItem("mode");
  localStorage.removeItem("firebase_token");
  localStorage.removeItem("admin_course");
  localStorage.removeItem("admin_section");
  location.href = "index.html";
}

async function api(action, payload={}){
  const body = JSON.stringify({
    action,
    token: getToken(),
    firebase_token: localStorage.getItem("firebase_token"),
    ...payload
  });
  const res = await fetch(API_URL, { method:"POST", body });
  const data = await res.json().catch(()=>({ok:false, message:"فشل قراءة الرد"}));
  if(!data.ok) throw new Error(data.message || "خطأ");
  return data;
}

function qs(k){ return new URLSearchParams(location.search).get(k); }
function esc(s){ return String(s??"").replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

function renderTable(rows){
  if(!rows || !rows.length) return `<div class="muted">لا توجد بيانات.</div>`;
  const head = Object.keys(rows[0]);
  const thead = `<tr>${head.map(h=>`<th>${esc(h)}</th>`).join("")}</tr>`;
  const tbody = rows.map(r=>`<tr>${head.map(h=>`<td>${esc(r[h])}</td>`).join("")}</tr>`).join("");
  return `<div class="tableWrap"><table class="table"><thead>${thead}</thead><tbody>${tbody}</tbody></table></div>`;
}
