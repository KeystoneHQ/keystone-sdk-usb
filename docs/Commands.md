# EAPDU Commands Documentation: Eth Class

| Command | Method | Parameters | Return Type | Description |
| ------- | ------ | ---------- | ----------- | ----------- |
| CMD_RESOLVE_UR | `signTransactionFromUr(urString: string)` | `urString` (string): A string representing the UR to be resolved. | `Promise<SignTransactionFromUrResponse>` | This command is used to resolve a UR (Uniform Resource). |
| CMD_CHECK_LOCK_STATUS (Check Lock Status Command) | `checkLockStatus()` | None | `Promise<CheckLockStatusResponse>` | This command is used to check the lock status of the device. |

## Types

### SignTransactionFromUrResponse

```typescript
type SignTransactionFromUrResponse = { payload: string; };
```

The response from the `signTransactionFromUr` method. Contains a string payload which represents the resolved UR.

### CheckLockStatusResponse

```typescript
type CheckLockStatusResponse = { payload: boolean; };
```

The response from the `checkLockStatus` method. Contains a boolean payload which represents the lock status of the device. `true` indicates the device is locked, while `false` indicates it is unlocked.