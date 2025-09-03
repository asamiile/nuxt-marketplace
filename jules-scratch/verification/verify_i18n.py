from playwright.sync_api import sync_playwright, Page, expect

def test_i18n(page: Page):
    """
    This test verifies that the i18n implementation is working correctly.
    It checks the default language (Japanese), then switches to English and
    verifies that the text has changed.
    """
    print("Starting verification script...")

    # 1. Go to the homepage.
    print("Navigating to http://localhost:3000/")
    page.goto("http://localhost:3000/", wait_until="networkidle")
    print("Navigation complete.")

    # 2. Wait for the content to load
    print("Waiting for initial content to load...")
    expect(
        page.get_by_role("heading", name="商品一覧").or_(page.get_by_text("商品はまだありません。"))
    ).to_be_visible(timeout=20000)
    print("Initial content loaded.")

    # 3. Take a screenshot of the Japanese page.
    print("Taking screenshot of Japanese page...")
    page.screenshot(path="jules-scratch/verification/verification_ja.png")
    print("Screenshot taken.")

    # 4. Assert that the Japanese heading is present.
    expect(page.get_by_role("heading", name="商品一覧")).to_be_visible()
    print("Japanese heading found.")

    # 5. Switch the language to English.
    print("Switching language to English...")
    page.get_by_role("combobox").select_option("en")
    print("Language switched.")
    page.wait_for_load_state('networkidle')


    # 6. Assert that the language has changed to English.
    print("Checking for English heading...")
    expect(page.get_by_role("heading", name="Product List")).to_be_visible()
    print("English heading found.")

    # 7. Take a screenshot of the English page.
    print("Taking screenshot of English page...")
    page.screenshot(path="jules-scratch/verification/verification_en.png")
    print("Screenshot taken.")

    print("Verification script finished.")

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        test_i18n(page)
        browser.close()

if __name__ == "__main__":
    main()
