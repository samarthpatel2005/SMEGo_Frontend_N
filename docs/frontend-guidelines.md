# Frontend Guidelines

## SME Operations Frontend Development Guidelines

### Project Structure

This project follows a modular architecture with clear separation of concerns:

```
src/
├── app/                    # Next.js App Router pages
├── components/            # Reusable UI components
│   ├── ui/               # Basic UI elements (Button, Input, Card)
│   ├── layout/           # Layout components (Navbar, Sidebar)
│   ├── charts/           # Chart components
│   └── forms/            # Form components
├── context/              # React contexts for global state
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries and configurations
├── services/             # API service layers
├── store/                # Zustand store (optional state management)
├── types/                # TypeScript type definitions
├── styles/               # Global styles
└── tests/                # Test files
```

### Design System

#### Colors
- Primary: Blue (#3B82F6)
- Secondary: Gray (#6B7280)
- Success: Green (#10B981)
- Warning: Yellow (#F59E0B)
- Error: Red (#EF4444)

#### Typography
- Font Family: Inter or system fonts
- Headings: Font weights 600-700
- Body: Font weight 400
- Small text: Font weight 300-400

#### Spacing
- Use Tailwind's spacing scale (4px increments)
- Standard padding: p-4, p-6, p-8
- Standard margins: m-4, m-6, m-8

### Component Guidelines

#### UI Components
- Keep components small and focused
- Use TypeScript interfaces for props
- Include proper error handling
- Add loading states where appropriate

#### Form Components
- Use controlled components
- Implement proper validation
- Show error states clearly
- Include accessibility attributes

#### Layout Components
- Responsive design first
- Mobile-friendly navigation
- Consistent spacing and alignment

### State Management

#### Local State
- Use useState for component-specific state
- Use useReducer for complex state logic

#### Global State
- Auth state: Context API (AuthContext)
- Organization state: Context API (OrgContext)
- Theme state: Context API (ThemeContext)
- Optional: Zustand for complex global state

### API Integration

#### Service Layer
- Create service files for each domain (auth, users, invoices, etc.)
- Use consistent error handling
- Implement proper TypeScript types
- Include loading states

#### Error Handling
- Show user-friendly error messages
- Log errors for debugging
- Implement retry mechanisms where appropriate

### Authentication

#### JWT Tokens
- Store in localStorage
- Include in Authorization headers
- Handle token expiration
- Implement refresh logic

#### Route Protection
- Use middleware for protected routes
- Redirect to login when unauthorized
- Check permissions for admin routes

### Testing Strategy

#### Unit Tests
- Test individual components
- Mock external dependencies
- Test user interactions
- Verify error states

#### Integration Tests
- Test component interactions
- Test API integration
- Test routing and navigation

### Performance Guidelines

#### Code Splitting
- Use dynamic imports for large components
- Lazy load routes and pages
- Split vendor bundles appropriately

#### Optimization
- Optimize images and assets
- Use React.memo for expensive components
- Implement proper caching strategies

### Accessibility

#### Requirements
- Semantic HTML elements
- Proper ARIA attributes
- Keyboard navigation support
- Screen reader compatibility

#### Testing
- Use automated accessibility testing tools
- Manual testing with screen readers
- Keyboard-only navigation testing

### Development Workflow

#### Code Style
- Use ESLint and Prettier
- Follow consistent naming conventions
- Write meaningful commit messages
- Document complex logic

#### Git Workflow
- Feature branches for new development
- Pull requests for code review
- Automated testing in CI/CD
- Semantic versioning for releases

### Environment Setup

#### Development
```bash
npm install
npm run dev
```

#### Testing
```bash
npm test
npm run test:coverage
```

#### Production Build
```bash
npm run build
npm start
```

### Deployment

#### Environment Variables
- Use .env files for configuration
- Separate configs for different environments
- Never commit sensitive data

#### CI/CD Pipeline
- Automated testing on pull requests
- Build and deploy on main branch
- Environment-specific deployments

### Security Guidelines

#### Best Practices
- Validate all user inputs
- Sanitize data before display
- Use HTTPS in production
- Implement proper CORS policies

#### Authentication Security
- Use secure token storage
- Implement proper logout
- Handle session timeouts
- Use strong password requirements

### Monitoring and Analytics

#### Error Tracking
- Implement error boundary components
- Use error tracking services
- Monitor application performance
- Track user interactions

### Browser Support

#### Target Browsers
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

#### Progressive Enhancement
- Core functionality works without JavaScript
- Enhanced experience with JavaScript enabled
- Graceful degradation for older browsers
