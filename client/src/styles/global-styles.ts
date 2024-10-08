import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  body {
    background: ${({ theme }) => theme.body};
    color: ${({ theme }) => theme.text};
    transition: all 0.50s linear;
  }

  .dark {
    background-color: #1a202c;
    color: #f7fafc;

    .textColorCompat {
      .text-gray-700 {
        color: #C7C8CC;
      }
    }
    .bg-compat {
      background-color: #374151;
    }
    .bg-comment-compat {
      background-color: #374151;
    }
    .hover-bg-compat:hover {
      background-color: #1F2937;
    }
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
    .commentsInUserPage {
      .bg-gray-100 {
        background-color: #2d3748;
      }
      .text-gray-500 {
        color: #C7C8CC;
      }
      .text-black {
        color: #C7C8CC;
      }
    }
  }

  .light {
    background-color: #f7fafc;
    color: #1a202c;
    .bg-compat {
      background-color: #F3F4F6;
    }
    .bg-comment-compat {
      background-color: #f7fafc;
    }
    .hover-bg-compat:hover {
      background-color: #edf2f7;
    }
  }
`;