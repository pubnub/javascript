/**       */

                                                     
import operationConstants from '../../../constants/operations';
                                                 

                                            
                  
                                                  
                 
           
                  
                  
     
              
                         
                           
     
   

                                            
              
                          
                      
                
                
   

const endpoint                                                                           = {
  getOperation: () => operationConstants.PNGetAllChannelMetadataOperation,

  // No required parameters.
  validateParams: () => {},

  getURL: ({ config }) => `/v2/objects/${config.subscribeKey}/channels`,

  getRequestTimeout: ({ config }) => config.getTransactionTimeout(),

  isAuthSupported: () => true,

  prepareParams: (_modules, params) => {
    const queryParams = {};

    if (params?.include?.customFields) {
      queryParams.include = 'custom';
    }

    if (params?.include?.totalCount) {
      queryParams.count = params.include?.totalCount;
    }

    if (params?.page?.next) {
      queryParams.start = params.page?.next;
    }

    if (params?.page?.prev) {
      queryParams.end = params.page?.prev;
    }

    if (params?.filter) {
      queryParams.filter = params.filter;
    }

    queryParams.limit = params?.limit ?? 100;

    if (params?.sort) {
      queryParams.sort = Object.entries(params.sort ?? {}).map(([key, value]) => {
        if (value === 'asc' || value === 'desc') {
          return `${key}:${value}`;
        } else {
          return key;
        }
      });
    }

    return queryParams;
  },

  handleResponse: (_, response)                              => ({
    status: response.status,
    data: response.data,
    totalCount: response.totalCount,
    prev: response.prev,
    next: response.next,
  }),
};

export default endpoint;
