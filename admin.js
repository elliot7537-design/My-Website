/* ============================================================
   Luna UX Mexico — Admin Dashboard
   ============================================================ */

let customers = [];
let filters = { search: '', status: '', payment: '' };

/* ---------- DOM refs ---------- */
const tbody = document.getElementById('customer-tbody');
const searchInput = document.getElementById('search-input');
const filterStatus = document.getElementById('filter-status');
const filterPayment = document.getElementById('filter-payment');
const overlay = document.getElementById('modal-overlay');
const editForm = document.getElementById('edit-form');
const modalTitle = document.getElementById('modal-title');
const btnDelete = document.getElementById('btn-delete');

/* ---------- Labels ---------- */
const PROJECT_LABELS = {
  brand_identity: 'Brand Identity',
  web_design: 'Web Design',
  digital_product: 'Digital Product',
  creative_strategy: 'Creative Strategy',
  motion_design: 'Motion Design'
};
const STATUS_LABELS = {
  new: 'New', contacted: 'Contacted', in_progress: 'In Progress',
  completed: 'Completed', cancelled: 'Cancelled'
};
const PAYMENT_LABELS = {
  pending: 'Pending', partial: 'Partial', paid: 'Paid'
};

/* ---------- Helpers ---------- */
function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return mins + ' min';
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + 'h';
  const days = Math.floor(hrs / 24);
  if (days < 30) return days + 'd';
  return Math.floor(days / 30) + 'mo';
}

function isOverdue(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date(new Date().toISOString().split('T')[0]);
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

let debounceTimer;
function debounce(fn, ms) {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(fn, ms);
}

/* ---------- Fetch ---------- */
async function fetchCustomers() {
  try {
    const { data, error } = await window.supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    customers = data || [];
  } catch (err) {
    console.error('Fetch error:', err);
    customers = [];
    tbody.innerHTML = '<tr><td colspan="9" class="empty-msg">Error connecting to Supabase. Check your configuration.</td></tr>';
    return;
  }
  renderStats();
  renderTable();
}

/* ---------- Stats ---------- */
function renderStats() {
  document.getElementById('stat-total').textContent = customers.length;
  document.getElementById('stat-new').textContent = customers.filter(c => c.status === 'new').length;
  document.getElementById('stat-progress').textContent = customers.filter(c => c.status === 'in_progress').length;
  document.getElementById('stat-paid').textContent = customers.filter(c => c.payment_status === 'paid').length;
  document.getElementById('customer-count').textContent = customers.length + ' customers';
}

/* ---------- Render table ---------- */
function renderTable() {
  const q = filters.search.toLowerCase();
  const filtered = customers.filter(c => {
    if (q && !(c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q))) return false;
    if (filters.status && c.status !== filters.status) return false;
    if (filters.payment && c.payment_status !== filters.payment) return false;
    return true;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" class="empty-msg">No results</td></tr>';
    return;
  }

  tbody.innerHTML = filtered.map(c => {
    const followClass = c.follow_up_date
      ? (isOverdue(c.follow_up_date) ? 'overdue' : 'upcoming')
      : '';

    return `<tr data-id="${c.id}">
      <td><strong>${esc(c.name)}</strong></td>
      <td>${esc(c.email)}</td>
      <td>${esc(c.phone || '—')}</td>
      <td>${PROJECT_LABELS[c.project_type] || c.project_type}</td>
      <td><span class="badge badge-${c.status}">${STATUS_LABELS[c.status] || c.status}</span></td>
      <td><span class="badge badge-${c.payment_status}">${PAYMENT_LABELS[c.payment_status] || c.payment_status}</span></td>
      <td><span class="follow-up ${followClass}">${formatDate(c.follow_up_date)}</span></td>
      <td title="${new Date(c.created_at).toLocaleString('en-US')}">${timeAgo(c.created_at)}</td>
      <td><button class="btn-edit" onclick="event.stopPropagation(); openModal('${c.id}')">EDIT</button></td>
    </tr>`;
  }).join('');

  // Row click = open modal
  tbody.querySelectorAll('tr[data-id]').forEach(row => {
    row.addEventListener('click', () => openModal(row.dataset.id));
  });
}

function esc(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/* ---------- Modal ---------- */
function openModal(id) {
  const c = customers.find(x => x.id === id);
  if (!c) return;

  modalTitle.textContent = 'Edit: ' + c.name;
  editForm.elements.id.value = c.id;
  editForm.elements.name.value = c.name;
  editForm.elements.email.value = c.email;
  editForm.elements.phone.value = c.phone || '';
  editForm.elements.project_type.value = c.project_type;
  editForm.elements.status.value = c.status;
  editForm.elements.payment_status.value = c.payment_status;
  editForm.elements.follow_up_date.value = c.follow_up_date || '';
  editForm.elements.notes.value = c.notes || '';

  btnDelete.style.display = '';
  overlay.classList.add('active');
}

function closeModal() {
  overlay.classList.remove('active');
  editForm.reset();
}

/* ---------- Save ---------- */
editForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(editForm);
  const id = fd.get('id');
  const data = {
    name: fd.get('name').trim(),
    email: fd.get('email').trim(),
    phone: fd.get('phone').trim() || null,
    project_type: fd.get('project_type'),
    status: fd.get('status'),
    payment_status: fd.get('payment_status'),
    follow_up_date: fd.get('follow_up_date') || null,
    notes: fd.get('notes').trim() || null
  };

  try {
    const { error } = await window.supabase
      .from('customers')
      .update(data)
      .eq('id', id);
    if (error) throw error;
    closeModal();
    await fetchCustomers();
  } catch (err) {
    console.error('Update error:', err);
    alert('Error saving: ' + err.message);
  }
});

/* ---------- Delete ---------- */
btnDelete.addEventListener('click', async () => {
  const id = editForm.elements.id.value;
  if (!confirm('Delete this customer? This cannot be undone.')) return;

  try {
    const { error } = await window.supabase
      .from('customers')
      .delete()
      .eq('id', id);
    if (error) throw error;
    closeModal();
    await fetchCustomers();
  } catch (err) {
    console.error('Delete error:', err);
    alert('Error deleting: ' + err.message);
  }
});

/* ---------- Filters ---------- */
searchInput.addEventListener('input', () => {
  debounce(() => {
    filters.search = searchInput.value;
    renderTable();
  }, 300);
});
filterStatus.addEventListener('change', () => {
  filters.status = filterStatus.value;
  renderTable();
});
filterPayment.addEventListener('change', () => {
  filters.payment = filterPayment.value;
  renderTable();
});

/* ---------- Other events ---------- */
document.getElementById('modal-close').addEventListener('click', closeModal);
overlay.addEventListener('click', (e) => {
  if (e.target === overlay) closeModal();
});
document.getElementById('btn-refresh').addEventListener('click', fetchCustomers);

/* ---------- Init ---------- */
if (window.supabase && window.supabase.from) {
  fetchCustomers();
} else {
  tbody.innerHTML = '<tr><td colspan="9" class="empty-msg">Configure Supabase in supabase-config.js to get started.</td></tr>';
}
