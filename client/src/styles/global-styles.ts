import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  body {
    background: ${({ theme }) => theme.body};
    color: ${({ theme }) => theme.text};
    transition: all 0.50s linear;
  }

  .dark {
    background-color: #1a202c !important;
    color: #f7fafc;
    
    .sidebar {
      .bg-gray-100 {
        background-color: #2d3748;
      }
      .text-gray-600 {
        color: #f7fafc;
      }
    }
    .searchbar {
      .bg-gray-100 {
        background-color: #2d3748;
      }
    }
  }

  .light {
    background-color: #f7fafc;
    color: #1a202c;
  }
`;