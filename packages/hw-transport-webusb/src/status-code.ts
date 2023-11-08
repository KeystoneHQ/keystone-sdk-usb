export enum Status {
  /**
   * Hardware wallet status code
   */
  RSP_SUCCESS_CODE = 0x00000000,      // Response success code
  RSP_FAILURE_CODE,                   // Response failure code
  PRS_INVALID_TOTAL_PACKETS,          // Invalid total packets
  PRS_INVALID_INDEX,                  // Invalid index
  // Resolve UR response status
  PRS_PARSING_REJECTED,               // Parsing rejected
  PRS_PARSING_ERROR,                  // Parsing error
  PRS_PARSING_DISALLOWED,             // Parsing disallowed
  PRS_PARSING_UNMATCHED,
  PRS_EXPORT_ADDRESS_UNSUPPORTED_CHAIN,
  PRS_EXPORT_ADDRESS_INVALID_PARAMS,
  PRS_EXPORT_ADDRESS_ERROR,
  PRS_EXPORT_ADDRESS_DISALLOWED,
  /**
   * Client status code
   */
  ERR_DEVICE_NOT_OPENED = 0xA0000001,
  ERR_DEVICE_NOT_FOUND,
  ERR_RESPONSE_STATUS_NOT_OK,
  ERR_TIMEOUT,
  ERR_DATA_TOO_LARGE,
  ERR_NOT_SUPPORTED,

  RSP_MAX_VALUE = 0xFFFFFFFF,
}