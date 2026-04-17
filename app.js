const locationText = document.getElementById("locationText");
const getLocationBtn = document.getElementById("getLocationBtn");
const showAllBtn = document.getElementById("showAllBtn");
const parkingList = document.getElementById("parkingList");

let userLocation = null;
let showAll = false;
let map;
let userMarker;
let parkingMarkers = [];

let parkings = [
  {
    id: 1,
    name: "Merkez Otopark",
    lat: 41.0082,
    lng: 28.9784,
    status: "available",
    capacity: 50,
    emptySlots: 12
  },
  {
    id: 2,
    name: "Meydan Katlı Otopark",
    lat: 41.0150,
    lng: 28.9850,
    status: "full",
    capacity: 100,
    emptySlots: 0
  },
  {
    id: 3,
    name: "AVM Açık Otopark",
    lat: 41.0035,
    lng: 28.9720,
    status: "available",
    capacity: 80,
    emptySlots: 20
  },
  {
    id: 4,
    name: "Sahil Otoparkı",
    lat: 41.0200,
    lng: 28.9900,
    status: "available",
    capacity: 60,
    emptySlots: 8
  }
];

function toRad(value) {
  return (value * Math.PI) / 180;
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

function initMap() {
  map = L.map("map").setView([41.0082, 28.9784], 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
  }).addTo(map);

  renderParkingMarkers();
}

function clearParkingMarkers() {
  parkingMarkers.forEach(marker => map.removeLayer(marker));
  parkingMarkers = [];
}

function renderParkingMarkers() {
  if (!map) return;

  clearParkingMarkers();

  let list = [...parkings];
  if (!showAll) {
    list = list.filter(parking => parking.status === "available");
  }

  list.forEach(parking => {
    const popupText = `
      <b>${parking.name}</b><br>
      Kapasite: ${parking.capacity}<br>
      Boş Yer: ${parking.emptySlots}<br>
      Durum: ${parking.status === "available" ? "Boş Yer Var" : "Dolu"}<br><br>
      <button onclick="navigateToParking(${parking.lat}, ${parking.lng})">Navigasyon</button>
    `;

    const marker = L.marker([parking.lat, parking.lng])
      .addTo(map)
      .bindPopup(popupText);

    parkingMarkers.push(marker);
  });
}

function updateUserMarker() {
  if (!map || !userLocation) return;

  if (userMarker) {
    map.removeLayer(userMarker);
  }

  userMarker = L.marker([userLocation.lat, userLocation.lng])
    .addTo(map)
    .bindPopup("Konumunuz")
    .openPopup();

  map.setView([userLocation.lat, userLocation.lng], 14);
}

function getSortedParkings() {
  const sorted = [...parkings];

  if (userLocation) {
    sorted.sort((a, b) => {
      const distA = calculateDistance(userLocation.lat, userLocation.lng, a.lat, a.lng);
      const distB = calculateDistance(userLocation.lat, userLocation.lng, b.lat, b.lng);
      return distA - distB;
    });
  }

  return sorted;
}

function renderParkings() {
  parkingList.innerHTML = "";

  let sortedParkings = getSortedParkings();

  if (!showAll) {
    sortedParkings = sortedParkings.filter(parking => parking.status === "available");
  }

  if (sortedParkings.length === 0) {
    parkingList.innerHTML = '<p class="empty-message">Gösterilecek uygun otopark bulunamadı.</p>';
    renderParkingMarkers();
    return;
  }

  sortedParkings.forEach((parking) => {
    const div = document.createElement("div");
    div.className = "parking-item";

    let distanceText = "Mesafe hesaplanamadı";
    if (userLocation) {
      const distance = calculateDistance(userLocation.lat, userLocation.lng, parking.lat, parking.lng);
      distanceText = distance + " km";
    }

    div.innerHTML = `
      <div class="parking-info">
        <h3>${parking.name}</h3>
        <p>Toplam Kapasite: ${parking.capacity}</p>
        <p>Boş Yer: ${parking.emptySlots}</p>
        <p>Mesafe: ${distanceText}</p>
      </div>

      <div class="actions">
        <span class="status ${parking.status === "available" ? "available" : "full"}">
          ${parking.status === "available" ? "Boş Yer Var" : "Dolu"}
        </span>
        <button onclick="navigateToParking(${parking.lat}, ${parking.lng})">Navigasyon</button>
        <button onclick="toggleParkingStatus(${parking.id})">
          ${parking.status === "available" ? "Dolu Yap" : "Boş Yap"}
        </button>
      </div>
    `;

    parkingList.appendChild(div);
  });

  renderParkingMarkers();
}

function toggleParkingStatus(id) {
  parkings = parkings.map((parking) => {
    if (parking.id === id) {
      if (parking.status === "available") {
        return {
          ...parking,
          status: "full",
          emptySlots: 0
        };
      } else {
        return {
          ...parking,
          status: "available",
          emptySlots: 5
        };
      }
    }
    return parking;
  });

  renderParkings();
}

function navigateToParking(lat, lng) {
  const mapsUrl = https://www.google.com/maps?q=${lat},${lng};
  window.open(mapsUrl, "_blank");
}

getLocationBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    locationText.textContent = "Tarayıcınız konum özelliğini desteklemiyor.";
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      userLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      locationText.textContent = Enlem: ${userLocation.lat.toFixed(4)}, Boylam: ${userLocation.lng.toFixed(4)};

      updateUserMarker();
      renderParkings();
    },
    () => {
      locationText.textContent = "Konum alınamadı. Lütfen izin verin.";
    }
  );
});

showAllBtn.addEventListener("click", () => {
  showAll = !showAll;
  showAllBtn.textContent = showAll ? "Sadece Boşları Göster" : "Tümünü Göster";
  renderParkings();
});

initMap();
renderParkings();
