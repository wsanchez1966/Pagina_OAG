import { getCertificate } from './api/certificate.js'

/**
 * Get URL parameter by name
 * @param {string} name 
 * @returns {string|null}
 */
function getUrlParameter(name) {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get(name)
}

/**
 * Set element text content safely
 * @param {string} id 
 * @param {string} value 
 */
function setElementText(id, value) {
  const element = document.getElementById(id)
  if (element) {
    element.textContent = value || 'No disponible'
  }
}

/**
 * Display certificate information
 * @param {Object} certificate
 * @param {string} codigoArticulo - The article code from URL parameter
 */
function displayCertificate(certificate, codigoArticulo) {
  // Update page title and breadcrumb
  const productDescription = certificate.marca && certificate.modelo ? 
    `${certificate.marca} ${certificate.modelo}` : 
    certificate.numeroParte || 'Producto'
  
  document.title = `Certificado - ${productDescription} | OAGSA`
  setElementText('product-breadcrumb-title', `Certificado - ${productDescription}`)
  
  // Fill importador information
  setElementText('importador', certificate.importador)
  setElementText('cuit', certificate.cuit)
  setElementText('origen', certificate.origen)
  
  // Fill certificate information
  setElementText('numero-certificado', certificate.numeroCertificado)
  setElementText('organismo-emisor', certificate.organismoEmisor)
  
  // Fill product specifications
  setElementText('numero-parte', certificate.numeroParte)
  setElementText('marca', certificate.marca)
  setElementText('modelo', certificate.modelo)
  setElementText('medida', certificate.medida)
  setElementText('indice-carga', certificate.indiceCarga)
  setElementText('indice-velocidad', certificate.indiceVelocidad)
  
  // Handle product image
  const productImage = document.getElementById('product-image')
  const noImageDiv = document.getElementById('no-image')
  
  console.log('Certificate data:', certificate) // Debug log
  console.log('urlImagen:', certificate.urlImagen) // Debug log
  console.log('urlQR:', certificate.urlQR) // Debug log
  
  if (certificate.urlImagen && certificate.urlImagen.trim() !== '') {
    console.log('Product image URL from API:', certificate.urlImagen) // Debug log

    // Process image URL: replace backslashes with forward slashes
    let imageUrl = certificate.urlImagen.replace(/\\/g, '/')

    // Add protocol if not present
    if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
      // If URL starts with domain name, add https://www.
      if (imageUrl.startsWith('oagsa.com')) {
        imageUrl = 'https://www.' + imageUrl
      } else if (!imageUrl.startsWith('www.')) {
        // If it's a relative path, prepend the full domain
        imageUrl = 'https://www.oagsa.com/' + imageUrl.replace(/^\/+/, '')
      } else {
        imageUrl = 'https://' + imageUrl
      }
    }

    console.log('Processed product image URL:', imageUrl) // Debug log

    productImage.src = imageUrl
    productImage.alt = productDescription
    productImage.style.display = 'block'
    if (noImageDiv) {
      noImageDiv.style.display = 'none'
    }

    // Handle image load error
    productImage.onerror = function() {
      console.log('Error loading product image:', imageUrl) // Debug log
      productImage.style.display = 'none'
      if (noImageDiv) {
        noImageDiv.style.display = 'block'
      }
    }
  } else {
    // No product image available from API
    console.log('No product image URL from API') // Debug log
    productImage.style.display = 'none'
    if (noImageDiv) {
      noImageDiv.style.display = 'block'
    }
  }

  // Handle QR code image
  const qrImage = document.getElementById('qr-image')
  const noQrDiv = document.getElementById('no-qr')
  
  if (codigoArticulo) {
    // Generate QR code with the exact URL that was used to access this page
    const currentUrl = window.location.href
    const qrData = encodeURIComponent(currentUrl)
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrData}`
    
    console.log('QR will contain URL:', currentUrl) // Debug log
    console.log('Generated QR image URL:', qrImageUrl) // Debug log
    
    qrImage.src = qrImageUrl
    qrImage.alt = `Código QR - ${productDescription}`
    qrImage.style.display = 'block'
    if (noQrDiv) {
      noQrDiv.style.display = 'none'
    }
    
    // Handle QR image load error
    qrImage.onerror = function() {
      console.log('Error loading generated QR image:', qrImageUrl) // Debug log
      qrImage.style.display = 'none'
      if (noQrDiv) {
        noQrDiv.style.display = 'block'
      }
    }
  } else {
    // No article code available
    console.log('No article code available for QR generation') // Debug log
    qrImage.style.display = 'none'
    if (noQrDiv) {
      noQrDiv.style.display = 'block'
    }
  }
}

/**
 * Show loading state
 */
function showLoading() {
  const loading = document.getElementById('loading')
  const error = document.getElementById('error')
  const ficha = document.getElementById('ficha')
  
  if (loading) loading.style.display = 'block'
  if (error) error.style.display = 'none'
  if (ficha) ficha.style.display = 'none'
}

/**
 * Show error state
 * @param {string} codigo 
 */
function showError(codigo) {
  const loading = document.getElementById('loading')
  const error = document.getElementById('error')
  const ficha = document.getElementById('ficha')
  
  if (loading) loading.style.display = 'none'
  if (error) error.style.display = 'block'
  if (ficha) ficha.style.display = 'none'
  
  const errorCodeSpan = document.getElementById('error-code')
  if (errorCodeSpan) {
    errorCodeSpan.textContent = codigo || 'No especificado'
  }
}

/**
 * Show certificate
 */
function showCertificate() {
  const loading = document.getElementById('loading')
  const error = document.getElementById('error')
  const ficha = document.getElementById('ficha')
  
  if (loading) loading.style.display = 'none'
  if (error) error.style.display = 'none'
  if (ficha) ficha.style.display = 'block'
}

/**
 * Initialize certificate page
 */
async function initCertificatePage() {
  const productCode = getUrlParameter('codigo')
  
  if (!productCode) {
    showError('No se proporcionó código de producto')
    return
  }
  
  try {
    showLoading()
    
    // Get certificate data from API
    const certificate = await getCertificate(productCode)
    
    if (certificate) {
      displayCertificate(certificate, productCode)
      showCertificate()
    } else {
      showError(productCode)
    }
  } catch (error) {
    console.error('Error loading certificate:', error)
    showError(productCode)
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initCertificatePage()
})