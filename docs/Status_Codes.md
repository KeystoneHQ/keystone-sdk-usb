# EAPDU Status Codes Documentation

This document provides a detailed breakdown of the status codes.

| Status Code | Hexadecimal Value | Description |
| ----------- | ----------------- | ----------- |
| RSP_SUCCESS_CODE | 0x00000000 | Response success code. Indicates the operation was successful. |
| RSP_FAILURE_CODE |  | Response failure code. Indicates the operation failed. |
| PRS_PARSING_REJECTED |  | Indicates the UR parsing was rejected. |
| PRS_PARSING_ERROR |  | Indicates an error occurred while parsing the UR. |
| PRS_PARSING_DISALLOWED |  | Indicates the UR parsing was disallowed. |
| ERR_DEVICE_NOT_OPENED | 0xA0000001 | Error code indicating the device is not opened. |
| ERR_RESPONSE_STATUS_NOT_OK |  | Error code indicating the response status was not OK. |
| ERR_TIMEOUT |  | Error code indicating a timeout occurred. |
| ERR_DATA_TOO_LARGE |  | Error code indicating the data was too large to handle. |
| RSP_MAX_VALUE | 0xFFFFFFFF | Maximum value for the response code. |
