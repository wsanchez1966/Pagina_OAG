# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Build & Development
- `npm run build-css` - Compile SCSS to CSS using node-sass
- `npm run watch-css` - Watch SCSS files and auto-compile on changes
- `npm start` - Start local development server using http-server

### Testing
- `npm test` - Run Jest tests with coverage collection
- `npm run test:dev` - Run Jest in watch mode for development
- `npm run cypress:open` - Open Cypress for end-to-end testing

### Code Quality
- `npm run lint` - Run ESLint with auto-fix on all .js files
- `npm run format` - Format all files using Prettier

### Pre-commit Hooks
The project uses Husky with lint-staged to automatically:
- Run ESLint with auto-fix on staged .js files
- Format staged files with Prettier
- Run the full test suite before allowing commits

## Architecture Overview

### Project Structure
This is a vanilla JavaScript e-commerce website for OAGSA (tire and automotive parts distributor) with the following architecture:

```
src/
├── api/           # API layer - data fetching functions
├── entities/      # Domain models/classes (User, Article, etc.)
├── mappers/       # Transform API data to domain entities
├── storage/       # Local storage utilities
├── ui/            # UI components and DOM manipulation
├── utils/         # Shared utility functions
└── __tests__/     # Jest test files
```

### Key Architectural Patterns

#### API Layer Pattern
- **Base URL**: All API calls use `BASE_URL` from `src/utils/getDataFromDB.js` (https://api.oagsa.com/api/)
- **Centralized fetching**: `getDataFromDB()` handles all HTTP requests with error handling
- **API modules**: Each domain has its own API module (e.g., `api/store.js`, `api/cart.js`)

#### Entity-Mapper Pattern
- **Entities**: Domain classes in `src/entities/` define the data structure (User, Article, etc.)
- **Mappers**: Functions in `src/mappers/` transform API responses to entity instances
- **Example**: `articlesMapper()` converts API product data to `Article` class instances

#### UI Component Structure
- **Page-specific UI**: Each major page has its own UI module (e.g., `ui/store.js`, `ui/cart.js`)
- **Shared components**: Common UI elements like modals, carousels, and pagination are in separate modules
- **Profile system**: Extensive user profile management with role-based functionality

#### Storage Pattern
- Uses browser localStorage for client-side data persistence
- Storage utilities abstract localStorage operations
- Automatic reset mechanism in place (localStorage cleared if version < 2)

### Key Features
- **Multi-role user system**: Different user roles with specific permissions and UI
- **Shopping cart**: Full e-commerce cart functionality with local storage
- **Product catalog**: Product browsing with filtering and search
- **User profiles**: Comprehensive user management system
- **Order management**: Order history and tracking
- **Price lists**: Dynamic pricing based on user roles
- **Image management**: Product image handling and optimization

### Technology Stack
- **Frontend**: Vanilla JavaScript (ES6 modules), HTML5, SCSS
- **Styling**: Custom SCSS with utility classes, Font Awesome icons
- **Testing**: Jest with jsdom environment, Cypress for E2E
- **Build tools**: node-sass for SCSS compilation, http-server for development
- **Code quality**: ESLint (Standard config), Prettier, Husky pre-commit hooks
- **External libraries**: Swiper.js for carousels, Toastify.js for notifications

### Code Style
- **ESLint**: Standard configuration with Prettier integration
- **Prettier**: Single quotes, no semicolons, LF line endings
- **JSDoc**: Comprehensive type documentation throughout the codebase
- **ES6 modules**: All code uses ES6 import/export syntax
- **File organization**: Features are separated into logical modules