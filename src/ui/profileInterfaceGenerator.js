import {
  downloadFile,
  getNotas,
  getOrder,
  postPrepararNotasSeleccionadas,
} from '../api/profileInterfaceGenerator.js'
import { showToast } from '../utils/showToast.js'
import { formatDate } from '../utils/formatDate.js'
import { formatter } from '../utils/formatPrice.js'
import { downloadNotas } from '../utils/downloadPDF.js'
import { createModal, createOverlay, renderModalContent } from './modal.js'

const selectedNoteIds = new Set()

export function renderInterfaceGenerator(parentElement) {
  parentElement.innerHTML = ''

  const $container = document.createElement('div')
  $container.className = 'interface__generator__container'

  const $buttonList = document.createElement('button')
  $buttonList.className = 'button-sm bg-secondary-300 bg-hover-secondary-400'
  $buttonList.textContent = 'Actualizar Lista'
  $buttonList.addEventListener('click', async () => {
    selectedNoteIds.clear()
    const notes = await getNotas()
    renderNotesList(notes)
  })

  const $buttonPrepare = document.createElement('button')
  $buttonPrepare.className =
    'button-sm bg-error-400 bg-hover-error-300 text-white'
  $buttonPrepare.textContent = 'Generar Interfaces'
  $buttonPrepare.addEventListener('click', async () => {
    if (selectedNoteIds.size === 0) {
      showToast('Seleccione al menos una nota para generar interfaces', 'error')
      return
    }

    const allNotes = await getNotas()
    const selectedNotes = allNotes.filter((note) =>
      selectedNoteIds.has(note.id),
    )
    const notesTotal = selectedNotes.reduce(
      (total, note) => total + note.total,
      0,
    )

    await downloadNotas(selectedNotes, selectedNotes.length, notesTotal)
    await postPrepararNotasSeleccionadas([...selectedNoteIds])

    selectedNoteIds.clear()
    const updatedNotes = await getNotas()
    renderNotesList(updatedNotes)

    showToast('Interfaces generadas')
  })

  const $buttonDownload = document.createElement('button')
  $buttonDownload.className =
    'button-sm bg-success-400 text-white bg-hover-success'
  $buttonDownload.textContent = 'Descargar Última Interfaz'
  $buttonDownload.addEventListener('click', () => {
    downloadFile()
  })

  $container.appendChild($buttonList)
  $container.appendChild($buttonPrepare)
  $container.appendChild($buttonDownload)

  parentElement.appendChild($container)

  const $tableContainer = document.createElement('div')
  $tableContainer.className = 'table-container'

  parentElement.appendChild($tableContainer)

  // Auto-cargar notas al renderizar
  ;(async () => {
    const notes = await getNotas()
    renderNotesList(notes)
  })()
}

async function renderNotesList(notes) {
  const $tableContainer = document.querySelector('.table-container')
  $tableContainer.innerHTML = ''

  const $table = await createTable()
  $tableContainer.appendChild($table)

  await renderTableRows(notes, '#table-body')
}

async function createTable() {
  const table = document.createElement('table')
  table.classList.add('fl-table')
  table.innerHTML = `
  <thead>
    <tr>
      <th scope="col" class="note-select-col"><input type="checkbox" id="select-all-notes" title="Seleccionar todas" /></th>
      <th scope="col">#</th>
      <th scope="col">Cliente</th>
      <th scope="col" class="visually-hidden-mobile">Fecha</th>
      <th scope="col">Articulos</th>
      <th scope="col">Total</th>
      <th scope="col" class="visually-hidden-mobile">Estado</th>
    </tr>
  </thead>
  <tbody id="table-body">
  </tbody>
  `

  const selectAllCheckbox = table.querySelector('#select-all-notes')
  selectAllCheckbox.addEventListener('change', () => {
    const checkboxes = table.querySelectorAll('.note-checkbox')
    checkboxes.forEach((cb) => {
      cb.checked = selectAllCheckbox.checked
      const noteId = parseInt(cb.dataset.noteId, 10)
      if (selectAllCheckbox.checked) {
        selectedNoteIds.add(noteId)
      } else {
        selectedNoteIds.delete(noteId)
      }
    })
  })

  return table
}

async function renderTableRows(notes, parentElement) {
  const $tableBody = document.querySelector(parentElement)
  $tableBody.innerHTML = ''

  if (notes.length <= 0) {
    const row = document.createElement('tr')
    const paragraph = document.createElement('td')
    paragraph.setAttribute('colspan', '7')
    paragraph.textContent = 'No se encontraron resultados.'
    row.appendChild(paragraph)
    $tableBody.appendChild(row)
  } else {
    for await (const obj of notes) {
      const $row = await createRow(obj)
      $tableBody.appendChild($row)
    }

    const $totalRow = createTotalRow(notes)
    $tableBody.appendChild($totalRow)
  }
}

async function createRow(note) {
  const { id, idClient, clientName, date, items, total, status } = note
  const $row = document.createElement('tr')
  $row.className = 'orders__table__row'

  const isChecked = selectedNoteIds.has(id)

  $row.innerHTML = `
    <td class="note-select-col"><input type="checkbox" class="note-checkbox" data-note-id="${id}" ${isChecked ? 'checked' : ''} /></td>
    <td>${id}</td>
    <td>${idClient} - ${clientName}</td>
    <td class="visually-hidden-mobile">${formatDate(date.split('T')[0])}</td>
    <td class="text-end">${items}</td>
    <td class="text-end">${formatter.format(
      total < 0 ? total.toFixed(0) * -1 : total.toFixed(0),
    )}</td>
    <td class="visually-hidden-mobile">${status}</td>
  `

  const checkbox = $row.querySelector('.note-checkbox')
  checkbox.addEventListener('click', (e) => {
    e.stopPropagation()
  })
  checkbox.addEventListener('change', () => {
    if (checkbox.checked) {
      selectedNoteIds.add(id)
    } else {
      selectedNoteIds.delete(id)
    }
    syncSelectAll()
  })

  $row.addEventListener('click', async () => {
    const order = await getOrder(id)
    renderModal(order)
  })

  return $row
}

function syncSelectAll() {
  const selectAll = document.querySelector('#select-all-notes')
  if (!selectAll) return
  const allCheckboxes = document.querySelectorAll('.note-checkbox')
  const allChecked =
    allCheckboxes.length > 0 &&
    [...allCheckboxes].every((cb) => cb.checked)
  selectAll.checked = allChecked
}

async function renderModal(order) {
  if (document.querySelector('.modal')) {
    document.querySelector('.modal').remove()
    document.querySelector('.overlay').remove()
  }

  const $modal = await createModal()
  const $overlay = await createOverlay()
  const $profileInfo = document.querySelector('.profile-info')
  $profileInfo.appendChild($modal)
  $profileInfo.appendChild($overlay)

  renderModalContent(order)
}

function createTotalRow(notes) {
  const $row = document.createElement('tr')
  $row.className = 'total-row'

  $row.innerHTML = `
  <td></td>
  <td>Total</td>
  <td class="text-start">Notas: ${notes.length}</td>
  <td></td>
  <td></td>
  <td class="text-end">${formatter.format(
    notes.reduce((total, note) => total + note.total, 0).toFixed(0),
  )}</td>
  <td></td>
    `

  return $row
}
