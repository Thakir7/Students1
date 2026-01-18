// === Students1 Frontend Helper (FIXED) ===
const API_URL = "https://script.google.com/macros/s/AKfycbw1Fc-4Vb_eST-8eY1aukpXaI3vim_FQVflbL_uEDPFLnRdKmQmWCGXJt2sM7-tSrpKng/exec";

function saveSession(data){
  localStorage.setItem("token", data.token);
  localStorage.setItem("student", JSON.stringify(data.student || {}));
  // مهم: المتدرب لا يكون admin
  localStorage.removeItem("mode");
  // لا نحذف firebase_token هنا (قد يكون مستخدم نفس الجهاز) لكن لا نفعّله بدون mode
}

function getToken(){ return localStorage.getItem("token"); }
function getStudent(){ return JSON.parse(localStorage.getItem("student") || "null"); }

function setSelection(course, section){
  if (course != null) localStorage.setItem("sel_course", String(course));
  if (section != null) localStorage.setItem("sel_section", String(section));
}
function getSelection(){
  return {
    course: localStorage.getItem("sel_course") || "",
    section: localStorage.getItem("sel_section") || ""
  };
}

function isAdmin(){
  return localStorage.getItem("mode") === "admin" && !!localStorage.getItem("firebase_token");
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
  // لا نلمس admin هنا
  location.href = "index.html";
}

function exitAdminMode(){
  localStorage.removeItem("mode");
  localStorage.removeItem("firebase_token");
  // تنظيف اختيار المقرر/الشعبة
  localStorage.removeItem("sel_course");
  localStorage.removeItem("sel_section");
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

function qs(k){ return new URLSearchParams(location.search).get(k); }

function esc(s){
  return String(s ?? "").replace(/[&<>"']/g, m => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[m]));
}
