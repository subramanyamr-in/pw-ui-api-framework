import { test, expect } from '@fixtures';
import { TableComponent, ModalComponent, FormComponent, NotificationComponent } from '@components';

test.describe('Component-Driven POM & Fixtures Verification @smoke', () => {
  test('Unified fixture injects UI, API, and DB capabilities cleanly @smoke', async ({
    basePage,
    http,
    db,
    userRepo,
  }) => {
    expect(basePage).toBeDefined();
    expect(http).toBeDefined();
    expect(db).toBeDefined();
    expect(userRepo).toBeDefined();
  });

  test('BasePage provides URL resolution and navigation @smoke', async ({ basePage }) => {
    await basePage.navigate('/');
    const title = await basePage.getTitle();
    expect(typeof title).toBe('string');
  });

  test('Component primitives instantiate correctly with scoped locators @smoke', async ({
    page,
  }) => {
    // Verify component contracts on synthetic DOM elements
    await page.setContent(`
      <div id="table-container">
        <table>
          <thead><tr><th>Name</th><th>Role</th></tr></thead>
          <tbody>
            <tr><td>Dr. Smith</td><td>Optometrist</td></tr>
            <tr><td>Dr. Jones</td><td>Ophthalmologist</td></tr>
          </tbody>
        </table>
      </div>
      <div id="modal-container" style="display: block;">
        <h2 class="modal-title">Confirm Appointment</h2>
        <div class="modal-body">Are you sure?</div>
        <button class="btn-primary" type="submit">Confirm</button>
      </div>
      <form id="sample-form">
        <input name="email" value="test@eyecare.com" />
        <button type="submit">Save</button>
      </form>
      <div class="toast success" role="alert">
        <span class="toast-message">Record saved successfully!</span>
      </div>
    `);

    const table = new TableComponent(page.locator('#table-container'));
    const headers = await table.getHeaderNames();
    expect(headers).toEqual(['Name', 'Role']);
    expect(await table.getRowCount()).toBe(2);
    expect(await table.getCellText(0, 0)).toBe('Dr. Smith');

    const modal = new ModalComponent(page.locator('#modal-container'));
    expect(await modal.getTitle()).toBe('Confirm Appointment');

    const form = new FormComponent(page.locator('#sample-form'));
    await form.fillField('email', 'updated@eyecare.com');

    const notification = new NotificationComponent(page.locator('.toast'));
    expect(await notification.getMessage()).toContain('Record saved successfully!');
    expect(await notification.getType()).toBe('success');
  });
});
