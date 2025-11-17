# Data Model: Public Welfare Service Assistant Portal

## Overview
Static content-driven data model powering the React experience. Focus on representing service guidance, supporting documents, and navigation categories with accessibility metadata.

## Entities

### 1. ServiceGuidance
- **Description**: Represents a welfare service or complaint workflow surfaced through chatbot or browsing.
- **Fields**:
  - `id` (string, slugified unique identifier)
  - `title` (string, public-facing name)
  - `summary` (string, 1–2 sentence overview)
  - `categories` (array\<CategoryRef\>) — primary life-event tags
  - `eligibilityHighlights` (array\<string\>)
  - `onlineSteps` (array\<StepBlock\>)
  - `offlineSteps` (array\<StepBlock\>)
  - `documentChecklist` (array\<DocumentRequirementRef\>)
  - `supportChannels` (array\<SupportChannelRef\>)
  - `lastReviewed` (date, optional)
  - `notes` (string, optional clarifications shown on detail view)
- **Validation**:
  - Must have at least one category.
  - Online or offline steps must include at least one actionable step (cannot both be empty).
  - Document checklist entries must reference existing DocumentRequirement records.
  - Summary limited to ≤ 240 characters for card layout readability.

### 2. Category
- **Description**: Life-event grouping displayed on Home cards.
- **Fields**:
  - `id` (string)
  - `title` (string)
  - `icon` (string, optional icon key)
  - `description` (string, optional supporting copy)
  - `primaryColor` (string, defaults to sky-blue token variations)
  - `serviceIds` (array\<ServiceGuidance.id\>)
- **Validation**:
  - `serviceIds` array must contain at least one service.
  - Icon references must map to accessible SVG assets with descriptive titles.

### 3. DocumentRequirement
- **Description**: Represents an individual document necessary for service completion.
- **Fields**:
  - `id` (string)
  - `name` (string)
  - `issuingAuthority` (string)
  - `purpose` (string, optional)
  - `availableFormats` (array\<`"download"` | `"in-person"` | `"copy"`\>)
  - `downloadUrl` (string, optional)
  - `fee` (string, optional textual amount)
  - `validityPeriod` (string, optional)
  - `preparationNotes` (string, optional)
- **Validation**:
  - If `availableFormats` includes `"download"`, `downloadUrl` must be present and HTTPS.
  - Fees must specify currency units (₩) when provided.

### 4. SupportChannel
- **Description**: Contact or physical location that helps users complete offline steps.
- **Fields**:
  - `id` (string)
  - `type` (`"office"` | `"call-center"` | `"online-portal"`)
  - `name` (string)
  - `address` (string, required for `office`)
  - `hours` (string)
  - `contact` (string, phone/email/URL)
  - `appointmentRequired` (boolean)
  - `notes` (string, optional)
- **Validation**:
  - `office` entries must include address and hours.
  - `online-portal` entries must supply accessible link text paired with URL.

### 5. StepBlock (Value Object)
- **Description**: Ordered instruction step for either online or offline flows.
- **Fields**:
  - `title` (string)
  - `description` (string, supports markdown for emphasis)
  - `requiredDocuments` (array\<DocumentRequirementRef\>, optional)
  - `estimatedTime` (string, optional)
- **Validation**:
  - Steps referencing documents must ensure those requirements appear in parent `documentChecklist`.

### 6. DocumentRequirementRef / SupportChannelRef / CategoryRef
- **Description**: Lightweight references used inside ServiceGuidance arrays.
- **Fields**:
  - `id` (string)
  - `displayLabel` (string, optional override for UI)

## Relationships
- `Category` 1—N `ServiceGuidance`
- `ServiceGuidance` N—N `DocumentRequirement` (through references)
- `ServiceGuidance` N—N `SupportChannel`
- `StepBlock` references 0—N `DocumentRequirement`

## State & Lifecycle
- **Draft → Reviewed → Published** lifecycle managed outside UI; front-end only consumes Published content.
- `lastReviewed` timestamp informs “Information verified on” badge to build trust.

## Accessibility Metadata
- Each `Category` and `ServiceGuidance` should expose aria-labels derived from `title`.
- `DocumentRequirement` entries include `downloadUrl` plus descriptive link text for screen readers.

## Sample Data Count (Phase Scope)
- 3 Categories (e.g., Senior Support, Childcare, Housing Assistance)
- 6–9 ServiceGuidance entries (2–3 per category) to demonstrate breadth.
- 5–7 DocumentRequirement templates reused across services (e.g., ID card copy, income certificate).
