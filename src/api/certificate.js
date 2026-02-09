import getDataFromDB from '../utils/getDataFromDB.js'

/**
 * @param {string} productCode
 * @returns {Object}
 */
export async function getCertificate(productCode) {
  const response = await getDataFromDB(`articulo/certificado?pCodigoArticulo=${productCode}`)
  const certificate = await response.data
  
  return certificate
}