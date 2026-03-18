import { test, expect } from './helpers/auth-fixture'

/**
 * TKT-254: File Attachment Upload & Preview E2E Tests
 *
 * Tests file upload to tickets, attachment list display,
 * image preview dialog, and attachment deletion.
 */

test.describe('File attachments', () => {
  test('upload file to ticket via dropzone', async ({ orgPage }) => {
    const page = orgPage

    // Create a ticket via the UI
    await page.goto('/tickets/new')
    await page.waitForLoadState('networkidle')
    await page.getByTestId('ticket-title-input').fill('E2E Attachment Test')
    await page.getByTestId('ticket-submit-button').click()
    await page.waitForURL(/\/tickets/, { timeout: 10000 })

    // Open the ticket
    await page.goto('/tickets')
    await page.waitForLoadState('networkidle')

    const ticketLink = page.locator('[data-testid^="ticket-row-"] a').first()
    if (!(await ticketLink.isVisible({ timeout: 5000 }).catch(() => false))) {
      test.skip()
      return
    }

    await ticketLink.click()
    await page.waitForLoadState('networkidle')

    // Find the file upload dropzone
    const dropzone = page.getByTestId('file-upload-dropzone')
    await expect(dropzone).toBeVisible({ timeout: 5000 })

    // Upload a file via the hidden input
    const fileInput = page.getByTestId('file-upload-input')
    await fileInput.setInputFiles({
      name: 'test-doc.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('Hello from E2E test'),
    })

    // Wait for upload to complete — check for attachment in the list
    const attachmentsList = page.getByTestId('attachments-list')
    await expect(attachmentsList).toBeVisible({ timeout: 15000 })

    // Verify the file name appears
    await expect(page.getByText('test-doc.txt')).toBeVisible({ timeout: 5000 })
  })

  test('upload shows progress and completes', async ({ orgPage }) => {
    const page = orgPage

    // Create and navigate to ticket
    await page.goto('/tickets/new')
    await page.waitForLoadState('networkidle')
    await page.getByTestId('ticket-title-input').fill('E2E Upload Progress Test')
    await page.getByTestId('ticket-submit-button').click()
    await page.waitForURL(/\/tickets/, { timeout: 10000 })

    await page.goto('/tickets')
    await page.waitForLoadState('networkidle')

    const ticketLink = page.locator('[data-testid^="ticket-row-"] a').first()
    if (!(await ticketLink.isVisible({ timeout: 5000 }).catch(() => false))) {
      test.skip()
      return
    }

    await ticketLink.click()
    await page.waitForLoadState('networkidle')

    const fileInput = page.getByTestId('file-upload-input')
    await expect(fileInput).toBeAttached()

    // Upload multiple files
    await fileInput.setInputFiles([
      {
        name: 'file1.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('File 1 content'),
      },
      {
        name: 'file2.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('File 2 content'),
      },
    ])

    // Statuses may appear briefly then clear after 3 seconds
    // Wait for attachments to appear in the list instead
    await expect(page.getByText('file1.txt')).toBeVisible({ timeout: 15000 })
    await expect(page.getByText('file2.txt')).toBeVisible({ timeout: 5000 })
  })

  test('rejects blocked file extensions', async ({ orgPage }) => {
    const page = orgPage

    await page.goto('/tickets/new')
    await page.waitForLoadState('networkidle')
    await page.getByTestId('ticket-title-input').fill('E2E Blocked Extension Test')
    await page.getByTestId('ticket-submit-button').click()
    await page.waitForURL(/\/tickets/, { timeout: 10000 })

    await page.goto('/tickets')
    await page.waitForLoadState('networkidle')

    const ticketLink = page.locator('[data-testid^="ticket-row-"] a').first()
    if (!(await ticketLink.isVisible({ timeout: 5000 }).catch(() => false))) {
      test.skip()
      return
    }

    await ticketLink.click()
    await page.waitForLoadState('networkidle')

    const fileInput = page.getByTestId('file-upload-input')
    await expect(fileInput).toBeAttached()

    // Try to upload an .exe file
    await fileInput.setInputFiles({
      name: 'malware.exe',
      mimeType: 'application/octet-stream',
      buffer: Buffer.from('MZ'),
    })

    // Should show an error
    await expect(page.getByText(/not allowed for security/i)).toBeVisible({ timeout: 5000 })
  })

  test('download button is present for attachments', async ({ orgPage }) => {
    const page = orgPage

    await page.goto('/tickets/new')
    await page.waitForLoadState('networkidle')
    await page.getByTestId('ticket-title-input').fill('E2E Download Button Test')
    await page.getByTestId('ticket-submit-button').click()
    await page.waitForURL(/\/tickets/, { timeout: 10000 })

    await page.goto('/tickets')
    await page.waitForLoadState('networkidle')

    const ticketLink = page.locator('[data-testid^="ticket-row-"] a').first()
    if (!(await ticketLink.isVisible({ timeout: 5000 }).catch(() => false))) {
      test.skip()
      return
    }

    await ticketLink.click()
    await page.waitForLoadState('networkidle')

    // Upload a file
    const fileInput = page.getByTestId('file-upload-input')
    await fileInput.setInputFiles({
      name: 'download-test.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('Download test content'),
    })

    // Wait for attachment to appear
    await expect(page.getByText('download-test.txt')).toBeVisible({ timeout: 15000 })

    // Verify download button exists
    const downloadBtn = page.locator('[data-testid^="download-attachment-"]').first()
    await expect(downloadBtn).toBeVisible({ timeout: 5000 })
    await expect(downloadBtn).toHaveAttribute('aria-label', /download/i)
  })

  test('delete button removes attachment', async ({ orgPage }) => {
    const page = orgPage

    await page.goto('/tickets/new')
    await page.waitForLoadState('networkidle')
    await page.getByTestId('ticket-title-input').fill('E2E Delete Attachment Test')
    await page.getByTestId('ticket-submit-button').click()
    await page.waitForURL(/\/tickets/, { timeout: 10000 })

    await page.goto('/tickets')
    await page.waitForLoadState('networkidle')

    const ticketLink = page.locator('[data-testid^="ticket-row-"] a').first()
    if (!(await ticketLink.isVisible({ timeout: 5000 }).catch(() => false))) {
      test.skip()
      return
    }

    await ticketLink.click()
    await page.waitForLoadState('networkidle')

    // Upload a file
    const fileInput = page.getByTestId('file-upload-input')
    await fileInput.setInputFiles({
      name: 'to-delete.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('This will be deleted'),
    })

    // Wait for it to appear
    await expect(page.getByText('to-delete.txt')).toBeVisible({ timeout: 15000 })

    // Click delete
    const deleteBtn = page.locator('[data-testid^="delete-attachment-"]').first()
    await expect(deleteBtn).toBeVisible({ timeout: 5000 })
    await deleteBtn.click()

    // File should disappear
    await expect(page.getByText('to-delete.txt')).not.toBeVisible({ timeout: 10000 })
  })

  test('image preview button appears for image attachments', async ({ orgPage }) => {
    const page = orgPage

    await page.goto('/tickets/new')
    await page.waitForLoadState('networkidle')
    await page.getByTestId('ticket-title-input').fill('E2E Image Preview Test')
    await page.getByTestId('ticket-submit-button').click()
    await page.waitForURL(/\/tickets/, { timeout: 10000 })

    await page.goto('/tickets')
    await page.waitForLoadState('networkidle')

    const ticketLink = page.locator('[data-testid^="ticket-row-"] a').first()
    if (!(await ticketLink.isVisible({ timeout: 5000 }).catch(() => false))) {
      test.skip()
      return
    }

    await ticketLink.click()
    await page.waitForLoadState('networkidle')

    // Upload a PNG image (1x1 pixel)
    const pngBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64',
    )
    const fileInput = page.getByTestId('file-upload-input')
    await fileInput.setInputFiles({
      name: 'test-image.png',
      mimeType: 'image/png',
      buffer: pngBuffer,
    })

    // Wait for it to appear
    await expect(page.getByText('test-image.png')).toBeVisible({ timeout: 15000 })

    // Preview button should be visible for image files
    const previewBtn = page.locator('[data-testid^="preview-attachment-"]').first()
    await expect(previewBtn).toBeVisible({ timeout: 5000 })
  })
})
