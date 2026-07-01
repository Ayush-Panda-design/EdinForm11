# Security Policy & Improvements

## Security Fixes Applied (v2.1)

### Critical
| # | Issue | Fix |
|---|-------|-----|
| 1 | **XSS via localStorage token** | JWT token moved from `localStorage` to `httpOnly` cookie. A non-sensitive session indicator cookie remains for UI state. |
| 2 | **No CSRF protection** | Added `csrfMiddleware` (double-submit / custom header check) on all state-changing routes |
| 3 | **No security headers** | Added `helmet()` with HSTS, CSP, X-Frame-Options, X-Content-Type-Options |
| 4 | **Request size not limited** | `express.json({ limit: "512kb" })` — down from the unguarded 2 MB |

### High
| # | Issue | Fix |
|---|-------|-----|
| 5 | **No email verification** | `verifyEmail` + `resendVerification` tRPC endpoints; token stored in `verificationTokensTable` |
| 6 | **No password reset** | `forgotPassword` + `resetPassword` tRPC endpoints; time-limited tokens; all sessions invalidated on reset |
| 7 | **No field existence check** | `submitResponse` now verifies every submitted `fieldId` belongs to the target form |
| 8 | **No answer type validation** | `submitResponse` validates array vs scalar answers match field type |
| 9 | **No duplicate submission prevention** | `checkDuplicateSubmission()` called when `allowMultipleResponses = false` |
| 10 | **No request logging** | `requestLogger` middleware logs method, path, status, latency, IP |

### Medium
| # | Issue | Fix |
|---|-------|-----|
| 11 | **No soft deletes** | Forms now soft-deleted via `deletedAt`; `restoreForm()` and `permanentlyDeleteForm()` added |
| 12 | **No audit logging** | `auditLogsTable` + `AuditService` — records user, action, entity, before/after values |
| 13 | **Pagination limit not enforced** | `paginationSchema` max `limit` = 100; answer arrays capped |
| 14 | **Input length not capped** | Answer `value` max 10,000 chars; `valueArray` max 50 items |

## Recommended Next Steps

- [ ] Migrate frontend fully to cookie-based auth (update tRPC client to use `credentials: "include"` and drop Bearer header)
- [ ] Add 2FA (TOTP via `otpauth` package)
- [ ] Encrypt sensitive form responses at rest (pg-crypto extension or application-level AES)
- [ ] Add GDPR data export + deletion endpoints
- [ ] Add `SameSite=Strict` + `Secure` to the session cookie
- [ ] Add per-user rate limiting (not just per-IP)
- [ ] Set up automated SAST scanning (SonarQube or Snyk CI)

## Reporting Vulnerabilities

Please report security vulnerabilities privately via email rather than opening a public issue.
