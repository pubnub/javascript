/**       */

                                                     
import operationConstants from '../../../constants/operations';
                                           
import utils from '../../../utils';

                                      
                
              
                           
     
   

                                      
              
                     
   

const endpoint                                                               = {
  getOperation: () => operationConstants.PNGetUUIDMetadataOperation,

  // No required parameters.
  validateParams: () => {},

  getURL: ({ config }, params) => `/v2/objects/${config.subscribeKey}/uuids/${utils.encodeString(params?.uuid ?? config.getUUID())}`,

  getRequestTimeout: ({ config }) => config.getTransactionTimeout(),

  isAuthSupported: () => true,

  prepareParams: ({ config }, params) => ({
    uuid: params?.uuid ?? config.getUUID(),
    include: (params?.include?.customFields ?? true) && 'custom',
  }),

  handleResponse: (_, response) => ({
    status: response.status,
    data: response.data,
  }),
};

export default endpoint;
