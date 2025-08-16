# Contributing to 7erfa

We love your input! We want to make contributing to 7erfa as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## We Develop with Github
We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

## We Use [Github Flow](https://guides.github.com/introduction/flow/index.html)
Pull requests are the best way to propose changes to the codebase. We actively welcome your pull requests:

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!

## Any contributions you make will be under the MIT Software License
In short, when you submit code changes, your submissions are understood to be under the same [MIT License](http://choosealicense.com/licenses/mit/) that covers the project. Feel free to contact the maintainers if that's a concern.

## Report bugs using Github's [issue tracker](https://github.com/heyitssugar/7erfa/issues)
We use GitHub issues to track public bugs. Report a bug by [opening a new issue](https://github.com/heyitssugar/7erfa/issues/new); it's that easy!

## Write bug reports with detail, background, and sample code

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can.
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

## Development Process

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/7erfa.git
   ```

2. Create a branch
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. Set up development environment
   ```bash
   # Install dependencies
   cd frontend && npm install
   cd ../backend && npm install

   # Start development servers
   docker-compose up
   ```

4. Make your changes
   - Follow the coding style of the project
   - Write meaningful commit messages
   - Add tests if applicable
   - Update documentation as needed

5. Test your changes
   ```bash
   # Frontend tests
   cd frontend && npm test

   # Backend tests
   cd backend && npm test
   ```

6. Push your changes
   ```bash
   git push origin feature/your-feature-name
   ```

7. Create a Pull Request

## Coding Style

- Use TypeScript for both frontend and backend
- Follow the existing code style
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused
- Write unit tests for new features

## Documentation

- Update README.md if needed
- Add JSDoc comments for new functions
- Update API documentation for new endpoints
- Add comments for complex logic
- Update deployment guide if needed

## Pull Request Process

1. Update the README.md with details of changes to the interface
2. Update the docs/ with details of changes to the API
3. The PR may be merged once you have the sign-off of at least one maintainer

## License
By contributing, you agree that your contributions will be licensed under its MIT License.
