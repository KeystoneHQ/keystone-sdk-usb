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
| Lc | 2 | Represents the length of the data in the current frame. |
| Data | Remaining Bytes | The data to be transmitted. |

Please note that the request frame does not include a status field. 

## Response Frame Structure

The structure of the response frame has an additional field for the status of the request. This is different from the request frame and it is important to note that the status field is unique to the response frame. The response frame structure is as follows:

| Field | Size (Bytes) | Description |
| ----- | ------------ | ----------- |
| CLA | 1 | Identifies the protocol type. |
| INS | 2 | Represents the command. |
| P1 | 2 | The total number of packages in the response. |
| P2 | 2 | The index of the current package in the response. |
| Lc | 2 | Represents the length of the data in the current frame. |
| Data | Varies | The data being returned. |
| Status | 2 | The status of the request. The last two bytes of the response frame represent this status. |

The size of the data field in the response will depend on the number of bytes left after accounting for the other fields in the protocol. The inclusion of the status field in the response frame is a key characteristic of the EAPDU protocol.