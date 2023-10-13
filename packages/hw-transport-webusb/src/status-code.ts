export enum Status {
  /**
   * Hardware wallet status code
   */
  RSP_SUCCESS_CODE = 0x00000000, // Response success code
  RSP_FAILURE_CODE,              // Response failure code
  // Resolve UR response status
  PRS_PARSING_REJECTED,
  PRS_PARSING_ERROR,
  PRS_PARSING_DISALLOWED,
  PRS_UNSUPPORTED_CHAIN,
  PRS_EXPORT_ADDRESS_INVALID_PARAMS,
  /**
   * Client status code
   */
  ERR_DEVICE_NOT_OPENED = 0xA0000001,
  ERR_DEVICE_NOT_FOUND,
  ERR_RESPONSE_STATUS_NOT_OK,
  ERR_TIMEOUT,
  ERR_DATA_TOO_LARGE,

  RSP_MAX_VALUE = 0xFFFFFFFF,
}