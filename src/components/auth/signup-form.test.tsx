import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SignupForm } from './signup-form'

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: jest.fn(), refresh: jest.fn(), push: jest.fn() }),
}))

jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }))

const maybeSingle = jest.fn()
const signUp = jest.fn()
jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: () => ({ select: () => ({ eq: () => ({ maybeSingle }) }) }),
    auth: { signUp },
  }),
}))

async function fillForm(overrides: Partial<Record<string, string>> = {}) {
  const values = {
    Username: 'prasad_ks',
    Email: 'prasad@example.com',
    Password: 'secret123',
    'Confirm password': 'secret123',
    ...overrides,
  }
  const user = userEvent.setup()
  for (const [label, value] of Object.entries(values)) {
    await user.type(screen.getByLabelText(label), value as string)
  }
  await user.click(screen.getByRole('button', { name: 'Create account' }))
}

describe('SignupForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    maybeSingle.mockResolvedValue({ data: null })
  })

  it('checks that the passwords match', async () => {
    render(<SignupForm />)
    await fillForm({ 'Confirm password': 'secret124' })

    expect(await screen.findByText('Passwords do not match')).toBeInTheDocument()
    expect(signUp).not.toHaveBeenCalled()
  })

  it('rejects usernames that are already taken', async () => {
    maybeSingle.mockResolvedValue({ data: { id: 'someone-else' } })
    render(<SignupForm />)
    await fillForm()

    expect(await screen.findByText('That username is taken')).toBeInTheDocument()
    expect(signUp).not.toHaveBeenCalled()
  })

  it('asks the user to confirm their email after signing up', async () => {
    signUp.mockResolvedValue({ data: { session: null }, error: null })
    render(<SignupForm />)
    await fillForm()

    expect(await screen.findByText('Check your email')).toBeInTheDocument()
    expect(signUp).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'prasad@example.com',
        password: 'secret123',
        options: expect.objectContaining({
          data: { username: 'prasad_ks', display_name: 'prasad_ks' },
        }),
      }),
    )
  })
})
