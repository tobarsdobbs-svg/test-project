/* === ForeclosureIQ - Frontend Application === */

const API = '/api';
let map = null;
let mapMarkers = [];
let currentPage = 0;
const PAGE_SIZE = 50;

const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC',
  'ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];

// === Initialization ===
document.addEventListener('DOMContentLoaded', () => {
  populateStateDropdown();
  setupNavigation();
  setupEventListeners();
  loadSearch();
  loadTotalCount();
});

function populateStateDropdown() {
  const sel = document.getElementById('filterState');
  US_STATES.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s; opt.textContent = s;
    sel.appendChild(opt);
  });
}

function setupNavigation() {
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
      tab.classList.add('active');
      const viewId = `view-${tab.dataset.view}`;
      document.getElementById(viewId).classList.add('active');

      // Lazy-load views
      switch (tab.dataset.view) {
        case 'map': initMap(); break;
        case 'analytics': loadAnalytics(); break;
        case 'deals': loadDeals(); break;
        case 'auctions': loadAuctions(); break;
        case 'alerts': loadAlerts(); break;
        case 'pipeline': loadPipeline(); break;
      }
    });
  });
}

function setupEventListeners() {
  document.getElementById('searchBtn').addEventListener('click', () => { currentPage = 0; loadSearch(); });
  document.getElementById('resetBtn').addEventListener('click', resetFilters);
  document.getElementById('sortBy').addEventListener('change', () => { currentPage = 0; loadSearch(); });
  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('roiClose').addEventListener('click', () => document.getElementById('roiModal').classList.remove('active'));
  document.getElementById('propertyModal').addEventListener('click', e => { if (e.target === e.currentTarget) closeModal(); });
  document.getElementById('roiModal').addEventListener('click', e => { if (e.target === e.currentTarget) e.currentTarget.classList.remove('active'); });
  document.getElementById('createAlertBtn').addEventListener('click', createAlert);
  document.getElementById('auctionDays').addEventListener('change', loadAuctions);

  // Enter key triggers search
  document.querySelectorAll('.filter-input, .filter-select').forEach(el => {
    el.addEventListener('keydown', e => { if (e.key === 'Enter') { currentPage = 0; loadSearch(); } });
  });
}

