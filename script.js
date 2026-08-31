const remoteMode = Boolean(window.SHANGHAI_SUPABASE_URL && window.SHANGHAI_SUPABASE_ANON_KEY);
const supabaseClient = remoteMode
  ? window.supabase.createClient(window.SHANGHAI_SUPABASE_URL, window.SHANGHAI_SUPABASE_ANON_KEY)
  : null;

const seedPhotos = [
  {
    id: 1, date: "2025-09-08", place: "Shanghai", category: "Shanghai",
    caption: "First days in Shanghai — everything felt new.",
    image: "data:image/svg+xml," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#b5b0a5"/><stop offset=".5" stop-color="#847f76"/><stop offset="1" stop-color="#383735"/></linearGradient></defs><rect width="1200" height="1200" fill="url(#g)"/><circle cx="850" cy="290" r="130" fill="#dfcaa9" opacity=".8"/><path d="M0 920L210 680 330 820 500 520 670 900 820 610 1200 930V1200H0Z" fill="#252523" opacity=".72"/><text x="600" y="1030" fill="white" font-size="80" text-anchor="middle" font-family="Georgia">上海</text></svg>`)
  },
  {
    id: 2, date: "2025-09-14", place: "The Bund", category: "Shanghai",
    caption: "The skyline I had seen in photos, finally in front of me.",
    image: "data:image/svg+xml," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200"><defs><linearGradient id="g" y2="1"><stop stop-color="#d5b89a"/><stop offset=".55" stop-color="#77716a"/><stop offset="1" stop-color="#252524"/></linearGradient></defs><rect width="1200" height="1200" fill="url(#g)"/><g fill="#272725"><rect x="100" y="620" width="110" height="350"/><rect x="260" y="540" width="160" height="430"/><rect x="470" y="650" width="110" height="320"/><rect x="650" y="430" width="140" height="540"/><rect x="850" y="560" width="180" height="410"/></g><circle cx="850" cy="230" r="110" fill="#ead8ba" opacity=".85"/><text x="600" y="1080" fill="white" font-size="52" text-anchor="middle" font-family="Arial" letter-spacing="10">THE BUND</text></svg>`)
  },
  {
    id: 3, date: "2025-10-03", place: "Lixin University", category: "Uni",
    caption: "Campus days, new routines and people from everywhere.",
    image: "data:image/svg+xml," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200"><rect width="1200" height="1200" fill="#ddd6c9"/><rect x="160" y="250" width="880" height="620" fill="#aaa397"/><rect x="230" y="320" width="740" height="550" fill="#c9c1b3"/><path d="M140 880L600 600 1060 880Z" fill="#6e6a63"/><circle cx="600" cy="430" r="120" fill="#e6cba7" opacity=".9"/><text x="600" y="1040" fill="#353330" font-size="55" text-anchor="middle" font-family="Georgia">LIXIN</text></svg>`)
  },
  {
    id: 4, date: "2025-10-18", place: "Shanghai", category: "Food",
    caption: "One of many meals that I wish I could photograph with smell included.",
    image: "data:image/svg+xml," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200"><rect width="1200" height="1200" fill="#c8b49d"/><circle cx="600" cy="610" r="350" fill="#504c45"/><circle cx="600" cy="610" r="290" fill="#d9b77f"/><circle cx="500" cy="540" r="65" fill="#8c4d36"/><circle cx="690" cy="660" r="75" fill="#6e372b"/><circle cx="650" cy="490" r="45" fill="#6b7650"/><text x="600" y="1050" fill="#3d3934" font-size="48" text-anchor="middle" font-family="Georgia">FOOD DIARY</text></svg>`)
  }
];

let photos = remoteMode
  ? []
  : JSON.parse(localStorage.getItem("shanghaiPhotos") || "null") || seedPhotos;
let activeFilter = "All";

const gallery = document.getElementById("gallery");
const filters = document.getElementById("filters");

