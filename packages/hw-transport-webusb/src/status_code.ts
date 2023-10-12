export enum Status {
  RSP_SUCCESS_CODE = 0x00000000, // Response success code
  RSP_FAILURE_CODE,              // Response failure code
  // Resolve UR response status
  PRS_PARSING_REJECTED,
  PRS_PARSING_ERROR,
  PRS_PARSING_DISALLOWED,
  RSP_MAX_VALUE = 0xFFFFFFFF,
}