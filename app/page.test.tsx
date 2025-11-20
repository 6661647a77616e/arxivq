import { render, screen, fireEvent } from '@testing-library/react';
import Page from './page';

jest.mock('@/components/chat-form', () => ({
  ChatForm: ({ source }: { source: string }) => <div data-testid="chat-form-source">{source}</div>,
}));

jest.mock('@/components/ui/tooltip', () => ({
  TooltipProvider: ({ children }: any) => <div>{children}</div>,
}));

jest.mock('@/components/ui/select', () => {
  const Real = jest.requireActual('@/components/ui/select');
  return {
    ...Real,
    Select: ({ value, onValueChange, children }: any) => (
      <div>
        <button data-testid="select" onClick={() => onValueChange('obb')} />
        <div data-testid="select-value">{value}</div>
        {children}
      </div>
    ),
    SelectTrigger: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    SelectContent: ({ children }: any) => <div>{children}</div>,
    SelectItem: ({ value, children }: any) => <div data-testid={`item-${value}`}>{children}</div>,
    SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
  };
});

describe('Page', () => {
  it('renders and passes default dataset to ChatForm', () => {
    render(<Page />);
    expect(screen.getByTestId('chat-form-source')).toBeInTheDocument();
  });

  it('updates ChatForm source when dataset changes', () => {
    render(<Page />);
    const select = screen.getByTestId('select');
    fireEvent.click(select);
    expect(screen.getByTestId('chat-form-source')).toHaveTextContent('obb');
  });
});


