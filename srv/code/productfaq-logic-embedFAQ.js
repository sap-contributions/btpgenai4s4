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
			request.reject(500, `Failed to retrieve the FAQ item ${productFAQID}`);
		}

		const { ID, issue, question, answer } = productFAQ;

		// Generate the embedding for the concatenated issue, question, and answer text
		let embedding;
		try {
			embedding = await generateEmbedding(request, `${issue} ${question} ${answer}`)
			//LOG.info("embedding", embedding);
		} catch (error) {
			LOG.error('Embedding service failed:', error.message);
			request.reject(500, 'Embedding service failed.');
		}

		try {
			// Update the ProductFAQ entry with the generated embedding
			await UPDATE('btpgenai4s4.ProductFAQ').set({ embedding: embedding }).where({ ID });
			LOG.info(`ProductFAQ with ID ${ID} updated with new embedding.`);
		} catch (error) {
			LOG.error('Failed to update the FAQ item', error.message);
			request.reject(500, `Failed to update the FAQ item ${ID}`);
		}

	} catch (error) {
		// Log the error and send a response with appropriate details
		LOG.error('Unexpected error occurred:', error.message || JSON.stringify(error));
		return error;
	}
}