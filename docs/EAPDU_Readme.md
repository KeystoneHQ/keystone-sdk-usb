# EAPDU Protocol README

The EAPDU (Extended Application Protocol Data Unit) is a protocol that extends the APDU (Application Protocol Data Unit). It's important to note that EAPDU is not compatible with the APDU protocol. 

## Request Frame Structure

Below is a breakdown of the EAPDU request frame structure:

| Field | Size (Bytes) | Description |
| ----- | ------------ | ----------- |
| CLA | 1 | Identifies the protocol type. For the EAPDU protocol, the CLA is `0x00`. |
| INS | 2 | Represents the command. |
| P1 | 2 | The total number of packages requested. Due to the frame limit of 64 bytes, data may need to be split across multiple packages. |
| P2 | 2 | The index of the current package. |
| Lc (RequestID) | 2 | Acts as a unique identifier for the request, passed in by the sender. |
| Data | Remaining Bytes | The data to be transmitted. |

Please note that the request frame does not include a status field. 

## Response Frame Structure

The structure of the response frame has an additional field for the status of the request. This is different from the request frame and it is important to note that the status field is unique to the response frame. In addition, the 'Lc' in the response frame is the 'RequestID' that remains consistent with the request frame, signifying the unique identifier for the request. The response frame structure is as follows:

| Field | Size (Bytes) | Description |
| ----- | ------------ | ----------- |
| CLA | 1 | Identifies the protocol type. |
| INS | 2 | Represents the command. |
| P1 | 2 | The total number of packages in the response. |
| P2 | 2 | The index of the current package in the response. |
| Lc (RequestID) | 2 | Returns the unique identifier for the request, matching the RequestID in the request frame. |
| Data | Varies | The data being returned. |
| Status | 2 | The status of the request. The last two bytes of the response frame represent this status. |

The size of the data field in the response will depend on the number of bytes left after accounting for the other fields in the protocol. The inclusion of the status field and the consistency of the RequestID field in both request and response frames are key characteristics of the EAPDU protocol.