async function loadPhotos() {
  if (!remoteMode) return;
  const { data, error } = await supabaseClient
    .from("photos")
    .select("id, date, place, category, caption, image_path")
    .order("date", { ascending: true });

  if (error) {
    gallery.innerHTML = `<p class="empty">The archive could not be loaded. Please try again later.</p>`;
    return;
  }

  photos = data.map(photo => ({
    ...photo,
    image: supabaseClient.storage.from("photos").getPublicUrl(photo.image_path).data.publicUrl
  }));
}

function formatMonth(date) {
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(new Date(date + "T12:00:00"));
}
function formatDate(date) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(date + "T12:00:00"));
}

function renderFilters() {
  const categories = ["All", ...new Set(photos.map(p => p.category))];
  filters.innerHTML = categories.map(c =>
    `<button class="filter ${c === activeFilter ? "active" : ""}" data-filter="${c}">${c}</button>`
  ).join("");
  filters.querySelectorAll(".filter").forEach(btn => {
    btn.addEventListener("click", () => {
      activeFilter = btn.dataset.filter;
      render();
    });
  });
}

function render() {
  renderFilters();
  const visible = photos
    .filter(p => activeFilter === "All" || p.category === activeFilter)
    .sort((a,b) => a.date.localeCompare(b.date));

  if (!visible.length) {
    gallery.innerHTML = `<p class="empty">No memories in this category yet.</p>`;
    return;
  }

  const groups = {};
  visible.forEach(p => (groups[formatMonth(p.date)] ||= []).push(p));

  gallery.innerHTML = Object.entries(groups).map(([month, items]) => `
    <section class="month-block">
      <div class="month-title"><h3>${month}</h3><span>${items.length} ${items.length === 1 ? "memory" : "memories"}</span></div>
      <div class="gallery">
        ${items.map(p => `
          <article class="photo-card" data-id="${p.id}">
            <div class="photo-frame"><img src="${p.image}" alt="${escapeHtml(p.caption)}"></div>
            <div class="photo-meta">
              <div class="photo-place">${escapeHtml(p.place)} · ${formatDate(p.date)}</div>
              <div class="photo-caption">${escapeHtml(p.caption)}</div>
            </div>
          </article>
        `).join("")}
      </div>
    </section>
  `).join("");

  gallery.querySelectorAll(".photo-card").forEach(card => {
    card.addEventListener("click", () => openLightbox(photos.find(p => p.id == card.dataset.id)));
  });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}

const adminPanel = document.getElementById("adminPanel");
const uploadForm = document.getElementById("uploadForm");
const loginForm = document.getElementById("loginForm");
const adminMessage = document.getElementById("adminMessage");
const signOutButton = document.getElementById("signOutButton");
const photoManager = document.getElementById("photoManager");
const photoManagerList = document.getElementById("photoManagerList");
const editPhotoForm = document.getElementById("editPhotoForm");
let editingPhotoId = null;

function renderPhotoManager(canManage) {
  photoManager.hidden = !canManage;
  if (!canManage) return;

  if (!photos.length) {
    photoManagerList.innerHTML = '<p class="muted">No photos to manage yet.</p>';
    return;
  }

  photoManagerList.innerHTML = photos
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .map(photo => `
      <article class="photo-manager-item">
        <img src="${photo.image}" alt="${escapeHtml(photo.caption)}">
        <div>
          <strong>${escapeHtml(photo.place)}</strong>
          <span>${formatDate(photo.date)}</span>
        </div>
        <div class="photo-manager-actions">
          <button class="edit-photo-btn" type="button" data-id="${photo.id}">Edit</button>
          <button class="delete-photo-btn" type="button" data-id="${photo.id}">Delete</button>
        </div>
      </article>
    `).join("");

  photoManagerList.querySelectorAll(".delete-photo-btn").forEach(button => {
    button.addEventListener("click", () => deletePhoto(button.dataset.id));
  });
  photoManagerList.querySelectorAll(".edit-photo-btn").forEach(button => {
    button.addEventListener("click", () => openEditPhoto(button.dataset.id));
  });
}