// === API Helpers ===
async function api(path, options) {
  const res = await fetch(API + path, options);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

function formatPrice(n) {
  if (!n) return '--';
  if (n >= 1000000) return '$' + (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return '$' + (n / 1000).toFixed(0) + 'K';
  return '$' + n.toLocaleString();
}

function formatFullPrice(n) {
  return n ? '$' + n.toLocaleString() : '--';
}

function formatStage(s) {
  const labels = {
    pre_foreclosure: 'Pre-Foreclosure',
    auction: 'Auction',
    reo: 'REO / Bank Owned',
    unknown: 'Unknown',
  };
  return labels[s] || s;
}

function formatType(t) {
  return (t || 'unknown').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function formatDate(d) {
  if (!d) return '--';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function daysUntil(d) {
  if (!d) return null;
  const diff = (new Date(d) - new Date()) / (1000 * 60 * 60 * 24);
  return Math.ceil(diff);
}

// === Total Count ===
async function loadTotalCount() {
  try {
    const data = await api('/health');
    document.getElementById('totalCount').textContent = `${data.properties.toLocaleString()} properties`;
  } catch { /* ignore */ }
}

// === Search ===
function getFilters() {
  return {
    city: document.getElementById('filterCity').value.trim(),
    state: document.getElementById('filterState').value,
    zip: document.getElementById('filterZip').value.trim(),
    stage: document.getElementById('filterStage').value,
    propertyType: document.getElementById('filterType').value,
    minPrice: document.getElementById('filterMinPrice').value,
    maxPrice: document.getElementById('filterMaxPrice').value,
    minBeds: document.getElementById('filterMinBeds').value,
    minBaths: document.getElementById('filterMinBaths').value,
  };
}

function resetFilters() {
  document.getElementById('filterCity').value = '';
  document.getElementById('filterState').value = '';
  document.getElementById('filterZip').value = '';
  document.getElementById('filterStage').value = '';
  document.getElementById('filterType').value = '';
  document.getElementById('filterMinPrice').value = '';
  document.getElementById('filterMaxPrice').value = '';
  document.getElementById('filterMinBeds').value = '';
  document.getElementById('filterMinBaths').value = '';
  currentPage = 0;
  loadSearch();
}

async function loadSearch() {
  const filters = getFilters();
  const sort = document.getElementById('sortBy').value;
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
  params.set('sort', sort);
  params.set('limit', PAGE_SIZE);
  params.set('offset', currentPage * PAGE_SIZE);

  try {
    const data = await api('/properties?' + params.toString());
    document.getElementById('resultCount').textContent = `${data.total.toLocaleString()} results`;
    renderPropertyCards(data.results, 'searchResults');
    renderPagination(data.total);
  } catch (err) {
    document.getElementById('searchResults').innerHTML = `<p style="color:var(--danger)">Error: ${err.message}</p>`;
  }
}

function renderPropertyCards(properties, containerId) {
  const container = document.getElementById(containerId);
  if (!properties.length) {
    container.innerHTML = '<p style="color:var(--text-dim);text-align:center;padding:2rem;">No properties found.</p>';
    return;
  }

  container.innerHTML = properties.map(p => {
    const discount = (p.estimated_value && p.listing_price)
      ? Math.round(((p.estimated_value - p.listing_price) / p.estimated_value) * 100)
      : null;
    const auctionDays = daysUntil(p.auction_date);

    return `
      <div class="property-card" onclick="openProperty(${p.id})">
        <div class="card-stage stage-${p.foreclosure_stage}">${formatStage(p.foreclosure_stage)}</div>
        <div class="card-address">${p.address}</div>
        <div class="card-location">${p.city}, ${p.state} ${p.zip || ''} · ${p.county || ''} County</div>
        <div class="card-details">
          ${p.bedrooms ? `<div><span>${p.bedrooms}</span> bd</div>` : ''}
          ${p.bathrooms ? `<div><span>${p.bathrooms}</span> ba</div>` : ''}
          ${p.sqft ? `<div><span>${p.sqft.toLocaleString()}</span> sqft</div>` : ''}
          ${p.year_built ? `<div>Built <span>${p.year_built}</span></div>` : ''}
        </div>
        <div class="card-prices">
          <div>
            <div class="card-price">${formatPrice(p.listing_price || p.auction_min_bid)}</div>
            ${p.estimated_value ? `<div class="card-value">Est. <span>${formatPrice(p.estimated_value)}</span></div>` : ''}
          </div>
          ${discount > 0 ? `<div class="card-discount">${discount}% off</div>` : ''}
        </div>
        ${p.auction_date ? `<div class="card-auction">Auction: ${formatDate(p.auction_date)}${auctionDays !== null && auctionDays > 0 ? ` (${auctionDays} days)` : auctionDays === 0 ? ' (TODAY)' : ''}</div>` : ''}
      </div>`;
  }).join('');
}

function renderPagination(total) {
  const pages = Math.ceil(total / PAGE_SIZE);
  const container = document.getElementById('pagination');
  if (pages <= 1) { container.innerHTML = ''; return; }

  let html = '';
  const start = Math.max(0, currentPage - 3);
  const end = Math.min(pages, start + 7);

  if (currentPage > 0) html += `<button class="page-btn" onclick="goToPage(${currentPage - 1})">Prev</button>`;
  for (let i = start; i < end; i++) {
    html += `<button class="page-btn${i === currentPage ? ' active' : ''}" onclick="goToPage(${i})">${i + 1}</button>`;
  }
  if (currentPage < pages - 1) html += `<button class="page-btn" onclick="goToPage(${currentPage + 1})">Next</button>`;
  container.innerHTML = html;
}

window.goToPage = function(page) {
  currentPage = page;
  loadSearch();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// === Property Detail Modal ===
window.openProperty = async function(id) {
  try {
    const p = await api(`/properties/${id}`);
    const inv = p.investment;

    document.getElementById('modalContent').innerHTML = `
      <div class="detail-header">
        <div class="card-stage stage-${p.foreclosure_stage}">${formatStage(p.foreclosure_stage)}</div>
        <h2>${p.address}</h2>
        <p>${p.city}, ${p.state} ${p.zip || ''} · ${p.county || ''} County</p>
      </div>

      <div class="detail-grid">
        <div class="detail-item"><div class="label">Property Type</div><div class="value">${formatType(p.property_type)}</div></div>
        <div class="detail-item"><div class="label">Bedrooms / Bathrooms</div><div class="value">${p.bedrooms || '--'} bd / ${p.bathrooms || '--'} ba</div></div>
        <div class="detail-item"><div class="label">Square Feet</div><div class="value">${p.sqft ? p.sqft.toLocaleString() : '--'}</div></div>
        <div class="detail-item"><div class="label">Lot Size</div><div class="value">${p.lot_size ? p.lot_size + ' acres' : '--'}</div></div>
        <div class="detail-item"><div class="label">Year Built</div><div class="value">${p.year_built || '--'}</div></div>
        <div class="detail-item"><div class="label">Lender</div><div class="value">${p.lender || '--'}</div></div>
        <div class="detail-item"><div class="label">Trustee</div><div class="value">${p.trustee || '--'}</div></div>
        <div class="detail-item"><div class="label">Case Number</div><div class="value">${p.case_number || '--'}</div></div>
        <div class="detail-item"><div class="label">Filing Date</div><div class="value">${formatDate(p.filing_date)}</div></div>
        <div class="detail-item"><div class="label">Default Amount</div><div class="value">${formatFullPrice(p.default_amount)}</div></div>
        ${p.auction_date ? `<div class="detail-item"><div class="label">Auction Date</div><div class="value" style="color:var(--stage-auction)">${formatDate(p.auction_date)}</div></div>` : ''}
        ${p.auction_min_bid ? `<div class="detail-item"><div class="label">Minimum Bid</div><div class="value">${formatFullPrice(p.auction_min_bid)}</div></div>` : ''}
      </div>

      <div class="detail-grid" style="grid-template-columns:1fr 1fr 1fr;">
        <div class="detail-item"><div class="label">Listing Price</div><div class="value" style="color:var(--accent);font-size:1.2rem">${formatFullPrice(p.listing_price)}</div></div>
        <div class="detail-item"><div class="label">Estimated Value</div><div class="value">${formatFullPrice(p.estimated_value)}</div></div>
        <div class="detail-item"><div class="label">Assessed Value</div><div class="value">${formatFullPrice(p.assessed_value)}</div></div>
      </div>

      ${inv ? `
      <div class="detail-section">
        <h3>Investment Analysis</h3>
        <div class="investment-grid">
          <div class="inv-item"><div class="label">Discount</div><div class="value ${inv.discountPercent > 0 ? 'positive' : ''}">${inv.discountPercent}%</div></div>
          <div class="inv-item"><div class="label">Est. Rehab</div><div class="value">${formatPrice(inv.estimatedRehab)}</div></div>
          <div class="inv-item"><div class="label">ARV</div><div class="value">${formatPrice(inv.arv)}</div></div>
          <div class="inv-item"><div class="label">Flip Profit</div><div class="value ${inv.estimatedFlipProfit > 0 ? 'positive' : 'negative'}">${formatPrice(inv.estimatedFlipProfit)}</div></div>
          <div class="inv-item"><div class="label">Flip ROI</div><div class="value ${inv.estimatedFlipROI > 0 ? 'positive' : 'negative'}">${inv.estimatedFlipROI}%</div></div>
        </div>
        <div style="margin-top:0.75rem;"><button class="btn btn-accent btn-sm" onclick="openROI(${p.id}, ${p.listing_price || 0}, ${p.estimated_value || 0})">Full ROI Calculator</button></div>
      </div>` : ''}

      ${p.liens && p.liens.length ? `
      <div class="detail-section">
        <h3>Liens & Encumbrances</h3>
        ${p.liens.map(l => `
          <div class="lien-row">
            <span class="lien-type">${l.lien_type} lien (${l.status})</span>
            <span>${l.holder || '--'}</span>
            <span class="lien-amount">${formatFullPrice(l.amount)}</span>
          </div>`).join('')}
        <div class="lien-row" style="font-weight:700;border-top:2px solid var(--border);">
          <span>Total Liens</span>
          <span></span>
          <span class="lien-amount">${formatFullPrice(p.liens.reduce((s, l) => s + (l.amount || 0), 0))}</span>
        </div>
      </div>` : ''}

      ${p.timeline && p.timeline.length ? `
      <div class="detail-section">
        <h3>Foreclosure Timeline</h3>
        <div class="timeline-list">
          ${p.timeline.map(t => `
            <div class="timeline-item">
              <div class="timeline-dot" style="background:var(--stage-${t.stage})"></div>
              <div class="date">${formatDate(t.event_date)}</div>
              <div>${t.details || formatStage(t.stage)}</div>
            </div>`).join('')}
        </div>
      </div>` : ''}

      ${p.comparables && p.comparables.length ? `
      <div class="detail-section">
        <h3>Comparable Sales</h3>
        ${p.comparables.map(c => `
          <div class="lien-row">
            <span>${c.comp_address}</span>
            <span style="color:var(--text-dim)">${c.sqft ? c.sqft.toLocaleString() + ' sqft' : ''} · ${c.distance_miles}mi</span>
            <span class="lien-amount">${formatFullPrice(c.sale_price)}</span>
          </div>`).join('')}
      </div>` : ''}

      <div style="margin-top:1.5rem;display:flex;gap:0.5rem;">
        <div class="detail-item" style="flex:1"><div class="label">Source</div><div class="value">${p.source}</div></div>
        <div class="detail-item" style="flex:1"><div class="label">Last Updated</div><div class="value">${formatDate(p.updated_at)}</div></div>
      </div>
    `;
    document.getElementById('propertyModal').classList.add('active');
  } catch (err) {
    console.error('Failed to load property:', err);
  }
};

function closeModal() {
  document.getElementById('propertyModal').classList.remove('active');
}

// === ROI Calculator ===
window.openROI = function(id, price, value) {
  const arv = Math.round(value * 1.05);
  document.getElementById('roiContent').innerHTML = `
    <div class="roi-form">
      <div class="roi-field"><label>Purchase Price</label><input type="number" id="roiPrice" value="${price}" class="filter-input"></div>
      <div class="roi-field"><label>Rehab Cost</label><input type="number" id="roiRehab" value="${Math.round(price * 0.15)}" class="filter-input"></div>
      <div class="roi-field"><label>After Repair Value</label><input type="number" id="roiARV" value="${arv}" class="filter-input"></div>
      <div class="roi-field"><label>Holding Months</label><input type="number" id="roiHold" value="6" class="filter-input"></div>
      <div class="roi-field"><label>Monthly Rent</label><input type="number" id="roiRent" value="${Math.round(price * 0.008)}" class="filter-input"></div>
      <div class="roi-field"><label>Annual Property Tax</label><input type="number" id="roiTax" value="${Math.round(price * 0.012)}" class="filter-input"></div>
      <div class="roi-field"><label>Annual Insurance</label><input type="number" id="roiInsurance" value="1200" class="filter-input"></div>
      <div class="roi-field"><label>Vacancy Rate %</label><input type="number" id="roiVacancy" value="8" class="filter-input"></div>
    </div>
    <button class="btn btn-primary" onclick="calculateROI()">Calculate</button>
    <div id="roiResults" class="roi-results" style="margin-top:1rem;"></div>
  `;
  document.getElementById('roiModal').classList.add('active');
};

window.calculateROI = async function() {
  const body = {
    purchasePrice: +document.getElementById('roiPrice').value,
    rehabCost: +document.getElementById('roiRehab').value,
    afterRepairValue: +document.getElementById('roiARV').value,
    holdingMonths: +document.getElementById('roiHold').value,
    monthlyRent: +document.getElementById('roiRent').value,
    propertyTax: +document.getElementById('roiTax').value,
    insurance: +document.getElementById('roiInsurance').value,
    vacancy: +document.getElementById('roiVacancy').value,
  };

  try {
    const r = await api('/properties/roi', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });

    document.getElementById('roiResults').innerHTML = `
      <div class="roi-section">
        <h4>Flip Analysis</h4>
        <div class="roi-row"><span>Total Investment</span><span class="val">${formatFullPrice(r.totalInvestment)}</span></div>
        <div class="roi-row"><span>Estimated Profit</span><span class="val ${r.flip.profit > 0 ? 'positive' : 'negative'}">${formatFullPrice(Math.round(r.flip.profit))}</span></div>
        <div class="roi-row"><span>ROI</span><span class="val ${r.flip.roi > 0 ? 'positive' : 'negative'}">${r.flip.roi.toFixed(1)}%</span></div>
      </div>
      <div class="roi-section">
        <h4>Rental Analysis</h4>
        <div class="roi-row"><span>Monthly NOI</span><span class="val ${r.rental.monthlyNOI > 0 ? 'positive' : 'negative'}">${formatFullPrice(Math.round(r.rental.monthlyNOI))}</span></div>
        <div class="roi-row"><span>Annual NOI</span><span class="val ${r.rental.annualNOI > 0 ? 'positive' : 'negative'}">${formatFullPrice(Math.round(r.rental.annualNOI))}</span></div>
        <div class="roi-row"><span>Cap Rate</span><span class="val">${r.rental.capRate.toFixed(2)}%</span></div>
        <div class="roi-row"><span>Cash-on-Cash Return</span><span class="val">${r.rental.cashOnCash.toFixed(2)}%</span></div>
        <div class="roi-row"><span>GRM</span><span class="val">${r.rental.grm.toFixed(1)}</span></div>
        ${r.breakEven ? `<div class="roi-row"><span>Break-Even</span><span class="val">${r.breakEven.toFixed(1)} years</span></div>` : ''}
      </div>
    `;
  } catch (err) {
    document.getElementById('roiResults').innerHTML = `<p style="color:var(--danger)">${err.message}</p>`;
  }
};

// === Map ===
function initMap() {
  if (map) return;
  map = L.map('mapContainer').setView([39.8, -98.5], 4);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    maxZoom: 18,
  }).addTo(map);

  setTimeout(() => map.invalidateSize(), 200);
  loadMapData();
}

async function loadMapData() {
  try {
    const data = await api('/properties?limit=200');
    clearMapMarkers();

    const stageColors = {
      pre_foreclosure: '#ffc107',
      auction: '#ff6b35',
      reo: '#4f8cff',
      unknown: '#8b8fa3',
    };

    data.results.forEach(p => {
      if (!p.latitude || !p.longitude) return;
      const color = stageColors[p.foreclosure_stage] || '#8b8fa3';
      const marker = L.circleMarker([p.latitude, p.longitude], {
        radius: 7, fillColor: color, color: '#1a1d27', weight: 2,
        fillOpacity: 0.85,
      }).addTo(map);

      marker.bindPopup(`
        <div class="map-popup">
          <h4>${p.address}</h4>
          <p>${p.city}, ${p.state} ${p.zip || ''}</p>
          <p>${formatStage(p.foreclosure_stage)} · ${formatType(p.property_type)}</p>
          ${p.listing_price ? `<div class="price">${formatFullPrice(p.listing_price)}</div>` : ''}
          <button class="btn btn-sm btn-primary" style="margin-top:0.5rem" onclick="openProperty(${p.id})">View Details</button>
        </div>
      `);
      mapMarkers.push(marker);
    });
  } catch (err) {
    console.error('Map data error:', err);
  }
}

function clearMapMarkers() {
  mapMarkers.forEach(m => map.removeLayer(m));
  mapMarkers = [];
}

// === Analytics ===
async function loadAnalytics() {
  try {
    const stats = await api('/analytics/stats');
    document.getElementById('statTotal').textContent = (stats.total || 0).toLocaleString();
    document.getElementById('statRecent').textContent = (stats.recentlyAdded || 0).toLocaleString();
    document.getElementById('statAuctions').textContent = (stats.upcomingAuctions || 0).toLocaleString();
    document.getElementById('statDiscount').textContent = stats.avgDiscount ? stats.avgDiscount.toFixed(1) + '%' : '--';

    renderBarChart('chartStage', stats.byStage || [], 'stage', 'count', {
      pre_foreclosure: '#ffc107', auction: '#ff6b35', reo: '#4f8cff',
    }, formatStage);

    renderBarChart('chartState', (stats.byState || []).slice(0, 15), 'state', 'count', null);
    renderBarChart('chartType', stats.byType || [], 'type', 'count', null, formatType);
  } catch (err) {
    console.error('Analytics error:', err);
  }
}

function renderBarChart(containerId, data, labelKey, valueKey, colorMap, labelFn) {
  const container = document.getElementById(containerId);
  if (!data.length) { container.innerHTML = '<p style="color:var(--text-dim)">No data</p>'; return; }

  const max = Math.max(...data.map(d => d[valueKey]));
  container.innerHTML = data.map(d => {
    const label = labelFn ? labelFn(d[labelKey]) : d[labelKey];
    const pct = max > 0 ? (d[valueKey] / max) * 100 : 0;
    const color = (colorMap && colorMap[d[labelKey]]) || 'var(--primary)';
    return `
      <div class="bar-row" ${labelKey === 'state' ? `onclick="drillState('${d[labelKey]}')" style="cursor:pointer"` : ''}>
        <div class="bar-label">${label || 'Unknown'}</div>
        <div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:${color}"></div></div>
        <div class="bar-count">${d[valueKey].toLocaleString()}</div>
      </div>`;
  }).join('');
}

window.drillState = async function(state) {
  try {
    const data = await api(`/analytics/trends/${state}`);
    document.getElementById('drillStateName').textContent = state;

    let html = '<div class="charts-grid">';
    if (data.byCounty && data.byCounty.length) {
      html += '<div class="chart-card"><h3>By County</h3><div class="chart-bars">';
      const max = Math.max(...data.byCounty.map(c => c.count));
      html += data.byCounty.map(c => `
        <div class="bar-row">
          <div class="bar-label">${c.county}</div>
          <div class="bar-track"><div class="bar-fill" style="width:${(c.count/max)*100}%;background:var(--primary)"></div></div>
          <div class="bar-count">${c.count}</div>
        </div>`).join('');
      html += '</div></div>';
    }
    if (data.byStage && data.byStage.length) {
      html += '<div class="chart-card"><h3>By Stage</h3><div class="chart-bars">';
      const colors = { pre_foreclosure: '#ffc107', auction: '#ff6b35', reo: '#4f8cff' };
      const max = Math.max(...data.byStage.map(s => s.count));
      html += data.byStage.map(s => `
        <div class="bar-row">
          <div class="bar-label">${formatStage(s.stage)}</div>
          <div class="bar-track"><div class="bar-fill" style="width:${(s.count/max)*100}%;background:${colors[s.stage] || 'var(--primary)'}"></div></div>
          <div class="bar-count">${s.count}</div>
        </div>`).join('');
      html += '</div></div>';
    }
    html += '</div>';

    document.getElementById('drillContent').innerHTML = html;
    document.getElementById('stateDrill').style.display = 'block';
  } catch (err) {
    console.error('State drill error:', err);
  }
};

// === Best Deals ===
async function loadDeals() {
  try {
    const deals = await api('/analytics/deals?limit=50');
    renderPropertyCards(deals, 'dealsResults');
  } catch (err) {
    document.getElementById('dealsResults').innerHTML = `<p style="color:var(--danger)">${err.message}</p>`;
  }
}

// === Auctions ===
async function loadAuctions() {
  try {
    const days = document.getElementById('auctionDays').value;
    const auctions = await api(`/analytics/auctions?days=${days}`);
    renderPropertyCards(auctions, 'auctionResults');
  } catch (err) {
    document.getElementById('auctionResults').innerHTML = `<p style="color:var(--danger)">${err.message}</p>`;
  }
}

// === Alerts ===
async function createAlert() {
  const name = document.getElementById('alertName').value.trim();
  const email = document.getElementById('alertEmail').value.trim();
  if (!name) return;

  const filters = getFilters();
  try {
    await api('/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, filters }),
    });
    document.getElementById('alertName').value = '';
    document.getElementById('alertEmail').value = '';
    loadAlerts();
  } catch (err) {
    console.error('Create alert error:', err);
  }
}

async function loadAlerts() {
  try {
    const alerts = await api('/alerts');
    const container = document.getElementById('alertsList');
    if (!alerts.length) {
      container.innerHTML = '<p style="color:var(--text-dim)">No alerts created yet.</p>';
      return;
    }
    container.innerHTML = alerts.map(a => {
      const filterDesc = Object.entries(a.filters).filter(([,v]) => v).map(([k,v]) => `${k}: ${v}`).join(', ');
      return `
        <div class="alert-item">
          <div class="alert-info">
            <h4>${a.name}</h4>
            <div class="alert-filters">${filterDesc || 'All properties'}</div>
            ${a.email ? `<div class="alert-filters">Email: ${a.email}</div>` : ''}
          </div>
          <button class="btn btn-sm btn-danger" onclick="deleteAlert(${a.id})">Delete</button>
        </div>`;
    }).join('');
  } catch (err) {
    console.error('Load alerts error:', err);
  }
}

window.deleteAlert = async function(id) {
  try {
    await api(`/alerts/${id}`, { method: 'DELETE' });
    loadAlerts();
  } catch (err) {
    console.error('Delete alert error:', err);
  }
};

// === Pipeline ===
async function loadPipeline() {
  try {
    const [sources, runs] = await Promise.all([
      api('/pipeline/sources'),
      api('/pipeline/runs'),
    ]);

    document.getElementById('sourcesList').innerHTML = sources.length
      ? sources.map(s => `
        <div class="source-card">
          <h4>${s.source}</h4>
          <div class="source-stat">Records: <span>${s.total_records.toLocaleString()}</span></div>
          <div class="source-stat">Last Updated: <span>${formatDate(s.last_updated)}</span></div>
          <div class="source-stat">First Record: <span>${formatDate(s.first_record)}</span></div>
        </div>`).join('')
      : '<p style="color:var(--text-dim)">No data sources yet. Run the pipeline to start collecting data.</p>';

    document.getElementById('pipelineRuns').innerHTML = runs.length
      ? runs.map(r => `
        <div class="run-row">
          <span class="run-status ${r.status}">${r.status}</span>
          <span>${r.source}</span>
          <span>${r.records_fetched || 0} fetched</span>
          <span>${r.records_new || 0} new</span>
          <span>${r.records_updated || 0} updated</span>
          <span style="color:var(--text-dim)">${formatDate(r.started_at)}</span>
        </div>`).join('')
      : '<p style="color:var(--text-dim)">No pipeline runs yet.</p>';
  } catch (err) {
    console.error('Pipeline error:', err);
  }
}
