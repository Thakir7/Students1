// === Students1 Frontend Helper (assets/app.js) ===
// ضع رابط WebApp هنا:
const API_URL = "https://script.google.com/macros/s/AKfycbw1Fc-4Vb_eST-8eY1aukpXaI3vim_FQVflbL_uEDPFLnRdKmQmWCGXJt2sM7-tSrpKng/exec";

// -------------------- Session --------------------
function saveSession(data){
  localStorage.setItem("token", data.token || "");
  localStorage.setItem("student", JSON.stringify(data.student || {}));
}
function getToken(){ return localStorage.getItem("token"); }
function getStudent(){ return JSON.parse(localStorage.getItem("student") || "null"); }

// Admin mode + firebase token
function isAdmin(){
  return localStorage.getItem("mode") === "admin" && !!localStorage.getItem("firebase_token");
}
function requireStudentOrAdmin(){
  if (isAdmin()) return;
  if (!getToken()) location.href = "index.html";
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

// -------------------- Selection (FIX setSelection) --------------------
function setSelection(course, section){
  localStorage.setItem("admin_course", course || "");
  localStorage.setItem("admin_section", section || "");
}
function getSelection(){
  return {
    course: localStorage.getItem("admin_course") || "",
    section: localStorage.getItem("admin_section") || ""
  };
}

// -------------------- API --------------------
async function api(action, payload = {}){
  const body = JSON.stringify({
    action,
    token: getToken(),
    firebase_token: localStorage.getItem("firebase_token"),
    ...payload
  });

  const res = await fetch(API_URL, { method: "POST", body });
  const data = await res.json().catch(()=>({ ok:false, message:"فشل قراءة الرد" }));
  if (!data.ok) throw new Error(data.message || "خطأ");
  return data;
}

// -------------------- Utils --------------------
function qs(k){ return new URLSearchParams(location.search).get(k); }
function esc(s){
  return String(s ?? "").replace(/[&<>"']/g, m => (
    { "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[m]
  ));
}
