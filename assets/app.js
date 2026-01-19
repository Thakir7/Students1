// === Students1 Frontend Helper (FINAL) ===
const API_URL = "https://script.google.com/macros/s/AKfycbziLEp9fOV6OVU8uOOOzCgQib1AomMACTXOEMx-OYUTXQH3S3pbx3-btJloSYHbjtJ54A/exec"; // ضع رابط WebApp هنا

function saveSession(data){
  localStorage.setItem("token", data.token || "");
  localStorage.setItem("student", JSON.stringify(data.student || {}));
}
function getToken(){ return localStorage.getItem("token"); }
function getStudent(){ return JSON.parse(localStorage.getItem("student") || "null"); }

function setAdminSession(uid){
  localStorage.setItem("mode","admin");
  localStorage.setItem("firebase_uid", uid);
}
function clearAdminSession(){
  localStorage.removeItem("mode");
  localStorage.removeItem("firebase_uid");
}
function isAdmin(){
  return localStorage.getItem("mode")==="admin" && !!localStorage.getItem("firebase_uid");
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
  clearAdminSession();
  location.href = "index.html";
}

async function api(action, payload={}){
  const body = JSON.stringify({
    action,
    token: getToken(),
    firebase_uid: localStorage.getItem("firebase_uid") || "",
    ...payload
  });
  const res = await fetch(API_URL, { method:"POST", body });
  const data = await res.json().catch(()=>({ok:false, message:"تعذّر قراءة الرد"}));
  if(!data.ok) throw new Error(data.message || "خطأ");
  return data;
}

function qs(k){ return new URLSearchParams(location.search).get(k); }
function esc(s){ return String(s??"").replace(/[&<>"]/g,m=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;" }[m])); }

// تخزين اختيار المدرب (مقرر/شعبة) مرة واحدة
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
