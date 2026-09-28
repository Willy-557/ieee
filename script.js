
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwi-VfcOja5EmnfOFdnB6ScsdUaowGKN4p3M3NncUHVE0YqOBwEoY72mhTe8BO3jbsvPw/exec";

const checkStatusForm = document.getElementById("checkStatusForm");
const nrpInput = document.getElementById("nrpInput");
const nrpError = document.getElementById("nrpError");
const checkAnnouncementBtn = document.getElementById("checkAnnouncementBtn");

const resultStateEmpty = document.getElementById("resultStateEmpty");
const resultStateLoading = document.getElementById("resultStateLoading");
const resultStateNotFound = document.getElementById("resultStateNotFound");
const resultStateLolos = document.getElementById("resultStateLolos");
const resultStateGagal = document.getElementById("resultStateGagal");

const notFoundMessage = document.getElementById("notFoundMessage");

const gagalNrp = document.getElementById("gagalNrp");
const gagalDivisi = document.getElementById("gagalDivisi");

const lolosNrp = document.getElementById("lolosNrp");
const lolosDivisi = document.getElementById("lolosDivisi");

const resultStateAbsen = document.getElementById("resultStateAbsen");
const absenNrp = document.getElementById("absenNrp");

function showResultState(stateName) {
  resultStateEmpty.hidden = stateName !== "empty";
  resultStateLoading.hidden = stateName !== "loading";
  resultStateNotFound.hidden = stateName !== "notfound";
  resultStateLolos.hidden = stateName !== "lolos";
  resultStateGagal.hidden = stateName !== "gagal";
  resultStateAbsen.hidden = stateName !== "absen";
}

function validateNrp(value) {
  if (value.trim() === "") {
    return "NRP tidak boleh kosong.";
  }
  if (!/^[0-9]+$/.test(value)) {
    return "NRP hanya boleh berisi angka (0-9), tanpa spasi atau huruf.";
  }
  return null; // artinya valid
}

nrpInput.addEventListener("input", () => {
  nrpInput.value = nrpInput.value.replace(/[^0-9]/g, "");
  nrpInput.classList.remove("input-invalid");
  nrpError.hidden = true;
});

async function fetchParticipantByNrp(nrp) {
  const url = APPS_SCRIPT_URL + "?nrp=" + encodeURIComponent(nrp);
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Gagal menghubungi server (status " + response.status + ")");
  }

  return response.json();
}

function renderGagal(peserta) {
  gagalNrp.textContent = peserta.nrp || "-";
  gagalDivisi.textContent = peserta.divisi || "-";
  showResultState("gagal");
}

function renderLolos(peserta) {
  lolosNrp.textContent = peserta.nrp || "-";
  lolosDivisi.textContent = peserta.divisi || "-";
  showResultState("lolos");
}

function renderAbsen(peserta) {
  absenNrp.textContent = peserta.nrp || "-";
  showResultState("absen");
}

checkStatusForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const nrpValue = nrpInput.value.trim();
  const errorMessage = validateNrp(nrpValue);

  if (errorMessage) {
    nrpInput.classList.add("input-invalid");
    nrpError.textContent = errorMessage;
    nrpError.hidden = false;
    return;
  }

  checkAnnouncementBtn.disabled = true;
  checkAnnouncementBtn.textContent = "Mencari...";
  showResultState("loading");

  try {
    const peserta = await fetchParticipantByNrp(nrpValue);

    if (!peserta.found) {
      notFoundMessage.textContent =
        'NRP "' + nrpValue + '" tidak ditemukan dalam data. Pastikan NRP yang Anda masukkan sudah benar, atau hubungi panitia melalui kontak di bawah.';
      showResultState("notfound");
    } else {
      const status = String(peserta.status || "").trim().toLowerCase();

      if (status === "lolos") {
        renderLolos(peserta);
      } else if (status === "tidak datang" || status === "tidak hadir") {
        renderAbsen(peserta);
      } else {
        renderGagal(peserta);
      }
    }
  } catch (err) {
    notFoundMessage.textContent =
      "Terjadi kesalahan saat mengambil data: " + err.message + ". Silakan coba lagi.";
    showResultState("notfound");
    console.error(err);
  } finally {
    checkAnnouncementBtn.disabled = false;
    checkAnnouncementBtn.textContent = "Cek Pengumuman";
  }
});

showResultState("empty");
