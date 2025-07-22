# Changelog

## [1.8.0](https://github.com/ibobdb/sasuai-desktop/compare/v1.7.0...v1.8.0) (2025-07-22)


### Features

* **cashier:** add execute transaction shortcut and enhance payment input ([a9cdb0c](https://github.com/ibobdb/sasuai-desktop/commit/a9cdb0c2b8cfdf6ce3b6b5f4261fa6649591fe37))
* implement member management features with CRUD operations ([e6c17a7](https://github.com/ibobdb/sasuai-desktop/commit/e6c17a778d548bcc60a925e02de3256801546065))
* **member:** update member operations with specific response types ([c8f6fa9](https://github.com/ibobdb/sasuai-desktop/commit/c8f6fa917a0b7701149b074fdea569d0db00f587))
* **payment:** enhance accessibility and auto-print functionality ([fa7d5e2](https://github.com/ibobdb/sasuai-desktop/commit/fa7d5e2ace62a60b34692c355999d868b9c08108))
* **printer-settings:** consolidate printer settings UI and enhance functionality ([8ee7dee](https://github.com/ibobdb/sasuai-desktop/commit/8ee7deee0b09f3fc8ce5534006b5896eeb604ecd))
* **printer-settings:** enhance printer settings with typography options and improved UI ([e1b1830](https://github.com/ibobdb/sasuai-desktop/commit/e1b18309dbfa5f591f04025256597b20ec121120))
* **printer-settings:** enhance PrinterSettings interface and update related components ([6b469ec](https://github.com/ibobdb/sasuai-desktop/commit/6b469ec75ff9fa5f44259d03d252bbc73460cb71))
* **printer:** implement printer settings management and receipt printing ([31e2561](https://github.com/ibobdb/sasuai-desktop/commit/31e25613d4488c16d2869d112db113a4de35df8b))
* **printer:** refactor printing system to use HTML directly and remove receipt builder ([30db0a1](https://github.com/ibobdb/sasuai-desktop/commit/30db0a105780acba3244e7554532eacba56d7e82))
* **settings:** add shortcut row actions for editing and resetting keyboard shortcuts ([9e02c55](https://github.com/ibobdb/sasuai-desktop/commit/9e02c553fb8bde4772afe24f0bbc2832f51d244d))
* **settings:** build settings page with tabs for general, keyboard, and printer settings ([9e02c55](https://github.com/ibobdb/sasuai-desktop/commit/9e02c553fb8bde4772afe24f0bbc2832f51d244d))
* **settings:** create custom hook for keyboard recording functionality ([9e02c55](https://github.com/ibobdb/sasuai-desktop/commit/9e02c553fb8bde4772afe24f0bbc2832f51d244d))
* **settings:** enhance general settings tab with store and footer information management ([8cd66fe](https://github.com/ibobdb/sasuai-desktop/commit/8cd66fec7f3bf95b091cbcbecad2ab0184100d46))
* **settings:** enhance GeneralSettingsTab with auto-save functionality and improved state management ([b48bb44](https://github.com/ibobdb/sasuai-desktop/commit/b48bb44d479e084db4fe829493acf5bb7394013d))
* **settings:** enhance useSettings hook for managing application settings with Electron Store ([9e02c55](https://github.com/ibobdb/sasuai-desktop/commit/9e02c553fb8bde4772afe24f0bbc2832f51d244d))
* **settings:** implement printer settings tab with printer selection and configuration options ([9e02c55](https://github.com/ibobdb/sasuai-desktop/commit/9e02c553fb8bde4772afe24f0bbc2832f51d244d))
* **shortcut-feedback:** add feedback mechanism for keyboard shortcuts execution ([9e02c55](https://github.com/ibobdb/sasuai-desktop/commit/9e02c553fb8bde4772afe24f0bbc2832f51d244d))
* **shortcuts:** implement global keyboard shortcuts handling ([9e02c55](https://github.com/ibobdb/sasuai-desktop/commit/9e02c553fb8bde4772afe24f0bbc2832f51d244d))


### Chores

* **package:** remove unnecessary 'dev' flags and update form-data version ([3b27adb](https://github.com/ibobdb/sasuai-desktop/commit/3b27adb97628936b4df99c30ed568d3946fa39a3))
* remove unused hooks and utility functions ([93ec0f3](https://github.com/ibobdb/sasuai-desktop/commit/93ec0f34e6e3a15fe2a0cdc2a10983c6860f44f8))
* update dependencies and improve code structure ([35677e4](https://github.com/ibobdb/sasuai-desktop/commit/35677e4979c062a5b51c1c074614aa8ef4938450))


### Code Refactoring

* **member:** optimize filter handling in member operations and toolbar ([207a652](https://github.com/ibobdb/sasuai-desktop/commit/207a652afb71572b70e8ec613fdd56a062d27b33))
* **member:** remove unused data provider and context files ([c8f6fa9](https://github.com/ibobdb/sasuai-desktop/commit/c8f6fa917a0b7701149b074fdea569d0db00f587))
* **member:** simplify member form and ban actions components ([c8f6fa9](https://github.com/ibobdb/sasuai-desktop/commit/c8f6fa917a0b7701149b074fdea569d0db00f587))
* **member:** streamline member operations and enhance API response handling ([f1b1b03](https://github.com/ibobdb/sasuai-desktop/commit/f1b1b03ff59c6d7b6b1950820099ca65d063fac1))
* remove unused discount validation utility and implement cashier operations ([accb988](https://github.com/ibobdb/sasuai-desktop/commit/accb9884f51f2ce1d090604646cf413d1ce7cee8))
* **routes:** create authenticated settings route ([9e02c55](https://github.com/ibobdb/sasuai-desktop/commit/9e02c553fb8bde4772afe24f0bbc2832f51d244d))
* **theme:** replace ThemeSwitch with ThemeToggle and enhance theme handling ([feb273e](https://github.com/ibobdb/sasuai-desktop/commit/feb273ef173a4b69feab9635309df20681770680))

## [1.7.0](https://github.com/ibobdb/sasuai-desktop/compare/v1.6.4...v1.7.0) (2025-07-11)

### Features

- **api-client:** refactor API client to use class structure with improved cookie handling and session management ([8b25238](https://github.com/ibobdb/sasuai-desktop/commit/8b252387be5d01b8b68d637818bc250297fab0e9))
- **auth:** implement internationalization for authentication components ([dcfcd59](https://github.com/ibobdb/sasuai-desktop/commit/dcfcd596baad737a37c9c6797419ad4f10bce317))
- **authStore:** update auth store to use new cookie management methods ([8b25238](https://github.com/ibobdb/sasuai-desktop/commit/8b252387be5d01b8b68d637818bc250297fab0e9))
- **constants:** add COOKIE_CONFIG for better cookie management ([8b25238](https://github.com/ibobdb/sasuai-desktop/commit/8b252387be5d01b8b68d637818bc250297fab0e9))
- **cookie-service:** create CookieService for centralized cookie operations ([8b25238](https://github.com/ibobdb/sasuai-desktop/commit/8b252387be5d01b8b68d637818bc250297fab0e9))
- **index:** initialize app with structured setup for handlers and services ([8b25238](https://github.com/ibobdb/sasuai-desktop/commit/8b252387be5d01b8b68d637818bc250297fab0e9))
- **updater:** enhance auto-updater functionality with better event handling ([8b25238](https://github.com/ibobdb/sasuai-desktop/commit/8b252387be5d01b8b68d637818bc250297fab0e9))

### Bug Fixes

- enhance date range picker and filters ([1cff638](https://github.com/ibobdb/sasuai-desktop/commit/1cff638ca4625cf22fbed743d198dfaa82c60848))

### Code Refactoring

- **api-handlers:** streamline API request handling ([8b25238](https://github.com/ibobdb/sasuai-desktop/commit/8b252387be5d01b8b68d637818bc250297fab0e9))
- **auth-provider:** optimize authentication flow with useMemo and useCallback ([8b25238](https://github.com/ibobdb/sasuai-desktop/commit/8b252387be5d01b8b68d637818bc250297fab0e9))
- **cookie-handlers:** implement CookieService for cookie management ([8b25238](https://github.com/ibobdb/sasuai-desktop/commit/8b252387be5d01b8b68d637818bc250297fab0e9))
- **device-info:** simplify device info retrieval and caching ([8b25238](https://github.com/ibobdb/sasuai-desktop/commit/8b252387be5d01b8b68d637818bc250297fab0e9))
- **store:** remove redundant store handlers and integrate directly into index ([8b25238](https://github.com/ibobdb/sasuai-desktop/commit/8b252387be5d01b8b68d637818bc250297fab0e9))
- **window-handlers:** consolidate window control handlers ([8b25238](https://github.com/ibobdb/sasuai-desktop/commit/8b252387be5d01b8b68d637818bc250297fab0e9))

## [1.6.4](https://github.com/ibobdb/sasuai-desktop/compare/v1.6.3...v1.6.4) (2025-05-29)

### Bug Fixes

- **device-info:** add device information retrieval for enhanced session tracking ([be4b71e](https://github.com/ibobdb/sasuai-desktop/commit/be4b71e533020d91c3dd4f0e8301ec9d7b28c83c))
- **profile-dropdown, update-dialog, i18n:** implement internationalization for update messages and actions ([f1bad83](https://github.com/ibobdb/sasuai-desktop/commit/f1bad838cf392b8c3e1521622baa982b12832940))
- **updater:** enhance auto-update functionality and user preferences ([c7844e1](https://github.com/ibobdb/sasuai-desktop/commit/c7844e1ee6530f3f2f1fea038bced608331a649b))

## [1.6.3](https://github.com/ibobdb/sasuai-desktop/compare/v1.6.2...v1.6.3) (2025-05-29)

### Bug Fixes

- **payment:** enhance payment dialog for non-cash methods ([ee5ca44](https://github.com/ibobdb/sasuai-desktop/commit/ee5ca44d6433a6efdc57bfae4fe15647e12ca6a8))
- **payment:** update payment dialog behavior for method changes ([0ce5d03](https://github.com/ibobdb/sasuai-desktop/commit/0ce5d03d4d7c7c7d32b403129d5f427222364e1b))

## [1.6.2](https://github.com/ibobdb/sasuai-dekstop/compare/v1.6.1...v1.6.2) (2025-05-19)

### Bug Fixes

- **cookies:** enhance cookie handling with secure prefixes ([fc110be](https://github.com/ibobdb/sasuai-dekstop/commit/fc110be9667ece9026efeefbd8fcfb9647cc983d))

## [1.6.1](https://github.com/ibobdb/sasuai-dekstop/compare/v1.6.0...v1.6.1) (2025-05-19)

### Bug Fixes

- **api:** update cookie URL to use HTTPS for secure transmission ([e796dd6](https://github.com/ibobdb/sasuai-dekstop/commit/e796dd66e23014de367f181637ae48298ba98582))

## [1.6.0](https://github.com/ibobdb/sasuai-dekstop/compare/v1.5.0...v1.6.0) (2025-05-19)

### Features

- **api:** enhance cookie security settings for authentication ([163ffe3](https://github.com/ibobdb/sasuai-dekstop/commit/163ffe3f6eb83d1fe03cb2371644a57444f634d8))

## [1.5.0](https://github.com/ibobdb/sasuai-dekstop/compare/v1.4.0...v1.5.0) (2025-05-19)

### Features

- **constants:** update cookie names for production environment ([d965dae](https://github.com/ibobdb/sasuai-dekstop/commit/d965dae80219436785132ff1de0dcaedfef9fe75))

## [1.4.0](https://github.com/ibobdb/sasuai-dekstop/compare/v1.3.0...v1.4.0) (2025-05-19)

### Features

- **api:** change API base URL to production ([7e56295](https://github.com/ibobdb/sasuai-dekstop/commit/7e5629526b466e8f31016bdee1ceb6f5c24b7b51))
- **constants:** update cookie configuration for production environment ([7e56295](https://github.com/ibobdb/sasuai-dekstop/commit/7e5629526b466e8f31016bdee1ceb6f5c24b7b51))
- **index:** update Content Security Policy to use production domain ([7e56295](https://github.com/ibobdb/sasuai-dekstop/commit/7e5629526b466e8f31016bdee1ceb6f5c24b7b51))
- **styles:** update theme to modern minimal ([88767ff](https://github.com/ibobdb/sasuai-dekstop/commit/88767fff474d0c68522b42a889d97479ed7d42cf))
- **transactions:** enhance filter toolbar with date range picker functionality ([7e56295](https://github.com/ibobdb/sasuai-dekstop/commit/7e5629526b466e8f31016bdee1ceb6f5c24b7b51))

### Chores

- **changelog:** update changelog for version 1.3.0 ([59f90e6](https://github.com/ibobdb/sasuai-dekstop/commit/59f90e608fdb559fbf4452db43bd55a73fd0d514))

## [1.3.0](https://github.com/ibobdb/sasuai-dekstop/compare/v1.2.0...v1.3.0) (2025-05-14)

### Features

- **cashier:** implement tier and global discount functionality ([e808030](https://github.com/ibobdb/sasuai-dekstop/commit/e8080305ea22b11017d9dfd8eb64ce8058a35c10))
- **cashier:** refactor discount handling and validation ([2100844](https://github.com/ibobdb/sasuai-dekstop/commit/210084447ec3f5abdc59a6493cf7e4423b759ce6))
- Implement rewards management feature with claims functionality ([56563ce](https://github.com/ibobdb/sasuai-dekstop/commit/56563ce7b2794b2a0bcf0d88e31bb45c19e3a525))
- **member:** add rewards claims tab and localization support ([1daf6d6](https://github.com/ibobdb/sasuai-dekstop/commit/1daf6d6696d864d57623c843d6303be5d35af617))
- **member:** enhance member view dialog with discount details and localization ([f39f415](https://github.com/ibobdb/sasuai-dekstop/commit/f39f415246324e399743a8749d281ab14f504eff))
- **transactions:** enhance discount display and localization support ([28afdfb](https://github.com/ibobdb/sasuai-dekstop/commit/28afdfbccf3314b742c4dc5bec317966016bcc9b))

### Bug Fixes

- **data-table-pagination:** correct total count display and punctuation in pagination text ([3c53d1c](https://github.com/ibobdb/sasuai-dekstop/commit/3c53d1c63206a32f35188ffa98d1100dd69e6745))

## [1.2.0](https://github.com/ibobdb/sasuai-dekstop/compare/v1.1.3...v1.2.0) (2025-05-06)

### Features

- **rewards:** implement rewards management feature ([cba46ed](https://github.com/ibobdb/sasuai-dekstop/commit/cba46ed2d4c46bcbdac43205e431a90714ff3e35))

### Code Refactoring

- **transaction-view-dialog:** improve member tier badge display ([c42d14d](https://github.com/ibobdb/sasuai-dekstop/commit/c42d14d77617bfc1bb1f6399a04afdcbc52305a3))

## [1.1.3](https://github.com/ibobdb/sasuai-dekstop/compare/v1.1.2...v1.1.3) (2025-05-06)

### Code Refactoring

- **search:** replace placeholder with translation for search button ([6b9defa](https://github.com/ibobdb/sasuai-dekstop/commit/6b9defad73a829c5fc815ee473604ea3ae66da18))
- **updater:** enhance update checking and handling ([5da270d](https://github.com/ibobdb/sasuai-dekstop/commit/5da270db114ec944889090ecd017d4a4fc8049f9))

## [1.1.2](https://github.com/ibobdb/sasuai-dekstop/compare/v1.1.1...v1.1.2) (2025-05-05)

### Code Refactoring

- streamline release workflow for Windows, macOS, and Linux builds ([a318af6](https://github.com/ibobdb/sasuai-dekstop/commit/a318af64676bdea3f72852fadca1598c19543e77))

## [1.1.1](https://github.com/ibobdb/sasuai-dekstop/compare/v1.1.0...v1.1.1) (2025-05-05)

### Bug Fixes

- merge release workflow ([6021c0d](https://github.com/ibobdb/sasuai-dekstop/commit/6021c0dd903740ce749c43ecc437328f5010aa8a))
- update release workflow and add manual electron build steps ([27c12f6](https://github.com/ibobdb/sasuai-dekstop/commit/27c12f6530ae825f79b48b97cdfe00120f19ffb3))

### Chores

- **release:** add GH_TOKEN to environment variables in release workflow ([ff93ec4](https://github.com/ibobdb/sasuai-dekstop/commit/ff93ec4dd48085d22761af153711df88bded97ec))
- **release:** update Node.js version to 22 in release workflow ([68bebd3](https://github.com/ibobdb/sasuai-dekstop/commit/68bebd3bd55594920f1647461864221cc1b4c9d3))
- **release:** update release workflow to support multiple OS builds ([cee0e82](https://github.com/ibobdb/sasuai-dekstop/commit/cee0e8212c1d7305c363f406eb693f1ad9b2dd88))

## [1.1.0](https://github.com/ibobdb/sasuai-dekstop/compare/v1.0.0...v1.1.0) (2025-05-05)

### Features

- add Checkbox and RadioGroup components for UI consistency ([cb40f89](https://github.com/ibobdb/sasuai-dekstop/commit/cb40f8961d4a209843bb6e4259fb44fd8815d01b))
- add DiscountSection component for applying discounts to transactions ([cb40f89](https://github.com/ibobdb/sasuai-dekstop/commit/cb40f8961d4a209843bb6e4259fb44fd8815d01b))
- add ProductSearch component for searching and selecting products ([cb40f89](https://github.com/ibobdb/sasuai-dekstop/commit/cb40f8961d4a209843bb6e4259fb44fd8815d01b))
- add unauthorized error page and related routing ([3e4862f](https://github.com/ibobdb/sasuai-dekstop/commit/3e4862ffc109d68772011a806ba30841927456ac))
- **api:** introduce API_ENDPOINTS for authentication ([a3ebb3a](https://github.com/ibobdb/sasuai-dekstop/commit/a3ebb3a2d5babbaed537b631595327d87d7ee52a))
- **auth:** enhance authentication flow with cookie management and session validation ([0085b39](https://github.com/ibobdb/sasuai-dekstop/commit/0085b3949c46112d3cd68c08fbc5b0ebd0961e05))
- **auth:** enhance AuthLayout and ForgotPassword components with improved UI and theme handling ([05783de](https://github.com/ibobdb/sasuai-dekstop/commit/05783de195c33b93093c21a68ef2fc016c2ad45e))
- **auth:** implement authentication context and session validation ([dd8bd7c](https://github.com/ibobdb/sasuai-dekstop/commit/dd8bd7c7675bd3cae4ec986387c71ac8d38ecdf6))
- **auth:** update forgot password API request method and enhance error handling ([d05c9a5](https://github.com/ibobdb/sasuai-dekstop/commit/d05c9a56384523eaf01ad5aa659fab2757b02b30))
- **auth:** update logo URL to use Cloudinary for better accessibility ([74e83e3](https://github.com/ibobdb/sasuai-dekstop/commit/74e83e39b0451a5fff799eb4e5f0de2669427aba))
- **auth:** update sign-in logic to support username and email ([3398910](https://github.com/ibobdb/sasuai-dekstop/commit/3398910c1be693661d74599792f743585624f6fb))
- **cashier:** add mobile-specific payment buttons and enhance layout for better usability ([f6dfbd8](https://github.com/ibobdb/sasuai-dekstop/commit/f6dfbd8d0c54ae015f3553878db2dc47b718e0f5))
- **cashier:** add quick add mode to product selection with quantity handling ([bfe3f75](https://github.com/ibobdb/sasuai-dekstop/commit/bfe3f755c97104a82d2b6030d01cf1f9328a0bd4))
- **cashier:** enhance cart layout and fix payment button positioning ([ebd69ce](https://github.com/ibobdb/sasuai-dekstop/commit/ebd69cebd282f16b842b5a86c87827fda6da7c45))
- **cashier:** enhance layout and member details in cashier components ([5f7fb01](https://github.com/ibobdb/sasuai-dekstop/commit/5f7fb01ba078b0c1f13c020c9a57b581a0d8855c))
- **cashier:** enhance member and product search with debouncing and click outside detection ([c53cbbf](https://github.com/ibobdb/sasuai-dekstop/commit/c53cbbf55905f9a622daf15dfd87e180ad103c4c))
- **cashier:** enhance product and member selection with quantity input dialog ([ee68b7a](https://github.com/ibobdb/sasuai-dekstop/commit/ee68b7a49f8219b109846221edc014310ad408b3))
- **cashier:** enhance transaction processing and member points calculation ([b18326d](https://github.com/ibobdb/sasuai-dekstop/commit/b18326dcc5ad3bc1af369aaafdbfdc40602bd444))
- **cashier:** implement payment status dialog and enhance payment handling ([185f91b](https://github.com/ibobdb/sasuai-dekstop/commit/185f91be2e00c36364358f08928ce66eae37fcb0))
- create CartList component to manage cart items and quantities ([cb40f89](https://github.com/ibobdb/sasuai-dekstop/commit/cb40f8961d4a209843bb6e4259fb44fd8815d01b))
- create PaymentSection component for handling payment methods and amounts ([cb40f89](https://github.com/ibobdb/sasuai-dekstop/commit/cb40f8961d4a209843bb6e4259fb44fd8815d01b))
- enhance authentication handling and session management ([f5f4a17](https://github.com/ibobdb/sasuai-dekstop/commit/f5f4a1729460e9cbd20221b4d5012433399cea57))
- enhance forgot password form with sign-in link ([f1f89c1](https://github.com/ibobdb/sasuai-dekstop/commit/f1f89c1aa254c9b7964483687a8b2593e3c9cf19))
- **i18n:** implement internationalization support with language switcher and translations ([e7f6436](https://github.com/ibobdb/sasuai-dekstop/commit/e7f643670759cf4a0c7e31276e2375d1f5fd469a))
- implement ActionButtons component for transaction actions ([cb40f89](https://github.com/ibobdb/sasuai-dekstop/commit/cb40f8961d4a209843bb6e4259fb44fd8815d01b))
- Implement cashier feature with member management, product search, discount handling, and payment processing ([ab46252](https://github.com/ibobdb/sasuai-dekstop/commit/ab4625237390390b6d84c1399792f696f3e8c902))
- implement MemberSection component for member management in transactions ([cb40f89](https://github.com/ibobdb/sasuai-dekstop/commit/cb40f8961d4a209843bb6e4259fb44fd8815d01b))
- implement system monitoring and resource polling ([86e991e](https://github.com/ibobdb/sasuai-dekstop/commit/86e991ecd0d58cd669a6e74b52a2f429568fca27))
- implement TransactionSummary component to display transaction totals ([cb40f89](https://github.com/ibobdb/sasuai-dekstop/commit/cb40f8961d4a209843bb6e4259fb44fd8815d01b))
- initialize project structure ([31100c4](https://github.com/ibobdb/sasuai-dekstop/commit/31100c4ca429c41e282bf6258e4313bee49fee08))
- **language:** add tooltips for language and theme switchers ([a1adaad](https://github.com/ibobdb/sasuai-dekstop/commit/a1adaad0ac864b605c93d60425a5ff7e44627b19))
- **legal:** add Privacy Policy and Terms of Service pages ([a804c06](https://github.com/ibobdb/sasuai-dekstop/commit/a804c06b28c8b5791f968cea4151e5000a701767))
- **member-search:** implement member search component with debounce and auto-select ([bc5ac30](https://github.com/ibobdb/sasuai-dekstop/commit/bc5ac303522a9f3200df38188e66dadb9f9c8f6a))
- **member:** add new fields for membership tier and points in localization ([99b7c2b](https://github.com/ibobdb/sasuai-dekstop/commit/99b7c2be0c624660fd4ac046aad015b88dd15518))
- **member:** enhance member management features and internationalization support ([daff3d1](https://github.com/ibobdb/sasuai-dekstop/commit/daff3d11945e0d098ac0b4a75aa962649c48c553))
- **member:** enhance tier badge display and add address field ([a34295a](https://github.com/ibobdb/sasuai-dekstop/commit/a34295a2c1d4af28c200aa445ad81b26698d2124))
- **member:** implement member ban and unban functionality with UI updates ([bd4d6f1](https://github.com/ibobdb/sasuai-dekstop/commit/bd4d6f1181422bf7c49cc5011ed6409d16380bad))
- **member:** implement member management features including create, edit, view, and delete functionalities ([fe1bca2](https://github.com/ibobdb/sasuai-dekstop/commit/fe1bca222eb41bb7555f894d5facb9f1e7263ccc))
- **payment:** enhance payment dialog with numeric keypad and input formatting ([848e22b](https://github.com/ibobdb/sasuai-dekstop/commit/848e22bc1cfec9bf6583674c3fdaa863abfd876c))
- **payment:** refactor payment methods handling and update structure ([e4c9db4](https://github.com/ibobdb/sasuai-dekstop/commit/e4c9db4c3bbcc39f68210dafc3dc6a513cc1637f))
- **product-search:** toggle quick add mode on label click ([6139031](https://github.com/ibobdb/sasuai-dekstop/commit/6139031817ab6321ecda3961f5bed82c68958fdd))
- **profile-dropdown:** enhance user dropdown with hover effects and state management ([c113679](https://github.com/ibobdb/sasuai-dekstop/commit/c1136791601e623b65aab7a1103954b28b06331d))
- refactor main application structure and enhance cookie management ([05dcb20](https://github.com/ibobdb/sasuai-dekstop/commit/05dcb20abe7ee22d177eb7e9715df24095897441))
- Refactor transactions table and components ([9d8da4f](https://github.com/ibobdb/sasuai-dekstop/commit/9d8da4f828d8b2e01efddd772e056757f752b6dc))
- replace payment section and action buttons with a unified payment dialog ([2a631c9](https://github.com/ibobdb/sasuai-dekstop/commit/2a631c996ce73dab21855d8bbd46c622fd5b91da))
- **sidebar:** update sidebar icons and logo for improved branding ([5d8aa27](https://github.com/ibobdb/sasuai-dekstop/commit/5d8aa27329134ce7a4ead15f178dadafcc33ab2a))
- **sidebar:** update store logo URL to use Cloudinary for better accessibility ([d0a62e0](https://github.com/ibobdb/sasuai-dekstop/commit/d0a62e0e90a1e5c304811afa986bc1ce1a7d1b84))
- **store:** integrate electron-store for session management ([f5ee088](https://github.com/ibobdb/sasuai-dekstop/commit/f5ee08818a0b7e0703cbd0f4cd1e7e06889ed546))
- **transactions:** add advanced date and amount range filters to filter toolbar ([bda668d](https://github.com/ibobdb/sasuai-dekstop/commit/bda668d295fd6fbd34c2e8aba070a1e995a39c39))
- **transactions:** enhance transaction dialogs and data handling ([feb52ec](https://github.com/ibobdb/sasuai-dekstop/commit/feb52ec95ceb23de544cfda97aa2033880823333))
- **transactions:** enhance transaction view dialog layout and responsiveness ([d8a0db2](https://github.com/ibobdb/sasuai-dekstop/commit/d8a0db27eff7928c4b77ff67cdc6c22fd431b7f5))
- **transactions:** implement transaction management features ([a39e570](https://github.com/ibobdb/sasuai-dekstop/commit/a39e570ae98f4c4e0a5c1f3932e1ae68c1d17fd5))
- **transactions:** implement transactions page and routing ([62dfd6b](https://github.com/ibobdb/sasuai-dekstop/commit/62dfd6bb190257f8cbc734c15c2eb432305e8e9b))
- **transactions:** refactor transaction handling and update payment structure ([1a79f79](https://github.com/ibobdb/sasuai-dekstop/commit/1a79f790bf94f86a3cfb15f2cc9eebbbb68e16d5))
- update appId and maintain project structure in electron-builder.json ([8a1c663](https://github.com/ibobdb/sasuai-dekstop/commit/8a1c6637573c1719e741d6e8f6247562c59d355e))
- update issue templates for feature requests and bug reports ([de75202](https://github.com/ibobdb/sasuai-dekstop/commit/de75202a2a92f0a51da5e04ba315c001fd2885f9))
- **updater:** implement auto-update functionality with GitHub integration ([38dff64](https://github.com/ibobdb/sasuai-dekstop/commit/38dff64c0199b87b828d4ad414aa416f4d42b51e))
- **window-controls:** add internationalization for window control actions ([ee53b03](https://github.com/ibobdb/sasuai-dekstop/commit/ee53b0313fe0e24f0fe9d31a726c4e60829db9b7))
- **window:** update browser window dimensions to improve layout ([8ff56a2](https://github.com/ibobdb/sasuai-dekstop/commit/8ff56a247ae46e7a3c83b27ebe9c3a901b6d236c))

### Bug Fixes

- add author information to package.json ([5ec1189](https://github.com/ibobdb/sasuai-dekstop/commit/5ec118980bd1d5af72e6e8b0144936941d2959bc))
- **api:** correct typo in forgot password endpoint URL ([83cebbf](https://github.com/ibobdb/sasuai-dekstop/commit/83cebbfe4fc4ad4b6e62f5abf7e6ee00d0cfacee))
- **auth:** remove redundant background class from content area ([0533973](https://github.com/ibobdb/sasuai-dekstop/commit/0533973168ce32f4be05d77aad265e7b25ed96f5))
- **auth:** update fetchApi calls to use new API_ENDPOINTS ([a3ebb3a](https://github.com/ibobdb/sasuai-dekstop/commit/a3ebb3a2d5babbaed537b631595327d87d7ee52a))
- **cart-list:** adjust height and improve item name display ([667f254](https://github.com/ibobdb/sasuai-dekstop/commit/667f254e1d4711f510055513c3f1e6dfd52490bf))
- **cashier:** adjust payment button width for better layout ([37e5ec6](https://github.com/ibobdb/sasuai-dekstop/commit/37e5ec67173a7a2fa8cab39f32f44cffc7654767))
- **cashier:** update keyboard shortcut for payment dialog to Ctrl+Spacebar ([b19894a](https://github.com/ibobdb/sasuai-dekstop/commit/b19894a11db9eef4c5c9c47b70f8a3d78d4ff0a7))
- clean up comments in checkIsActive function ([4833b6d](https://github.com/ibobdb/sasuai-dekstop/commit/4833b6dfba30667aad3ef132714fe3b3f37eaae6))
- **components:** update paths in components.json for consistency ([522b79c](https://github.com/ibobdb/sasuai-dekstop/commit/522b79c11985c38e5c019436ef151f70ee612c93))
- **debounce:** add no-op cleanup function for debounce effect ([61acd51](https://github.com/ibobdb/sasuai-dekstop/commit/61acd518c5664226261efbfb04b15137e96b3849))
- Enhances cashier functionality and UI ([5940f51](https://github.com/ibobdb/sasuai-dekstop/commit/5940f515fb7bcabcff8df08d9108545fd4223ffc))
- **header:** add titlebar-drag-region and adjust z-index for header components ([9c3ef8f](https://github.com/ibobdb/sasuai-dekstop/commit/9c3ef8f7cb26c6086be66d57ed49d2e80f7ac5d1))
- **nsis:** enable showDetails option for installer ([7bf804a](https://github.com/ibobdb/sasuai-dekstop/commit/7bf804a1167a5ac0ae95d1b157361110a140c951))
- **nsis:** remove showDetails option from installer configuration ([c1eb46a](https://github.com/ibobdb/sasuai-dekstop/commit/c1eb46ab94474af109689d7905caf4b956c2d14f))
- **product-search:** update button disable logic to require at least 2 characters in query ([b931c8e](https://github.com/ibobdb/sasuai-dekstop/commit/b931c8ea4ba3d232bca3e393134c877ec9a839f4))
- **profile-dropdown:** enhance user name tooltip visibility and styling ([28437a7](https://github.com/ibobdb/sasuai-dekstop/commit/28437a7c0cbf4478aba763eb8e77c13102ca52cf))
- Refactor builder ([141cf19](https://github.com/ibobdb/sasuai-dekstop/commit/141cf1922c84e9888e0b890fee0ab63481fa0996))
- reorganize Windows target configuration in electron-builder.json ([9a387d2](https://github.com/ibobdb/sasuai-dekstop/commit/9a387d25ee5374217fbd22c98acd2e9d356f07c3))
- standardize string quotes in issue templates and update package description ([97503db](https://github.com/ibobdb/sasuai-dekstop/commit/97503db70242116887a0023d25c6f30ca8a0aa31))
- update product name and copyright in electron-builder configuration ([91c727a](https://github.com/ibobdb/sasuai-dekstop/commit/91c727ab2b8193dfb66f85f07e807c2d5dd62d71))

### Chores

- **master:** release 1.0.0 ([09fe3b9](https://github.com/ibobdb/sasuai-dekstop/commit/09fe3b93319defeed8c4820dd94d06cd93284dd2))
- remove unnecessary comments in index.ts and preload/index.ts ([97503db](https://github.com/ibobdb/sasuai-dekstop/commit/97503db70242116887a0023d25c6f30ca8a0aa31))

### Code Refactoring

- **api:** enhance error handling and response structure for API requests ([1c758c1](https://github.com/ibobdb/sasuai-dekstop/commit/1c758c1ebc3eac01600028e1f0d1cc85c5df6eae))
- **cashier:** streamline member discount logic and update subtotal handling ([5b2cae8](https://github.com/ibobdb/sasuai-dekstop/commit/5b2cae8e1d5399d8339eb7a3128b3511435a1f38))
- **detail-dialog:** improve layout and structure for better readability ([268026d](https://github.com/ibobdb/sasuai-dekstop/commit/268026de46103e41a5b4006d95a13f5deae6f807))
- **member:** improve dialog close handling and edit transition timing ([980880f](https://github.com/ibobdb/sasuai-dekstop/commit/980880facd61765ac58871032a389aaf0d8d1f49))
- **routes:** remove dashboard and replace with cashier in authenticated routes ([213d732](https://github.com/ibobdb/sasuai-dekstop/commit/213d732c9e49f2135abd6985262e73a09fb9d775))
- **transactions:** migrate transaction types to new types file and remove old schema ([b69078d](https://github.com/ibobdb/sasuai-dekstop/commit/b69078d0729329fd6355847c59789491747159a6))
- **transactions:** simplify filter function in transaction columns ([d0a62e0](https://github.com/ibobdb/sasuai-dekstop/commit/d0a62e0e90a1e5c304811afa986bc1ce1a7d1b84))
- **transactions:** update payment method types and enhance data context structure ([11e23c1](https://github.com/ibobdb/sasuai-dekstop/commit/11e23c13f0c1f20b4c6695e22130ef9be4c5c255))

## 1.0.0 (2025-05-05)

### Features

- add Checkbox and RadioGroup components for UI consistency ([cb40f89](https://github.com/ibobdb/sasuai-dekstop/commit/cb40f8961d4a209843bb6e4259fb44fd8815d01b))
- add DiscountSection component for applying discounts to transactions ([cb40f89](https://github.com/ibobdb/sasuai-dekstop/commit/cb40f8961d4a209843bb6e4259fb44fd8815d01b))
- add ProductSearch component for searching and selecting products ([cb40f89](https://github.com/ibobdb/sasuai-dekstop/commit/cb40f8961d4a209843bb6e4259fb44fd8815d01b))
- add unauthorized error page and related routing ([3e4862f](https://github.com/ibobdb/sasuai-dekstop/commit/3e4862ffc109d68772011a806ba30841927456ac))
- **api:** introduce API_ENDPOINTS for authentication ([a3ebb3a](https://github.com/ibobdb/sasuai-dekstop/commit/a3ebb3a2d5babbaed537b631595327d87d7ee52a))
- **auth:** enhance authentication flow with cookie management and session validation ([0085b39](https://github.com/ibobdb/sasuai-dekstop/commit/0085b3949c46112d3cd68c08fbc5b0ebd0961e05))
- **auth:** enhance AuthLayout and ForgotPassword components with improved UI and theme handling ([05783de](https://github.com/ibobdb/sasuai-dekstop/commit/05783de195c33b93093c21a68ef2fc016c2ad45e))
- **auth:** implement authentication context and session validation ([dd8bd7c](https://github.com/ibobdb/sasuai-dekstop/commit/dd8bd7c7675bd3cae4ec986387c71ac8d38ecdf6))
- **auth:** update forgot password API request method and enhance error handling ([d05c9a5](https://github.com/ibobdb/sasuai-dekstop/commit/d05c9a56384523eaf01ad5aa659fab2757b02b30))
- **auth:** update logo URL to use Cloudinary for better accessibility ([74e83e3](https://github.com/ibobdb/sasuai-dekstop/commit/74e83e39b0451a5fff799eb4e5f0de2669427aba))
- **auth:** update sign-in logic to support username and email ([3398910](https://github.com/ibobdb/sasuai-dekstop/commit/3398910c1be693661d74599792f743585624f6fb))
- **cashier:** add mobile-specific payment buttons and enhance layout for better usability ([f6dfbd8](https://github.com/ibobdb/sasuai-dekstop/commit/f6dfbd8d0c54ae015f3553878db2dc47b718e0f5))
- **cashier:** add quick add mode to product selection with quantity handling ([bfe3f75](https://github.com/ibobdb/sasuai-dekstop/commit/bfe3f755c97104a82d2b6030d01cf1f9328a0bd4))
- **cashier:** enhance cart layout and fix payment button positioning ([ebd69ce](https://github.com/ibobdb/sasuai-dekstop/commit/ebd69cebd282f16b842b5a86c87827fda6da7c45))
- **cashier:** enhance layout and member details in cashier components ([5f7fb01](https://github.com/ibobdb/sasuai-dekstop/commit/5f7fb01ba078b0c1f13c020c9a57b581a0d8855c))
- **cashier:** enhance member and product search with debouncing and click outside detection ([c53cbbf](https://github.com/ibobdb/sasuai-dekstop/commit/c53cbbf55905f9a622daf15dfd87e180ad103c4c))
- **cashier:** enhance product and member selection with quantity input dialog ([ee68b7a](https://github.com/ibobdb/sasuai-dekstop/commit/ee68b7a49f8219b109846221edc014310ad408b3))
- **cashier:** enhance transaction processing and member points calculation ([b18326d](https://github.com/ibobdb/sasuai-dekstop/commit/b18326dcc5ad3bc1af369aaafdbfdc40602bd444))
- **cashier:** implement payment status dialog and enhance payment handling ([185f91b](https://github.com/ibobdb/sasuai-dekstop/commit/185f91be2e00c36364358f08928ce66eae37fcb0))
- create CartList component to manage cart items and quantities ([cb40f89](https://github.com/ibobdb/sasuai-dekstop/commit/cb40f8961d4a209843bb6e4259fb44fd8815d01b))
- create PaymentSection component for handling payment methods and amounts ([cb40f89](https://github.com/ibobdb/sasuai-dekstop/commit/cb40f8961d4a209843bb6e4259fb44fd8815d01b))
- enhance authentication handling and session management ([f5f4a17](https://github.com/ibobdb/sasuai-dekstop/commit/f5f4a1729460e9cbd20221b4d5012433399cea57))
- enhance forgot password form with sign-in link ([f1f89c1](https://github.com/ibobdb/sasuai-dekstop/commit/f1f89c1aa254c9b7964483687a8b2593e3c9cf19))
- **i18n:** implement internationalization support with language switcher and translations ([e7f6436](https://github.com/ibobdb/sasuai-dekstop/commit/e7f643670759cf4a0c7e31276e2375d1f5fd469a))
- implement ActionButtons component for transaction actions ([cb40f89](https://github.com/ibobdb/sasuai-dekstop/commit/cb40f8961d4a209843bb6e4259fb44fd8815d01b))
- Implement cashier feature with member management, product search, discount handling, and payment processing ([ab46252](https://github.com/ibobdb/sasuai-dekstop/commit/ab4625237390390b6d84c1399792f696f3e8c902))
- implement MemberSection component for member management in transactions ([cb40f89](https://github.com/ibobdb/sasuai-dekstop/commit/cb40f8961d4a209843bb6e4259fb44fd8815d01b))
- implement system monitoring and resource polling ([86e991e](https://github.com/ibobdb/sasuai-dekstop/commit/86e991ecd0d58cd669a6e74b52a2f429568fca27))
- implement TransactionSummary component to display transaction totals ([cb40f89](https://github.com/ibobdb/sasuai-dekstop/commit/cb40f8961d4a209843bb6e4259fb44fd8815d01b))
- initialize project structure ([31100c4](https://github.com/ibobdb/sasuai-dekstop/commit/31100c4ca429c41e282bf6258e4313bee49fee08))
- **language:** add tooltips for language and theme switchers ([a1adaad](https://github.com/ibobdb/sasuai-dekstop/commit/a1adaad0ac864b605c93d60425a5ff7e44627b19))
- **legal:** add Privacy Policy and Terms of Service pages ([a804c06](https://github.com/ibobdb/sasuai-dekstop/commit/a804c06b28c8b5791f968cea4151e5000a701767))
- **member-search:** implement member search component with debounce and auto-select ([bc5ac30](https://github.com/ibobdb/sasuai-dekstop/commit/bc5ac303522a9f3200df38188e66dadb9f9c8f6a))
- **member:** add new fields for membership tier and points in localization ([99b7c2b](https://github.com/ibobdb/sasuai-dekstop/commit/99b7c2be0c624660fd4ac046aad015b88dd15518))
- **member:** enhance member management features and internationalization support ([daff3d1](https://github.com/ibobdb/sasuai-dekstop/commit/daff3d11945e0d098ac0b4a75aa962649c48c553))
- **member:** enhance tier badge display and add address field ([a34295a](https://github.com/ibobdb/sasuai-dekstop/commit/a34295a2c1d4af28c200aa445ad81b26698d2124))
- **member:** implement member ban and unban functionality with UI updates ([bd4d6f1](https://github.com/ibobdb/sasuai-dekstop/commit/bd4d6f1181422bf7c49cc5011ed6409d16380bad))
- **member:** implement member management features including create, edit, view, and delete functionalities ([fe1bca2](https://github.com/ibobdb/sasuai-dekstop/commit/fe1bca222eb41bb7555f894d5facb9f1e7263ccc))
- **payment:** enhance payment dialog with numeric keypad and input formatting ([848e22b](https://github.com/ibobdb/sasuai-dekstop/commit/848e22bc1cfec9bf6583674c3fdaa863abfd876c))
- **payment:** refactor payment methods handling and update structure ([e4c9db4](https://github.com/ibobdb/sasuai-dekstop/commit/e4c9db4c3bbcc39f68210dafc3dc6a513cc1637f))
- **product-search:** toggle quick add mode on label click ([6139031](https://github.com/ibobdb/sasuai-dekstop/commit/6139031817ab6321ecda3961f5bed82c68958fdd))
- **profile-dropdown:** enhance user dropdown with hover effects and state management ([c113679](https://github.com/ibobdb/sasuai-dekstop/commit/c1136791601e623b65aab7a1103954b28b06331d))
- refactor main application structure and enhance cookie management ([05dcb20](https://github.com/ibobdb/sasuai-dekstop/commit/05dcb20abe7ee22d177eb7e9715df24095897441))
- Refactor transactions table and components ([9d8da4f](https://github.com/ibobdb/sasuai-dekstop/commit/9d8da4f828d8b2e01efddd772e056757f752b6dc))
- replace payment section and action buttons with a unified payment dialog ([2a631c9](https://github.com/ibobdb/sasuai-dekstop/commit/2a631c996ce73dab21855d8bbd46c622fd5b91da))
- **sidebar:** update sidebar icons and logo for improved branding ([5d8aa27](https://github.com/ibobdb/sasuai-dekstop/commit/5d8aa27329134ce7a4ead15f178dadafcc33ab2a))
- **sidebar:** update store logo URL to use Cloudinary for better accessibility ([d0a62e0](https://github.com/ibobdb/sasuai-dekstop/commit/d0a62e0e90a1e5c304811afa986bc1ce1a7d1b84))
- **store:** integrate electron-store for session management ([f5ee088](https://github.com/ibobdb/sasuai-dekstop/commit/f5ee08818a0b7e0703cbd0f4cd1e7e06889ed546))
- **transactions:** add advanced date and amount range filters to filter toolbar ([bda668d](https://github.com/ibobdb/sasuai-dekstop/commit/bda668d295fd6fbd34c2e8aba070a1e995a39c39))
- **transactions:** enhance transaction dialogs and data handling ([feb52ec](https://github.com/ibobdb/sasuai-dekstop/commit/feb52ec95ceb23de544cfda97aa2033880823333))
- **transactions:** enhance transaction view dialog layout and responsiveness ([d8a0db2](https://github.com/ibobdb/sasuai-dekstop/commit/d8a0db27eff7928c4b77ff67cdc6c22fd431b7f5))
- **transactions:** implement transaction management features ([a39e570](https://github.com/ibobdb/sasuai-dekstop/commit/a39e570ae98f4c4e0a5c1f3932e1ae68c1d17fd5))
- **transactions:** implement transactions page and routing ([62dfd6b](https://github.com/ibobdb/sasuai-dekstop/commit/62dfd6bb190257f8cbc734c15c2eb432305e8e9b))
- **transactions:** refactor transaction handling and update payment structure ([1a79f79](https://github.com/ibobdb/sasuai-dekstop/commit/1a79f790bf94f86a3cfb15f2cc9eebbbb68e16d5))
- update appId and maintain project structure in electron-builder.json ([8a1c663](https://github.com/ibobdb/sasuai-dekstop/commit/8a1c6637573c1719e741d6e8f6247562c59d355e))
- update issue templates for feature requests and bug reports ([de75202](https://github.com/ibobdb/sasuai-dekstop/commit/de75202a2a92f0a51da5e04ba315c001fd2885f9))
- **updater:** implement auto-update functionality with GitHub integration ([38dff64](https://github.com/ibobdb/sasuai-dekstop/commit/38dff64c0199b87b828d4ad414aa416f4d42b51e))
- **window-controls:** add internationalization for window control actions ([ee53b03](https://github.com/ibobdb/sasuai-dekstop/commit/ee53b0313fe0e24f0fe9d31a726c4e60829db9b7))
- **window:** update browser window dimensions to improve layout ([8ff56a2](https://github.com/ibobdb/sasuai-dekstop/commit/8ff56a247ae46e7a3c83b27ebe9c3a901b6d236c))

### Bug Fixes

- add author information to package.json ([5ec1189](https://github.com/ibobdb/sasuai-dekstop/commit/5ec118980bd1d5af72e6e8b0144936941d2959bc))
- **api:** correct typo in forgot password endpoint URL ([83cebbf](https://github.com/ibobdb/sasuai-dekstop/commit/83cebbfe4fc4ad4b6e62f5abf7e6ee00d0cfacee))
- **auth:** remove redundant background class from content area ([0533973](https://github.com/ibobdb/sasuai-dekstop/commit/0533973168ce32f4be05d77aad265e7b25ed96f5))
- **auth:** update fetchApi calls to use new API_ENDPOINTS ([a3ebb3a](https://github.com/ibobdb/sasuai-dekstop/commit/a3ebb3a2d5babbaed537b631595327d87d7ee52a))
- **cart-list:** adjust height and improve item name display ([667f254](https://github.com/ibobdb/sasuai-dekstop/commit/667f254e1d4711f510055513c3f1e6dfd52490bf))
- **cashier:** adjust payment button width for better layout ([37e5ec6](https://github.com/ibobdb/sasuai-dekstop/commit/37e5ec67173a7a2fa8cab39f32f44cffc7654767))
- **cashier:** update keyboard shortcut for payment dialog to Ctrl+Spacebar ([b19894a](https://github.com/ibobdb/sasuai-dekstop/commit/b19894a11db9eef4c5c9c47b70f8a3d78d4ff0a7))
- clean up comments in checkIsActive function ([4833b6d](https://github.com/ibobdb/sasuai-dekstop/commit/4833b6dfba30667aad3ef132714fe3b3f37eaae6))
- **components:** update paths in components.json for consistency ([522b79c](https://github.com/ibobdb/sasuai-dekstop/commit/522b79c11985c38e5c019436ef151f70ee612c93))
- **debounce:** add no-op cleanup function for debounce effect ([61acd51](https://github.com/ibobdb/sasuai-dekstop/commit/61acd518c5664226261efbfb04b15137e96b3849))
- Enhances cashier functionality and UI ([5940f51](https://github.com/ibobdb/sasuai-dekstop/commit/5940f515fb7bcabcff8df08d9108545fd4223ffc))
- **header:** add titlebar-drag-region and adjust z-index for header components ([9c3ef8f](https://github.com/ibobdb/sasuai-dekstop/commit/9c3ef8f7cb26c6086be66d57ed49d2e80f7ac5d1))
- **nsis:** enable showDetails option for installer ([7bf804a](https://github.com/ibobdb/sasuai-dekstop/commit/7bf804a1167a5ac0ae95d1b157361110a140c951))
- **nsis:** remove showDetails option from installer configuration ([c1eb46a](https://github.com/ibobdb/sasuai-dekstop/commit/c1eb46ab94474af109689d7905caf4b956c2d14f))
- **product-search:** update button disable logic to require at least 2 characters in query ([b931c8e](https://github.com/ibobdb/sasuai-dekstop/commit/b931c8ea4ba3d232bca3e393134c877ec9a839f4))
- **profile-dropdown:** enhance user name tooltip visibility and styling ([28437a7](https://github.com/ibobdb/sasuai-dekstop/commit/28437a7c0cbf4478aba763eb8e77c13102ca52cf))
- Refactor builder ([141cf19](https://github.com/ibobdb/sasuai-dekstop/commit/141cf1922c84e9888e0b890fee0ab63481fa0996))
- reorganize Windows target configuration in electron-builder.json ([9a387d2](https://github.com/ibobdb/sasuai-dekstop/commit/9a387d25ee5374217fbd22c98acd2e9d356f07c3))
- standardize string quotes in issue templates and update package description ([97503db](https://github.com/ibobdb/sasuai-dekstop/commit/97503db70242116887a0023d25c6f30ca8a0aa31))
- update product name and copyright in electron-builder configuration ([91c727a](https://github.com/ibobdb/sasuai-dekstop/commit/91c727ab2b8193dfb66f85f07e807c2d5dd62d71))

### Chores

- remove unnecessary comments in index.ts and preload/index.ts ([97503db](https://github.com/ibobdb/sasuai-dekstop/commit/97503db70242116887a0023d25c6f30ca8a0aa31))

### Code Refactoring

- **api:** enhance error handling and response structure for API requests ([1c758c1](https://github.com/ibobdb/sasuai-dekstop/commit/1c758c1ebc3eac01600028e1f0d1cc85c5df6eae))
- **cashier:** streamline member discount logic and update subtotal handling ([5b2cae8](https://github.com/ibobdb/sasuai-dekstop/commit/5b2cae8e1d5399d8339eb7a3128b3511435a1f38))
- **detail-dialog:** improve layout and structure for better readability ([268026d](https://github.com/ibobdb/sasuai-dekstop/commit/268026de46103e41a5b4006d95a13f5deae6f807))
- **member:** improve dialog close handling and edit transition timing ([980880f](https://github.com/ibobdb/sasuai-dekstop/commit/980880facd61765ac58871032a389aaf0d8d1f49))
- **routes:** remove dashboard and replace with cashier in authenticated routes ([213d732](https://github.com/ibobdb/sasuai-dekstop/commit/213d732c9e49f2135abd6985262e73a09fb9d775))
- **transactions:** migrate transaction types to new types file and remove old schema ([b69078d](https://github.com/ibobdb/sasuai-dekstop/commit/b69078d0729329fd6355847c59789491747159a6))
- **transactions:** simplify filter function in transaction columns ([d0a62e0](https://github.com/ibobdb/sasuai-dekstop/commit/d0a62e0e90a1e5c304811afa986bc1ce1a7d1b84))
- **transactions:** update payment method types and enhance data context structure ([11e23c1](https://github.com/ibobdb/sasuai-dekstop/commit/11e23c13f0c1f20b4c6695e22130ef9be4c5c255))