function openEditPhoto(id) {
  const photo = photos.find(p => String(p.id) === String(id));
  if (!photo) return;
  editingPhotoId = photo.id;
  document.getElementById("editCaptionInput").value = photo.caption;
  document.getElementById("editDateInput").value = photo.date;
  document.getElementById("editPlaceInput").value = photo.place;
  document.getElementById("editCategoryInput").value = photo.category;
  editPhotoForm.hidden = false;
  editPhotoForm.scrollIntoView({ behavior: "smooth", block: "start" });
}

function closeEditPhoto() {
  editingPhotoId = null;
  editPhotoForm.reset();
  editPhotoForm.hidden = true;
}

function updateAdminState(session) {
  if (!remoteMode) {
    loginForm.hidden = true;
    uploadForm.hidden = false;
    signOutButton.hidden = true;
    adminMessage.textContent = "This prototype stores uploads in this browser only.";
    renderPhotoManager(true);
    return;
  }

  const signedIn = Boolean(session);
  loginForm.hidden = signedIn;
  uploadForm.hidden = !signedIn;
  signOutButton.hidden = !signedIn;
  renderPhotoManager(signedIn);
  adminMessage.textContent = signedIn
    ? `Signed in as ${session.user.email}. Uploads are added to the shared archive.`
    : "Sign in to add photos to the shared archive.";
}

document.getElementById("adminToggle").onclick = async () => {
  adminPanel.classList.add("open");
  adminPanel.setAttribute("aria-hidden", "false");
  if (remoteMode) {
    const { data } = await supabaseClient.auth.getSession();
    updateAdminState(data.session);
  }
};
document.getElementById("closeAdmin").onclick = () => {
  adminPanel.classList.remove("open");
  adminPanel.setAttribute("aria-hidden", "true");
};

loginForm.addEventListener("submit", async e => {
  e.preventDefault();
  if (!remoteMode) return;
  const submit = loginForm.querySelector("button[type=submit]");
  submit.disabled = true;
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email: document.getElementById("emailInput").value,
    password: document.getElementById("passwordInput").value
  });
  submit.disabled = false;
  if (error) {
    adminMessage.textContent = error.message;
    return;
  }
  loginForm.reset();
  updateAdminState(data.session);
});

signOutButton.addEventListener("click", async () => {
  if (!remoteMode) return;
  await supabaseClient.auth.signOut();
  updateAdminState(null);
});

document.getElementById("cancelEditButton").addEventListener("click", closeEditPhoto);

editPhotoForm.addEventListener("submit", async e => {
  e.preventDefault();
  const photo = photos.find(p => String(p.id) === String(editingPhotoId));
  if (!photo) return;

  const changes = {
    caption: document.getElementById("editCaptionInput").value,
    date: document.getElementById("editDateInput").value,
    place: document.getElementById("editPlaceInput").value,
    category: document.getElementById("editCategoryInput").value
  };
  const submit = editPhotoForm.querySelector("button[type=submit]");
  submit.disabled = true;
  adminMessage.textContent = "Saving changes…";

  if (remoteMode) {
    const { error } = await supabaseClient.from("photos").update(changes).eq("id", photo.id);
    if (error) {
      submit.disabled = false;
      adminMessage.textContent = error.message;
      return;
    }
    await loadPhotos();
  } else {
    Object.assign(photo, changes);
    localStorage.setItem("shanghaiPhotos", JSON.stringify(photos));
  }

  activeFilter = "All";
  render();
  closeEditPhoto();
  renderPhotoManager(true);
  submit.disabled = false;
  adminMessage.textContent = "Changes saved.";
});

