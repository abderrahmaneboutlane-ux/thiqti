const fs = require("fs");
let content = fs.readFileSync("single.html", "utf8");

// Fix the end of CARS array
const searchPattern = /\{id:\s*'car_1705'[\s\S]*?desc:[^\}]*\}\s*,?\s*\/\*\s*=====\s*LOAD REAL SCRAPED DATA/;
const match = content.match(searchPattern);

if (match) {
  const replacement = match[0].replace(/,\s*\/\*\s*=====\s*LOAD REAL SCRAPED DATA/, `\n];\n\n/* ===== THIQTI REST API CLIENT ===== */
window.ThiqtiAPI = {
  getVehicles: function(params) {
    var qs = new URLSearchParams(params || {}).toString();
    return fetch('/api/vehicles' + (qs ? '?' + qs : '')).then(function(r){ return r.json(); });
  },
  getHome: function() {
    return fetch('/api/home').then(function(r){ return r.json(); });
  },
  getVehicle: function(id) {
    return fetch('/api/vehicles/' + encodeURIComponent(id)).then(function(r){ return r.json(); });
  },
  getReputation: function(id) {
    return fetch('/api/vehicles/' + encodeURIComponent(id) + '/reputation').then(function(r){ return r.json(); });
  },
  getCompare: function(ids) {
    return fetch('/api/compare?ids=' + encodeURIComponent(ids.join(','))).then(function(r){ return r.json(); });
  },
  chat: function(data) {
    return fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(function(r){ return r.json(); });
  },
  syncFavorites: function(sessionId, vehicleIds) {
    return fetch('/api/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: sessionId, vehicleIds: vehicleIds })
    }).then(function(r){ return r.json(); });
  }
};\n\n/* ===== LOAD REAL SCRAPED DATA`);

  content = content.replace(match[0], replacement);
  fs.writeFileSync("single.html", content, "utf8");
  console.log("single.html successfully patched!");
} else {
  console.log("Search pattern not found in single.html");
}
