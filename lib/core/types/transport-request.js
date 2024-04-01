/**
 * Enum representing possible transport methods for HTTP requests.
 *
 * @enum {number}
 */
export var TransportMethod;
(function (TransportMethod) {
    /**
     * Request will be sent using `GET` method.
     */
    TransportMethod["GET"] = "GET";
    /**
     * Request will be sent using `POST` method.
     */
    TransportMethod["POST"] = "POST";
    /**
     * Request will be sent using `PATCH` method.
     */
    TransportMethod["PATCH"] = "PATCH";
    /**
     * Request will be sent using `DELETE` method.
     */
    TransportMethod["DELETE"] = "DELETE";
    /**
     * Local request.
     *
     * Request won't be sent to the service and probably used to compute URL.
     */
    TransportMethod["LOCAL"] = "LOCAL";
})(TransportMethod || (TransportMethod = {}));
