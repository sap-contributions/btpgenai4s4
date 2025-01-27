const cds = require('@sap/cds');
const LOG = cds.log('GenAI');
const { generateEmbedding } = require('./genai/embedding');

/**
 * 
 * @After(event = { "CREATE","UPDATE" }, entity = "btpgenai4s4Srv.ProductFAQ")
 * @param {(Object|Object[])} results - For the After phase only: the results of the event processing
 * @param {Object} request - User information, tenant-specific CDS model, headers and query parameters
*/
module.exports = async function (results, request) {
	try {
		// Extract the ProductFAQ ID from the request data
		const productFAQID = request.data.ID;
		if (!productFAQID) {
			request.reject(400, 'ProductFAQ ID is missing.');
		}

		let productFAQ;
		try {
			// Fetch the specific ProductFAQ entry for update
			productFAQ = await SELECT.one('btpgenai4s4.ProductFAQ').where({ ID: productFAQID }).forUpdate();
			if (!productFAQ) {
				request.reject(404, `ProductFAQ with ID ${productFAQID} not found.`);
			}
		} catch (error) {
			LOG.error('Failed to retrieve the FAQ item', error.message);
			request.reject({ code: 500, message: `Failed to retrieve the FAQ item ${productFAQID}`, target: 'ProductFAQ' });
		}

		const { ID, issue, question, answer } = productFAQ;

		// Generate the embedding for the concatenated issue, question, and answer text
		let embedding;
		try {
			embedding = await generateEmbedding(request, `${issue} ${question} ${answer}`)
			LOG.info("embedding", embedding);
		} catch (error) {
			LOG.error('Embedding service failed:', error.message);
			request.reject({ code: 500, message: 'Embedding service failed.', target: 'ProductFAQ' });
		}

		try {
			// Update the ProductFAQ entry with the generated embedding
			await UPDATE('btpgenai4s4.ProductFAQ').set({ embedding: embedding }).where({ ID });
			LOG.info(`ProductFAQ with ID ${ID} updated with new embedding.`);
		} catch (error) {
			LOG.error('Failed to update the FAQ item', error.message);
			request.reject({ code: 500, message: `Failed to update the FAQ item ${ID}`, target: 'ProductFAQ' });
		}

	} catch (error) {
		// Log the error and send a response with appropriate details
		LOG.error('An error occurred:', error.message);
		return error;
	}
}