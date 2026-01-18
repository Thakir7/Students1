
const API_URL = "https://script.google.com/macros/s/AKfycbwzwkOnIy38TN67Kt26sIvzy7mhVjCCZmpD7YjA_S6ZmtT3qgTC0nFuPb9_BYmYUrewMA/exec";  // مثال: https://script.google.com/macros/s/XXXX/exec

function saveSession(data){
  if (data.token) localStorage.setItem("token", data.token);
  if (data.student) localStorage.setItem("student", JSON.stringify(data.student));
}
function getToken(){ return localStorage.getItem("token"); }
function getStudent(){ return JSON.parse(localStorage.getItem("student") || "null"); }

function isAdmin(){
  return localStorage.getItem("mode") === "admin" && !!localStorage.getItem("firebase_token");
}

function requireStudent(){
  if (!getToken()) location.href = "index.html";
}
function requireAdmin(){
  if (!isAdmin()) location.href = "admin-login.html";
}
function requireStudentOrAdmin(){
  if (isAdmin()) return;
  requireStudent();
}

function logoutStudent(){
  localStorage.removeItem("token");
  localStorage.removeItem("student");
  location.href = "index.html";
}
function exitAdminMode(){
  localStorage.removeItem("mode");
  localStorage.removeItem("firebase_token");
  localStorage.removeItem("admin_course");
  localStorage.removeItem("admin_section");
  location.href = "index.html";
}

async function api(action, payload = {}){
  const body = JSON.stringify({
    action,
    token: getToken(),
    firebase_token: localStorage.getItem("firebase_token"),
    ...payload
  });

  const res = await fetch(API_URL, { method:"POST", body });
  const data = await res.json().catch(()=>({ok:false, message:"تعذر قراءة الرد"}));
  if (!data.ok) throw new Error(data.message || "خطأ");
  return data;
}

// querystring helper
function qs(k){ return new URLSearchParams(location.search).get(k); }

// escape html
function esc(s){
  return String(s??"").replace(/[&<>"']/g, m => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[m]));
}
