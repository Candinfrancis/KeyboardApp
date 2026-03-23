# Sprint 2 Smoke Test Matrix

## Scope
- Dynamic key rendering from config rows
- Letter and word insertion
- Backspace, space, newline
- Shift and caps lock state
- Next keyboard and language switch controls

## Test Cases
| App/Field | Action | Expected Result |
|---|---|---|
| WhatsApp chat input | Press letter keys (, , c) | Characters append in order |
| WhatsApp chat input | Press macro (Hello) | Full word inserted |
| WhatsApp chat input | Press Shift then  | Uppercase A inserted; shift auto-resets |
| Gmail compose body | Toggle Caps, press ,  | AB inserted while caps lock is ON |
| Gmail compose body | Press Space and Newline | Space and line break inserted |
| Notes text input | Press Backspace repeatedly | Removes one character at a time; no crash at empty text |
| Browser textarea | Press Lang repeatedly | Active language indicator cycles EN/PT/ES |
| Browser textarea | Press Next KB | Next keyboard index increments; no crash |

## Non-Functional Checks
- Key press latency target: < 100ms average on reference devices.
- Orientation change while keyboard visible: no crash, state preserved or safely reset.
- App switch background/foreground: no crash; keyboard remains interactive.

## Devices
- Android emulator API 34+
- At least one physical Android device