async function deletePhoto(id) {
  const photo = photos.find(p => String(p.id) === String(id));
  if (!photo || !confirm(`Delete the photo from ${photo.place}? This cannot be undone.`)) return;

  const button = photoManagerList.querySelector(`.delete-photo-btn[data-id="${id}"]`);
  button.disabled = true;
  adminMessage.textContent = "Deleting photo…";

  if (remoteMode) {
    const { error: databaseError } = await supabaseClient.from("photos").delete().eq("id", photo.id);
    if (databaseError) {
      button.disabled = false;
      adminMessage.textContent = databaseError.message;
      return;
    }

    const { error: storageError } = await supabaseClient.storage.from("photos").remove([photo.image_path]);
    await loadPhotos();
    render();
    renderPhotoManager(true);
    closeEditPhoto();
    adminMessage.textContent = storageError
      ? "The photo was removed from the gallery, but its file could not be removed from storage."
      : "Photo deleted.";
    return;
  }

  photos = photos.filter(p => String(p.id) !== String(id));
  localStorage.setItem("shanghaiPhotos", JSON.stringify(photos));
  render();
  renderPhotoManager(true);
  adminMessage.textContent = "Photo deleted.";
}

uploadForm.addEventListener("submit", async e => {
  e.preventDefault();
  const file = document.getElementById("photoInput").files[0];
  if (!file) return;
  if (file.size > 10 * 1024 * 1024) {
    adminMessage.textContent = "Please choose an image smaller than 10 MB.";
    return;
  }

  if (remoteMode) {
    const { data: sessionData } = await supabaseClient.auth.getSession();
    if (!sessionData.session) {
      updateAdminState(null);
      return;
    }
    const submit = uploadForm.querySelector(".primary-btn");
    submit.disabled = true;
    adminMessage.textContent = "Uploading photo…";
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const imagePath = `${sessionData.session.user.id}/${crypto.randomUUID()}.${extension}`;
    const { error: storageError } = await supabaseClient.storage.from("photos").upload(imagePath, file, {
      cacheControl: "3600", upsert: false, contentType: file.type
    });
    if (storageError) {
      submit.disabled = false;
      adminMessage.textContent = storageError.message;
      return;
    }
    const { error: databaseError } = await supabaseClient.from("photos").insert({
      date: document.getElementById("dateInput").value,
      place: document.getElementById("placeInput").value,
      category: document.getElementById("categoryInput").value,
      caption: document.getElementById("captionInput").value,
      image_path: imagePath
    });
    if (databaseError) {
      await supabaseClient.storage.from("photos").remove([imagePath]);
      submit.disabled = false;
      adminMessage.textContent = databaseError.message;
      return;
    }
    e.target.reset();
    await loadPhotos();
    activeFilter = "All";
    render();
    renderPhotoManager(true);
    submit.disabled = false;
    adminPanel.classList.remove("open");
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    photos.push({
      id: Date.now(),
      date: document.getElementById("dateInput").value,
      place: document.getElementById("placeInput").value,
      category: document.getElementById("categoryInput").value,
      caption: document.getElementById("captionInput").value,
      image: reader.result
    });
    localStorage.setItem("shanghaiPhotos", JSON.stringify(photos));
    e.target.reset();
    activeFilter = "All";
    render();
    renderPhotoManager(true);
    adminPanel.classList.remove("open");
  };
  reader.readAsDataURL(file);
});

const lightbox = document.getElementById("lightbox");
function openLightbox(p) {
  document.getElementById("lightboxImage").src = p.image;
  document.getElementById("lightboxImage").alt = p.caption;
  document.getElementById("lightboxPlace").textContent = p.place;
  document.getElementById("lightboxDate").textContent = formatDate(p.date);
  document.getElementById("lightboxText").textContent = p.caption;
  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
}
function closeLightbox() {
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
}
document.getElementById("lightboxClose").onclick = closeLightbox;
lightbox.addEventListener("click", e => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener("keydown", e => { if (e.key === "Escape") { closeLightbox(); adminPanel.classList.remove("open"); } });

loadPhotos().then(render);
