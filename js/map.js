/* ==========================================================================
   SUNSTONE TOWNS — Location map (Leaflet)
   --------------------------------------------------------------------------
   NOTE: coordinates below are APPROXIMATE placeholders based on the
   "1820 Rutherford Road, Vaughan" address in the mockup. Confirm the real
   site coordinates before this goes live — see README.
   ========================================================================== */
(function () {
  'use strict';

  var SITE = {
    lat: 43.840861,
    lng: -79.4922884,
    label: 'Sunstone Towns',
    sub: 'Rutherford Rd & Peter Rupert Ave, Vaughan'
  };

  /* id must match data-place on the list rows */
  var PLACES = [
    { id: 'transit',  lat: 43.8556, lng: -79.5074, name: 'Maple GO Station',      meta: '8 minutes' },
    { id: 'highway',  lat: 43.8385, lng: -79.5225, name: 'Highway 400 Access',     meta: 'Minutes away' },
    { id: 'shopping', lat: 43.8220, lng: -79.5367, name: 'Vaughan Mills',          meta: 'Close to home' },
    { id: 'schools',  lat: 43.8455, lng: -79.4890, name: 'Parks & Schools',        meta: 'Walkable' }
  ];

  var el = document.getElementById('map');
  if (!el) return;

  /* If Leaflet failed to load (offline, blocked CDN), show the fallback panel
     rather than leaving an empty grey box. */
  if (typeof window.L === 'undefined') {
    el.classList.add('is-unavailable');
    return;
  }

  var map = L.map(el, {
    center: [SITE.lat, SITE.lng],
    zoom: 13,
    scrollWheelZoom: false,      // don't hijack page scroll
    zoomControl: true,
    attributionControl: true
  });

  /* Muted light basemap — sits under the cream palette without fighting it */
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(map);

  /* --- markers ----------------------------------------------------------- */
  var siteIcon = L.divIcon({
    className: 'pin pin--site',
    html: '<span class="pin__dot"></span><span class="pin__pulse"></span>',
    iconSize: [26, 26],
    iconAnchor: [13, 13]
  });

  function placeIcon(n) {
    return L.divIcon({
      className: 'pin pin--place',
      html: '<span class="pin__n">' + n + '</span>',
      iconSize: [26, 26],
      iconAnchor: [13, 13]
    });
  }

  L.marker([SITE.lat, SITE.lng], { icon: siteIcon, title: SITE.label, riseOnHover: true })
    .addTo(map)
    .bindPopup('<strong>' + SITE.label + '</strong><br>' + SITE.sub);

  var markers = {};
  PLACES.forEach(function (p, i) {
    var m = L.marker([p.lat, p.lng], {
      icon: placeIcon(String(i + 1).padStart(2, '0')),
      title: p.name,
      riseOnHover: true
    }).addTo(map).bindPopup('<strong>' + p.name + '</strong><br>' + p.meta);
    markers[p.id] = m;
  });

  /* fit everything with room to breathe */
  var group = L.featureGroup(
    [L.marker([SITE.lat, SITE.lng])].concat(PLACES.map(function (p) {
      return L.marker([p.lat, p.lng]);
    }))
  );
  map.fitBounds(group.getBounds(), { padding: [46, 46] });

  /* enable wheel zoom only once the user has committed to the map */
  map.on('click', function () { map.scrollWheelZoom.enable(); });
  map.on('mouseout', function () { map.scrollWheelZoom.disable(); });

  /* --- bind the connectivity list to the map ----------------------------- */
  var rows = document.querySelectorAll('[data-place]');

  function activate(row) {
    var id = row.getAttribute('data-place');
    var m = markers[id];
    if (!m) return;
    rows.forEach(function (r) { r.classList.remove('is-active'); });
    row.classList.add('is-active');
    map.flyTo(m.getLatLng(), 15, { duration: 0.7 });
    m.openPopup();
  }

  rows.forEach(function (row) {
    row.addEventListener('click', function () { activate(row); });
    row.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(row); }
    });
    row.addEventListener('mouseenter', function () {
      var m = markers[row.getAttribute('data-place')];
      if (m && m._icon) m._icon.classList.add('is-hot');
    });
    row.addEventListener('mouseleave', function () {
      var m = markers[row.getAttribute('data-place')];
      if (m && m._icon) m._icon.classList.remove('is-hot');
    });
  });

  /* reset view control */
  var reset = document.querySelector('[data-map-reset]');
  if (reset) {
    reset.addEventListener('click', function () {
      rows.forEach(function (r) { r.classList.remove('is-active'); });
      map.closePopup();
      map.flyToBounds(group.getBounds(), { padding: [46, 46], duration: 0.7 });
    });
  }
})();
