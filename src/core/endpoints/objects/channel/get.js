/**       */

                                                     
import operationConstants from '../../../constants/operations';
                                                 
import utils from '../../../utils';

                                         
                  
              
                           
     
   

                                         
              
                        
   

const endpoint                                                                     = {
  getOperation: () => operationConstants.PNGetChannelMetadataOperation,

  validateParams: (_, params) => {
    if (!params?.channel) {
      return 'Channel cannot be empty';
    }
  },

  getURL: ({ config }, params) => `/v2/objects/${config.subscribeKey}/channels/${utils.encodeString(params.channel)}`,

  getRequestTimeout: ({ config }) => config.getTransactionTimeout(),

  isAuthSupported: () => true,

  prepareParams: (_, params) => ({
    include: (params?.include?.customFields ?? true) && 'custom',
  }),

  handleResponse: (_, response) => ({
    status: response.status,
    data: response.data,
  }),
};

export default endpoint;
