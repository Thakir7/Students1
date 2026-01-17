// === Students1 Frontend Helper (DIAG+FIX v4) ===
const API_URL = "https://script.google.com/macros/s/AKfycbxhyxk69wn7RQa9wlL4L8zG_QW_YecA9mdXxPsCp3hzQO9s4eCpZ34KIVNgjZr5QJ_mGQ/exec";

function saveSession(data){
  localStorage.setItem("token", data.token || "");
  localStorage.setItem("student", JSON.stringify(data.student || {}));
}
function getToken(){ return localStorage.getItem("token"); }
function getStudent(){ return JSON.parse(localStorage.getItem("student") || "null"); }

function isAdmin(){
  // شرط الأدمن: mode=admin + وجود firebase_token
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

// تحويل الأرقام العربية/الفارسية إلى إنجليزي + حذف غير الأرقام
function digitsOnly(s){
  s = String(s ?? "");
  const map = {
    "٠":"0","١":"1","٢":"2","٣":"3","٤":"4","٥":"5","٦":"6","٧":"7","٨":"8","٩":"9",
    "۰":"0","۱":"1","۲":"2","۳":"3","۴":"4","۵":"5","۶":"6","۷":"7","۸":"8","۹":"9"
  };
  s = s.replace(/[٠-٩۰-۹]/g, ch => map[ch] || ch);
  return s.replace(/\D+/g,"");
}

async function api(action, payload={}){
  const body = JSON.stringify({
    action,
    token: getToken(),
    firebase_token: localStorage.getItem("firebase_token") || "",
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

function renderTable(container, rows){
  if (!rows || !rows.length){
    container.innerHTML = `<div class="muted">لا توجد بيانات.</div>`;
    return;
  }
  const head = Object.keys(rows[0]);
  const thead = `<tr>${head.map(h=>`<th>${esc(h)}</th>`).join("")}</tr>`;
  const tbody = rows.map(r=>`<tr>${head.map(h=>`<td>${esc(r[h])}</td>`).join("")}</tr>`).join("");
  container.innerHTML = `<div class="tableWrap"><table class="table"><thead>${thead}</thead><tbody>${tbody}</tbody></table></div>`;
}
