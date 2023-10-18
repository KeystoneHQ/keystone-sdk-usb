# EAPDU Commands Documentation: Eth Class
| Command | Method | Parameters | Return Type | Description |
| --- | --- | --- | --- | --- |
| CMD_RESOLVE_UR | `signTransactionFromUr(urString: string)` | `urString` (string): A string representing the UR to be resolved. | `Promise<SignTransactionFromUrResponse>` | This command is used to resolve a UR (Uniform Resource). |
| CMD_CHECK_LOCK_STATUS (Check Lock Status Command) | `checkLockStatus()` | None | `Promise<CheckLockStatusResponse>` | This command is used to check the lock status of the device. |
| CMD_EXPORT_ADDRESS | `exportAddress` | `ExportAddressResponse` | `Promise<ExportAddressesResponse>` | This command is used to extraction of the public key from the device. |

