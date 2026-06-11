const escapeHtml = (value) => {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const DEFAULT_COLUMNS = ['Pendientes', 'En progreso', 'Terminadas']
const DEFAULT_CARDS = ['Crear pruebas de caja negra HU2', 'HU03 Juliana']
const DEFAULT_DETAILS = [
  {label: 'Persona', value: 'nataliaflorezz7282@gmail.com'},
  {label: 'Fecha', value: '15 de junio'},
]
const DEFAULT_BUTTONS = ['+ Add board', '+ Add a group', '+ New']

function renderItems(items, className) {
  return items.map((item) => `<div class="${className}">${escapeHtml(item)}</div>`).join('')
}

function renderDetails(details) {
  return details.map((detail) => `
    <div class="CardDetail__property">
      <span class="CardDetail__label">${escapeHtml(detail.label)}:</span>
      <span class="CardDetail__value">${escapeHtml(detail.value)}</span>
    </div>
  `).join('')
}

function renderButtons(buttons) {
  return buttons.map((button) => `<button type="button">${escapeHtml(button)}</button>`).join('')
}

function mountMockWorkspace(doc, overrides = {}) {
  const columns = overrides.columns || DEFAULT_COLUMNS
  const cards = overrides.cards || DEFAULT_CARDS
  const details = overrides.details || DEFAULT_DETAILS
  const buttons = overrides.buttons || DEFAULT_BUTTONS
  const includeInput = overrides.includeInput !== false

  doc.body.innerHTML = `
    <main class="Workspace">
      <section class="Board">
        <div class="Columns">
          ${renderItems(columns, 'Column')}
        </div>
        <div class="Cards">
          ${renderItems(cards, 'Card')}
        </div>
      </section>
      <section class="CardDetail">
        <div class="CardDetail__title">${escapeHtml(cards[0] || 'Card detail')}</div>
        ${renderDetails(details)}
      </section>
      <section class="Workspace__actions">
        ${renderButtons(buttons)}
      </section>
      ${includeInput ? '<label class="Workspace__searchLabel" for="workspace-search">Search</label><input id="workspace-search" type="text" aria-label="workspace search" />' : ''}
    </main>
  `
}

module.exports = {
  DEFAULT_BUTTONS,
  DEFAULT_CARDS,
  DEFAULT_COLUMNS,
  DEFAULT_DETAILS,
  mountMockWorkspace,
}
