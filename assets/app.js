
const API_URL = "https://script.google.com/macros/s/AKfycbziLEp9fOV6OVU8uOOOzCgQib1AomMACTXOEMx-OYUTXQH3S3pbx3-btJloSYHbjtJ54A/exec";

function saveSession(data){
  localStorage.setItem("token", data.token || "");
  localStorage.setItem("student", JSON.stringify(data.student || {}));
}
function getToken(){ return localStorage.getItem("token"); }
function getStudent(){ return JSON.parse(localStorage.getItem("student") || "null"); }

function isAdmin(){
  // admin mode is when firebase token exists
  return localStorage.getItem("mode")==="admin" && !!localStorage.getItem("firebase_token");
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

async function api(action, payload={}){
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

function qs(k){ return new URLSearchParams(location.search).get(k); }
function esc(s){ return String(s??"").replace(/[&<>"']/g,m=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[m])); }

