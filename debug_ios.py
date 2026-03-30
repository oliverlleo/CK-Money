from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    ctx = browser.new_context(
        user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
        viewport={"width": 375, "height": 812},
        has_touch=True,
        is_mobile=True
    )
    page = ctx.new_page()
    page.goto("http://localhost:3000")

    # check values
    print("isMobileDevice", page.evaluate("isMobileDevice()"))
    print("isStandaloneMode", page.evaluate("isStandaloneMode()"))
    print("wasBannerDismissed", page.evaluate("wasBannerDismissed()"))
    print("canShowBanner", page.evaluate("canShowBanner()"))
    print("isIOS", page.evaluate("isIOS()"))
    print("isSafariIOS", page.evaluate("isSafariIOS()"))

    ctx.close()
    browser.close()
