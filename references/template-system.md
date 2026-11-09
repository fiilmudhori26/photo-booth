# Photo Booth Template System - Design Reference

## Color Schemes by Template

### Boarding Pass
- Background: #FFFFFF, Accent: #7B1E2A (maroon), Ink: #7B1E2A

### Vintage Movie Ticket
- Background: #FFFFFF, Accent: #1E3A8A (blue), Border: #1E3A8A, Highlight: #EF4444

### Modern Graphic
- Background: #1E3A8A → #334155 gradient, Accent: #F59E0B, Ink: #FFFFFF

### Air Mail Postal
- Background: #F8FAFC, Accent: #B91C1C (red), Ink: #0F172A, Border: #B91C1C

### Theater Ticket
- Background: #7B1E2A (maroon), Accent: #FCD34D (gold), Ink: #FEFCE8

## Photo Slot Dimensions
- Standard slot: 300x225px (4:3 aspect)
- Gap: 20-24px between slots
- Canvas: 1200x1600px minimum for print quality

## Export Settings
- imageSmoothingEnabled: true
- imageSmoothingQuality: "high"
- JPEG quality: 0.95

## Pattern: Canvas Render Function Signature
`(ctx: CanvasRenderingContext2D, opts: TemplateRenderOptions, scale: number) => void`

Render order: background → graphics → photos → metadata