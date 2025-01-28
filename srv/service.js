/**
 * Code is auto-generated by Application Logic, DO NOT EDIT.
 * @version(2.0)
 */
const LCAPApplicationService = require('@sap/low-code-event-handler');
const customermessage_Logic_PreprocessMessages = require('./code/customermessage-logic-preprocessMessages');
const reportmessage_Logic_AfterCreate = require('./code/reportmessage-logic-afterCreate');
const productfaq_Logic_EmbedFAQ = require('./code/productfaq-logic-embedFAQ');
const customermessage_Logic_GenerateReply = require('./code/customermessage-logic-generateReply');
const customermessage_Logic_MaintainSO = require('./code/customermessage-logic-maintainSO');
const reportmessage_Logic_AfterRead = require('./code/reportmessage-logic-afterRead');
const reportmessage_Logic_BeforeCreate = require('./code/reportmessage-logic-beforeCreate');

class btpgenai4s4Srv extends LCAPApplicationService {
    async init() {

        this.before('READ', 'CustomerMessages', async (request) => {
            await customermessage_Logic_PreprocessMessages(request);
        });

        this.after('CREATE', 'ReportMessage', async (results, request) => {
            await reportmessage_Logic_AfterCreate(results, request);
        });

        this.after(['CREATE', 'UPDATE'], 'ProductFAQ', async (results, request) => {
            await productfaq_Logic_EmbedFAQ(results, request);
        });

        this.on('Action1', 'CustomerMessages', async (request, next) => {
            return customermessage_Logic_GenerateReply(request);
        });

        this.on('Action2', 'CustomerMessages', async (request, next) => {
            return customermessage_Logic_MaintainSO(request);
        });

        this.after('READ', 'ReportMessage', async (results, request) => {
            await reportmessage_Logic_AfterRead(results, request);
        });

        this.before('CREATE', 'ReportMessage', async (request) => {
            await reportmessage_Logic_BeforeCreate(request);
        });

        return super.init();
    }
}


module.exports = {
    btpgenai4s4Srv
};