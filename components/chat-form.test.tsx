import { render, screen, fireEvent, act } from '@testing-library/react';
import { ChatForm } from './chat-form';

jest.useFakeTimers();

jest.mock('@/components/ui/tooltip', () => ({
  TooltipProvider: ({ children }: any) => <div>{children}</div>,
  Tooltip: ({ children }: any) => <div>{children}</div>,
  TooltipContent: ({ children }: any) => <div>{children}</div>,
  TooltipTrigger: ({ children }: any) => <div>{children}</div>,
}));
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));
jest.mock('@/components/autoresize-textarea', () => ({
  AutoResizeTextarea: ({ value, onChange, onKeyDown, placeholder }: any) => (
    <textarea
      aria-label="input"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
    />
  ),
}));

jest.mock('./data/datasets', () => ({
  datasets: [
    {
      key: 'obb',
      label: 'OBB',
      data: {
        questions: [
          { question: 'Q1', options: ['A1', 'B1', 'C1', 'D1'], answer: 'A1' },
          { question: 'Q2', options: ['A2', 'B2', 'C2', 'D2'], answer: 'B2' },
        ],
      },
    },
  ],
}));

describe('ChatForm', () => {
  it('shows welcome message before quiz starts', async () => {
    render(<ChatForm source="obb" />);
    expect(await screen.findByText(/welcome to ArXiv Studies/i)).toBeInTheDocument();
  });

  it('starts quiz after first submit and sends first question', () => {
    render(<ChatForm source="obb" />);
    const input = screen.getByLabelText('input');
    fireEvent.change(input, { target: { value: 'hi' } });
    act(() => {
      fireEvent.keyDown(input, { key: 'Enter' });
    });
    act(() => {
      jest.runOnlyPendingTimers(); // "great! let's begin..."
      jest.runOnlyPendingTimers(); // sendQuestion delay
    });
    expect(screen.getByText(/let's begin the quiz/i)).toBeInTheDocument();
    expect(screen.getByText(/Question 1 of/i)).toBeInTheDocument();
  });

  it('validates answer letters and advances flow', () => {
    render(<ChatForm source="obb" />);
    const input = screen.getByLabelText('input');
    fireEvent.change(input, { target: { value: 'start' } });
    act(() => {
      fireEvent.keyDown(input, { key: 'Enter' });
      jest.runOnlyPendingTimers();
      jest.runOnlyPendingTimers();
    });
    act(() => {
      fireEvent.change(input, { target: { value: 'A' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      jest.runOnlyPendingTimers(); // feedback delay
      jest.runOnlyPendingTimers(); // next question or results path
    });
    expect(screen.getByText(/Correct|Incorrect/)).toBeInTheDocument();
  });
});


