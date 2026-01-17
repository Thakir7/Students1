// assets/app.js
const API_URL = "https://script.google.com/macros/s/AKfycbxhyxk69wn7RQa9wlL4L8zG_QW_YecA9mdXxPsCp3hzQO9s4eCpZ34KIVNgjZr5QJ_mGQ/exec";

// تحويل الأرقام العربية إلى إنجليزية + حذف غير الأرقام
function normDigits(v){
  v = String(v ?? "").trim();
  const map = {
    "٠":"0","١":"1","٢":"2","٣":"3","٤":"4","٥":"5","٦":"6","٧":"7","٨":"8","٩":"9",
    "۰":"0","۱":"1","۲":"2","۳":"3","۴":"4","۵":"5","۶":"6","۷":"7","۸":"8","۹":"9"
  };
  v = v.replace(/[٠-٩۰-۹]/g, ch => map[ch] ?? ch);
  v = v.replace(/\D+/g, ""); // اترك الأرقام فقط
  return v;
}

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
  if (isAdmin()) return;
  if (!getToken()) location.href = "index.html";
}
function requireAdminOnly(){
  if (!isAdmin()) location.href = "admin-login.html";
}

function logoutStudent(){
  localStorage.removeItem("token");
  localStorage.removeItem("student");
  location.href = "index.html";
}
function logoutAdmin(){
  localStorage.removeItem("mode");
  localStorage.removeItem("firebase_token");
  localStorage.removeItem("admin_course");
  localStorage.removeItem("admin_section");
  location.href = "index.html";
}

function getAdminCourse(){ return localStorage.getItem("admin_course") || ""; }
function getAdminSection(){ return localStorage.getItem("admin_section") || ""; }
function setAdminSelection(course, section){
  localStorage.setItem("admin_course", course || "");
  localStorage.setItem("admin_section", section || "");
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

function esc(s){
  return String(s ?? "").replace(/[&<>"']/g, m => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[m]));
}

// ✅ شريط تغيير (المقرر/الشعبة) داخل صفحات المدرب بدون الرجوع للداشبورد
async function renderAdminSelector(mountEl, onChanged){
  if(!isAdmin()){ mountEl.innerHTML=""; return; }

  const data = await api("admin_courses_list", {});
  const courses = data.courses || [];
  if(!courses.length){
    mountEl.innerHTML = `<div class="muted">لا توجد مقررات في شيت Students.</div>`;
    return;
  }

  const curCourse = getAdminCourse() || courses[0].course;
  const curObj = courses.find(c=>c.course===curCourse) || courses[0];
  const sections = (curObj.sections || []).filter(Boolean);

  mountEl.innerHTML = `
    <div class="card" style="margin:12px 0">
      <div class="h2">تغيير المقرر والشعبة</div>
      <div class="row" style="margin-top:10px">
        <select id="__ac" class="input"></select>
        <select id="__as" class="input"></select>
        <button id="__save" class="btn primary">حفظ</button>
      </div>
      <div class="muted" style="margin-top:8px">سيتم تطبيق الاختيار على كل صفحات المدرب تلقائيًا.</div>
    </div>
  `;

  const ac = mountEl.querySelector("#__ac");
  const as = mountEl.querySelector("#__as");
  const btn = mountEl.querySelector("#__save");

  ac.innerHTML = courses.map(c=>`<option value="${esc(c.course)}">${esc(c.course)}</option>`).join("");
  ac.value = curCourse;

  function fillSections(){
    const c = courses.find(x=>x.course===ac.value) || courses[0];
    const secs = (c.sections || []).filter(Boolean);
    as.innerHTML = secs.length
      ? secs.map(s=>`<option value="${esc(s)}">${esc(s)}</option>`).join("")
      : `<option value="">بدون شعبة</option>`;

    const saved = getAdminSection();
    if(saved && secs.includes(saved)) as.value = saved;
  }
  fillSections();
  ac.onchange = fillSections;

  btn.onclick = ()=>{
    setAdminSelection(ac.value, as.value);
    if(typeof onChanged === "function") onChanged(ac.value, as.value);
    alert("تم حفظ الاختيار ✅");
  };
}
