import { render, screen, waitFor } from '@testing-library/react'
import Home from '../src/pages/index'
import '@testing-library/jest-dom'

describe('Home', () => {
  it('renders a heading', async () => {
    render(<Home />)

    await waitFor(() => {
      const heading = screen.getByText('상위 커뮤니티');
      expect(heading).toBeInTheDocument()
    })
  })
})