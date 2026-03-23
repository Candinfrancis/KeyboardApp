# Sprint 3 Smoke Test Matrix

## Scope
- Media helper keys (photo/audio)
- Consent and privacy UX
- Capability detection and fallback messaging

## Test Cases
| Platform | Target App | Field Type | Action | Expected |
|---|---|---|---|---|
| Android | WhatsApp | plainText | Photo key -> Gallery | Snippet inserted, fallback message shown |
| Android | Gmail | plainText | Audio key -> Pick file | Snippet inserted, fallback message shown |
| Android | Notes | richContent | Photo key -> Camera | Snippet inserted and "maybe direct image" guidance shown |
| iOS | Notes | plainText | Audio key -> Simulate record | Snippet inserted, iOS full-access guidance visible |
| iOS | Any | plainText | Media key without consent | Consent warning shown, no snippet inserted |

## Acceptance Checks
- Text key actions continue to insert reliably while media helpers are enabled.
- Media helpers never crash and always produce a deterministic snippet fallback.
- Unsupported direct-send scenarios are clearly communicated to the user.
